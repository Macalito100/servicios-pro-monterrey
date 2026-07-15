"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type SelectedBusiness = {
  id: number;
  business_name: string;
  service: string;
  municipality: string[];
  logo_url: string | null;
  verified: boolean;
};
export default function QuotePage() {
  const [submitted, setSubmitted] = useState(false);
const [selectedBusiness, setSelectedBusiness] =
  useState<SelectedBusiness | null>(null);

const [loadingBusiness, setLoadingBusiness] = useState(false);
  const searchParams = useSearchParams();
  const businessId = searchParams.get("business");
  
const [name, setName] = useState("");
const [phone, setPhone] = useState("");
const [email, setEmail] = useState("");
const [propertyType, setPropertyType] = useState("");
const [service, setService] = useState("");
const [description, setDescription] = useState("");
useEffect(() => {
  async function loadSelectedBusiness() {
    if (!businessId) {
      return;
    }

    setLoadingBusiness(true);

    const { data, error } = await supabase
  .from("business_registrations")
  .select(
  "id, business_name, service, municipality, logo_url, verified"
)
      .eq("id", Number(businessId))
      .eq("status", "approved")
      .single();

    setLoadingBusiness(false);

    if (error || !data) {
      console.error("No se pudo cargar el negocio:", error);
      return;
    }

    setSelectedBusiness(data);
    setService(data.service);
  }

  loadSelectedBusiness();
}, [businessId]);
 async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const { error } = await supabase
  .from("quote_requests")
  .insert({
    name,
    phone,
    email,
    property_type: propertyType,
    service,
    description,
    business_id: selectedBusiness?.id ?? null,
    contractor_id: selectedBusiness
      ? String(selectedBusiness.id)
      : null,
    contractor_name:
      selectedBusiness?.business_name ?? null,
  });

  if (error) {
    console.error(error);
    alert("No se pudo enviar la solicitud.");
    return;
  }

  setSubmitted(true);
}

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8">

        <h1 className="text-4xl font-bold text-blue-700">
  Solicitar cotización
</h1>

<p className="mt-3 text-gray-600">
  Completa el formulario y el profesional recibirá tu solicitud directamente.
</p>


       {submitted ? (
  <div className="mt-8 rounded-xl bg-green-100 p-6 text-center">
    <h2 className="text-2xl font-bold text-green-700">
      ¡Solicitud enviada!
    </h2>

    <p className="mt-3 text-gray-700">
      Tu solicitud fue enviada correctamente.
    </p>

    <p className="mt-4 text-lg">
      <span className="font-bold text-blue-700">
        {selectedBusiness?.business_name}
      </span>{" "}
      recibió tu solicitud y se pondrá en contacto contigo muy pronto.
    </p>
  </div>
) : (
  <form
    onSubmit={handleSubmit}
    className="mt-8 space-y-4"
  >

            <input
  className="w-full border p-3 rounded"
  placeholder="Nombre"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
/>


           <input
  className="w-full border p-3 rounded"
  placeholder="Número telefónico"
  type="tel"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  required
/>


            <input
  className="w-full border p-3 rounded"
  placeholder="Correo electrónico"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>

<select
  className="w-full border p-3 rounded"
  required
  value={propertyType}
  onChange={(e) => setPropertyType(e.target.value)}
>
  <option value="" disabled>
    Tipo de propiedad
  </option>

  <option value="hogar">
    Hogar
  </option>

  <option value="negocio">
    Negocio
  </option>
</select>
           {loadingBusiness ? (
  <div className="w-full rounded border bg-gray-50 p-3 text-gray-600">
    Cargando información del negocio...
  </div>
) : selectedBusiness ? (
  <div className="mb-8 rounded-xl border bg-blue-50 p-6">
    <p className="text-center text-sm font-semibold uppercase tracking-wide text-blue-700">
      Solicitando cotización para
    </p>

    <div className="mt-6 flex flex-col items-center text-center">
      {selectedBusiness.logo_url ? (
        <img
          src={selectedBusiness.logo_url}
          alt={`Logo de ${selectedBusiness.business_name}`}
          className="h-32 w-32 rounded-xl bg-white p-3 object-contain shadow"
        />
      ) : (
        <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-white text-6xl shadow">
          🛠️
        </div>
      )}

      <h2 className="mt-6 text-4xl font-bold text-gray-900">
  {selectedBusiness.business_name}
</h2>

<div className="mt-3 flex flex-wrap items-center justify-center gap-3">
  <p className="text-sm text-gray-600">
  Sin reseñas todavía
</p>

  {selectedBusiness.verified && (
  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
    ✓ Empresa verificada
  </span>
)}
</div>

<p className="mt-4 text-xl text-gray-700">
  🔧 {selectedBusiness.service}
</p>

      <p className="mt-2 text-gray-600">
        📍 {selectedBusiness.municipality.join(" • ")}
      </p>
    </div>
  </div>
) : (
  <select
    className="w-full rounded border p-3"
    value={service}
    onChange={(e) => setService(e.target.value)}
    required
  >
    <option value="" disabled>
      Selecciona un servicio
    </option>

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
)}

            <textarea
  className="w-full border p-3 rounded"
  placeholder="Describe el trabajo que necesitas y en qué zona de Monterrey se encuentra"
  rows={5}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  required
/>


<button
  type="submit"
  className="w-full bg-blue-700 text-white p-3 rounded font-bold hover:bg-blue-800 transition"
>
  Solicitar Cotización
</button>


          </form>

        )}

      </div>

    </main>
  );
}