"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Business = {
  id: number;
  business_name: string;
  service: string;
  customer_type: string;
  municipality: string[];
  description: string;
  logo_url: string | null;
  approval_status: "pending" | "approved" | "rejected";
};

export default function AdminBusinessesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
const [statusFilter, setStatusFilter] = useState("pending");
  useEffect(() => {
    async function loadBusinesses() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("business_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setBusinesses(data as Business[]);
      }

      setLoading(false);
    }

    loadBusinesses();
  }, [router]);
async function updateBusinessStatus(
  id: number,
  status: "approved" | "rejected"
) {
  const { data, error } = await supabase
    .from("business_registrations")
    .update({
      approval_status: status,
    })
    .eq("id", id)
    .select("id, approval_status")
    .single();

  if (error) {
    console.error(
      "Error al actualizar el negocio:",
      JSON.stringify(error, null, 2)
    );

    alert("No se pudo actualizar el negocio.");
    return;
  }

  if (!data) {
    alert("No se actualizó ningún negocio.");
    return;
  }

  setBusinesses((current) =>
    current.map((business) =>
      business.id === id
        ? {
            ...business,
            approval_status: data.approval_status,
          }
        : business
    )
  );
  
}
async function handleLogout() {
  await supabase.auth.signOut();
  router.push("/admin/login");
  router.refresh();
}
const filteredBusinesses = businesses.filter((business) => {
  if (statusFilter === "all") {
    return true;
  }

  return business.approval_status === statusFilter;
});
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p>Cargando negocios...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="mx-auto max-w-6xl">

        <div className="flex flex-wrap items-center justify-between gap-4">
  <div>
    <h1 className="text-4xl font-bold text-blue-700">
      Panel de negocios
    </h1>

    <p className="mt-3 text-gray-600">
      Revisa, aprueba o rechaza los negocios registrados.
    </p>
  </div>

  <button
    type="button"
    onClick={handleLogout}
    className="rounded bg-gray-800 px-5 py-3 font-semibold text-white hover:bg-gray-900"
  >
    Cerrar sesión
  </button>
</div>
<div className="mt-8">
  <label className="mr-3 font-semibold">
    Mostrar:
  </label>

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="rounded border bg-white p-2"
  >
    <option value="pending">Pendientes</option>
    <option value="approved">Aprobados</option>
    <option value="rejected">Rechazados</option>
    <option value="all">Todos</option>
  </select>
</div>
        

        <div className="mt-8 space-y-6">
 {filteredBusinesses.length === 0 && (
    <div className="rounded-xl bg-white p-6 shadow">
      No hay negocios en esta categoría.
    </div>
  )}
          {filteredBusinesses.map((business) => (

            <div
              key={business.id}
              className="rounded-xl bg-white p-6 shadow"
            >

              <div className="flex justify-between">

                <div>

                  <h2 className="text-2xl font-bold">
                    {business.business_name}
                  </h2>

                  <p className="mt-2">
                    🔧 {business.service}
                  </p>

                  <p>
                    🏠🏢 {business.customer_type}
                  </p>

                  <p className="mt-2 text-gray-600">
                    {business.description}
                  </p>

                  <p className="mt-3 text-sm text-blue-700">
  Estado: {business.approval_status}
</p>
<div className="mt-5 flex flex-wrap gap-3">
  <button
    type="button"
    onClick={() =>
      updateBusinessStatus(business.id, "approved")
    }
    disabled={business.approval_status === "approved"}
    className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    Aprobar
  </button>

  <button
    type="button"
    onClick={() =>
      updateBusinessStatus(business.id, "rejected")
    }
    disabled={business.approval_status === "rejected"}
    className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    Rechazar
  </button>

  {business.approval_status === "approved" && (
  <a
    href={`/contractors/${business.id}`}
    className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-800"
  >
    Ver perfil
  </a>
)}
</div>
                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}