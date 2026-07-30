import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY;
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabasePublishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (
      !stripeSecretKey ||
      !supabaseUrl ||
      !supabasePublishableKey
    ) {
      return NextResponse.json(
        {
          error:
            "Faltan variables de configuración del servidor.",
        },
        { status: 500 }
      );
    }

    const authorization =
      request.headers.get("authorization");

    const accessToken = authorization?.replace(
      /^Bearer\s+/i,
      ""
    );

    if (!accessToken) {
      return NextResponse.json(
        { error: "Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabasePublishableKey,
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

    const {
      data: business,
      error: businessError,
    } = await supabase
      .from("business_registrations")
      .select("stripe_customer_id")
      .eq("owner_user_id", user.id)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: "No se encontró el negocio." },
        { status: 404 }
      );
    }

    if (!business.stripe_customer_id) {
      return NextResponse.json(
        {
          error:
            "Este negocio no tiene una suscripción de Stripe.",
        },
        { status: 400 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    const portalSession =
      await stripe.billingPortal.sessions.create({
        customer: business.stripe_customer_id,
        return_url: new URL(
          "/businesses/dashboard",
          request.url
        ).toString(),
      });

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error(
      "Error creating Stripe portal session:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo abrir la administración de la suscripción.",
      },
      { status: 500 }
    );
  }
}