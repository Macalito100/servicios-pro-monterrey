"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [hasSession, setHasSession] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      setHasSession(Boolean(session));
      setCheckingSession(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) {
          return;
        }

        setHasSession(Boolean(session));
        setCheckingSession(false);
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setSuccess(false);

    if (password.length < 6) {
      setMessage(
        "La contraseña debe tener por lo menos 6 caracteres."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const { data, error } =
      await supabase.auth.updateUser({
        password,
      });

    setLoading(false);

    if (error) {
      console.error(
        "Error al cambiar la contraseña:",
        error
      );

      setMessage(
        "No se pudo cambiar la contraseña. Solicita un enlace nuevo."
      );

      return;
    }

    const accountType =
      data.user.user_metadata?.account_type;

    const loginPath =
      accountType === "business"
        ? "/businesses/login"
        : "/customer/login";

    setSuccess(true);
    setMessage(
      "Contraseña actualizada correctamente. Ahora puedes iniciar sesión."
    );

    window.setTimeout(async () => {
      await supabase.auth.signOut();
      router.replace(loginPath);
      router.refresh();
    }, 1500);
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-10">
        <p className="text-center text-gray-600">
          Verificando enlace...
        </p>
      </main>
    );
  }

  if (!hasSession) {
    return (
      <main className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow sm:p-8">
          <h1 className="text-2xl font-bold text-red-700">
            Enlace inválido o vencido
          </h1>

          <p className="mt-3 text-gray-600">
            Solicita un nuevo enlace para cambiar tu contraseña.
          </p>

          <a
            href="/forgot-password"
            className="mt-6 inline-block rounded bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Solicitar otro enlace
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow sm:p-8">
        <h1 className="text-3xl font-bold text-blue-700">
          Crear nueva contraseña
        </h1>

        <p className="mt-3 text-gray-600">
          Escribe y confirma tu nueva contraseña.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-semibold"
            >
              Nueva contraseña
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
              autoComplete="new-password"
              className="w-full rounded border p-3"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block font-semibold"
            >
              Confirmar nueva contraseña
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
              autoComplete="new-password"
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
              placeholder="Escribe nuevamente la contraseña"
            />

            {confirmPassword.length > 0 &&
              password !== confirmPassword && (
                <p className="mt-2 text-sm font-semibold text-red-600">
                  Las contraseñas no coinciden.
                </p>
              )}
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
            disabled={loading || success}
            className="w-full rounded bg-blue-700 p-3 font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Actualizando..."
              : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </main>
  );
}