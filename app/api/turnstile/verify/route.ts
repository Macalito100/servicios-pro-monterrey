import { NextResponse } from "next/server";

type TurnstileResult = {
  success: boolean;
  hostname?: string;
  "error-codes"?: string[];
};

export async function POST(request: Request) {
  const secretKey =
    process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error(
      "Falta TURNSTILE_SECRET_KEY."
    );

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }

  let token: unknown;

  try {
    const body = await request.json();
    token = body.token;
  } catch {
    return NextResponse.json(
      { success: false },
      { status: 400 }
    );
  }

  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > 2048
  ) {
    return NextResponse.json(
      { success: false },
      { status: 400 }
    );
  }

  const forwardedFor =
    request.headers.get("x-forwarded-for");

  const remoteIp =
    request.headers.get("cf-connecting-ip") ??
    forwardedFor?.split(",")[0]?.trim();

  const verificationData = new URLSearchParams({
    secret: secretKey,
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

    const result =
      (await cloudflareResponse.json()) as TurnstileResult;

    if (!result.success) {
      console.warn(
        "Falló la verificación Turnstile:",
        result["error-codes"]
      );

      return NextResponse.json(
        { success: false },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
    });
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
}