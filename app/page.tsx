"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FeaturedContractors from "@/components/FeaturedContractors";
import PlatformStats from "@/components/PlatformStats";

export default function Home() {
  const router = useRouter();

const [service, setService] = useState("");
const [municipality, setMunicipality] = useState("");
  const services = [
  {
    icon: "⚡",
    title: "Electricistas",
    value: "electricidad",
    description:
      "Instalaciones y reparaciones para hogares, oficinas y comercios.",
  },
  {
    icon: "🚿",
    title: "Plomería",
    value: "plomeria",
    description: "Fugas, tuberías, baños y sistemas de agua.",
  },
  {
    icon: "❄️",
    title: "Aire acondicionado",
    value: "aire-acondicionado",
    description:
      "Instalación y mantenimiento de minisplits y sistemas comerciales.",
  },
  {
    icon: "🧹",
    title: "Limpieza",
    value: "limpieza",
    description: "Limpieza residencial, de oficinas y negocios.",
  },
  {
    icon: "🔒",
    title: "Seguridad",
    value: "seguridad",
    description: "Cámaras, alarmas, cerraduras y control de acceso.",
  },
  {
    icon: "🛠️",
    title: "Mantenimiento general",
    value: "mantenimiento",
    description:
      "Reparaciones y mantenimiento preventivo para propiedades.",
  },
];

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Hero */}
<header className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-20 text-white">

  <div className="mx-auto max-w-6xl">

    <h1 className="text-center text-5xl font-extrabold leading-tight md:text-6xl">
      Encuentra profesionales confiables
      <br />
      para tu hogar o negocio
    </h1>

    <p className="mx-auto mt-6 max-w-3xl text-center text-xl text-blue-100">
      Electricistas, plomeros, carpinteros, técnicos de aire acondicionado,
      limpieza y muchos más en Monterrey y su área metropolitana.
    </p>

    <div className="mx-auto mt-10 max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">

      <div className="grid gap-4 md:grid-cols-3">

        <select
  value={service}
  onChange={(e) => setService(e.target.value)}
  className="rounded-xl border p-4 text-gray-800 outline-none focus:border-blue-600"
>
  <option value="">¿Qué servicio necesitas?</option>

  <option value="electricidad">
    ⚡ Electricidad
  </option>

  <option value="plomeria">
    🚿 Plomería
  </option>

  <option value="aire-acondicionado">
    ❄️ Aire acondicionado
  </option>

  <option value="limpieza">
    🧹 Limpieza
  </option>

  <option value="pintura">
    🎨 Pintura
  </option>

  <option value="carpinteria">
    🪚 Carpintería
  </option>

  <option value="seguridad">
    🔒 Seguridad
  </option>

  <option value="jardineria">
    🌿 Jardinería
  </option>

  <option value="remodelacion">
    🏠 Remodelación
  </option>

  <option value="mantenimiento">
    🛠️ Mantenimiento general
  </option>
</select>

        <select
  value={municipality}
  onChange={(e) => setMunicipality(e.target.value)}
  className="rounded-xl border p-4 text-gray-800 outline-none focus:border-blue-600"
>
  <option value="">Selecciona un municipio</option>
  <option>Monterrey</option>
  <option>San Pedro</option>
  <option>Guadalupe</option>
  <option>Apodaca</option>
  <option>San Nicolás</option>
  <option>Escobedo</option>
  <option>Santa Catarina</option>
</select>

        <button
  onClick={() => {
    const params = new URLSearchParams();

    if (service) {
      params.set("service", service);
    }

    if (municipality) {
      params.set("municipality", municipality);
    }

    router.push(`/contractors?${params.toString()}`);
  }}
  className="rounded-xl bg-blue-700 px-8 py-4 text-lg font-bold text-white transition hover:bg-blue-800"
>
  🔍 Buscar
</button>

      </div>

    </div>

    <div className="mt-8 flex flex-wrap justify-center gap-4 text-lg">

      <span>⭐⭐⭐⭐⭐ Profesionales aprobados</span>

      <span>📷 Portafolios reales</span>

      <span>📝 Reseñas verificadas</span>

    </div>

  </div>

</header>

{/* Popular Services */}
<section className="mx-auto max-w-6xl px-6 py-14">

  <h2 className="text-center text-4xl font-bold">
    Servicios populares
  </h2>

  <p className="mt-3 text-center text-gray-600">
    Selecciona un servicio para ver profesionales disponibles.
  </p>

  <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">

    <a
      href="/contractors?service=electricidad"
      className="rounded-2xl bg-white p-6 text-center shadow transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="text-5xl">⚡</div>
      <h3 className="mt-4 font-bold">Electricidad</h3>
    </a>

    <a
      href="/contractors?service=plomeria"
      className="rounded-2xl bg-white p-6 text-center shadow transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="text-5xl">🚿</div>
      <h3 className="mt-4 font-bold">Plomería</h3>
    </a>

    <a
      href="/contractors?service=aire-acondicionado"
      className="rounded-2xl bg-white p-6 text-center shadow transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="text-5xl">❄️</div>
      <h3 className="mt-4 font-bold">Aire acondicionado</h3>
    </a>

    <a
      href="/contractors?service=carpinteria"
      className="rounded-2xl bg-white p-6 text-center shadow transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="text-5xl">🪚</div>
      <h3 className="mt-4 font-bold">Carpintería</h3>
    </a>

    <a
      href="/contractors?service=limpieza"
      className="rounded-2xl bg-white p-6 text-center shadow transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="text-5xl">🧹</div>
      <h3 className="mt-4 font-bold">Limpieza</h3>
    </a>

  </div>

</section>

<FeaturedContractors />

<div className="mt-16">
  <PlatformStats />
</div>

{/* Services */}
<section className="p-8 max-w-6xl mx-auto">

        <h2 className="text-3xl font-bold mb-8 text-center">
          Servicios Profesionales
        </h2>


        <div className="grid md:grid-cols-3 gap-6">

          {services.map((service) => (
  <button
    key={service.value}
    type="button"
    onClick={() =>
      router.push(`/contractors?service=${service.value}`)
    }
    className="w-full cursor-pointer rounded-xl bg-white p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
  >
    <div className="text-3xl">{service.icon}</div>

    <h3 className="mt-3 text-lg font-bold">
      {service.title}
    </h3>

    <p className="mt-2 text-gray-600">
      {service.description}
    </p>

    <p className="mt-4 font-semibold text-blue-700">
      Ver profesionales →
    </p>
  </button>
))}

        </div>

      </section>


      {/* How It Works */}
<section className="bg-white py-20">

  <div className="mx-auto max-w-6xl px-6">

    <h2 className="text-center text-4xl font-bold">
      ¿Cómo funciona?
    </h2>

    <p className="mt-4 text-center text-lg text-gray-600">
      Encontrar un profesional confiable nunca había sido tan fácil.
    </p>

    <div className="mt-16 grid gap-10 md:grid-cols-3">

      <div className="rounded-2xl border bg-gray-50 p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

        <div className="text-6xl">🔍</div>

        <h3 className="mt-6 text-2xl font-bold">
          1. Busca
        </h3>

        <p className="mt-4 text-gray-600">
          Encuentra profesionales por servicio y municipio.
        </p>

      </div>

      <div className="rounded-2xl border bg-gray-50 p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

        <div className="text-6xl">📝</div>

        <h3 className="mt-6 text-2xl font-bold">
          2. Solicita un servicio
        </h3>

        <p className="mt-4 text-gray-600">
          Describe tu proyecto y envía una solicitud rápidamente.
        </p>

      </div>

      <div className="rounded-2xl border bg-gray-50 p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

        <div className="text-6xl">🤝</div>

        <h3 className="mt-6 text-2xl font-bold">
          3. Contrata
        </h3>

        <p className="mt-4 text-gray-600">
          Revisa perfiles, portafolios y reseñas antes de tomar una decisión.
        </p>

      </div>

    </div>

  </div>

</section>


      {/* Footer CTA */}
      <footer className="bg-blue-700 text-white py-16 px-6 text-center">

  <h2 className="text-4xl font-extrabold">
    ¿Necesitas un servicio para tu hogar o negocio?
  </h2>

  <p className="mt-4 text-xl text-blue-100">
    Solicita una cotización con profesionales de Monterrey.
  </p>

  <button
    onClick={() => router.push("/quote")}
    className="mt-8 rounded-xl bg-white px-10 py-5 text-xl font-bold text-blue-700 shadow-lg transition hover:scale-105 hover:bg-gray-100"
  >
    📝 Solicitar una cotización gratis
  </button>

  <p className="mt-6 text-lg text-blue-100">
    ✅ Sin costo • ✅ Sin compromiso • ✅ Profesionales verificados
  </p>

</footer>

    </main>
  );
}