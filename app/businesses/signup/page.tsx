"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function BusinessSignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (password.length < 6) {
      alert(
        "La contraseña debe tener por lo menos 6 caracteres."
      );
      return;
    }

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            account_type: "business",
          },
        },
      });

    if (error) {
      console.error(
        "Error al crear la cuenta:",
        error
      );

      alert(error.message);
      setSubmitting(false);
      return;
    }

    /*
      If email confirmation is disabled, Supabase usually
      creates a session immediately.
    */
    if (data.session) {
      router.push("/register");
      router.refresh();
      return;
    }

    setSubmitting(false);

    alert(
      "Cuenta creada. Revisa tu correo para confirmar tu cuenta y después inicia sesión."
    );

    router.push("/businesses/login");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-blue-700">
          Crear cuenta de negocio
        </h1>

        <p className="mt-3 text-gray-600">
          Crea tu cuenta antes de registrar la información de tu negocio.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4"
        >
          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Correo electrónico"
            className="w-full rounded border p-3"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Contraseña"
            className="w-full rounded border p-3"
            minLength={6}
            required
          />

          <div>
  <input
    type="password"
    value={confirmPassword}
    onChange={(event) =>
      setConfirmPassword(event.target.value)
    }
    placeholder="Confirmar contraseña"
    minLength={6}
    required
    aria-invalid={
      confirmPassword.length > 0 &&
      password !== confirmPassword
    }
    className={`w-full rounded border p-3 ${
      confirmPassword.length > 0 &&
      password !== confirmPassword
        ? "border-red-500"
        : ""
    }`}
  />

  {confirmPassword.length > 0 &&
    password !== confirmPassword && (
      <p className="mt-2 text-sm font-semibold text-red-600">
        Las contraseñas no coinciden.
      </p>
    )}
</div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-blue-700 p-3 font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Creando cuenta..."
              : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/businesses/login"
            className="font-semibold text-blue-700 hover:underline"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}