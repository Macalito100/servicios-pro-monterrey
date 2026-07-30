"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type QuoteRequest = {
  id: string;
  created_at: string;
  service: string | null;
  description: string | null;
  contractor_name: string | null;
  status: string | null;
  preferred_date: string | null;
  preferred_time_window: string | null;
  alternative_date: string | null;
  business_response: string | null;
  responded_at: string | null;
  photo_urls: string[] | null;
};

function getStatusDetails(status: string | null) {
  switch (status) {
    case "accepted":
      return {
        label: "Aceptada",
        className:
          "border border-green-200 bg-green-100 text-green-800",
      };

case "in_progress":
  return {
    label: "Trabajo en progreso",
    className:
      "border border-blue-200 bg-blue-100 text-blue-800",
  };

case "completed":
  return {
    label: "Completada",
    className:
      "border border-purple-200 bg-purple-100 text-purple-800",
  };

    case "rejected":
      return {
        label: "Rechazada",
        className:
          "border border-red-200 bg-red-100 text-red-800",
      };

    case "new":
    default:
      return {
        label: "Pendiente",
        className:
          "border border-yellow-200 bg-yellow-100 text-yellow-800",
      };
  }
}

function formatDate(date: string | null) {
  if (!date) {
    return "No especificada";
  }

  return new Date(`${date}T12:00:00`).toLocaleDateString(
    "es-MX",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function formatCreatedAt(date: string) {
  return new Date(date).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CustomerDashboard() {
  const router = useRouter();

  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] =
    useState<string>("");

const [unreadMessages, setUnreadMessages] =
  useState(0);

const [reviewedQuoteIds, setReviewedQuoteIds] =
  useState<string[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/customer/login");
        return;
      }

      const accountType =
        session.user.user_metadata?.account_type;

      if (accountType !== "customer") {
        router.replace("/");
        return;
      }

      const savedName =
        session.user.user_metadata?.full_name ??
        session.user.user_metadata?.name ??
        "";

      setCustomerName(savedName);
const {
  data: reviewData,
  error: reviewError,
} = await supabase
  .from("business_reviews")
  .select("quote_request_id")
  .eq("customer_id", session.user.id);

if (reviewError) {
  console.error(
    "Error al cargar las reseñas del cliente:",
    reviewError
  );

  setReviewedQuoteIds([]);
} else {
  const reviewedIds = (reviewData ?? [])
    .map((review) => String(review.quote_request_id))
    .filter((id) => id !== "null");

  setReviewedQuoteIds(reviewedIds);
}
      const {
  data: conversationData,
  error: conversationError,
} = await supabase
  .from("conversations")
  .select("id")
  .eq("customer_id", session.user.id);

if (conversationError) {
  console.error(
    "Error al cargar las conversaciones:",
    conversationError
  );
} else {
  const conversationIds =
    (conversationData ?? []).map(
      (conversation) => conversation.id
    );

  if (conversationIds.length === 0) {
    setUnreadMessages(0);
  } else {
    const {
      count: unreadCount,
      error: unreadError,
    } = await supabase
      .from("messages")
      .select("id", {
        count: "exact",
        head: true,
      })
      .in("conversation_id", conversationIds)
      .neq("sender_id", session.user.id)
      .eq("is_read", false);

    if (unreadError) {
      console.error(
        "Error al contar mensajes no leídos:",
        unreadError
      );

      setUnreadMessages(0);
    } else {
      setUnreadMessages(unreadCount ?? 0);
    }
  }
}

      const { data, error } = await supabase
        .from("quote_requests")
        .select(`
          id,
          created_at,
          service,
          description,
          contractor_name,
          status,
          preferred_date,
          preferred_time_window,
          alternative_date,
          business_response,
          responded_at,
          photo_urls
        `)
        .eq("customer_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "Error al cargar las solicitudes:",
          error
        );

        setQuotes([]);
        setLoading(false);
        return;
      }

      setQuotes(data ?? []);
      setLoading(false);
    }

    loadDashboard();
    const channel = supabase
  .channel("customer-dashboard-notifications")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "messages",
    },
    () => {
      loadDashboard();
    }
  )
  .subscribe();
  return () => {
  supabase.removeChannel(channel);
};
  }, [router]);

async function openConversation(quoteRequestId: string) {
  const {
    data: conversation,
    error,
  } = await supabase
    .from("conversations")
    .select("id")
    .eq("quote_request_id", quoteRequestId)
    .maybeSingle();

  if (error) {
    console.error(
      "Error al buscar la conversación:",
      error
    );

    alert("No se pudo abrir la conversación.");
    return;
  }

  if (!conversation) {
    alert(
      "La empresa todavía no ha creado la conversación."
    );
    return;
  }

  router.push(
    `/customer/messages/${conversation.id}`
  );
}

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl px-5 py-10">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-gray-600">
              Cargando tus solicitudes...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
  <div>
    <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
      Panel del cliente
    </p>

    <h1 className="mt-1 text-3xl font-bold text-gray-900">
      {customerName
        ? `Hola, ${customerName}`
        : "Mis solicitudes"}
    </h1>

    <p className="mt-2 text-gray-600">
      Consulta el estado de tus solicitudes de
      cotización.
    </p>
  </div>

  <div className="flex flex-wrap gap-3">
    <Link
  href="/customer/messages"
  className="relative rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
>
  💬 Mis mensajes

  {unreadMessages > 0 && (
    <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-bold text-white">
      {unreadMessages}
    </span>
  )}
</Link>

    <Link
      href="/quote"
      className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
    >
      Nueva cotización
    </Link>
  </div>
</div>

        {quotes.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">📨</div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Aún no tienes solicitudes
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-gray-600">
              Cuando solicites una cotización, podrás ver
              aquí su estado y la respuesta de la empresa.
            </p>

            <Link
              href="/quote"
              className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Solicitar una cotización
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {quotes.map((quote) => {
              const statusDetails = getStatusDetails(
                quote.status
              );

              return (
                <article
                  key={quote.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 p-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Solicitud enviada el{" "}
                        {formatCreatedAt(
                          quote.created_at
                        )}
                      </p>

                      <h2 className="mt-1 text-2xl font-bold text-gray-900">
                        {quote.service ??
                          "Servicio solicitado"}
                      </h2>

                      <p className="mt-2 text-gray-600">
                        👷{" "}
                        {quote.contractor_name ??
                          "Empresa por asignar"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-4 py-2 text-sm font-bold ${statusDetails.className}`}
                    >
                      {statusDetails.label}
                    </span>
                  </div>

                  <div className="grid gap-6 p-6 md:grid-cols-2">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Detalles de la solicitud
                      </h3>

                      <div className="mt-4 space-y-3 text-gray-700">
                        <p>
                          <span className="font-semibold">
                            📅 Fecha preferida:
                          </span>{" "}
                          {formatDate(
                            quote.preferred_date
                          )}
                        </p>

                        <p>
                          <span className="font-semibold">
                            🕒 Horario:
                          </span>{" "}
                          {quote.preferred_time_window ??
                            "No especificado"}
                        </p>

                        {quote.alternative_date && (
                          <p>
                            <span className="font-semibold">
                              📆 Fecha alternativa:
                            </span>{" "}
                            {formatDate(
                              quote.alternative_date
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900">
                        Descripción
                      </h3>

                      <p className="mt-4 whitespace-pre-wrap text-gray-700">
                        {quote.description ??
                          "No se agregó una descripción."}
                      </p>
                    </div>
                  </div>

          

                  {quote.photo_urls &&
                    quote.photo_urls.length > 0 && (
                      <div className="border-t border-gray-100 p-6">
                        <p className="font-semibold text-gray-900">
                          📷{" "}
                          {quote.photo_urls.length === 1
                            ? "1 foto adjunta"
                            : `${quote.photo_urls.length} fotos adjuntas`}
                        </p>
                      </div>
                    )}

                  {["accepted", "in_progress"].includes(
  quote.status ?? ""
) && (
  <div className="border-t border-gray-100 p-6">
    <button
      type="button"
      onClick={() =>
        openConversation(quote.id)
      }
      className="rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
    >
      💬 Abrir conversación
    </button>
  </div>
)}
{quote.status === "completed" && (
  <div className="border-t border-gray-100 p-6">
    {reviewedQuoteIds.includes(String(quote.id)) ? (
      <span className="inline-flex rounded-lg border border-green-200 bg-green-100 px-5 py-3 font-semibold text-green-800">
        ✅ Reseña enviada
      </span>
    ) : (
      <Link
        href={`/review/${quote.id}`}
        className="inline-block rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-white hover:bg-yellow-600"
      >
        ⭐ Dejar reseña
      </Link>
    )}
  </div>
)}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}