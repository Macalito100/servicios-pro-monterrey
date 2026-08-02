"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function CustomerRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
  useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRegister(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");

if (password !== confirmPassword) {
  setMessage("Las contraseñas no coinciden.");
  return;
}

setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          account_type: "customer",
        },
      },
    });

    if (error) {
      console.error("Error al crear la cuenta:", error);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setMessage("No se pudo crear la cuenta.");
      setLoading(false);
      return;
    }

    if (data.session) {
  router.push("/customer/dashboard");
  router.refresh();
  return;
}

setMessage(
  "Cuenta creada correctamente. Revisa tu correo para confirmar tu cuenta y después inicia sesión."
);

setLoading(false);

router.push("/customer/login");
router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-blue-700">
          Crear cuenta de cliente
        </h1>

        <p className="mt-3 text-gray-600">
          Regístrate para administrar tus solicitudes y guardar
          profesionales.
        </p>

        <form
          onSubmit={handleRegister}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block font-semibold"
            >
              Nombre completo
            </label>

            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              required
              className="w-full rounded border p-3"
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block font-semibold"
            >
              Teléfono
            </label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              required
              className="w-full rounded border p-3"
              placeholder="81 1234 5678"
            />
          </div>

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
              placeholder="cliente@email.com"
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
              minLength={6}
              className="w-full rounded border p-3"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
<div>
  <label
    htmlFor="confirmPassword"
    className="mb-2 block font-semibold"
  >
    Confirmar contraseña
  </label>

  <input
    id="confirmPassword"
    type="password"
    value={confirmPassword}
    onChange={(event) =>
      setConfirmPassword(event.target.value)
    }
    required
    minLength={6}
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
    placeholder="Escribe nuevamente tu contraseña"
  />

  {confirmPassword.length > 0 &&
    password !== confirmPassword && (
      <p className="mt-2 text-sm font-semibold text-red-600">
        Las contraseñas no coinciden.
      </p>
    )}
</div>
          {message && (
            <div className="rounded bg-blue-50 p-3 text-sm text-blue-800">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-700 p-3 font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/customer/login"
            className="font-semibold text-blue-700 hover:underline"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}