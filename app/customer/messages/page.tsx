"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ConversationRow = {
  id: number;
  quote_request_id: number;
  customer_id: string;
  business_id: number;
  created_at: string;
};

type BusinessRow = {
  id: number;
  business_name: string;
  service: string | null;
  logo_url: string | null;
  verified: boolean;
};

type QuoteRequestRow = {
  id: number;
  service: string | null;
  status: string;
};

type MessageRow = {
  id: number;
  conversation_id: number;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type InboxConversation = ConversationRow & {
  business_name: string;
  business_service: string | null;
  business_logo_url: string | null;
  business_verified: boolean;
  requested_service: string | null;
  request_status: string;
  last_message: MessageRow | null;
  unread_count: number;
};

export default function CustomerMessagesPage() {
  const router = useRouter();

  const [conversations, setConversations] =
    useState<InboxConversation[]>([]);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");


  useEffect(() => {
    async function loadInbox() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/customer/login");
        return;
      }

      const {
        data: conversationData,
        error: conversationError,
      } = await supabase
        .from("conversations")
        .select(
          "id, quote_request_id, customer_id, business_id, created_at"
        )
        .eq("customer_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (conversationError) {
        console.error(
          "No se pudieron cargar las conversaciones:",
          conversationError
        );

        setErrorMessage(
          "No se pudieron cargar tus conversaciones."
        );

        setLoading(false);
        return;
      }

      const conversationRows =
        (conversationData ?? []) as ConversationRow[];

      if (conversationRows.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const businessIds = [
        ...new Set(
          conversationRows.map(
            (conversation) =>
              conversation.business_id
          )
        ),
      ];

      const quoteRequestIds = [
        ...new Set(
          conversationRows.map(
            (conversation) =>
              conversation.quote_request_id
          )
        ),
      ];

      const conversationIds =
        conversationRows.map(
          (conversation) => conversation.id
        );

      const {
        data: businessData,
        error: businessError,
      } = await supabase
        .from("business_registrations")
        .select(
          "id, business_name, service, logo_url, verified"
        )
        .in("id", businessIds);

      if (businessError) {
        console.error(
          "No se pudieron cargar los negocios:",
          businessError
        );
      }

      const {
        data: quoteData,
        error: quoteError,
      } = await supabase
        .from("quote_requests")
        .select("id, service, status")
        .in("id", quoteRequestIds);

      if (quoteError) {
        console.error(
          "No se pudieron cargar las solicitudes:",
          quoteError
        );
      }

      const {
        data: messageData,
        error: messageError,
      } = await supabase
        .from("messages")
        .select(
          "id, conversation_id, sender_id, message, is_read, created_at"
        )
        .in("conversation_id", conversationIds)
        .order("created_at", {
          ascending: false,
        });

      if (messageError) {
        console.error(
          "No se pudieron cargar los mensajes:",
          messageError
        );
      }

      const businessRows =
        (businessData ?? []) as BusinessRow[];

      const quoteRows =
        (quoteData ?? []) as QuoteRequestRow[];

      const messageRows =
        (messageData ?? []) as MessageRow[];

      const completedInbox =
        conversationRows.map((conversation) => {
          const business =
            businessRows.find(
              (item) =>
                item.id ===
                conversation.business_id
            );

          const quote =
            quoteRows.find(
              (item) =>
                item.id ===
                conversation.quote_request_id
            );

          const conversationMessages =
            messageRows.filter(
              (message) =>
                message.conversation_id ===
                conversation.id
            );

          const lastMessage =
            conversationMessages[0] ?? null;

          const unreadCount =
            conversationMessages.filter(
              (message) =>
                !message.is_read &&
                message.sender_id !== user.id
            ).length;

          return {
            ...conversation,

            business_name:
              business?.business_name ??
              "Negocio",

            business_service:
              business?.service ?? null,

            business_logo_url:
              business?.logo_url ?? null,

            business_verified:
              business?.verified ?? false,

            requested_service:
              quote?.service ?? null,

            request_status:
              quote?.status ?? "accepted",

            last_message: lastMessage,

            unread_count: unreadCount,
          };
        });

      completedInbox.sort((a, b) => {
        const firstDate =
          a.last_message?.created_at ??
          a.created_at;

        const secondDate =
          b.last_message?.created_at ??
          b.created_at;

        return (
          new Date(secondDate).getTime() -
          new Date(firstDate).getTime()
        );
      });

      setConversations(completedInbox);
      setLoading(false);
    }

    loadInbox();
  }, [router]);

  function formatMessageDate(date: string) {
    const messageDate = new Date(date);
    const today = new Date();

    const isToday =
      messageDate.toDateString() ===
      today.toDateString();

    if (isToday) {
      return messageDate.toLocaleTimeString(
        "es-MX",
        {
          hour: "numeric",
          minute: "2-digit",
        }
      );
    }

    const yesterday = new Date();
    yesterday.setDate(
      yesterday.getDate() - 1
    );

    const isYesterday =
      messageDate.toDateString() ===
      yesterday.toDateString();

    if (isYesterday) {
      return "Ayer";
    }

    return messageDate.toLocaleDateString(
      "es-MX",
      {
        day: "numeric",
        month: "short",
      }
    );
  }

  function getStatusLabel(status: string) {
    if (status === "accepted") {
      return "Aceptada";
    }

    if (status === "in_progress") {
      return "En proceso";
    }

    if (status === "completed") {
      return "Completada";
    }

    if (status === "rejected") {
      return "Rechazada";
    }

    return "Nueva";
  }

  function getStatusClasses(status: string) {
    if (status === "accepted") {
      return "bg-blue-100 text-blue-700";
    }

    if (status === "in_progress") {
      return "bg-purple-100 text-purple-700";
    }

    if (status === "completed") {
      return "bg-green-100 text-green-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">
          <p className="text-gray-600">
            Cargando conversaciones...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-red-700">
            No se pudieron cargar los mensajes
          </h1>

          <p className="mt-3 text-gray-600">
            {errorMessage}
          </p>

          <Link
            href="/customer/dashboard"
            className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Volver al panel
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            href="/customer/dashboard"
            className="font-semibold text-blue-700 hover:underline"
          >
            ← Volver al panel
          </Link>
        </div>

        <section className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-3xl font-bold text-gray-900">
              💬 Mis mensajes
            </h1>

            <p className="mt-2 text-gray-600">
              Consulta tus conversaciones con profesionales.
            </p>
          </div>

          {conversations.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-5xl">
                💬
              </div>

              <h2 className="mt-4 text-xl font-bold text-gray-900">
                Todavía no tienes conversaciones
              </h2>

              <p className="mt-2 text-gray-600">
                Tus conversaciones aparecerán aquí cuando un negocio acepte una solicitud.
              </p>

              <Link
                href="/contractors"
                className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
              >
                Buscar profesionales
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map(
                (conversation) => (
                  <Link
                    key={conversation.id}
                    href={`/customer/messages/${conversation.id}`}
                    className="flex items-center gap-4 p-5 transition hover:bg-gray-50"
                  >
                    {conversation.business_logo_url ? (
                      <img
                        src={
                          conversation.business_logo_url
                        }
                        alt={`Logo de ${conversation.business_name}`}
                        className="h-14 w-14 shrink-0 rounded-full border border-gray-200 bg-white object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl">
                        🛠️
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate font-bold text-gray-900">
                              {
                                conversation.business_name
                              }
                            </h2>

                            {conversation.business_verified && (
                              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                                ✓ Verificado
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-gray-500">
                            🔧{" "}
                            {conversation.requested_service ??
                              conversation.business_service ??
                              "Servicio solicitado"}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-sm text-gray-500">
                            {formatMessageDate(
                              conversation
                                .last_message
                                ?.created_at ??
                                conversation.created_at
                            )}
                          </p>

                          {conversation.unread_count >
                            0 && (
                            <span className="mt-2 inline-flex min-w-6 items-center justify-center rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
                              {
                                conversation.unread_count
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      <p
                        className={`mt-2 truncate ${
                          conversation.unread_count >
                          0
                            ? "font-semibold text-gray-900"
                            : "text-gray-600"
                        }`}
                      >
                        {conversation.last_message
                          ?.message ??
                          "Conversación creada. Envía el primer mensaje."}
                      </p>

                      <div className="mt-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            conversation.request_status
                          )}`}
                        >
                          {getStatusLabel(
                            conversation.request_status
                          )}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}