import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type TurnstileResult = {
  success: boolean;
  "error-codes"?: string[];
};

function cleanString(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export async function POST(request: Request) {
  const turnstileSecretKey =
    process.env.TURNSTILE_SECRET_KEY;

  if (!turnstileSecretKey) {
    console.error("Falta TURNSTILE_SECRET_KEY.");

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false },
      { status: 400 }
    );
  }

  const token = cleanString(body.token);
  const name = cleanString(body.name);
  const phone = cleanString(body.phone);
  const email = cleanString(body.email);
  const propertyType = cleanString(body.propertyType);
  const requestType = cleanString(body.requestType);
  const service = cleanString(body.service);
  const municipality = cleanString(body.municipality);
  const description = cleanString(body.description);
  const preferredDate = cleanString(body.preferredDate);
  const preferredTimeWindow = cleanString(
    body.preferredTimeWindow
  );
  const alternativeDate = cleanString(
    body.alternativeDate
  );

  if (
    !token ||
    token.length > 2048 ||
    !name ||
    name.length > 120 ||
    !phone ||
    phone.length > 50 ||
    !email ||
    email.length > 254 ||
    !propertyType ||
    propertyType.length > 100 ||
    !service ||
    service.length > 120 ||
    !municipality ||
    municipality.length > 120 ||
    !description ||
    description.length > 5000
  ) {
    return NextResponse.json(
      { success: false },
      { status: 400 }
    );
  }

  if (
    requestType !== "quote" &&
    requestType !== "visit"
  ) {
    return NextResponse.json(
      { success: false },
      { status: 400 }
    );
  }

  if (
    requestType === "visit" &&
    (!preferredDate || !preferredTimeWindow)
  ) {
    return NextResponse.json(
      { success: false },
      { status: 400 }
    );
  }

  let businessId: number | null = null;

  if (
    body.businessId !== null &&
    body.businessId !== undefined
  ) {
    if (
      typeof body.businessId !== "number" ||
      !Number.isInteger(body.businessId) ||
      body.businessId <= 0
    ) {
      return NextResponse.json(
        { success: false },
        { status: 400 }
      );
    }

    businessId = body.businessId;
  }

  let photoUrls: string[] = [];

  if (body.photoUrls !== undefined) {
    if (
      !Array.isArray(body.photoUrls) ||
      body.photoUrls.length > 10 ||
      !body.photoUrls.every(
        (url) =>
          typeof url === "string" &&
          url.length > 0 &&
          url.length <= 2048
      )
    ) {
      return NextResponse.json(
        { success: false },
        { status: 400 }
      );
    }

    photoUrls = body.photoUrls;
  }

  const forwardedFor =
    request.headers.get("x-forwarded-for");

  const remoteIp =
    request.headers.get("cf-connecting-ip") ??
    forwardedFor?.split(",")[0]?.trim();

  const verificationData = new URLSearchParams({
    secret: turnstileSecretKey,
    response: token,
  });

  if (remoteIp) {
    verificationData.set("remoteip", remoteIp);
  }

  try {
    const cloudflareResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: verificationData.toString(),
        cache: "no-store",
      }
    );

    if (!cloudflareResponse.ok) {
      return NextResponse.json(
        { success: false },
        { status: 502 }
      );
    }

    const turnstileResult =
      (await cloudflareResponse.json()) as TurnstileResult;

    if (!turnstileResult.success) {
      console.warn(
        "Falló la verificación Turnstile:",
        turnstileResult["error-codes"]
      );

      return NextResponse.json(
        { success: false },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error(
      "Error al verificar Turnstile:",
      error
    );

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }

  let customerId: string | null = null;

  const authorization =
    request.headers.get("authorization");

  if (authorization) {
    const accessToken = authorization
      .replace(/^Bearer\s+/i, "")
      .trim();

    if (!accessToken) {
      return NextResponse.json(
        { success: false },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { success: false },
        { status: 401 }
      );
    }

    customerId = user.id;
  }

  let selectedBusiness: {
    id: number;
    business_name: string;
    service: string;
  } | null = null;

  if (businessId) {
    const { data, error } = await supabaseAdmin
      .from("business_registrations")
      .select("id, business_name, service")
      .eq("id", businessId)
      .eq("status", "approved")
      .maybeSingle();

    if (error) {
      console.error(
        "Error al verificar el negocio:",
        error
      );

      return NextResponse.json(
        { success: false },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false },
        { status: 400 }
      );
    }

    selectedBusiness = data;
  }

  const { data: quoteRequest, error: insertError } =
    await supabaseAdmin
      .from("quote_requests")
      .insert({
        customer_id: customerId,
        name,
        phone,
        email,
        property_type: propertyType,
        service: selectedBusiness?.service ?? service,
        municipality,
        description,
        request_type: requestType,

        preferred_date:
          requestType === "visit"
            ? preferredDate
            : null,

        preferred_time_window:
          requestType === "visit"
            ? preferredTimeWindow
            : null,

        alternative_date:
          requestType === "visit" &&
          alternativeDate
            ? alternativeDate
            : null,

        business_id: selectedBusiness?.id ?? null,

        contractor_id: selectedBusiness
          ? String(selectedBusiness.id)
          : null,

        contractor_name:
          selectedBusiness?.business_name ?? null,

        photo_urls: photoUrls,
        status: "new",
        is_read: false,
      })
      .select("id")
      .single();

  if (insertError) {
    console.error(
      "Error al guardar la solicitud:",
      insertError
    );

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    requestId: quoteRequest.id,
  });
}