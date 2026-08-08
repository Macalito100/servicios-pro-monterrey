import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contacto | Servicios Pro México",
  description:
    "Contacta al equipo de Servicios Pro México para recibir ayuda.",
};

const contactEmail =
  "contacto.servipromonterrey@gmail.com";

const privacyEmail =
  "privacidad.servipromonterrey@gmail.com";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-2xl bg-gradient-to-r from-blue-700 to-blue-500 p-6 text-center text-white shadow-lg sm:p-10">
          <p className="font-semibold text-blue-100">
            Servicios Pro México
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-5xl">
            ¿Cómo podemos ayudarte?
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-blue-100 sm:text-lg">
            Contáctanos si necesitas ayuda con tu cuenta,
            solicitudes, perfil profesional o suscripción.
          </p>
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl bg-white p-6 shadow">
            <div className="text-4xl">👤</div>

            <h2 className="mt-4 text-2xl font-bold">
              Ayuda para clientes
            </h2>

            <p className="mt-3 leading-relaxed text-gray-600">
              Escríbenos si necesitas ayuda con una solicitud,
              una conversación, tus favoritos, una reseña o tu
              cuenta de cliente.
            </p>

            <a
              href={`mailto:${contactEmail}?subject=Ayuda para cliente`}
              className="mt-6 block rounded-xl bg-blue-700 px-5 py-3 text-center font-bold text-white hover:bg-blue-800"
            >
              Enviar correo
            </a>
          </article>

          <article className="rounded-2xl bg-white p-6 shadow">
            <div className="text-4xl">🏢</div>

            <h2 className="mt-4 text-2xl font-bold">
              Ayuda para profesionales
            </h2>

            <p className="mt-3 leading-relaxed text-gray-600">
              Escríbenos si necesitas ayuda con el registro de
              tu negocio, aprobación, perfil, solicitudes,
              portafolio o suscripción.
            </p>

            <a
              href={`mailto:${contactEmail}?subject=Ayuda para profesional`}
              className="mt-6 block rounded-xl bg-green-600 px-5 py-3 text-center font-bold text-white hover:bg-green-700"
            >
              Enviar correo
            </a>
          </article>
        </div>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow sm:p-8">
          <h2 className="text-2xl font-bold">
            Contacto general
          </h2>

          <p className="mt-3 text-gray-600">
            Correo electrónico:
          </p>

          <a
            href={`mailto:${contactEmail}`}
            className="mt-1 inline-block break-all font-bold text-blue-700 hover:underline"
          >
            {contactEmail}
          </a>

          <p className="mt-4 text-gray-600">
            Intentaremos responder lo antes posible. Incluye
            una descripción clara del problema y el correo
            asociado con tu cuenta.
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-purple-200 bg-purple-50 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-purple-900">
            Privacidad y datos personales
          </h2>

          <p className="mt-3 text-purple-800">
            Para ejercer derechos ARCO o realizar consultas
            relacionadas con privacidad, utiliza únicamente:
          </p>

          <a
            href={`mailto:${privacyEmail}?subject=Solicitud de privacidad`}
            className="mt-3 inline-block break-all font-bold text-purple-700 hover:underline"
          >
            {privacyEmail}
          </a>

          <div className="mt-5">
            <Link
              href="/privacy"
              className="font-semibold text-purple-700 hover:underline"
            >
              Consultar el Aviso de Privacidad →
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-xl font-bold text-red-800">
            Protege tu información
          </h2>

          <p className="mt-3 leading-relaxed text-red-700">
            Nunca envíes contraseñas, códigos de verificación,
            números completos de tarjeta, claves bancarias,
            documentos de identidad o claves secretas de
            Stripe por correo electrónico.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-xl border border-blue-700 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
          >
            Página principal
          </Link>

          <Link
            href="/contractors"
            className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Ver profesionales
          </Link>
        </div>
      </div>
    </main>
  );
}