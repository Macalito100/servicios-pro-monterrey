"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Business = {
  id: number;
  business_name: string;
};
type QuoteRequest = {
  id: number;
  business_id: number;
  name: string;
  email: string;
  status: string;
};
function ReviewContent() {
  const searchParams = useSearchParams();


const businessId = searchParams.get("business");
 const quoteRequestId = searchParams.get("quote");

const [quoteRequest, setQuoteRequest] =
  useState<QuoteRequest | null>(null);

  const [invalidQuote, setInvalidQuote] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
  async function loadBusiness() {
    if (!businessId) {
      setLoadingBusiness(false);
      return;
    }

    const { data: businessData, error: businessError } =
      await supabase
        .from("business_registrations")
        .select("id, business_name")
        .eq("id", Number(businessId))
        .eq("status", "approved")
        .single();

    if (businessError || !businessData) {
      console.error(
        "No se pudo cargar el negocio:",
        businessError
      );

      setLoadingBusiness(false);
      return;
    }

    setBusiness(businessData);

    if (!quoteRequestId) {
      setInvalidQuote(true);
      setLoadingBusiness(false);
      return;
    }

    const { data: quoteRows, error: quoteError } =
  await supabase.rpc("get_review_quote", {
    requested_quote_id: Number(quoteRequestId),
    requested_business_id: Number(businessId),
  });

const quoteData = quoteRows?.[0] ?? null;

    if (
  quoteError ||
  !quoteData ||
  quoteData.status !== "completed"
) {
  console.log("quoteError:", quoteError);
console.log("quoteData:", quoteData);
console.log("businessId:", businessId);
console.log("quoteRequestId:", quoteRequestId);

  setInvalidQuote(true);
  setLoadingBusiness(false);
  return;
}

    setQuoteRequest(quoteData);
    setCustomerName(quoteData.name);
    setCustomerEmail(quoteData.email);
    setLoadingBusiness(false);
  }

  loadBusiness();
}, [businessId, quoteRequestId]);
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!business) {
      alert("No se encontró el negocio.");
      return;
    }
if (!quoteRequestId || !quoteRequest) {
  alert(
    "Necesitas una solicitud completada para dejar una reseña."
  );
  return;
}
    if (rating < 1 || rating > 5) {
      alert("Selecciona una calificación de 1 a 5 estrellas.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("business_reviews")
      .insert({
        business_id: business.id,
        quote_request_id: quoteRequest.id,
        customer_name: customerName,
        customer_email: customerEmail,
        rating,
        review_text: reviewText,
        status: "published",
      });

    setSubmitting(false);

    if (error) {
      console.error("No se pudo guardar la reseña:", error);

      if (error.code === "23505") {
        alert("Ya se envió una reseña para esta solicitud.");
        return;
      }

      alert("No se pudo enviar la reseña.");
      return;
    }

    setSubmitted(true);
  }

 if (loadingBusiness) {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <p>Cargando negocio...</p>
    </main>
  );
}

if (invalidQuote) {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-red-700">
          Reseña no disponible
        </h1>

        <p className="mt-3 text-gray-600">
          Esta solicitud todavía no está completada o el enlace no es válido.
        </p>
      </div>
    </main>
  );
}

if (!business) {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-red-700">
          Negocio no encontrado
        </h1>
      </div>
    </main>
  );
}

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 shadow">
        <h1 className="text-4xl font-bold text-blue-700">
          Califica tu experiencia
        </h1>

        <p className="mt-3 text-gray-600">
          Comparte tu experiencia con{" "}
          <span className="font-bold">
            {business.business_name}
          </span>
          .
        </p>

        {submitted ? (
          <div className="mt-8 rounded-xl bg-green-100 p-6 text-center">
            <h2 className="text-2xl font-bold text-green-700">
              ¡Gracias por tu reseña!
            </h2>

            <p className="mt-3 text-gray-700">
              Tu opinión fue publicada correctamente.
            </p>

            <a
              href={`/contractors/${business.id}`}
              className="mt-6 inline-block rounded bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Ver perfil del negocio
            </a>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <p className="mb-3 font-semibold text-gray-700">
                Calificación
              </p>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-4xl ${
                      star <= rating
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                    aria-label={`${star} estrellas`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Tu nombre"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded border p-3"
              required
            />

            <input
              type="email"
              placeholder="Tu correo electrónico"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full rounded border p-3"
              required
            />

            <textarea
              placeholder="Cuéntanos cómo fue tu experiencia"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={6}
              className="w-full rounded border p-3"
              required
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-blue-700 p-3 font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Enviando..." : "Enviar reseña"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-8">
          <p>Cargando reseña...</p>
        </main>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}