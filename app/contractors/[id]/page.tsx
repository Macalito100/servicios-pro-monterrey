import { supabase } from "@/lib/supabase";
import PortfolioGallery from "@/components/PortfolioGallery";
import { formatService } from "@/lib/formatService";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

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
};
type PortfolioItem = {
  id: number;
  image_url: string;
  title: string | null;
  description: string | null;
};
type Review = {
  id: number;
  created_at: string;
  customer_name: string;
  rating: number;
  review_text: string;
};
export default async function ContractorProfile({ params }: Props) {
  const { id } = await params;

  const businessId = Number(id);

  if (Number.isNaN(businessId)) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
          <h1 className="text-3xl font-bold text-red-700">
            Profesional no encontrado
          </h1>

          <a
            href="/contractors"
            className="mt-6 inline-block rounded bg-blue-700 px-5 py-3 text-white"
          >
            Volver a profesionales
          </a>
        </div>
      </main>
    );
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
  verified
`)
    .eq("id", businessId)
    .eq("approval_status", "approved")
    .single();

  const business = data as Business | null;

if (error || !business) {
  console.error("Error al cargar el profesional:", error);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-red-700">
          Profesional no encontrado
        </h1>

        <p className="mt-3 text-gray-600">
          Este negocio no existe o todavía no ha sido aprobado.
        </p>

        <a
          href="/contractors"
          className="mt-6 inline-block rounded bg-blue-700 px-5 py-3 text-white"
        >
          Volver a profesionales
        </a>
      </div>
    </main>
  );
}
const { error: viewError } = await supabase.rpc(
  "increment_business_profile_view",
  {
    requested_business_id: business.id,
  }
);

if (viewError) {
  console.error(
    "No se pudo registrar la visita:",
    viewError
  );
}
const { data: portfolioData, error: portfolioError } =
  await supabase
    .from("business_portfolio")
    .select("id, image_url, title, description")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

if (portfolioError) {
  console.error(
    "No se pudo cargar el portafolio:",
    portfolioError
  );
}

const portfolioItems =
  (portfolioData ?? []) as PortfolioItem[];
const { data: reviewData, error: reviewError } =
  await supabase
    .from("business_reviews")
    .select(
      "id, created_at, customer_name, rating, review_text"
    )
    .eq("business_id", business.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

if (reviewError) {
  console.error(
    "No se pudieron cargar las reseñas:",
    reviewError
  );
}

const reviews = (reviewData ?? []) as Review[];

const averageRating =
  reviews.length > 0
    ? reviews.reduce(
        (total, review) => total + review.rating,
        0
      ) / reviews.length
    : 0;
  return (
  <main className="min-h-screen bg-gray-100 px-4 py-6 sm:p-8">
    <div className="mx-auto max-w-3xl rounded-xl bg-white p-4 shadow sm:p-8">
      <section className="rounded-2xl bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-6 text-center text-white sm:p-10">
        {business.logo_url ? (
          <img
            src={business.logo_url}
            alt={`Logo de ${business.business_name}`}
            className="mx-auto h-24 w-24 rounded-full border-4 border-white bg-white object-contain shadow-lg sm:h-36 sm:w-36"
          />
        ) : (
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl shadow-lg sm:h-36 sm:w-36 sm:text-7xl">
            🛠️
          </div>
        )}

        <h1 className="mt-4 break-words text-3xl font-extrabold leading-tight sm:mt-6 sm:text-4xl">
          {business.business_name}
        </h1>

        <div className="mt-4 flex flex-wrap justify-center gap-2 sm:gap-3">
          <span className="rounded-full bg-yellow-400 px-3 py-1.5 text-sm font-bold text-black sm:px-4 sm:py-2 sm:text-base">
            {reviews.length > 0
              ? `⭐ ${averageRating.toFixed(1)} (${reviews.length})`
              : "⭐ Sin reseñas"}
          </span>

          <span className="rounded-full bg-green-500 px-3 py-1.5 text-sm font-bold text-white sm:px-4 sm:py-2 sm:text-base">
            ✔ Profesional aprobado
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
          <a
            href={`tel:${business.phone}`}
            className="rounded-xl bg-gray-800 px-3 py-3 text-center text-sm font-bold text-white transition hover:bg-gray-900 sm:px-8 sm:text-base"
          >
            📞 Llamar
          </a>

          <a
            href={`https://wa.me/52${business.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-green-500 px-3 py-3 text-center text-sm font-bold text-white transition hover:bg-green-600 sm:px-8 sm:text-base"
          >
            💬 WhatsApp
          </a>

          <a
            href={`/quote?business=${business.id}`}
            className="col-span-2 rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-blue-700 transition hover:bg-gray-100 sm:col-span-1 sm:px-8 sm:text-base"
          >
            📝 Solicitar servicio
          </a>
        </div>
      </section>

<div className="mt-6 grid gap-4 rounded-xl border bg-gray-50 p-4 sm:grid-cols-2 sm:p-6">
  <div>
    <p className="text-sm text-gray-500">
      Servicio principal
    </p>

    <p className="text-lg font-bold">
  🔧 {formatService(business.service)}
</p>
  </div>

  <div>
    <p className="text-sm text-gray-500">
  Tipo de cliente
</p>

<p className="text-lg font-bold">
  {business.customer_type === "ambos"
    ? "🏠 Hogares y 🏢 Negocios"
    : business.customer_type === "hogares"
    ? "🏠 Hogares"
    : business.customer_type === "negocios"
    ? "🏢 Negocios"
    : business.customer_type}
</p>
    
  </div>

  <div>
    <p className="text-sm text-gray-500">
      Municipios
    </p>

    <p className="font-bold">
      {business.municipality.join(", ")}
    </p>
  </div>

<div>
  <p className="text-sm text-gray-500">
    Calificación
  </p>

  <p className="text-lg font-bold text-yellow-600">
    {reviews.length > 0
  ? `⭐ ${averageRating.toFixed(1)} • ${reviews.length} ${
      reviews.length === 1 ? "reseña" : "reseñas"
    }`
  : "⭐ Sin reseñas"}
  </p>
</div>

</div>

        <h2 className="mt-8 text-2xl font-bold">
          Municipios donde presta servicio
        </h2>

        <ul className="mt-3 list-disc pl-6 text-gray-700">
          {business.municipality.map((municipality) => (
            <li key={municipality}>
              {municipality}
            </li>
          ))}
        </ul>

        <h2 className="mt-8 text-2xl font-bold">
          Acerca del negocio
        </h2>

        <p className="mt-3 text-gray-700">
          {business.description}
        </p>
<section
  id="portfolio"
  className="mt-10 border-t pt-8"
>

  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-3xl font-bold">
        Trabajos realizados
      </h2>

      <p className="mt-2 text-gray-600">
        Explora algunos de los proyectos realizados por este profesional.
      </p>
    </div>

    <span className="rounded-full bg-blue-100 px-4 py-2 font-semibold text-blue-700">
  📷 {portfolioItems.length}{" "}
  {portfolioItems.length === 1
    ? "proyecto"
    : "proyectos"}
</span>
  </div>

  {portfolioItems.length === 0 ? (

    <div className="mt-6 rounded-xl bg-gray-50 p-6 text-center text-gray-500">
      Este profesional aún no ha publicado proyectos. Vuelve pronto para ver sus trabajos.
    </div>

  
        ) : (
  <PortfolioGallery items={portfolioItems} />
)}

</section>
<section className="mt-10 border-t pt-8">
  <div className="flex items-center justify-between gap-4">
    <div>
      <h2 className="text-3xl font-bold">
        Reseñas de clientes
      </h2>

      <p className="mt-2 text-gray-600">
        Opiniones publicadas por clientes.
      </p>
    </div>

    <span className="rounded-full bg-yellow-100 px-3 py-1 font-semibold text-yellow-700">
      {reviews.length > 0
        ? `⭐ ${averageRating.toFixed(1)}`
        : "Sin reseñas"}
    </span>
  </div>

  {reviews.length === 0 ? (
    <div className="mt-6 rounded-xl bg-gray-50 p-6 text-gray-600">
      Este profesional todavía no tiene reseñas.
    </div>
  ) : (
    <div className="mt-6 space-y-5">
      {reviews.map((review) => (
        <article
          key={review.id}
          className="rounded-xl border bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold">
              {review.customer_name}
            </h3>

            <p className="font-semibold text-yellow-500">
              {"★".repeat(review.rating)}
              <span className="text-gray-300">
                {"★".repeat(5 - review.rating)}
              </span>
            </p>
          </div>

          <p className="mt-4 text-gray-700">
            {review.review_text}
          </p>

          <p className="mt-4 text-sm text-gray-500">
            {new Date(review.created_at).toLocaleDateString(
              "es-MX"
            )}
          </p>
        </article>
      ))}
    </div>
  )}
</section>
      </div>
    </main>
  );
}