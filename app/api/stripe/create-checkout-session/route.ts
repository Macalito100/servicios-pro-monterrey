import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

type PaidPlan = "basic" | "professional" | "premium";

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY;

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const requiredVariables = {
  STRIPE_SECRET_KEY: stripeSecretKey,
  NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
  supabasePublishableKey,
  STRIPE_PRICE_BASIC:
    process.env.STRIPE_PRICE_BASIC,
  STRIPE_PRICE_PROFESSIONAL:
    process.env.STRIPE_PRICE_PROFESSIONAL,
  STRIPE_PRICE_PREMIUM:
    process.env.STRIPE_PRICE_PREMIUM,
};

const missingVariables = Object.entries(
  requiredVariables
)
  .filter(([, value]) => !value?.trim())
  .map(([name]) => name);

if (missingVariables.length > 0) {
  return NextResponse.json(
    {
      error: `Faltan: ${missingVariables.join(", ")}`,
    },
    { status: 500 }
  );
}

    const authorization =
      request.headers.get("authorization");

    const accessToken = authorization
      ?.replace(/^Bearer\s+/i, "")
      .trim();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const supabase = createClient(
  supabaseUrl!,
  supabasePublishableKey!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Sesión inválida." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      plan?: string;
    };

    const allowedPlans: PaidPlan[] = [
      "basic",
      "professional",
      "premium",
    ];

    if (
      !body.plan ||
      !allowedPlans.includes(body.plan as PaidPlan)
    ) {
      return NextResponse.json(
        { error: "El plan seleccionado no es válido." },
        { status: 400 }
      );
    }

    const plan = body.plan as PaidPlan;

    const priceIds: Record<PaidPlan, string | undefined> = {
      basic: process.env.STRIPE_PRICE_BASIC,
      professional:
        process.env.STRIPE_PRICE_PROFESSIONAL,
      premium: process.env.STRIPE_PRICE_PREMIUM,
    };

    const priceId = priceIds[plan];

    if (!priceId) {
      return NextResponse.json(
        {
          error:
            "No se encontró el precio de este plan.",
        },
        { status: 500 }
      );
    }

    const {
      data: business,
      error: businessError,
    } = await supabase
      .from("business_registrations")
      .select(
        `
          id,
          business_name,
          plan,
          subscription_status,
          stripe_customer_id
        `
      )
      .eq("owner_user_id", user.id)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        {
          error:
            "No se encontró el negocio de esta cuenta.",
        },
        { status: 404 }
      );
    }

    if (
      business.plan !== "free" &&
      ["active", "trialing"].includes(
        business.subscription_status
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Tu negocio ya tiene una suscripción activa.",
        },
        { status: 409 }
      );
    }

    const stripe = new Stripe(stripeSecretKey!);

    const metadata = {
      business_id: String(business.id),
      plan,
    };

    const checkoutSession =
      await stripe.checkout.sessions.create({
        mode: "subscription",
        adaptive_pricing: {
  enabled: false,
},

        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],

        customer:
          business.stripe_customer_id || undefined,

        customer_email:
          business.stripe_customer_id
            ? undefined
            : user.email,

        client_reference_id: String(business.id),

        metadata,

        subscription_data: {
          metadata,
        },

        success_url:
          `${request.nextUrl.origin}` +
          "/businesses/dashboard?checkout=success",

        cancel_url:
          `${request.nextUrl.origin}` +
          "/pricing?checkout=cancelled",

        locale: "es",
      });

    if (!checkoutSession.url) {
      return NextResponse.json(
        {
          error:
            "Stripe no devolvió una página de pago.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error(
      "Error al crear Stripe Checkout:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo abrir la página de pago.",
      },
      { status: 500 }
    );
  }
}