"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import {
  useRouter,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatService } from "@/lib/formatService";
import Link from "next/link";

type Business = {
  id: number;
  business_name: string;
  phone: string;
  service: string;
  customer_type: string;
  municipality: string[];
  description: string;
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
    isFeatured?: boolean;
  planPriority?: number;
  rankingScore?: number;
};

function ContractorsContent() {
    const router = useRouter();
const pathname = usePathname();
const searchParams = useSearchParams();
  const [businesses, setBusinesses] = useState<Business[]>([]);
 const [search, setSearch] = useState(
  searchParams.get("search") ?? ""
);

const [loading, setLoading] = useState(true);

const [errorMessage, setErrorMessage] = useState("");

const [serviceFilter, setServiceFilter] = useState(
  searchParams.get("service") ?? ""
);

const [municipalityFilter, setMunicipalityFilter] = useState(
  searchParams.get("municipality") ?? ""
);

const [verifiedOnly, setVerifiedOnly] = useState(
  searchParams.get("verified") === "true"
);

const [portfolioOnly, setPortfolioOnly] = useState(
  searchParams.get("portfolio") === "true"
);

const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

const [sortOption, setSortOption] = useState(
  searchParams.get("sort") ?? "ranking"
);

const [currentPage, setCurrentPage] = useState(() => {
  const page = Number(searchParams.get("page"));

  return Number.isInteger(page) && page > 0
    ? page
    : 1;
});

const businessesPerPage = 9;
  useEffect(() => {
    async function loadBusinesses() {
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
  .eq("approval_status", "approved");

      if (error) {
        console.error("Error al cargar negocios:", error);
        setErrorMessage("No se pudieron cargar los profesionales.");
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
      const normalizedPlan = (
  business.plan ?? "free"
).toLowerCase();

const hasPaidAccess = [
  "active",
  "trialing",
  "past_due",
].includes(
  (
    business.subscription_status ?? ""
  ).toLowerCase()
);

const isFeatured =
  hasPaidAccess &&
  (normalizedPlan === "professional" ||
    normalizedPlan === "premium");

const planPriority =
  hasPaidAccess && normalizedPlan === "premium"
    ? 1
    : 0;

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
  isFeatured,
  planPriority,
  rankingScore,
};
  })
  .sort((a, b) => {
  const priorityDifference =
    (b.planPriority ?? 0) -
    (a.planPriority ?? 0);

  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  return (
    (b.rankingScore ?? 0) -
    (a.rankingScore ?? 0)
  );
});

setBusinesses(rankedBusinesses);

      setLoading(false);
    }

    loadBusinesses();
  }, []);

useEffect(() => {
  async function loadFavorites() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setFavoriteIds([]);
      return;
    }

    const accountType =
      session.user.user_metadata?.account_type;

    if (accountType !== "customer") {
      setFavoriteIds([]);
      return;
    }

    const { data, error } = await supabase
      .from("customer_favorites")
      .select("business_id")
      .eq("customer_id", session.user.id);

    if (error) {
      console.error(
        "Error al cargar favoritos:",
        error
      );
      return;
    }

    setFavoriteIds(
      (data ?? []).map(
        (favorite) => favorite.business_id
      )
    );
  }

  loadFavorites();
}, []);

useEffect(() => {
  const params = new URLSearchParams(searchParams.toString());

  function setOrDelete(
    key: string,
    value: string,
    defaultValue = ""
  ) {
    if (!value || value === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }

  setOrDelete("search", search);
  setOrDelete("service", serviceFilter);
  setOrDelete("municipality", municipalityFilter);
  setOrDelete("sort", sortOption, "ranking");

  if (verifiedOnly) {
    params.set("verified", "true");
  } else {
    params.delete("verified");
  }

  if (portfolioOnly) {
    params.set("portfolio", "true");
  } else {
    params.delete("portfolio");
  }

  if (currentPage > 1) {
    params.set("page", String(currentPage));
  } else {
    params.delete("page");
  }

  const query = params.toString();
  const nextUrl = query ? `${pathname}?${query}` : pathname;

  router.replace(nextUrl, { scroll: false });
}, [
  search,
  serviceFilter,
  municipalityFilter,
  verifiedOnly,
  portfolioOnly,
  sortOption,
  currentPage,
  pathname,
  router,
  searchParams,
]);

async function toggleFavorite(businessId: number) {
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
    alert(
      "Debes iniciar sesión con una cuenta de cliente para guardar favoritos."
    );
    return;
  }

  const isAlreadyFavorite =
    favoriteIds.includes(businessId);

  if (isAlreadyFavorite) {
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
      return;
    }

    setFavoriteIds((currentFavorites) =>
      currentFavorites.filter(
        (id) => id !== businessId
      )
    );

    return;
  }

  const { error } = await supabase
    .from("customer_favorites")
    .insert({
      customer_id: session.user.id,
      business_id: businessId,
    });

  if (error) {
    console.error(
      "Error al guardar favorito:",
      error
    );
    return;
  }

  setFavoriteIds((currentFavorites) => [
    ...currentFavorites,
    businessId,
  ]);
}

  const filteredBusinesses = businesses.filter((business) => {
  const query = search.trim().toLowerCase();

  const matchesSearch =
    !query ||
    business.business_name.toLowerCase().includes(query) ||
    business.service.toLowerCase().includes(query) ||
    business.customer_type.toLowerCase().includes(query) ||
    business.municipality.some((municipality) =>
      municipality.toLowerCase().includes(query)
    );

  const matchesService =
    !serviceFilter ||
    business.service === serviceFilter;

  const matchesMunicipality =
    !municipalityFilter ||
    business.municipality.includes(municipalityFilter);

  const matchesVerified =
    !verifiedOnly || business.verified;

  const matchesPortfolio =
    !portfolioOnly ||
    (business.portfolioCount ?? 0) > 0;

  return (
    matchesSearch &&
    matchesService &&
    matchesMunicipality &&
    matchesVerified &&
    matchesPortfolio
  );
});

const sortedBusinesses = [...filteredBusinesses].sort((a, b) => {
    const priorityDifference =
    (b.planPriority ?? 0) -
    (a.planPriority ?? 0);

  if (priorityDifference !== 0) {
    return priorityDifference;
  }
  if (sortOption === "rating") {
    return (b.averageRating ?? 0) - (a.averageRating ?? 0);
  }

  if (sortOption === "reviews") {
    return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
  }

  if (sortOption === "views") {
    return b.profile_views - a.profile_views;
  }

  if (sortOption === "name") {
    return a.business_name.localeCompare(
      b.business_name,
      "es"
    );
  }

  return (b.rankingScore ?? 0) - (a.rankingScore ?? 0);
});
const totalPages = Math.max(
  1,
  Math.ceil(sortedBusinesses.length / businessesPerPage)
);

const startIndex =
  (currentPage - 1) * businessesPerPage;

const paginatedBusinesses = sortedBusinesses.slice(
  startIndex,
  startIndex + businessesPerPage
);
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-blue-700">
          Profesionales en Monterrey
        </h1>

        <p className="mt-2 text-gray-600">
          Encuentra servicios para hogares y negocios.
        </p>

        <input
          type="text"
          placeholder="Buscar por nombre, servicio o municipio..."
          value={search}
          onChange={(e) => {
  setSearch(e.target.value);
  setCurrentPage(1);
}}
          className="mt-6 w-full rounded-lg border bg-white p-3"
        />
<div className="mt-4 grid gap-4 rounded-xl bg-white p-5 shadow sm:grid-cols-2 lg:grid-cols-4">
  <select
  value={serviceFilter}
  onChange={(e) => {
    setServiceFilter(e.target.value);
    setCurrentPage(1);
  }}
    className="w-full rounded border p-3"
  >
    <option value="">Todos los servicios</option>
    <option value="electricidad">Electricidad</option>
    <option value="plomeria">Plomería</option>
    <option value="aire-acondicionado">
      Aire acondicionado
    </option>
    <option value="limpieza">Limpieza</option>
    <option value="pintura">Pintura</option>
    <option value="carpinteria">Carpintería</option>
    <option value="seguridad">Seguridad</option>
    <option value="jardineria">Jardinería</option>
    <option value="remodelacion">Remodelación</option>
    <option value="mantenimiento">
      Mantenimiento general
    </option>
  </select>

  <select
  value={municipalityFilter}
  onChange={(e) => {
    setMunicipalityFilter(e.target.value);
    setCurrentPage(1);
  }}
    className="w-full rounded border p-3"
  >
    <option value="">Todos los municipios</option>
    <option value="Monterrey">Monterrey</option>
    <option value="San Pedro Garza García">
      San Pedro Garza García
    </option>
    <option value="San Nicolás de los Garza">
      San Nicolás de los Garza
    </option>
    <option value="Guadalupe">Guadalupe</option>
    <option value="Apodaca">Apodaca</option>
    <option value="Santa Catarina">Santa Catarina</option>
    <option value="General Escobedo">
      General Escobedo
    </option>
    <option value="García">García</option>
    <option value="Juárez">Juárez</option>
    <option value="Santiago">Santiago</option>
  </select>

  <label className="flex items-center gap-2 rounded border p-3">
    <input
  type="checkbox"
  checked={verifiedOnly}
  onChange={(e) => {
    setVerifiedOnly(e.target.checked);
    setCurrentPage(1);
  }}
/>

    Solo verificados
  </label>

  <label className="flex items-center gap-2 rounded border p-3">
    
<input
  type="checkbox"
  checked={portfolioOnly}
  onChange={(e) => {
    setPortfolioOnly(e.target.checked);
    setCurrentPage(1);
  }}
/>
    Con portafolio
  </label>
  <button
  type="button"
  onClick={() => {
    setSearch("");
    setServiceFilter("");
    setMunicipalityFilter("");
    setVerifiedOnly(false);
    setPortfolioOnly(false);
    setSortOption("ranking");
    setCurrentPage(1);
  }}
  className="rounded bg-gray-800 px-4 py-3 font-semibold text-white hover:bg-gray-900 sm:col-span-2 lg:col-span-4"
>
  Limpiar filtros
</button>
</div>
<div className="mt-6 flex flex-wrap items-center justify-between gap-4">
  <p className="font-semibold text-gray-700">
    {sortedBusinesses.length}{" "}
    {sortedBusinesses.length === 1
      ? "profesional encontrado"
      : "profesionales encontrados"}
  </p>

  <div className="flex items-center gap-3">
    <label
      htmlFor="sort-contractors"
      className="font-semibold text-gray-700"
    >
      Ordenar por:
    </label>

    <select
  id="sort-contractors"
  value={sortOption}
  onChange={(e) => {
    setSortOption(e.target.value);
    setCurrentPage(1);
  }}
      className="rounded border bg-white p-3"
    >
      <option value="ranking">Recomendados</option>
      <option value="rating">Mejor calificación</option>
      <option value="reviews">Más reseñas</option>
      <option value="views">Más visitados</option>
      <option value="name">Nombre A–Z</option>
    </select>
  </div>
</div>
        {loading && (
          <p className="mt-8 text-gray-600">
            Cargando profesionales...
          </p>
        )}

        {errorMessage && (
          <div className="mt-8 rounded-lg bg-red-100 p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        {!loading &&
          !errorMessage &&
          sortedBusinesses.length === 0 && (
            <div className="mt-8 rounded-xl bg-white p-6 shadow">
              No se encontraron profesionales aprobados.
            </div>
          )}

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {paginatedBusinesses.map((business) => (
            <article
  key={business.id}
  role="link"
  tabIndex={0}
  onClick={() => router.push(`/contractors/${business.id}`)}
  onKeyDown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      router.push(`/contractors/${business.id}`);
    }
  }}
  className={`relative cursor-pointer rounded-2xl border-2 p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 ${
  business.isFeatured
    ? "border-purple-400 bg-gradient-to-br from-purple-50 to-white ring-2 ring-purple-100"
    : "border-transparent bg-white"
}`}
>
{business.isFeatured && (
  <span
    className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-xs font-bold shadow ${
      business.plan?.toLowerCase() === "premium"
        ? "bg-amber-400 text-amber-950"
        : "bg-purple-600 text-white"
    }`}
  >
    {business.plan?.toLowerCase() === "premium"
      ? "👑 Premium"
      : "⭐ Perfil destacado"}
  </span>
)}
 <button
    type="button"
    onClick={(event) => {
      event.stopPropagation();
      toggleFavorite(business.id);
    }}
    aria-label={
      favoriteIds.includes(business.id)
        ? `Quitar ${business.business_name} de favoritos`
        : `Guardar ${business.business_name} en favoritos`
    }
    title={
      favoriteIds.includes(business.id)
        ? "Quitar de favoritos"
        : "Guardar profesional"
    }
    className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border bg-white text-2xl shadow-md transition hover:scale-110 hover:bg-red-50"
  >
    {favoriteIds.includes(business.id) ? "❤️" : "🤍"}
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

{business.rankingScore !== undefined && (
  <div className="mb-3 flex flex-wrap items-center gap-2">
    {business.reviewCount !== undefined &&
  business.reviewCount >= 3 &&
  (business.averageRating ?? 0) >= 4.5 && (
    <span className="rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700">
      🏆 Top Profesional
    </span>
  )}
    {business.portfolioCount !== undefined &&
  business.portfolioCount > 0 && (
    <Link
  href={`/contractors/${business.id}#portfolio`}
  onClick={(event) => event.stopPropagation()}
  className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
>
  📷 {business.portfolioCount}{" "}
  {business.portfolioCount === 1 ? "proyecto" : "proyectos"}
</Link>
  )}
  </div>
)}
              <h2 className="text-center text-2xl font-bold">
                {business.business_name}
              </h2>
<div className="mt-3 flex flex-wrap items-center gap-2">
  <span className="font-semibold text-yellow-600">
    {business.reviewCount && business.reviewCount > 0
      ? `⭐ ${business.averageRating?.toFixed(1)}`
      : "⭐ Sin reseñas"}
  </span>

  {business.reviewCount && business.reviewCount > 0 ? (
    <span className="text-sm text-gray-500">
      ({business.reviewCount}{" "}
      {business.reviewCount === 1 ? "reseña" : "reseñas"})
    </span>
  ) : null}

  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
  ✔ Profesional aprobado
</span>
</div>
              <div className="mt-4 space-y-2">
  <p className="font-semibold text-gray-700">
    🔧 {formatService(business.service)}
  </p>

  <p className="font-semibold text-gray-700">
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
    {business.municipality.map((municipality) => (
      <span
        key={municipality}
        className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
      >
        📍 {municipality}
      </span>
    ))}
  </div>
</div>

              <p className="mt-4 text-gray-600">
  {business.description}
</p>

<div
  className="mt-6 space-y-3"
  onClick={(event) => event.stopPropagation()}
>

  <Link
  href={`/contractors/${business.id}`}
  className="block w-full rounded-xl bg-blue-700 px-4 py-3 text-center font-bold text-white transition hover:bg-blue-800"
>
  Ver perfil
</Link>

  <div className="grid grid-cols-2 gap-3">

    <a
      href={`https://wa.me/52${business.phone.replace(/\D/g, "")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-xl bg-green-500 px-4 py-3 text-center font-bold text-white transition hover:bg-green-600"
    >
      💬 WhatsApp
    </a>

    <a
      href={`tel:${business.phone}`}
      className="rounded-xl bg-gray-800 px-4 py-3 text-center font-bold text-white transition hover:bg-gray-900"
    >
      📞 Llamar
    </a>

  </div>

</div>
            </article>
          ))}
        </div>
        {sortedBusinesses.length > 0 && totalPages > 1 && (
  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
    <button
      type="button"
      onClick={() =>
        setCurrentPage((page) => Math.max(1, page - 1))
      }
      disabled={currentPage === 1}
      className="rounded bg-gray-800 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      Anterior
    </button>

    <span className="rounded border bg-white px-4 py-2 font-semibold text-gray-700">
      Página {currentPage} de {totalPages}
    </span>

    <button
      type="button"
      onClick={() =>
        setCurrentPage((page) =>
          Math.min(totalPages, page + 1)
        )
      }
      disabled={currentPage === totalPages}
      className="rounded bg-blue-700 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      Siguiente
    </button>
  </div>
)}
      </div>
    </main>
  );
}
export default function ContractorsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-8">
          <p>Cargando profesionales...</p>
        </main>
      }
    >
      <ContractorsContent />
    </Suspense>
  );
}