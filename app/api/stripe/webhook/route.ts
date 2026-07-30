import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

type PaidPlan =
  | "basic"
  | "professional"
  | "premium";

const paidPlans: PaidPlan[] = [
  "basic",
  "professional",
  "premium",
];

function isPaidPlan(
  value: unknown
): value is PaidPlan {
  return (
    typeof value === "string" &&
    paidPlans.includes(value as PaidPlan)
  );
}

function getStripeId(
  value: string | { id: string } | null
) {
  if (!value) {
    return null;
  }

  return typeof value === "string"
    ? value
    : value.id;
}

export async function POST(request: NextRequest) {
  const stripeSecretKey =
    process.env.STRIPE_SECRET_KEY;

  const stripeWebhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY;

  const missingVariables = [
    ["STRIPE_SECRET_KEY", stripeSecretKey],
    ["STRIPE_WEBHOOK_SECRET", stripeWebhookSecret],
    ["NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
    ["SUPABASE_SECRET_KEY", supabaseSecretKey],
  ]
    .filter(([, value]) => !value?.trim())
    .map(([name]) => name);

  if (missingVariables.length > 0) {
    console.error(
      "Faltan variables:",
      missingVariables
    );

    return NextResponse.json(
      {
        error: `Faltan: ${missingVariables.join(", ")}`,
      },
      { status: 500 }
    );
  }

  const signature = request.headers.get(
    "stripe-signature"
  );

  if (!signature) {
    return NextResponse.json(
      { error: "Falta la firma de Stripe." },
      { status: 400 }
    );
  }

  const rawBody = await request.text();

  const stripe = new Stripe(stripeSecretKey!);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      stripeWebhookSecret!
    );
  } catch (error) {
    console.error(
      "Firma de Stripe inválida:",
      error
    );

    return NextResponse.json(
      { error: "Firma de Stripe inválida." },
      { status: 400 }
    );
  }

  const supabaseAdmin = createClient(
    supabaseUrl!,
    supabaseSecretKey!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  async function syncSubscription(
    subscription: Stripe.Subscription,
    fallbackBusinessId?: string | null,
    fallbackPlan?: string | null
  ) {
    const businessId = Number(
      subscription.metadata.business_id ||
        fallbackBusinessId
    );

    const subscriptionPriceId =
  subscription.items.data[0]?.price.id;

const paidPlan =
  subscriptionPriceId ===
  process.env.STRIPE_PRICE_BASIC
    ? "basic"
    : subscriptionPriceId ===
        process.env.STRIPE_PRICE_PROFESSIONAL
      ? "professional"
      : subscriptionPriceId ===
          process.env.STRIPE_PRICE_PREMIUM
        ? "premium"
        : subscription.metadata.plan ||
          fallbackPlan;

    if (
      !Number.isInteger(businessId) ||
      businessId <= 0 ||
      !isPaidPlan(paidPlan)
    ) {
      console.warn(
        "Suscripción sin negocio o plan válido:",
        subscription.id
      );

      return;
    }

    const customerId = getStripeId(
      subscription.customer
    );

    const periodEnd =
      subscription.items.data[0]
        ?.current_period_end;

    const subscriptionHasAccess = [
      "active",
      "trialing",
      "past_due",
    ].includes(subscription.status);

    const updates: Record<string, unknown> = {
      plan: subscriptionHasAccess
        ? paidPlan
        : "free",

      subscription_status:
        subscription.status,

      stripe_subscription_id:
        subscriptionHasAccess
          ? subscription.id
          : null,

      current_period_end:
        subscriptionHasAccess && periodEnd
          ? new Date(
              periodEnd * 1000
            ).toISOString()
          : null,
    };

    if (customerId) {
      updates.stripe_customer_id =
        customerId;
    }

    const { error } = await supabaseAdmin
      .from("business_registrations")
      .update(updates)
      .eq("id", businessId);

    if (error) {
      throw new Error(
        `No se pudo actualizar el negocio: ${error.message}`
      );
    }
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session =
          event.data
            .object as Stripe.Checkout.Session;

        let subscription:
          | Stripe.Subscription
          | null = null;

        if (
          typeof session.subscription ===
          "string"
        ) {
          subscription =
            await stripe.subscriptions.retrieve(
              session.subscription
            );
        } else if (session.subscription) {
          subscription =
            session.subscription;
        }

        if (subscription) {
          await syncSubscription(
            subscription,
            session.metadata?.business_id ||
              session.client_reference_id,
            session.metadata?.plan
          );
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription =
          event.data
            .object as Stripe.Subscription;

        await syncSubscription(subscription);

        break;
      }

      default:
        console.log(
          "Evento de Stripe ignorado:",
          event.type
        );
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Error procesando webhook de Stripe:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo procesar el webhook.",
      },
      { status: 500 }
    );
  }
}