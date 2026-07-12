export default function Home() {
  const services = [
  {
    icon: "⚡",
    title: "Electricistas",
    description: "Instalaciones y reparaciones para hogares, oficinas y comercios.",
  },
  {
    icon: "🚿",
    title: "Plomería",
    description: "Fugas, tuberías, baños y sistemas de agua.",
  },
  {
    icon: "❄️",
    title: "Aire acondicionado",
    description: "Instalación y mantenimiento de minisplits y sistemas comerciales.",
  },
  {
    icon: "🧹",
    title: "Limpieza",
    description: "Limpieza residencial, de oficinas y negocios.",
  },
  {
    icon: "🔒",
    title: "Seguridad",
    description: "Cámaras, alarmas, cerraduras y control de acceso.",
  },
  {
    icon: "🛠️",
    title: "Mantenimiento general",
    description: "Reparaciones y mantenimiento preventivo para propiedades.",
  },
];

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Navigation */}
      <nav className="bg-white shadow p-5 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">
          Servicios Pro Monterrey
          
        </h1>

        <button className="bg-blue-700 text-white px-5 py-2 rounded">
          Cotizar
        </button>
      </nav>


      {/* Hero */}
     <header className="bg-blue-700 text-white p-10 text-center">

  <h2 className="text-5xl font-bold">
    Servicios confiables para hogares y negocios en Monterrey
  </h2>

  <p className="mt-4 text-xl">
    Encuentra profesionales para mantenimiento, reparación e instalación en casas, oficinas y comercios.
  </p>

  <a
    href="/contractors"
    className="inline-block mt-6 bg-white text-blue-700 px-8 py-3 rounded font-bold"
  >
    Buscar un profesional
  </a>

</header>


      {/* Services */}
      <section className="p-8 max-w-6xl mx-auto">

        <h2 className="text-3xl font-bold mb-8 text-center">
          Servicios Profesionales
        </h2>


        <div className="grid md:grid-cols-3 gap-6">

          {services.map((service) => (
            <div
              key={service.title}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >

              <div className="text-4xl">
                {service.icon}
              </div>

              <h3 className="text-xl font-bold mt-3">
                {service.title}
              </h3>

              <p className="text-gray-600 mt-2">
                {service.description}
              </p>

            </div>
          ))}

        </div>

      </section>


      {/* Why Choose Us */}
      <section className="bg-white p-10">

        <h2 className="text-3xl font-bold text-center">
          ¿Por qué elegir Servicios Pro Monterrey?
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mt-8 text-center">

          <div>
            <h3 className="font-bold text-xl">
              Profesionales locales
            </h3>
            <p className="mt-2 text-gray-600">
              Encuentra proveedores que conocen Monterrey y su área metropolitana.
            </p>
          </div>


          <div>
            <h3 className="font-bold text-xl">
              Servicios para hogares y negocios
            </h3>
            <p className="mt-2 text-gray-600">
              Conecta con especialistas para casas, oficinas y comercios.
            </p>
          </div>


          <div>
            <h3 className="font-bold text-xl">
              Solicitudes sencillas
            </h3>
            <p className="mt-2 text-gray-600">
              Describe el servicio que necesitas y encuentra ayuda más rápido.
            </p>
          </div>

        </div>

      </section>


      {/* Footer CTA */}
      <footer className="bg-blue-700 text-white p-10 text-center">

        <h2 className="text-3xl font-bold">
          ¿Necesitas un servicio para tu hogar o negocio?
        </h2>
         <p className="mt-3 text-lg">
    Solicita una cotización con profesionales de Monterrey.
  </p>

        <button className="mt-5 bg-white text-blue-700 px-8 py-3 rounded font-bold">
          Solicitar cotizacion
        </button>

      </footer>

    </main>
  );
}