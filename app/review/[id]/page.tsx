"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type QuoteRequest = {
  id: string;
  business_id: number;
  customer_id: string | null;
  contractor_name: string | null;
  service: string | null;
  status: string | null;
};

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const quoteRequestId = params.id;

  const [quote, setQuote] =
    useState<QuoteRequest | null>(null);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [alreadyReviewed, setAlreadyReviewed] =
    useState(false);

  useEffect(() => {
    async function loadReviewPage() {
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

      const {
        data: quoteData,
        error: quoteError,
      } = await supabase
        .from("quote_requests")
        .select(
          "id, business_id, customer_id, contractor_name, service, status"
        )
        .eq("id", quoteRequestId)
        .eq("customer_id", session.user.id)
        .maybeSingle();

      if (quoteError) {
        console.error(
          "Error al cargar la solicitud:",
          quoteError
        );

        setErrorMessage(
          "No se pudo cargar esta solicitud."
        );
        setLoading(false);
        return;
      }

      if (!quoteData) {
        setErrorMessage(
          "No se encontró esta solicitud o no pertenece a tu cuenta."
        );
        setLoading(false);
        return;
      }

      if (quoteData.status !== "completed") {
        setErrorMessage(
          "Solo puedes dejar una reseña cuando el trabajo esté completado."
        );
        setLoading(false);
        return;
      }

      setQuote(quoteData as QuoteRequest);

      const {
        data: existingReview,
        error: reviewError,
      } = await supabase
        .from("business_reviews")
        .select("id")
        .eq("quote_request_id", quoteRequestId)
        .maybeSingle();

      if (reviewError) {
        console.error(
          "Error al comprobar la reseña:",
          reviewError
        );

        setErrorMessage(
          "No se pudo verificar si ya existe una reseña."
        );
        setLoading(false);
        return;
      }

      if (existingReview) {
        setAlreadyReviewed(true);
      }

      setLoading(false);
    }

    loadReviewPage();
  }, [quoteRequestId, router]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!quote) {
      return;
    }

    if (rating < 1 || rating > 5) {
      setErrorMessage(
        "Selecciona una calificación de 1 a 5 estrellas."
      );
      return;
    }

    if (reviewText.trim().length < 5) {
      setErrorMessage(
        "Escribe una reseña de al menos 5 caracteres."
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setSubmitting(false);
      router.replace("/customer/login");
      return;
    }

    const customerName =
      session.user.user_metadata?.full_name ??
      session.user.user_metadata?.name ??
      "Cliente";

    const customerEmail =
      session.user.email ?? "";

    const { error } = await supabase
      .from("business_reviews")
      .insert({
        business_id: quote.business_id,
        quote_request_id: quote.id,
        customer_id: session.user.id,
        customer_name: customerName,
        customer_email: customerEmail,
        rating,
        review_text: reviewText.trim(),
        status: "published",
      });

    if (error) {
      console.error(
        "Error al guardar la reseña:",
        error
      );

      if (
        error.code === "23505"
      ) {
        setAlreadyReviewed(true);
        setErrorMessage(
          "Ya existe una reseña para esta solicitud."
        );
      } else {
        setErrorMessage(
          "No se pudo publicar la reseña. Inténtalo nuevamente."
        );
      }

      setSubmitting(false);
      return;
    }

    alert("¡Gracias! Tu reseña fue publicada.");

    router.push("/customer/dashboard");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-5 py-10">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
          <p>Cargando página de reseña...</p>
        </div>
      </main>
    );
  }

  if (errorMessage && !quote) {
    return (
      <main className="min-h-screen bg-gray-50 px-5 py-10">
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-red-700">
            No se puede dejar la reseña
          </h1>

          <p className="mt-3 text-gray-700">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/customer/dashboard")
            }
            className="mt-6 rounded-lg bg-gray-800 px-5 py-3 font-semibold text-white hover:bg-gray-900"
          >
            Volver al panel
          </button>
        </div>
      </main>
    );
  }

  if (alreadyReviewed) {
    return (
      <main className="min-h-screen bg-gray-50 px-5 py-10">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow">
          <div className="text-5xl">✅</div>

          <h1 className="mt-4 text-3xl font-bold">
            Reseña enviada
          </h1>

          <p className="mt-3 text-gray-600">
            Ya publicaste una reseña para este trabajo.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/customer/dashboard")
            }
            className="mt-6 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Volver al panel
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-yellow-600">
          Reseña del servicio
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          ¿Cómo fue tu experiencia?
        </h1>

        <p className="mt-3 text-gray-600">
          Comparte tu opinión sobre{" "}
          <strong>
            {quote?.contractor_name ??
              "la empresa"}
          </strong>
          .
        </p>

        {quote?.service && (
          <p className="mt-2 text-gray-600">
            Servicio:{" "}
            <strong>{quote.service}</strong>
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >
          <div>
            <p className="font-bold text-gray-900">
              Calificación
            </p>

            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setRating(star)
                    }
                    aria-label={`${star} estrellas`}
                    className={`text-4xl transition hover:scale-110 ${
                      star <= rating
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                )
              )}
            </div>

            {rating > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                Seleccionaste {rating} de 5 estrellas.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="reviewText"
              className="font-bold text-gray-900"
            >
              Escribe tu reseña
            </label>

            <textarea
              id="reviewText"
              value={reviewText}
              onChange={(event) =>
                setReviewText(event.target.value)
              }
              rows={6}
              maxLength={1000}
              placeholder="Cuéntanos cómo fue el servicio..."
              className="mt-3 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-right text-sm text-gray-500">
              {reviewText.length}/1000
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-yellow-500 px-6 py-3 font-bold text-white hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Publicando..."
                : "⭐ Publicar reseña"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/customer/dashboard")
              }
              disabled={submitting}
              className="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-800 hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}