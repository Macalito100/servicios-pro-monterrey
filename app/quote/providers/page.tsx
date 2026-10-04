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
  const [quoteRequestId, setQuoteRequestId] =
  useState<number | null>(null);

const [selectingBusinessId, setSelectingBusinessId] =
  useState<number | null>(null);

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
setQuoteRequestId(Number(requestId));
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
async function selectProvider(provider: Provider) {
  if (!quoteRequestId) {
    alert("No se encontró la solicitud.");
    return;
  }

  const confirmed = window.confirm(
    `¿Deseas seleccionar a ${provider.business_name}?`
  );

  if (!confirmed) {
    return;
  }

  setSelectingBusinessId(provider.business_id);

  const { data, error } = await supabase.rpc(
    "select_quote_provider",
    {
      p_request_id: quoteRequestId,
      p_business_id: provider.business_id,
    }
  );

  if (error) {
    console.error(
      "Error al seleccionar la empresa:",
      error
    );

    alert("No se pudo seleccionar la empresa.");
    setSelectingBusinessId(null);
    return;
  }

  const result = data as {
    success?: boolean;
    reason?: string;
    conversation_id?: number;
  };

 if (!result?.success) {
  if (result?.reason === "provider_limit") {
    alert(
      "Esta empresa alcanzó el límite mensual de trabajos de su plan. Selecciona otra empresa."
    );
  } else if (
    result?.reason === "invalid_status"
  ) {
    alert(
      "Esta solicitud ya tiene una empresa seleccionada."
    );
  } else if (
    result?.reason === "invalid_provider"
  ) {
    alert(
      "Esta empresa ya no está disponible para la solicitud."
    );
  } else {
    alert(
      "No tienes permiso para seleccionar esta empresa."
    );
  }

  setSelectingBusinessId(null);
  return;
}

  alert(
    `${provider.business_name} fue seleccionada correctamente.`
  );

  if (result.conversation_id) {
    router.push(
      `/customer/messages/${result.conversation_id}`
    );
  } else {
    router.push("/customer/dashboard");
  }
}
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

                 <div className="mt-6 flex flex-wrap gap-3">
  <Link
    href={`/contractors/${provider.business_id}`}
    className="inline-block rounded-lg border border-blue-700 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
  >
    Ver perfil
  </Link>

  <button
    type="button"
    onClick={() => selectProvider(provider)}
    disabled={selectingBusinessId !== null}
    className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {selectingBusinessId === provider.business_id
      ? "Seleccionando..."
      : "Seleccionar empresa"}
  </button>
</div>
                </article>
              ))}
            </div>
          )}
      </div>
    </main>
  );
}