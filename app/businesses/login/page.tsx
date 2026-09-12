"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Turnstile } from "@marsidev/react-turnstile";
import { supabase } from "@/lib/supabase";

export default function BusinessLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
const [turnstileToken, setTurnstileToken] =
  useState<string | null>(null);

const [turnstileKey, setTurnstileKey] =
  useState(0);

const turnstileSiteKey =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

if (!turnstileToken) {
  alert(
    "Completa la verificación de seguridad."
  );
  return;
}

setSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
  options: {
    captchaToken: turnstileToken,
  },
});

    setSubmitting(false);

    if (error) {
  console.error("Error de inicio de sesión:", error);

  setTurnstileToken(null);
  setTurnstileKey((current) => current + 1);

  alert("Correo o contraseña incorrectos.");
  return;
}

    router.push("/businesses/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-blue-700">
          Acceso para profesionales
        </h1>

        <p className="mt-3 text-gray-600">
          Inicia sesión para administrar tu negocio y revisar solicitudes.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4"
        >
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-3"
            required
          />

          <div>
  <input
    type="password"
    placeholder="Contraseña"
    value={password}
    onChange={(e) =>
      setPassword(e.target.value)
    }
    className="w-full rounded border p-3"
    required
  />

  <div className="mt-2 text-right">
    <Link
      href="/forgot-password"
      className="text-sm font-semibold text-blue-700 hover:underline"
    >
      ¿Olvidaste tu contraseña?
    </Link>
  </div>
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
          <button
            type="submit"
            disabled={
  submitting ||
  !turnstileToken ||
  !turnstileSiteKey
}
            className="w-full rounded bg-blue-700 p-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {submitting ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </main>
  );
}