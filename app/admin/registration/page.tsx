"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Registration = {
  id: number;
  created_at: string;
  business_name: string;
  owner_name: string;
  phone: string;
  email: string;
  service: string;
  customer_type: string;
  municipality: string[] | string | null;
  description: string;
  logo_url: string | null;
  approval_status: "pending" | "approved" | "rejected";
};

export default function AdminRegistrationPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function loadRegistrations() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("business_registrations")
      .select(
        `
        id,
        created_at,
        business_name,
        owner_name,
        phone,
        email,
        service,
        customer_type,
        municipality,
        description,
        logo_url,
        approval_status
        `
      )
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar registros:", error);
      setErrorMessage("No se pudieron cargar los registros.");
      setLoading(false);
      return;
    }

    setRegistrations((data ?? []) as Registration[]);
    setLoading(false);
  }

  async function updateApprovalStatus(
    id: number,
    status: "approved" | "rejected"
  ) {
    setUpdatingId(id);

    const { error } = await supabase
      .from("business_registrations")
      .update({
        approval_status: status,
      })
      .eq("id", id);

    if (error) {
      console.error("Error al actualizar el registro:", error);
      alert("No se pudo actualizar el registro.");
      setUpdatingId(null);
      return;
    }

    setRegistrations((current) =>
      current.filter((registration) => registration.id !== id)
    );

    setUpdatingId(null);
  }

  function formatMunicipalities(
    municipality: string[] | string | null
  ) {
    if (!municipality) {
      return "No especificado";
    }

    if (Array.isArray(municipality)) {
      return municipality.join(", ");
    }

    return municipality;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p>Cargando registros pendientes...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-700">
            Registros pendientes
          </h1>

          <p className="mt-2 text-gray-600">
            Revisa y aprueba los negocios antes de publicarlos.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-lg bg-red-100 p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        {!errorMessage && registrations.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <p className="text-lg font-semibold text-gray-700">
              No hay registros pendientes.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {registrations.map((registration) => (
            <article
              key={registration.id}
              className="rounded-xl bg-white p-6 shadow"
            >
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="shrink-0">
                  {registration.logo_url ? (
                    <img
                      src={registration.logo_url}
                      alt={`Logo de ${registration.business_name}`}
                      className="h-32 w-32 rounded-xl border bg-white object-contain p-2"
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-blue-50 text-5xl">
                      🏢
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-bold text-blue-700">
                        {registration.business_name}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Registrado el{" "}
                        {new Date(
                          registration.created_at
                        ).toLocaleDateString("es-MX")}
                      </p>
                    </div>

                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                      Pendiente
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 text-gray-700 md:grid-cols-2">
                    <p>
                      <strong>Responsable:</strong>{" "}
                      {registration.owner_name}
                    </p>

                    <p>
                      <strong>Teléfono:</strong>{" "}
                      {registration.phone}
                    </p>

                    <p>
                      <strong>Correo:</strong>{" "}
                      {registration.email}
                    </p>

                    <p>
                      <strong>Servicio:</strong>{" "}
                      {registration.service}
                    </p>

                    <p>
                      <strong>Atiende a:</strong>{" "}
                      {registration.customer_type}
                    </p>

                    <p>
                      <strong>Municipios:</strong>{" "}
                      {formatMunicipalities(
                        registration.municipality
                      )}
                    </p>
                  </div>

                  <div className="mt-5 rounded-lg bg-gray-50 p-4">
                    <p className="font-semibold text-gray-700">
                      Descripción
                    </p>

                    <p className="mt-2 whitespace-pre-line text-gray-600">
                      {registration.description}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={`tel:${registration.phone}`}
                      className="rounded bg-gray-700 px-4 py-2 font-semibold text-white hover:bg-gray-800"
                    >
                      📞 Llamar
                    </a>

                    <a
                      href={`mailto:${registration.email}`}
                      className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                    >
                      ✉️ Correo
                    </a>

                    <button
                      type="button"
                      disabled={updatingId === registration.id}
                      onClick={() =>
                        updateApprovalStatus(
                          registration.id,
                          "approved"
                        )
                      }
                      className="rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updatingId === registration.id
                        ? "Guardando..."
                        : "✅ Aprobar"}
                    </button>

                    <button
                      type="button"
                      disabled={updatingId === registration.id}
                      onClick={() =>
                        updateApprovalStatus(
                          registration.id,
                          "rejected"
                        )
                      }
                      className="rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updatingId === registration.id
                        ? "Guardando..."
                        : "❌ Rechazar"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}