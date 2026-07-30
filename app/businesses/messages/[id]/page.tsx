"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Conversation = {
  id: number;
  quote_request_id: number;
  customer_id: string;
  business_id: number;
};

type Message = {
  id: number;
  conversation_id: number;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function BusinessConversationPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [currentUserId, setCurrentUserId] =
    useState("");

  const [newMessage, setNewMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadConversation() {
      const conversationId = Number(params.id);

      if (!Number.isInteger(conversationId)) {
        setErrorMessage(
          "La conversación no es válida."
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

      setCurrentUserId(user.id);

      const {
        data: conversationData,
        error: conversationError,
      } = await supabase
        .from("conversations")
        .select(
          "id, quote_request_id, customer_id, business_id"
        )
        .eq("id", conversationId)
        .single();

      if (conversationError || !conversationData) {
        console.error(
          "Error al cargar la conversación:",
          conversationError
        );

        setErrorMessage(
          "No se encontró esta conversación."
        );
        setLoading(false);
        return;
      }

      setConversation(
        conversationData as Conversation
      );

      const {
        data: messageData,
        error: messageError,
      } = await supabase
        .from("messages")
        .select(
          "id, conversation_id, sender_id, message, is_read, created_at"
        )
        .eq("conversation_id", conversationId)
        .order("created_at", {
          ascending: true,
        });

      if (messageError) {
        console.error(
          "Error al cargar los mensajes:",
          messageError
        );

        setErrorMessage(
          "No se pudieron cargar los mensajes."
        );
        setLoading(false);
        return;
      }

      const loadedMessages =
  (messageData ?? []) as Message[];

setMessages(loadedMessages);

const {
  data: updatedMessages,
  error: readError,
} = await supabase
  .from("messages")
  .update({
    is_read: true,
  })
  .eq("conversation_id", conversationId)
  .neq("sender_id", user.id)
  .eq("is_read", false)
  .select();

console.log(
  "Mensajes marcados como leídos:",
  updatedMessages
);

if (readError) {
  console.error(
    "Error al marcar mensajes como leídos:",
    readError
  );

  alert(
  JSON.stringify(readError)
);
}

setLoading(false);
    }

    loadConversation();
  }, [params.id, router]);

useEffect(() => {
  if (!conversation?.id || !currentUserId) {
    return;
  }

  const channel = supabase
    .channel(
      `conversation-${conversation.id}-${currentUserId}`
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversation.id}`,
      },
      async (payload) => {
        console.log(
          "Cambio recibido en mensajes:",
          payload.eventType,
          payload
        );

        if (payload.eventType === "INSERT") {
          const incomingMessage =
            payload.new as Message;

          setMessages((currentMessages) => {
            const alreadyExists =
              currentMessages.some(
                (message) =>
                  message.id === incomingMessage.id
              );

            if (alreadyExists) {
              return currentMessages;
            }

            return [
              ...currentMessages,
              incomingMessage,
            ];
          });

          // If the other person sends a message while
          // this chat is already open, mark it as read.
          if (
            incomingMessage.sender_id !==
            currentUserId
          ) {
            const { error: readError } =
              await supabase
                .from("messages")
                .update({
                  is_read: true,
                })
                .eq("id", incomingMessage.id)
                .eq("is_read", false);

            if (readError) {
              console.error(
                "No se pudo marcar el mensaje como leído:",
                readError
              );
            }
          }
        }

        if (payload.eventType === "UPDATE") {
          const updatedMessage =
            payload.new as Message;

          setMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.id === updatedMessage.id
                ? updatedMessage
                : message
            )
          );
        }
      }
    )
    .subscribe((status) => {
      console.log(
        "Estado de Realtime:",
        status
      );
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, [
  conversation?.id,
  currentUserId,
]);

  async function sendMessage(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !conversation ||
      !currentUserId ||
      !newMessage.trim()
    ) {
      return;
    }

    setSending(true);

    const {
      data,
      error,
    } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        sender_id: currentUserId,
        message: newMessage.trim(),
      })
      .select(
        "id, conversation_id, sender_id, message, is_read, created_at"
      )
      .single();

    if (error) {
  console.log("Supabase error:", error);
  console.log("Code:", error.code);
  console.log("Message:", error.message);
  console.log("Details:", error.details);
  console.log("Hint:", error.hint);

  alert(error.message);

  setSending(false);
  return;
}

    setMessages((current) => [
      ...current,
      data as Message,
    ]);

    setNewMessage("");
    setSending(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <p>Cargando conversación...</p>
      </main>
    );
  }

  if (errorMessage || !conversation) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-red-700">
            Conversación no encontrada
          </h1>

          <p className="mt-3 text-gray-600">
            {errorMessage}
          </p>

          <Link
            href="/businesses/dashboard"
            className="mt-6 inline-block rounded bg-blue-700 px-5 py-3 font-semibold text-white"
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
        <Link
          href="/businesses/dashboard#solicitudes"
          className="font-semibold text-blue-700 hover:underline"
        >
          ← Volver a solicitudes
        </Link>

        <section className="mt-5 rounded-2xl bg-white shadow">
          <div className="border-b p-5">
            <h1 className="text-2xl font-bold">
              💬 Conversación
            </h1>

            <p className="mt-1 text-gray-500">
              Solicitud #{conversation.quote_request_id}
            </p>
          </div>

          <div className="min-h-[420px] space-y-4 p-5">
            {messages.length === 0 ? (
              <div className="rounded-xl bg-gray-50 p-5 text-center text-gray-600">
                Todavía no hay mensajes.
              </div>
            ) : (
              messages.map((message) => {
                const isMine =
                  message.sender_id ===
                  currentUserId;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isMine
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        isMine
                          ? "bg-blue-700 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">
                        {message.message}
                      </p>

                      <p
                        className={`mt-2 text-xs ${
                          isMine
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(
                          message.created_at
                        ).toLocaleString(
                          "es-MX",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                      {isMine && (
  <p className="mt-1 text-right text-xs text-blue-200">
    {message.is_read
      ? "✓✓ Leído"
      : "✓ Enviado"}
  </p>
)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form
            onSubmit={sendMessage}
            className="border-t p-5"
          >
            <textarea
              value={newMessage}
              onChange={(event) =>
                setNewMessage(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();

    if (!sending && newMessage.trim()) {
      event.currentTarget.form?.requestSubmit();
    }
  }
}}
              rows={3}
              placeholder="Escribe un mensaje..."
              className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
            />

            <button
              type="submit"
              disabled={
                sending ||
                newMessage.trim() === ""
              }
              className="mt-3 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending
                ? "Enviando..."
                : "Enviar mensaje"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}