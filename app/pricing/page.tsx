"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type PaidPlan =
  | "basic"
  | "professional"
  | "premium";

type Plan = {
  key: PaidPlan | null;
  name: string;
  price: string;
  description: string;
  features: string[];
  featured: boolean;
};

const plans: Plan[] = [
  {
    key: null,
    name: "Gratis",
    price: "$0",
    description: "Para comenzar a recibir clientes.",
    features: [
      "5 trabajos aceptados por mes",
      "Perfil público del negocio",
      "Recibir solicitudes de clientes",
      "Acceso a conversaciones",
    ],
    featured: false,
  },
  {
    key: "basic",
    name: "Básico",
    price: "$149",
    description:
      "Para negocios que quieren aceptar más trabajos.",
    features: [
      "Trabajos aceptados ilimitados",
      "Perfil público del negocio",
      "Solicitudes ilimitadas",
      "Acceso a conversaciones",
    ],
    featured: false,
  },
  {
    key: "professional",
    name: "Profesional",
    price: "$299",
    description:
      "Para aumentar la visibilidad de tu negocio.",
    features: [
      "Todo lo incluido en Básico",
      "Trabajos aceptados ilimitados",
      "Perfil destacado",
      "Estadísticas avanzadas",
    ],
    featured: true,
  },
  {
    key: "premium",
    name: "Premium",
    price: "$499",
    description:
      "La mayor visibilidad para tu negocio.",
    features: [
      "Todo lo incluido en Profesional",
      "Posición prioritaria en resultados",
      "Aparición destacada en la página principal",
      "Insignia Premium en el perfil",
      "Soporte prioritario",
    ],
    featured: false,
  },
];

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] =
    useState<PaidPlan | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");
const [acceptedTerms, setAcceptedTerms] =
  useState(false);
  
  async function startCheckout(plan: PaidPlan) {
  if (!acceptedTerms) {
    setErrorMessage(
      "Debes aceptar los términos y autorizar el cobro mensual recurrente antes de continuar."
    );
    return;
  }

  setLoadingPlan(plan);
  setErrorMessage("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (
        sessionError ||
        !session?.access_token
      ) {
        throw new Error(
          "Debes iniciar sesión con tu cuenta de negocio."
        );
      }

      const response = await fetch(
        "/api/stripe/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ plan }),
        }
      );

      const result = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !result.url) {
        throw new Error(
          result.error ||
            "No se pudo abrir la página de pago."
        );
      }

      window.location.href = result.url;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error."
      );

      setLoadingPlan(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="font-semibold text-purple-700">
            Servi Pro Monterrey
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            Elige el plan ideal para tu negocio
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Recibe solicitudes de clientes y aumenta la
            visibilidad de tu negocio.
          </p>
        </div>

        {errorMessage && (
          <div className="mx-auto mt-6 max-w-2xl rounded-lg border border-red-300 bg-red-50 p-4 text-center font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

<div className="mx-auto mt-8 max-w-3xl rounded-xl border border-purple-200 bg-white p-5 shadow-sm">
  <label className="flex cursor-pointer items-start gap-3">
    <input
      type="checkbox"
      checked={acceptedTerms}
      onChange={(event) => {
        setAcceptedTerms(event.target.checked);

        if (event.target.checked) {
          setErrorMessage("");
        }
      }}
      className="mt-1 h-5 w-5 shrink-0"
    />

    <span className="text-sm leading-relaxed text-gray-700">
      Autorizo el cobro automático mensual del plan que
      seleccione, por el precio mostrado, en la misma fecha de
      cada mes hasta que lo cancele. Podré cancelarlo sin
      penalización desde el panel de mi negocio.
    </span>
  </label>

  <p className="mt-3 text-sm text-gray-600">
    Al continuar, acepto los{" "}
    <Link
      href="/terms"
      target="_blank"
      className="font-semibold text-purple-700 hover:underline"
    >
      Términos y Condiciones
    </Link>
    .
  </p>
</div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-2xl bg-white p-6 shadow ${
                plan.featured
                  ? "border-2 border-purple-600"
                  : "border border-gray-200"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-700 px-4 py-1 text-sm font-semibold text-white">
                  Más popular
                </span>
              )}

              <h2 className="text-2xl font-bold text-gray-900">
                {plan.name}
              </h2>

              <p className="mt-2 min-h-12 text-sm text-gray-600">
                {plan.description}
              </p>

              <div className="mt-5">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price}
                </span>

                <span className="text-gray-500">
                  {" "}
                  MXN/mes
                </span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="font-bold text-green-600">
                      ✓
                    </span>

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.key === null ? (
                <Link
                  href="/businesses/dashboard"
                  className="mt-8 block rounded-lg border border-purple-700 px-4 py-3 text-center font-semibold text-purple-700 hover:bg-purple-50"
                >
                  Continuar con Gratis
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    startCheckout(plan.key as PaidPlan)
                  }
                  disabled={loadingPlan !== null}
                  className={`mt-8 rounded-lg px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                    plan.featured
                      ? "bg-purple-700 hover:bg-purple-800"
                      : "bg-gray-700 hover:bg-gray-800"
                  }`}
                >
                  {loadingPlan === plan.key
                    ? "Abriendo pago..."
                    : `Seleccionar ${plan.name}`}
                </button>
              )}
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/businesses/dashboard"
            className="font-semibold text-purple-700 hover:underline"
          >
            ← Volver al panel del negocio
          </Link>
        </div>
      </div>
    </main>
  );
}