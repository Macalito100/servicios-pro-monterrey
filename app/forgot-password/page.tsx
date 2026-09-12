"use client";

import { useState } from "react";
import Link from "next/link";
import { Turnstile } from "@marsidev/react-turnstile";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
const [turnstileToken, setTurnstileToken] =
  useState<string | null>(null);

const [turnstileKey, setTurnstileKey] =
  useState(0);

const turnstileSiteKey =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

if (!turnstileToken) {
  setMessage(
    "Completa la verificación de seguridad."
  );
  return;
}

setLoading(true);
    setMessage("");
    setSuccess(false);

    const redirectTo =
      `${window.location.origin}/reset-password`;

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
  redirectTo,
  captchaToken: turnstileToken,
}
      );

    setLoading(false);

    if (error) {
      console.error(
        "Error al solicitar recuperación:",
        error
      );
setTurnstileToken(null);
setTurnstileKey((current) => current + 1);
      setMessage(
        "No se pudo enviar el correo. Inténtalo nuevamente."
      );

      return;
    }

    setSuccess(true);

    setMessage(
      "Si existe una cuenta con ese correo, recibirás un enlace para cambiar tu contraseña."
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow sm:p-8">
        <h1 className="text-3xl font-bold text-blue-700">
          Recuperar contraseña
        </h1>

        <p className="mt-3 text-gray-600">
          Escribe el correo asociado con tu cuenta.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-semibold"
            >
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              required
              className="w-full rounded border p-3"
              placeholder="correo@email.com"
            />
          </div>
{turnstileSiteKey ? (
  <div className="flex justify-center">
    <Turnstile
      key={turnstileKey}
      siteKey={turnstileSiteKey}
      onSuccess={(token) =>
        setTurnstileToken(token)
      }
      onExpire={() =>
        setTurnstileToken(null)
      }
      onError={() =>
        setTurnstileToken(null)
      }
      options={{
        theme: "light",
      }}
    />
  </div>
) : (
  <p className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">
    No se pudo cargar la verificación de seguridad.
  </p>
)}
          {message && (
            <div
              className={`rounded p-3 text-sm ${
                success
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={
  loading ||
  !turnstileToken ||
  !turnstileSiteKey
}
            className="w-full rounded bg-blue-700 p-3 font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Enviando..."
              : "Enviar enlace de recuperación"}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm">
          <Link
            href="/customer/login"
            className="block font-semibold text-blue-700 hover:underline"
          >
            Volver al acceso de clientes
          </Link>

          <Link
            href="/businesses/login"
            className="block font-semibold text-blue-700 hover:underline"
          >
            Volver al acceso de negocios
          </Link>
        </div>
      </div>
    </main>
  );
}