"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatService } from "@/lib/formatService";

type Business = {
  id: number;
  business_name: string;
  service: string;
  customer_type: string;
  municipality: string[];
  logo_url: string | null;
  verified: boolean;
    plan: string | null;
  subscription_status: string | null;
  profile_views: number;

  business_reviews: {
    rating: number;
    status: string;
  }[];

  business_portfolio: {
    id: number;
    image_url: string;
  }[];

  averageRating?: number;
  reviewCount?: number;
  portfolioCount?: number;
  rankingScore?: number;
};

export default function FeaturedContractors() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadFeatured() {
      const { data, error } = await supabase
        .from("business_registrations")
        .select(`
          id,
          business_name,
          service,
          customer_type,
          municipality,
          logo_url,
          verified,
plan,
subscription_status,
profile_views,
          business_reviews (
            rating,
            status
          ),
          business_portfolio (
            id,
            image_url
          )
        `)
        .eq("approval_status", "approved")
.eq("plan", "premium")
.in("subscription_status", [
  "active",
  "trialing",
]);

      if (error) {
        console.error(
          "Error al cargar profesionales destacados:",
          error
        );

        setErrorMessage(
          "No se pudieron cargar los profesionales destacados."
        );

        setLoading(false);
        return;
      }

      const rankedBusinesses = ((data ?? []) as Business[])
        .map((business) => {
          const publishedReviews =
            business.business_reviews?.filter(
              (review) => review.status === "published"
            ) ?? [];

          const reviewCount = publishedReviews.length;

          const averageRating =
            reviewCount > 0
              ? publishedReviews.reduce(
                  (total, review) => total + review.rating,
                  0
                ) / reviewCount
              : 0;

          const portfolioCount =
            business.business_portfolio?.length ?? 0;

          const rankingScore =
            averageRating * 20 +
            Math.min(reviewCount, 25) * 2 +
            (business.verified ? 20 : 0) +
            Math.min(business.profile_views ?? 0, 500) * 0.02 +
            Math.min(portfolioCount, 10) * 2;

          return {
            ...business,
            averageRating,
            reviewCount,
            portfolioCount,
            rankingScore,
          };
        })
        .sort(
  (a, b) =>
    (b.rankingScore ?? 0) -
    (a.rankingScore ?? 0)
);

      const dayNumber = Math.floor(
  Date.now() / (1000 * 60 * 60 * 24)
);

const dailyStartIndex =
  rankedBusinesses.length > 0
    ? dayNumber % rankedBusinesses.length
    : 0;

const dailyRotatedBusinesses = [
  ...rankedBusinesses.slice(dailyStartIndex),
  ...rankedBusinesses.slice(0, dailyStartIndex),
];

setBusinesses(dailyRotatedBusinesses);
      setLoading(false);
    }

    loadFeatured();
  }, []);
  useEffect(() => {
    if (businesses.length <= 3) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentIndex(
        (index) =>
          (index + 3) % businesses.length
      );
    }, 8000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [businesses.length]);

  const visibleBusinesses =
    businesses.length <= 3
      ? businesses
      : [0, 1, 2]
          .map(
            (offset) =>
              businesses[
                (currentIndex + offset) %
                  businesses.length
              ]
          )
          .filter(
            (business): business is Business =>
              Boolean(business)
          );
  return (
    <section className="mx-auto mt-16 max-w-6xl px-6">
      <h2 className="text-center text-4xl font-bold">
        👑 Profesionales Premium destacados
      </h2>

      <p className="mt-3 text-center text-gray-600">
        Descubre negocios Premium con mayor visibilidad en Servi Pro Monterrey.
      </p>

      {loading && (
        <p className="mt-10 text-center text-gray-600">
          Cargando profesionales destacados...
        </p>
      )}

      {errorMessage && (
        <div className="mt-10 rounded-xl bg-red-100 p-4 text-center text-red-700">
          {errorMessage}
        </div>
      )}

      {!loading &&
        !errorMessage &&
        businesses.length === 0 && (
          <div className="mt-10 rounded-xl bg-white p-6 text-center shadow">
            Todavía no hay profesionales destacados.
          </div>
        )}

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {visibleBusinesses.map((business) => (
          <article
            key={business.id}
            className="relative rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-white to-purple-50 p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <span className="absolute left-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950 shadow">
  👑 Premium
</span>
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={`Logo de ${business.business_name}`}
                className="mx-auto mb-5 h-28 w-28 rounded-full border-4 border-white bg-white object-contain shadow-lg"
              />
            ) : (
              <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-blue-100 text-5xl shadow-lg">
                🛠️
              </div>
            )}

            <div className="mb-3 flex flex-wrap justify-center gap-2">
              {(business.reviewCount ?? 0) >= 3 &&
                (business.averageRating ?? 0) >= 4.5 && (
                  <span className="rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700">
                    🏆 Top Profesional
                  </span>
                )}

              {(business.portfolioCount ?? 0) > 0 && (
                <a
                  href={`/contractors/${business.id}#portfolio`}
                  className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
                >
                  📷 {business.portfolioCount}{" "}
                  {business.portfolioCount === 1
                    ? "proyecto"
                    : "proyectos"}
                </a>
              )}
            </div>

            <h3 className="text-center text-2xl font-bold">
              {business.business_name}
            </h3>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="font-semibold text-yellow-600">
                {(business.reviewCount ?? 0) > 0
                  ? `⭐ ${business.averageRating?.toFixed(1)}`
                  : "⭐ Sin reseñas"}
              </span>

              {(business.reviewCount ?? 0) > 0 && (
                <span className="text-sm text-gray-500">
                  ({business.reviewCount}{" "}
                  {business.reviewCount === 1
                    ? "reseña"
                    : "reseñas"})
                </span>
              )}
            </div>

            <div className="mt-3 flex justify-center">
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                ✔ Profesional aprobado
              </span>
            </div>

            <div className="mt-5 space-y-3 text-gray-700">
              <p className="font-semibold">
                🔧 {formatService(business.service)}
              </p>

              <p className="font-semibold">
                {business.customer_type === "ambos"
                  ? "🏠 Hogares y 🏢 Negocios"
                  : business.customer_type === "hogares"
                  ? "🏠 Hogares"
                  : business.customer_type === "negocios"
                  ? "🏢 Negocios"
                  : business.customer_type}
              </p>
            </div>

            <div className="mt-4">
              <p className="mb-2 font-semibold text-gray-700">
                Municipios
              </p>

              <div className="flex flex-wrap gap-2">
                {business.municipality
                  ?.slice(0, 3)
                  .map((municipality) => (
                    <span
                      key={municipality}
                      className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                    >
                      📍 {municipality}
                    </span>
                  ))}

                {business.municipality?.length > 3 && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                    +{business.municipality.length - 3} más
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <a
                href={`/contractors/${business.id}`}
                className="block w-full rounded-xl bg-blue-700 px-4 py-3 text-center font-bold text-white transition hover:bg-blue-800"
              >
                Ver perfil
              </a>

              <a
                href={`/quote?business=${business.id}`}
                className="block w-full rounded-xl bg-green-600 px-4 py-3 text-center font-bold text-white transition hover:bg-green-700"
              >
                Solicitar servicio
              </a>
            </div>
          </article>
        ))}
      </div>
{businesses.length > 3 && (
  <div className="mt-6 flex items-center justify-center gap-4">
    <button
      type="button"
      onClick={() =>
        setCurrentIndex(
          (index) =>
            (index - 3 + businesses.length) %
            businesses.length
        )
      }
      className="rounded-xl border-2 border-purple-600 px-5 py-2 font-bold text-purple-700 transition hover:bg-purple-600 hover:text-white"
    >
      ← Anteriores
    </button>

    <span className="text-sm font-semibold text-gray-600">
      Más negocios Premium
    </span>

    <button
      type="button"
      onClick={() =>
        setCurrentIndex(
          (index) =>
            (index + 3) % businesses.length
        )
      }
      className="rounded-xl bg-purple-600 px-5 py-2 font-bold text-white transition hover:bg-purple-700"
    >
      Siguientes →
    </button>
  </div>
)}
      {!loading &&
        !errorMessage &&
        businesses.length > 0 && (
          <div className="mt-10 text-center">
            <a
              href="/contractors"
              className="inline-block rounded-xl border-2 border-blue-700 px-8 py-3 font-bold text-blue-700 transition hover:bg-blue-700 hover:text-white"
            >
              Ver todos los profesionales →
            </a>
          </div>
        )}
    </section>
  );
}