"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Business = {
  id: number;
  business_name: string;
  service: string;
  status: string;
  verified: boolean;
  logo_url: string | null;
  municipality: string[];
};
type QuoteRequest = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  property_type: string | null;
  service: string | null;
  description: string | null;
  status: string;
};
export default function BusinessDashboardPage() {
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
const [requests, setRequests] = useState<QuoteRequest[]>([]);
  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/businesses/login");
        return;
      }

      const { data, error } = await supabase
        .from("business_registrations")
        .select(
          "id, business_name, service, status, verified, logo_url, municipality"
        )
        .eq("owner_user_id", user.id)
        .single();

      if (error || !data) {
        console.error("No se encontró el negocio:", error);
        setErrorMessage(
          "Tu cuenta todavía no está vinculada con un negocio."
        );
        setLoading(false);
        return;
      }

      setBusiness(data);

const { data: quoteData, error: quoteError } = await supabase
  .from("quote_requests")
  .select(
    "id, created_at, name, phone, email, property_type, service, description, status"
  )
  .eq("business_id", data.id)
  .order("created_at", { ascending: false });

if (quoteError) {
  console.error(
    "No se pudieron cargar las solicitudes:",
    quoteError
  );
} else {
  setRequests((quoteData ?? []) as QuoteRequest[]);
}

setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/businesses/login");
    router.refresh();
  }
async function updateRequestStatus(
  id: number,
  status: "new" | "accepted" | "in_progress" | "completed" | "rejected"
) {
  const { data, error } = await supabase
    .from("quote_requests")
    .update({ status })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) {
    console.error(
      "No se pudo actualizar la solicitud:",
      error
    );

    alert("No se pudo cambiar el estado.");
    return;
  }

  setRequests((current) =>
    current.map((request) =>
      request.id === id
        ? { ...request, status: data.status }
        : request
    )
  );
}
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p>Cargando panel del negocio...</p>
      </main>
    );
  }

  if (errorMessage || !business) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
          <h1 className="text-3xl font-bold text-red-700">
            Negocio no encontrado
          </h1>

          <p className="mt-3 text-gray-600">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 rounded bg-gray-800 px-5 py-3 text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex gap-3">
  <a
    href="/businesses/profile"
    className="rounded bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
  >
    Mi perfil
  </a>

  <button
    type="button"
    onClick={handleLogout}
    className="rounded bg-gray-800 px-5 py-3 font-semibold text-white hover:bg-gray-900"
  >
    Cerrar sesión
  </button>
</div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <section className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Estado del negocio
            </p>

            <p className="mt-2 text-2xl font-bold capitalize">
              {business.status}
            </p>
          </section>

          <section className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Servicio principal
            </p>

            <p className="mt-2 text-2xl font-bold">
              {business.service}
            </p>
          </section>

          <section className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Verificación
            </p>

            <p className="mt-2 text-2xl font-bold">
              {business.verified
                ? "✓ Verificado"
                : "Pendiente"}
            </p>
          </section>
        </div>

        <section className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-bold">
            Municipios donde prestas servicio
          </h2>

          <p className="mt-3 text-gray-600">
            {business.municipality.join(" • ")}
          </p>
        </section>
        <section className="mt-8">
  <div className="flex items-center justify-between">
    <h2 className="text-2xl font-bold">
      Solicitudes recibidas
    </h2>

    <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
      {requests.length}
    </span>
  </div>

  {requests.length === 0 ? (
    <div className="mt-5 rounded-xl bg-white p-6 shadow">
      Todavía no has recibido solicitudes.
    </div>
  ) : (
    <div className="mt-5 space-y-5">
      {requests.map((request) => (
        <article
          key={request.id}
          className="rounded-xl bg-white p-6 shadow"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">
              {request.name}
            </h3>

            <span
  className={`rounded-full px-3 py-1 text-sm font-semibold ${
    request.status === "completed"
      ? "bg-green-100 text-green-700"
      : request.status === "rejected"
        ? "bg-red-100 text-red-700"
        : request.status === "accepted"
          ? "bg-blue-100 text-blue-700"
          : request.status === "in_progress"
            ? "bg-purple-100 text-purple-700"
            : "bg-yellow-100 text-yellow-700"
  }`}
>
  {request.status === "new" && "Nueva"}
  {request.status === "accepted" && "Aceptada"}
  {request.status === "in_progress" && "En proceso"}
  {request.status === "completed" && "Completada"}
  {request.status === "rejected" && "Rechazada"}
</span>
          </div>

          <p className="mt-3">
            <strong>Servicio:</strong>{" "}
            {request.service || "No especificado"}
          </p>

          <p>
            <strong>Teléfono:</strong> {request.phone}
          </p>

          <p>
            <strong>Correo:</strong> {request.email}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
  <a
    href={`tel:${request.phone}`}
    className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
  >
    📞 Llamar
  </a>

  <a
    href={`mailto:${request.email}`}
    className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
  >
    ✉️ Correo
  </a>

  <button
    type="button"
    onClick={() =>
      updateRequestStatus(request.id, "accepted")
    }
    disabled={request.status === "accepted"}
    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    Aceptar
  </button>

  <button
    type="button"
    onClick={() =>
      updateRequestStatus(request.id, "in_progress")
    }
    disabled={request.status === "in_progress"}
    className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    En proceso
  </button>

  <button
    type="button"
    onClick={() =>
      updateRequestStatus(request.id, "completed")
    }
    disabled={request.status === "completed"}
    className="rounded bg-green-700 px-4 py-2 text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
  >
    Completar
  </button>

  <button
    type="button"
    onClick={() =>
      updateRequestStatus(request.id, "rejected")
    }
    disabled={request.status === "rejected"}
    className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    Rechazar
  </button>
</div>
        </article>
      ))}
    </div>
  )}
</section>
      </div>
    </main>
  );
}