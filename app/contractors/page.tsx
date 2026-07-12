"use client";
import Image from "next/image";
import { useState } from "react";
import { contractors } from "@/data/contractors";


export default function Contractors() {
const [search, setSearch] = useState("");
  return (
    <main className="min-h-screen bg-gray-100 p-8">

     <h1 className="text-4xl font-bold text-blue-700 mb-2">
  Profesionales en Monterrey
</h1>

<p className="text-gray-600 mb-8">
  Encuentra servicios confiables para hogares y negocios.
</p>

<input
  type="text"
  placeholder="Buscar por nombre, servicio o municipio..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-full p-3 mb-8 border rounded-lg"
/>

      <div className="grid md:grid-cols-3 gap-6">

        {contractors
  .filter((contractor) => {
    const query = search.toLowerCase();

   return (
  contractor.name.toLowerCase().includes(query) ||
  contractor.service.toLowerCase().includes(query) ||
  contractor.location.toLowerCase().includes(query) ||
  contractor.customerType.toLowerCase().includes(query)
);
  })
  .map((contractor) => (

          <div
            key={contractor.id}
            className="bg-white rounded-xl shadow p-6 hover:shadow-xl transition"
          >
<Image
  src={contractor.image}
  alt={contractor.name}
  width={400}
  height={250}
  className="w-full h-48 object-cover rounded-lg mb-4"
/>
            <h2 className="text-2xl font-bold">
              {contractor.name}
            </h2>


            <p className="mt-3 text-gray-700">
              🔧 {contractor.service}
            </p>


            <p className="text-gray-700">
              📍 {contractor.location}
            </p>
            <p className="mt-2 text-gray-700">
             🏠🏢 {contractor.customerType}
            </p>

            <p className="mt-3 text-yellow-500">
              {"★".repeat(contractor.rating)}
            </p>


            <p className="mt-3 text-gray-600">
              {contractor.description}
            </p>


            <a
  href={`/contractors/${contractor.id}`}
  className="inline-block mt-5 bg-blue-700 text-white px-5 py-2 rounded hover:bg-blue-800 transition"
>
  Ver Perfil
</a>


          </div>

        ))}

      </div>

    </main>
  );
}