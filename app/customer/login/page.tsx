"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function CustomerLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
  console.error("Error al iniciar sesión:", error);

  if (error.message === "Email not confirmed") {
    setMessage(
      "Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada y la carpeta de spam."
    );
  } else {
    setMessage("Correo o contraseña incorrectos.");
  }

  setLoading(false);
  return;
}

    const accountType =
      data.user.user_metadata?.account_type;

    if (accountType !== "customer") {
      await supabase.auth.signOut();

      setMessage(
        "Esta cuenta no está registrada como cliente."
      );

      setLoading(false);
      return;
    }

    router.push("/customer/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-blue-700">
          Iniciar sesión
        </h1>

        <p className="mt-3 text-gray-600">
          Accede a tu cuenta de cliente.
        </p>

        <form
          onSubmit={handleLogin}
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
              required
              className="w-full rounded border p-3"
            />
          </div>

          <div>
  <label
    htmlFor="password"
    className="mb-2 block font-semibold"
  >
    Contraseña
  </label>

  <input
    id="password"
    type="password"
    value={password}
    onChange={(event) =>
      setPassword(event.target.value)
    }
    required
    className="w-full rounded border p-3"
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

          {message && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-700 p-3 font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link
            href="/customer/register"
            className="font-semibold text-blue-700 hover:underline"
          >
            Crear una cuenta
          </Link>
        </p>
      </div>
    </main>
  );
}