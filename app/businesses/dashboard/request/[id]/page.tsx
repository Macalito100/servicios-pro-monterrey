"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type QuoteRequest = {
  id: number;
  created_at: string;

  customer_id: string;
business_id: number;

  name: string;
  phone: string;
  email: string;

  property_type: string | null;
  service: string | null;
  description: string | null;
  photo_urls: string[] | null;

  request_type: "quote" | "visit" | null;

  preferred_date: string | null;
  preferred_time_window: string | null;
  alternative_date: string | null;

  status: string;
  is_read: boolean;

  business_response: string | null;
  responded_at: string | null;
};

function formatDate(date: string | null) {
  if (!date) {
    return "No especificada";
  }

  return new Date(`${date}T12:00:00`).toLocaleDateString(
    "es-MX",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function formatCreatedAt(date: string) {
  return new Date(date).toLocaleString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusDetails(status: string) {
  switch (status) {
    case "accepted":
      return {
        label: "Aceptada",
        className: "bg-blue-100 text-blue-700",
      };

    case "rejected":
      return {
        label: "Rechazada",
        className: "bg-red-100 text-red-700",
      };

    case "in_progress":
      return {
        label: "En progreso",
        className: "bg-purple-100 text-purple-700",
      };

    case "completed":
      return {
        label: "Completada",
        className: "bg-green-100 text-green-700",
      };

    case "new":
    default:
      return {
        label: "Nueva",
        className: "bg-yellow-100 text-yellow-700",
      };
  }
}

export default function BusinessRequestDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [request, setRequest] =
    useState<QuoteRequest | null>(null);


  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadRequest() {
      const requestId = Number(params.id);

      if (!Number.isInteger(requestId)) {
        setErrorMessage(
          "El número de la solicitud no es válido."
        );
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/businesses/login");
        return;
      }

      const {
        data: business,
        error: businessError,
      } = await supabase
        .from("business_registrations")
        .select("id")
        .eq("owner_user_id", user.id)
        .single();

console.log("Business from DB:", business);
console.log("Business error:", businessError);
console.log("Logged in user:", user.id);

      if (businessError || !business) {
        console.error(
          "No se encontró el negocio:",
          businessError
        );

        setErrorMessage(
          "Tu cuenta no está vinculada con un negocio."
        );
        setLoading(false);
        return;
      }

      const {
        data: requestData,
        error: requestError,
      } = await supabase
        .from("quote_requests")
        .select(`
  id,
  created_at,
  customer_id,
  business_id,
  name,
          phone,
          email,
          property_type,
          service,
          description,
          photo_urls,
          request_type,
          preferred_date,
          preferred_time_window,
          alternative_date,
          status,
          is_read,
          business_response,
          responded_at
        `)
        .eq("id", requestId)
        .eq("business_id", business.id)
        .single();

console.log("Looking for request:", requestId);
console.log("Request result:", requestData);
console.log("Request error:", requestError);

      if (requestError || !requestData) {
        console.error(
          "No se encontró la solicitud:",
          requestError
        );

        setErrorMessage(
          "No se encontró esta solicitud o no pertenece a tu negocio."
        );
        setLoading(false);
        return;
      }

      const loadedRequest =
        requestData as QuoteRequest;

      setRequest(loadedRequest);


      if (!loadedRequest.is_read) {
        const { error: readError } = await supabase
          .from("quote_requests")
          .update({ is_read: true })
          .eq("id", loadedRequest.id)
          .eq("business_id", business.id);

        if (readError) {
          console.error(
            "No se pudo marcar como leída:",
            readError
          );
        } else {
          setRequest((current) =>
            current
              ? {
                  ...current,
                  is_read: true,
                }
              : current
          );
        }
      }

      setLoading(false);
    }

    loadRequest();
  }, [params.id, router]);

  async function updateRequestStatus(
    status:
      | "accepted"
      | "rejected"
      | "in_progress"
      | "completed"
  ) {
    if (!request) {
      return;
    }

    setSaving(true);



    const updateData: {
  status: string;
  is_read: boolean;
  responded_at?: string;
} = {
      status,
      is_read: true,
    };

    if (
  status === "accepted" ||
  status === "rejected"
) {
  updateData.responded_at =
    new Date().toISOString();
}

    const { data, error } = await supabase
      .from("quote_requests")
      .update(updateData)
      .eq("id", request.id)
      .select(`
        id,
        status,
        is_read,
        business_response,
        responded_at
      `)
      .single();

    if (error) {
      console.error(
        "No se pudo actualizar la solicitud:",
        error
      );

      alert("No se pudo cambiar el estado.");
      setSaving(false);
      return;
    }

    setRequest((current) =>
  current
    ? {
        ...current,
        status: data.status,
        is_read: data.is_read,
        responded_at: data.responded_at,
      }
    : current
);


if (status === "accepted") {
  const conversationId =
    await getOrCreateConversation();

  setSaving(false);

  if (conversationId) {
    router.push(
      `/businesses/messages/${conversationId}`
    );
  }

  return;
}

setSaving(false);
  }

async function getOrCreateConversation() {
  if (!request) {
    return null;
  }

  const {
    data: existingConversation,
    error: existingError,
  } = await supabase
    .from("conversations")
    .select("id")
    .eq("quote_request_id", request.id)
    .maybeSingle();

  if (existingError) {
    console.error(
      "No se pudo buscar la conversación:",
      existingError
    );

    alert("No se pudo abrir la conversación.");
    return null;
  }

  if (existingConversation) {
    return existingConversation.id;
  }

  const {
    data: newConversation,
    error: createError,
  } = await supabase
    .from("conversations")
    .insert({
      quote_request_id: request.id,
      customer_id: request.customer_id,
      business_id: request.business_id,
    })
    .select("id")
    .single();

  if (createError) {
    console.error(
      "No se pudo crear la conversación:",
      createError
    );

    alert("No se pudo crear la conversación.");
    return null;
  }

  return newConversation.id;
}

async function openConversation() {
  setSaving(true);

  const conversationId =
    await getOrCreateConversation();

  setSaving(false);

  if (!conversationId) {
    return;
  }

  router.push(
    `/businesses/messages/${conversationId}`
  );
}

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6 md:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl bg-white p-8 shadow">
            <p className="text-gray-600">
              Cargando solicitud...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (errorMessage || !request) {
    return (
      <main className="min-h-screen bg-gray-100 p-6 md:p-8">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-red-700">
            Solicitud no encontrada
          </h1>

          <p className="mt-3 text-gray-600">
            {errorMessage}
          </p>

          <Link
            href="/businesses/dashboard"
            className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Volver al panel
          </Link>
        </div>
      </main>
    );
  }

  const statusDetails =
    getStatusDetails(request.status);

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href="/businesses/dashboard#solicitudes"
            className="font-semibold text-blue-700 hover:text-blue-900"
          >
            ← Volver a solicitudes
          </Link>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5 border-b border-gray-200 pb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Solicitud #{request.id}
              </p>

              <h1 className="mt-2 text-3xl font-bold text-gray-900">
                {request.service ||
                  "Servicio solicitado"}
              </h1>

              <p className="mt-2 text-gray-500">
                Recibida el{" "}
                {formatCreatedAt(
                  request.created_at
                )}
              </p>
            </div>

            <span
              className={`rounded-full px-4 py-2 font-bold ${statusDetails.className}`}
            >
              {statusDetails.label}
            </span>
          </div>

          <div className="mt-7 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-5">
              <h2 className="text-lg font-bold text-gray-900">
                Información del cliente
              </h2>

              <div className="mt-4 space-y-3 text-gray-700">
                <p>
                  <strong>Nombre:</strong>{" "}
                  {request.name}
                </p>

                <p>
                  <strong>Teléfono:</strong>{" "}
                  {request.phone}
                </p>

                <p>
                  <strong>Correo:</strong>{" "}
                  {request.email}
                </p>

                <p>
                  <strong>Tipo de propiedad:</strong>{" "}
                  {request.property_type ||
                    "No especificado"}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={`tel:${request.phone}`}
                  className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
                >
                  📞 Llamar
                </a>

                <a
                  href={`mailto:${request.email}`}
                  className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
                >
                  ✉️ Correo
                </a>

                <a
                  href={`https://wa.me/52${request.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <h2 className="text-lg font-bold text-gray-900">
                Información del servicio
              </h2>

              <div className="mt-4 space-y-3 text-gray-700">
                <p>
                  <strong>Tipo de solicitud:</strong>{" "}
                  {request.request_type === "visit"
                    ? "Visita"
                    : "Cotización"}
                </p>

                <p>
                  <strong>Servicio:</strong>{" "}
                  {request.service ||
                    "No especificado"}
                </p>

                <p>
                  <strong>Fecha preferida:</strong>{" "}
                  {formatDate(
                    request.preferred_date
                  )}
                </p>

                <p>
                  <strong>Horario:</strong>{" "}
                  {request.preferred_time_window ||
                    "Flexible"}
                </p>

                {request.alternative_date && (
                  <p>
                    <strong>
                      Fecha alternativa:
                    </strong>{" "}
                    {formatDate(
                      request.alternative_date
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          <section className="mt-7">
            <h2 className="text-xl font-bold">
              Descripción del proyecto
            </h2>

            <div className="mt-3 rounded-xl bg-gray-50 p-5 text-gray-700">
              <p className="whitespace-pre-wrap">
                {request.description ||
                  "El cliente no agregó una descripción."}
              </p>
            </div>
          </section>

          <section className="mt-7">
            <h2 className="text-xl font-bold">
              Fotos del proyecto
            </h2>

            {request.photo_urls &&
            request.photo_urls.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {request.photo_urls.map(
                  (url, index) => (
                    <a
                      key={`${url}-${index}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                    >
                      <img
                        src={url}
                        alt={`Foto del proyecto ${
                          index + 1
                        }`}
                        className="h-40 w-full object-cover transition hover:scale-105"
                      />
                    </a>
                  )
                )}
              </div>
            ) : (
              <div className="mt-3 rounded-xl bg-gray-50 p-5 text-gray-600">
                El cliente no agregó fotos.
              </div>
            )}
          </section>

        

          <div className="mt-7 flex flex-wrap gap-3">

  {/* Nueva */}
  {request.status === "new" && (
    <>
      <button
        type="button"
        disabled={saving}
        onClick={() => updateRequestStatus("accepted")}
        className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
      >
        ✔️ Aceptar y enviar
      </button>

      <button
        type="button"
        disabled={saving}
        onClick={() => updateRequestStatus("rejected")}
        className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
      >
        ❌ Rechazar y enviar
      </button>
    </>
  )}

  {/* Aceptada */}
  {request.status === "accepted" && (
    <>
      <button
  type="button"
  disabled={saving}
  onClick={openConversation}
  className="rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
>
  {saving
    ? "Abriendo..."
    : "💬 Abrir conversación"}
</button>

      <button
        type="button"
        disabled={saving}
        onClick={() => updateRequestStatus("in_progress")}
        className="rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
      >
        🚧 Iniciar trabajo
      </button>
    </>
  )}

  {/* En progreso */}
  {request.status === "in_progress" && (
    <>
      <button
  type="button"
  disabled={saving}
  onClick={openConversation}
  className="rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
>
  {saving
    ? "Abriendo..."
    : "💬 Abrir conversación"}
</button>

      <button
        type="button"
        disabled={saving}
        onClick={() => updateRequestStatus("completed")}
        className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
      >
        ✅ Marcar completada
      </button>
    </>
  )}

  {/* Completada */}
  {request.status === "completed" && (
    <>
      <button
  type="button"
  disabled={saving}
  onClick={openConversation}
  className="rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
>
  {saving
    ? "Abriendo..."
    : "💬 Abrir conversación"}
</button>

      <div className="rounded-lg bg-green-100 px-5 py-3 font-semibold text-green-700">
        ⭐ Esperando reseña del cliente
      </div>
    </>
  )}

  {/* Rechazada */}
  {request.status === "rejected" && (
    <div className="rounded-lg bg-red-100 px-5 py-3 font-semibold text-red-700">
      ❌ Solicitud rechazada
    </div>
  )}

</div>
        </section>
      </div>
    </main>
  );
}