export default function Services() {
  const services = [
    "Electricistas",
    "Plomería",
    "Aire acondicionado",
    "Limpieza",
    "Pintura",
    "Carpintería",
    "Seguridad (Cámaras y Alarmas)",
    "Jardinería",
    "Remodelaciones",
    "Soldadura",
    "Cerrajería",
    "Mantenimiento General",
  ];

  return (
  <main className="min-h-screen bg-gray-100 px-4 py-6 sm:p-8">
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold leading-tight text-blue-700 sm:text-4xl">
        Servicios para Hogares y Negocios
      </h1>

      <p className="mb-6 mt-3 text-sm leading-relaxed text-gray-600 sm:mb-8 sm:text-base">
        Encuentra profesionales confiables en Monterrey y su área
        metropolitana.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service}
            className="flex h-full flex-col rounded-xl bg-white p-5 shadow transition hover:shadow-xl sm:p-6"
          >
            <h2 className="text-lg font-bold sm:text-xl">
              {service}
            </h2>

            <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600 sm:text-base">
              Profesionales disponibles para hogares y negocios en
              Monterrey.
            </p>

            <a
              href="/contractors"
              className="mt-4 block min-h-12 w-full rounded bg-blue-700 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-800"
            >
              Ver profesionales
            </a>
          </div>
        ))}
      </div>
    </div>
  </main>
);
}