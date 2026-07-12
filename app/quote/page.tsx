"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { contractors } from "@/data/contractors";
import { supabase } from "@/lib/supabase";

export default function QuotePage() {
  const [submitted, setSubmitted] = useState(false);

  const searchParams = useSearchParams();
  const contractorId = searchParams.get("contractor");

  const selectedContractor = contractors.find(
    (contractor) => contractor.id === contractorId
  );
const [name, setName] = useState("");
const [phone, setPhone] = useState("");
const [email, setEmail] = useState("");
const [propertyType, setPropertyType] = useState("");
const [service, setService] = useState("");
const [description, setDescription] = useState("");
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
      contractor_id: selectedContractor?.id ?? null,
      contractor_name: selectedContractor?.name ?? null,
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
  Solicitar Cotización
</h1>

        <p className="mt-3 text-gray-600">
          Cuéntanos qué servicio necesitas para tu hogar o negocio en Monterrey y te ayudaremos a encontrar el profesional indicado.
        </p>
{selectedContractor && (
  <div className="mt-5 rounded-lg bg-blue-50 p-4">
    <p className="text-sm text-gray-600">
      Solicitud para:
    </p>

    <p className="font-bold text-blue-700">
      {selectedContractor.name}
    </p>

    <p className="text-sm text-gray-600">
      {selectedContractor.service} · {selectedContractor.location}
    </p>
  </div>
)}

        {submitted ? (

          <div className="mt-8 bg-green-100 p-5 rounded">
            <h2 className="text-xl font-bold">
              ¡Gracias!
            </h2>
            <p>
               Hemos recibido tu solicitud. Un profesional se pondrá en contacto contigo pronto.
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
            <select
  className="w-full border p-3 rounded"
  required
  value={service}
  onChange={(e) => setService(e.target.value)}
>
  <option value="" disabled>
    Selecciona un servicio
  </option>

  <option value="electricidad">
    Electricidad
  </option>

  <option value="plomeria">
    Plomería
  </option>

  <option value="aire-acondicionado">
    Aire acondicionado
  </option>

  <option value="limpieza">
    Limpieza
  </option>

  <option value="seguridad">
    Seguridad
  </option>

  <option value="mantenimiento">
    Mantenimiento general
  </option>
</select>

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