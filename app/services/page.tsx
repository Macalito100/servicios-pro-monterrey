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
    <main className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-4xl font-bold text-blue-700 mb-3">
        Servicios para Hogares y Negocios
      </h1>

      <p className="text-gray-600 mb-8">
        Encuentra profesionales confiables en Monterrey y su área metropolitana.
      </p>

      <div className="grid md:grid-cols-3 gap-6">

        {services.map((service) => (
          <div
            key={service}
            className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition"
          >

            <h2 className="text-xl font-bold">
              {service}
            </h2>

            <p className="mt-2 text-gray-600">
              Profesionales disponibles para hogares y negocios en Monterrey.
            </p>

            <a
              href="/contractors"
              className="inline-block mt-4 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
            >
              Ver profesionales
            </a>

          </div>
        ))}

      </div>

    </main>
  );
}