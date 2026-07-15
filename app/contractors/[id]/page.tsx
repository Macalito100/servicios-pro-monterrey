import { supabase } from "@/lib/supabase";
import PortfolioGallery from "@/components/PortfolioGallery";
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
    .eq("status", "approved")
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

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
        {business.logo_url ? (
          <img
            src={business.logo_url}
            alt={`Logo de ${business.business_name}`}
            className="h-56 w-full rounded-xl object-contain"
          />
        ) : (
          <div className="flex h-56 items-center justify-center rounded-xl bg-blue-50 text-7xl">
            🛠️
          </div>
        )}

        <h1 className="mt-6 text-4xl font-bold text-blue-700">
          {business.business_name}
        </h1>
<div className="mt-4 flex flex-wrap items-center gap-3">

  <div className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-700 font-semibold">
    ⭐ Sin reseñas todavía
  </div>

  {business.verified ? (
  <div className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700">
    ✓ Empresa verificada
  </div>
) : (
  <div className="rounded-full bg-yellow-100 px-3 py-1 font-semibold text-yellow-700">
    ⏳ Empresa pendiente de verificación
  </div>
)}

</div>
        <p className="mt-4 text-xl text-gray-700">
          🔧 {business.service}
        </p>

        <p className="mt-2 text-gray-700">
          🏠🏢 {business.customer_type}
        </p>

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
<section className="mt-10 border-t pt-8">

  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-3xl font-bold">
        Trabajos realizados
      </h2>

      <p className="mt-2 text-gray-600">
        Algunos proyectos publicados por este profesional.
      </p>
    </div>

    <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
      {portfolioItems.length}
    </span>
  </div>

  {portfolioItems.length === 0 ? (

    <div className="mt-6 rounded-xl bg-gray-50 p-6 text-center text-gray-500">
      Este profesional todavía no ha publicado trabajos.
    </div>

  
        ) : (
  <PortfolioGallery items={portfolioItems} />
)}

</section>
<div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`tel:${business.phone}`}
            className="rounded bg-green-600 px-6 py-3 text-white hover:bg-green-700"
          >
            📞 Llamar
          </a>

          <a
            href={`/quote?business=${business.id}`}
            className="rounded bg-blue-700 px-6 py-3 text-white hover:bg-blue-800"
          >
            Solicitar cotización
          </a>
        </div>
      </div>
    </main>
  );
}