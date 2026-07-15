"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type QuoteRequest = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  property_type: string | null;
  service: string | null;
  description: string | null;
  contractor_id: string | null;
  contractor_name: string | null;
};

export default function AdminQuotesPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadRequests() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("quote_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al cargar solicitudes:", error);
        setErrorMessage("No se pudieron cargar las solicitudes.");
      } else {
        setRequests((data ?? []) as QuoteRequest[]);
      }

      setLoading(false);
    }

    loadRequests();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p>Cargando solicitudes...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-blue-700">
              Solicitudes de cotización
            </h1>

            <p className="mt-2 text-gray-600">
              Revisa las solicitudes enviadas por los clientes.
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

        {errorMessage && (
          <div className="mt-8 rounded-lg bg-red-100 p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        {!errorMessage && requests.length === 0 && (
          <div className="mt-8 rounded-xl bg-white p-6 shadow">
            No hay solicitudes de cotización.
          </div>
        )}

        <div className="mt-8 space-y-5">
          {requests.map((request) => (
            <article
              key={request.id}
              className="rounded-xl bg-white p-6 shadow"
            >
              <h2 className="text-2xl font-bold">
                {request.name}
              </h2>

              <p className="mt-3">
                <strong>Teléfono:</strong> {request.phone}
              </p>

              <p>
                <strong>Correo:</strong> {request.email}
              </p>

              <p>
                <strong>Tipo de propiedad:</strong>{" "}
                {request.property_type || "No especificado"}
              </p>

              <p>
                <strong>Servicio:</strong>{" "}
                {request.service || "No especificado"}
              </p>

              {request.contractor_name && (
                <p>
                  <strong>Profesional solicitado:</strong>{" "}
                  {request.contractor_name}
                </p>
              )}

              <p className="mt-4 text-gray-700">
                {request.description || "Sin descripción"}
              </p>

              <p className="mt-4 text-sm text-gray-500">
                {new Date(request.created_at).toLocaleString("es-MX")}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={`tel:${request.phone}`}
                  className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  Llamar
                </a>

                <a
                  href={`mailto:${request.email}`}
                  className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
                >
                  Enviar correo
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}