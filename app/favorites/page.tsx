"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatService } from "@/lib/formatService";

type FavoriteBusiness = {
  id: number;
  business_name: string;
  phone: string;
  service: string;
  customer_type: string;
  municipality: string[];
  description: string;
  logo_url: string | null;
  verified: boolean;

  business_reviews: {
    rating: number;
    status: string;
  }[];

  averageRating?: number;
  reviewCount?: number;
};

export default function FavoritesPage() {
    const router = useRouter();
  const [businesses, setBusinesses] = useState<FavoriteBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function loadFavorites() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/customer/login");
      return;
    }

    const accountType =
      session.user.user_metadata?.account_type;

    if (accountType !== "customer") {
      router.push("/");
      return;
    }

    const { data: favoriteRows, error: favoritesError } =
      await supabase
        .from("customer_favorites")
        .select("business_id")
        .eq("customer_id", session.user.id);

    if (favoritesError) {
      console.error(
        "Error al cargar favoritos:",
        favoritesError
      );
      setLoading(false);
      return;
    }

    const favoriteIds = (favoriteRows ?? []).map(
      (favorite) => favorite.business_id
    );

    if (favoriteIds.length === 0) {
      setBusinesses([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("business_registrations")
      .select(`
        id,
        business_name,
        phone,
        service,
        customer_type,
        municipality,
        description,
        logo_url,
        verified,
        business_reviews (
          rating,
          status
        )
      `)
      .eq("approval_status", "approved")
      .in("id", favoriteIds);

    if (error) {
      console.error(
        "Error al cargar los negocios favoritos:",
        error
      );
      setLoading(false);
      return;
    }

    const favoriteBusinesses = (
      (data ?? []) as FavoriteBusiness[]
    ).map((business) => {
      const publishedReviews =
        business.business_reviews?.filter(
          (review) => review.status === "published"
        ) ?? [];

      const reviewCount = publishedReviews.length;

      const averageRating =
        reviewCount > 0
          ? publishedReviews.reduce(
              (total, review) =>
                total + review.rating,
              0
            ) / reviewCount
          : 0;

      return {
        ...business,
        reviewCount,
        averageRating,
      };
    });

    setBusinesses(favoriteBusinesses);
    setLoading(false);
  }

  loadFavorites();
}, [router]);

  async function removeFavorite(businessId: number) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    router.push("/customer/login");
    return;
  }

  const { error } = await supabase
    .from("customer_favorites")
    .delete()
    .eq("customer_id", session.user.id)
    .eq("business_id", businessId);

  if (error) {
    console.error(
      "Error al quitar favorito:",
      error
    );

    alert("No se pudo quitar el favorito.");
    return;
  }

  setBusinesses((currentBusinesses) =>
    currentBusinesses.filter(
      (business) => business.id !== businessId
    )
  );
}

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-blue-700">
              Mis Favoritos
            </h1>

            <p className="mt-2 text-gray-600">
              Profesionales que guardaste para consultar
              después.
            </p>
          </div>

          <Link
            href="/contractors"
            className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
          >
            Buscar profesionales
          </Link>
        </div>

        {loading && (
          <p className="mt-10 text-gray-600">
            Cargando favoritos...
          </p>
        )}

        {!loading && businesses.length === 0 && (
          <div className="mt-10 rounded-2xl bg-white p-10 text-center shadow">
            <div className="text-6xl">🤍</div>

            <h2 className="mt-4 text-2xl font-bold text-gray-800">
              Aún no tienes favoritos
            </h2>

            <p className="mt-2 text-gray-600">
              Guarda profesionales para encontrarlos
              fácilmente después.
            </p>

            <Link
              href="/contractors"
              className="mt-6 inline-block rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
            >
              Ver profesionales
            </Link>
          </div>
        )}

        {!loading && businesses.length > 0 && (
          <>
            <p className="mt-8 font-semibold text-gray-700">
              {businesses.length}{" "}
              {businesses.length === 1
                ? "profesional guardado"
                : "profesionales guardados"}
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => (
                <article
                  key={business.id}
                  className="relative rounded-2xl bg-white p-6 shadow-lg"
                >
                  <button
                    type="button"
                    onClick={() =>
                      removeFavorite(business.id)
                    }
                    aria-label={`Quitar ${business.business_name} de favoritos`}
                    title="Quitar de favoritos"
                    className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border bg-white text-2xl shadow-md transition hover:scale-110 hover:bg-red-50"
                  >
                    ❤️
                  </button>

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

                  <h2 className="pr-10 text-center text-2xl font-bold">
                    {business.business_name}
                  </h2>

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <span className="font-semibold text-yellow-600">
                      {business.reviewCount &&
                      business.reviewCount > 0
                        ? `⭐ ${business.averageRating?.toFixed(
                            1
                          )}`
                        : "⭐ Sin reseñas"}
                    </span>

                    {business.verified && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        ✔ Profesional aprobado
                      </span>
                    )}
                  </div>

                  <div className="mt-5 space-y-3 text-gray-700">
                    <p className="font-semibold">
                      🔧 {formatService(business.service)}
                    </p>

                    <p className="font-semibold">
                      {business.customer_type === "ambos"
                        ? "🏠 Hogares y 🏢 Negocios"
                        : business.customer_type ===
                          "hogares"
                        ? "🏠 Hogares"
                        : business.customer_type ===
                          "negocios"
                        ? "🏢 Negocios"
                        : business.customer_type}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {business.municipality.map(
                      (municipality) => (
                        <span
                          key={municipality}
                          className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                        >
                          📍 {municipality}
                        </span>
                      )
                    )}
                  </div>

                  <p className="mt-4 text-gray-600">
                    {business.description}
                  </p>

                  <div className="mt-6 space-y-3">
                    <Link
                      href={`/contractors/${business.id}`}
                      className="block w-full rounded-xl bg-blue-700 px-4 py-3 text-center font-bold text-white transition hover:bg-blue-800"
                    >
                      Ver perfil
                    </Link>

                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href={`https://wa.me/52${business.phone.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-green-500 px-3 py-3 text-center font-bold text-white transition hover:bg-green-600"
                      >
                        💬 WhatsApp
                      </a>

                      <a
                        href={`tel:${business.phone}`}
                        className="rounded-xl bg-gray-800 px-3 py-3 text-center font-bold text-white transition hover:bg-gray-900"
                      >
                        📞 Llamar
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}