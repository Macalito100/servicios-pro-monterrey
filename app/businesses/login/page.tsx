"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function BusinessLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (error) {
      console.error("Error de inicio de sesión:", error);
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-blue-700 p-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {submitting ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </main>
  );
}