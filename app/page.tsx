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
<header className="bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-12 text-white sm:px-6 sm:py-16 md:py-20">
  <div className="mx-auto max-w-6xl">
    <h1 className="text-center text-3xl font-extrabold leading-tight sm:text-4xl md:text-6xl">
      Encuentra profesionales confiables
      <br className="hidden sm:block" />
      para tu hogar o negocio
    </h1>

    <p className="mx-auto mt-4 max-w-3xl text-center text-base leading-relaxed text-blue-100 sm:mt-6 sm:text-lg md:text-xl">
      Electricistas, plomeros, carpinteros, técnicos de aire
      acondicionado, limpieza y muchos más en Monterrey y su área
      metropolitana.
    </p>

    <div className="mx-auto mt-8 max-w-4xl rounded-2xl bg-white p-4 shadow-2xl sm:mt-10 sm:p-6">
      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        <select
          value={service}
          onChange={(event) =>
            setService(event.target.value)
          }
          className="w-full min-w-0 rounded-xl border p-4 text-base text-gray-800 outline-none focus:border-blue-600"
        >
          <option value="">
            ¿Qué servicio necesitas?
          </option>
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
          onChange={(event) =>
            setMunicipality(event.target.value)
          }
          className="w-full min-w-0 rounded-xl border p-4 text-base text-gray-800 outline-none focus:border-blue-600"
        >
          <option value="">
            Selecciona un municipio
          </option>
          <option>Monterrey</option>
          <option>San Pedro</option>
          <option>Guadalupe</option>
          <option>Apodaca</option>
          <option>San Nicolás</option>
          <option>Escobedo</option>
          <option>Santa Catarina</option>
        </select>

        <button
          type="button"
          onClick={() => {
            const params = new URLSearchParams();

            if (service) {
              params.set("service", service);
            }

            if (municipality) {
              params.set("municipality", municipality);
            }

            router.push(
              `/contractors?${params.toString()}`
            );
          }}
          className="min-h-12 w-full rounded-xl bg-blue-700 px-6 py-4 text-lg font-bold text-white transition hover:bg-blue-800"
        >
          🔍 Buscar
        </button>
      </div>
    </div>

    <div className="mt-6 flex flex-col items-center gap-2 text-center text-sm sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 sm:text-base md:text-lg">
      <span>⭐⭐⭐⭐⭐ Profesionales aprobados</span>
      <span>📷 Portafolios reales</span>
      <span>📝 Reseñas verificadas</span>
    </div>
  </div>
</header>

{/* Popular Services */}
<section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">

  <h2 className="text-center text-3xl font-bold sm:text-4xl">
    Servicios populares
  </h2>

  <p className="mt-3 text-center text-gray-600">
    Selecciona un servicio para ver profesionales disponibles.
  </p>

  <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-6 lg:grid-cols-5">

    <a
      href="/contractors?service=electricidad"
      className="min-w-0 rounded-2xl bg-white p-4 text-center shadow transition hover:-translate-y-1 hover:shadow-xl sm:p-6"
    >
      <div className="text-4xl sm:text-5xl">⚡</div>
      <h3 className="mt-4 font-bold">Electricidad</h3>
    </a>

    <a
      href="/contractors?service=plomeria"
      className="min-w-0 rounded-2xl bg-white p-4 text-center shadow transition hover:-translate-y-1 hover:shadow-xl sm:p-6"
    >
      <div className="text-4xl sm:text-5xl">🚿</div>
      <h3 className="mt-4 font-bold">Plomería</h3>
    </a>

    <a
      href="/contractors?service=aire-acondicionado"
      className="min-w-0 rounded-2xl bg-white p-4 text-center shadow transition hover:-translate-y-1 hover:shadow-xl sm:p-6"
    >
      <div className="text-4xl sm:text-5xl">❄️</div>
      <h3 className="mt-4 font-bold">Aire acondicionado</h3>
    </a>

    <a
      href="/contractors?service=carpinteria"
      className="min-w-0 rounded-2xl bg-white p-4 text-center shadow transition hover:-translate-y-1 hover:shadow-xl sm:p-6"
    >
      <div className="text-4xl sm:text-5xl">🪚</div>
      <h3 className="mt-4 font-bold">Carpintería</h3>
    </a>

    <a
      href="/contractors?service=limpieza"
      className="min-w-0 rounded-2xl bg-white p-4 text-center shadow transition hover:-translate-y-1 hover:shadow-xl sm:p-6"
    >
      <div className="text-4xl sm:text-5xl">🧹</div>
      <h3 className="mt-4 font-bold">Limpieza</h3>
    </a>

  </div>

</section>

<FeaturedContractors />

<div className="mt-16">
  <PlatformStats />
</div>

{/* Services */}
<section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">

        <h2 className="mb-6 text-center text-3xl font-bold sm:mb-8">
          Servicios Profesionales
        </h2>


        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">

          {services.map((service) => (
  <button
    key={service.value}
    type="button"
    onClick={() =>
      router.push(`/contractors?service=${service.value}`)
    }
    className="w-full cursor-pointer rounded-xl bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-6"
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
<section className="bg-white py-12 sm:py-16 md:py-20">

  <div className="mx-auto max-w-6xl px-4 sm:px-6">

    <h2 className="text-center text-3xl font-bold sm:text-4xl">
      ¿Cómo funciona?
    </h2>

    <p className="mt-3 text-center text-base text-gray-600 sm:mt-4 sm:text-lg">
      Encontrar un profesional confiable nunca había sido tan fácil.
    </p>

    <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-6 md:grid-cols-3 md:mt-16">

      <div className="rounded-2xl border bg-gray-50 p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-8">

        <div className="text-5xl sm:text-6xl">🔍</div>

        <h3 className="mt-4 text-xl font-bold sm:mt-6 sm:text-2xl">
          1. Busca
        </h3>

        <p className="mt-4 text-gray-600">
          Encuentra profesionales por servicio y municipio.
        </p>

      </div>

      <div className="rounded-2xl border bg-gray-50 p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-8">

        <div className="text-5xl sm:text-6xl">📝</div>

        <h3 className="mt-4 text-xl font-bold sm:mt-6 sm:text-2xl">
          2. Solicita un servicio
        </h3>

        <p className="mt-4 text-gray-600">
          Describe tu proyecto y envía una solicitud rápidamente.
        </p>

      </div>

      <div className="rounded-2xl border bg-gray-50 p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-8">

        <div className="text-5xl sm:text-6xl">🤝</div>

        <h3 className="mt-4 text-xl font-bold sm:mt-6 sm:text-2xl">
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
    <footer className="bg-blue-700 px-4 py-12 text-center text-white sm:px-6 sm:py-16">

  <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
    ¿Necesitas un servicio para tu hogar o negocio?
  </h2>

  <p className="mt-4 text-base text-blue-100 sm:text-xl">
    Solicita una cotización con profesionales de Monterrey.
  </p>

  <button
    onClick={() => router.push("/quote")}
    className="mt-7 w-full max-w-sm rounded-xl bg-white px-4 py-4 text-lg font-bold text-blue-700 shadow-lg transition hover:scale-105 hover:bg-gray-100 sm:mt-8 sm:w-auto sm:px-10 sm:py-5 sm:text-xl"
  >
    📝 Solicitar una cotización gratis
  </button>

  <p className="mt-6 text-sm leading-relaxed text-blue-100 sm:text-lg">
    ✅ Sin costo • ✅ Sin compromiso • ✅ Profesionales verificados
  </p>

</footer>

    </main>
  );
}