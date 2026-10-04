"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Provider = {
  business_id: number;
  business_name: string;
  service: string | null;
  municipality: string[] | string | null;
  logo_url: string | null;
  verified: boolean | null;
  plan: string | null;
};

function formatMunicipality(
  municipality: Provider["municipality"]
) {
  if (Array.isArray(municipality)) {
    return municipality.join(", ");
  }

  return municipality || "Ubicación no especificada";
}

export default function Providers() {
  const router = useRouter();

  const [providers, setProviders] = useState<Provider[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProviders() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/customer/login");
        return;
      }

      const requestId = new URLSearchParams(
        window.location.search
      ).get("request");

      if (!requestId || !/^\d+$/.test(requestId)) {
        setErrorMessage(
          "No se encontró la solicitud seleccionada."
        );
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc(
        "get_interested_providers",
        {
          p_request_id: Number(requestId),
        }
      );

      if (error) {
        console.error(
          "Error al cargar las empresas interesadas:",
          error
        );

        setErrorMessage(
          "No se pudieron cargar las empresas interesadas."
        );
        setLoading(false);
        return;
      }

      setProviders(
        Array.isArray(data) ? (data as Provider[]) : []
      );
      setLoading(false);
    }

    loadProviders();
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <Link
          href="/customer/dashboard"
          className="font-semibold text-blue-700 hover:underline"
        >
          ← Volver a mis solicitudes
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Comparar empresas
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Empresas interesadas
          </h1>

          <p className="mt-2 text-gray-600">
            Revisa las empresas que desean ayudarte con tu
            solicitud.
          </p>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-gray-600">
              Cargando empresas interesadas...
            </p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8">
            <p className="font-semibold text-red-700">
              {errorMessage}
            </p>
          </div>
        )}

        {!loading &&
          !errorMessage &&
          providers.length === 0 && (
            <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <div className="text-5xl">⏳</div>

              <h2 className="mt-4 text-xl font-bold text-gray-900">
                Todavía no hay empresas interesadas
              </h2>

              <p className="mt-2 text-gray-600">
                Cuando una empresa envíe su interés,
                aparecerá aquí.
              </p>
            </div>
          )}

        {!loading &&
          !errorMessage &&
          providers.length > 0 && (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {providers.map((provider) => (
                <article
                  key={provider.business_id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    {provider.logo_url ? (
                      <img
                        src={provider.logo_url}
                        alt={`Logo de ${provider.business_name}`}
                        className="h-16 w-16 rounded-xl border border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100 text-3xl">
                        🛠️
                      </div>
                    )}

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-900">
                          {provider.business_name}
                        </h2>

                        {provider.verified && (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                            ✓ Verificada
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-gray-600">
                        {provider.service ||
                          "Servicio profesional"}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        📍{" "}
                        {formatMunicipality(
                          provider.municipality
                        )}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/contractors/${provider.business_id}`}
                    className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
                  >
                    Ver perfil
                  </Link>
                </article>
              ))}
            </div>
          )}
      </div>
    </main>
  );
}