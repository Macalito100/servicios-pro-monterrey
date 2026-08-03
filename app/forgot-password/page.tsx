"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

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
        }
      );

    setLoading(false);

    if (error) {
      console.error(
        "Error al solicitar recuperación:",
        error
      );

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
            disabled={loading}
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