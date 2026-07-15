"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Business = {
  id: number;
  business_name: string;
  phone: string;
  service: string;
  customer_type: string;
  municipality: string[];
  description: string;
  logo_url: string | null;
};

export default function ContractorsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadBusinesses() {
      const { data, error } = await supabase
        .from("business_registrations")
        .select(
  "id, business_name, phone, service, customer_type, municipality, description, logo_url"
)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al cargar negocios:", error);
        setErrorMessage("No se pudieron cargar los profesionales.");
        setLoading(false);
        return;
      }

      setBusinesses((data ?? []) as Business[]);
      setLoading(false);
    }

    loadBusinesses();
  }, []);

  const filteredBusinesses = businesses.filter((business) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      business.business_name.toLowerCase().includes(query) ||
      business.service.toLowerCase().includes(query) ||
      business.customer_type.toLowerCase().includes(query) ||
      business.municipality.some((municipality) =>
        municipality.toLowerCase().includes(query)
      )
    );
  });

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
          onChange={(e) => setSearch(e.target.value)}
          className="mt-6 w-full rounded-lg border bg-white p-3"
        />

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
          filteredBusinesses.length === 0 && (
            <div className="mt-8 rounded-xl bg-white p-6 shadow">
              No se encontraron profesionales aprobados.
            </div>
          )}

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {filteredBusinesses.map((business) => (
            <article
              key={business.id}
              className="rounded-xl bg-white p-6 shadow transition hover:shadow-xl"
            >
             {business.logo_url ? (
  <img
    src={business.logo_url}
    alt={`Logo de ${business.business_name}`}
    className="mb-4 h-40 w-full rounded-lg object-contain bg-white"
  />
) : (
  <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-blue-50 text-6xl">
    🛠️
  </div>
)} 

              <h2 className="text-2xl font-bold">
                {business.business_name}
              </h2>

              <p className="mt-3 text-gray-700">
                🔧 {business.service}
              </p>

              <p className="mt-2 text-gray-700">
                🏠🏢 {business.customer_type}
              </p>

              <div className="mt-3">
                <p className="font-semibold text-gray-700">
                  Municipios:
                </p>

                <p className="text-gray-600">
                  {business.municipality.join(", ")}
                </p>
              </div>

              <p className="mt-4 text-gray-600">
  {business.description}
</p>

<div className="mt-5 flex gap-2">

  <a
    href={`tel:${business.phone}`}
    className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
  >
    📞 Llamar
  </a>

  <a
  href={`/quote?business=${business.id}`}
  className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
>
  Cotizar
</a>

  <a
    href={`/contractors/${business.id}`}
    className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-800"
  >
    Ver perfil
  </a>

</div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}