import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso de Privacidad | Servicios Pro México",
  description:
    "Aviso de privacidad de la plataforma Servicios Pro México.",
};

const responsibleName =
  "Mario Jokzan Camarena Vazquez";

const responsibleEmail =
  "privacidad.servipromonterrey@gmail.com";

const responsibleAddress =
  "Calle Juan Escutia, número 2080, colonia San Fernando, municipio Ahome, Sinaloa, C.P. 81270, México";

const isDraft = responsibleAddress.startsWith(
  "REEMPLAZA_AQUI"
);

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 sm:px-6">
      <article className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow sm:p-10">
        {isDraft && (
          <div className="mb-8 rounded-xl border border-red-300 bg-red-50 p-4 font-semibold text-red-700">
            BORRADOR: reemplaza el domicilio antes de
            publicar esta página.
          </div>
        )}

        <p className="font-semibold text-blue-700">
          Servicios Pro México
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
          Aviso de Privacidad Integral
        </h1>

        <p className="mt-4 text-gray-600">
          Última actualización: 3 de agosto de 2026
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            1. Identidad y domicilio del responsable
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            <strong>{responsibleName}</strong>, responsable
            de la plataforma digital Servicios Pro México,
            con domicilio en{" "}
            <strong>{responsibleAddress}</strong>, es
            responsable del tratamiento y protección de sus
            datos personales.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            Para cualquier asunto relacionado con privacidad
            y protección de datos personales, puede escribir
            a{" "}
            <a
              href={`mailto:${responsibleEmail}`}
              className="font-semibold text-blue-700 hover:underline"
            >
              {responsibleEmail}
            </a>
            .
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            2. Datos personales que recopilamos
          </h2>

          <p className="mt-4 text-gray-700">
            Dependiendo de la forma en que utilice la
            plataforma, podemos recopilar:
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
            <li>Nombre completo.</li>
            <li>Correo electrónico y número telefónico.</li>
            <li>
              Información necesaria para crear y administrar
              una cuenta.
            </li>
            <li>
              Información del inmueble, municipio, dirección
              del servicio y tipo de propiedad.
            </li>
            <li>
              Descripción de solicitudes, cotizaciones,
              visitas o trabajos requeridos.
            </li>
            <li>
              Fotografías, archivos y mensajes enviados
              mediante la plataforma.
            </li>
            <li>
              Favoritos, reseñas, calificaciones y actividad
              dentro de la plataforma.
            </li>
            <li>
              En el caso de profesionales y negocios:
              información comercial, servicios, municipios,
              logotipo, portafolio y capacidad para emitir
              factura.
            </li>
            <li>
              Datos técnicos como dirección IP, navegador,
              dispositivo, fecha de acceso y registros de
              seguridad.
            </li>
          </ul>

          <p className="mt-4 leading-relaxed text-gray-700">
            Las contraseñas son administradas mediante el
            proveedor de autenticación de la plataforma. Servi
            Pro Monterrey no puede visualizar las contraseñas
            en texto completo.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            3. Finalidades del tratamiento
          </h2>

          <p className="mt-4 text-gray-700">
            Utilizamos los datos personales para las
            siguientes finalidades necesarias:
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
            <li>Crear y administrar cuentas de usuario.</li>
            <li>
              Registrar, revisar y publicar perfiles de
              profesionales y negocios.
            </li>
            <li>
              Conectar clientes con profesionales y negocios.
            </li>
            <li>
              Procesar solicitudes de cotización, visitas y
              servicios.
            </li>
            <li>
              Habilitar conversaciones y notificaciones.
            </li>
            <li>
              Administrar favoritos, reseñas y calificaciones.
            </li>
            <li>
              Administrar planes y suscripciones de negocios.
            </li>
            <li>
              Proteger la plataforma, prevenir abusos y
              atender incidentes de seguridad.
            </li>
            <li>
              Cumplir obligaciones legales y responder a
              solicitudes de autoridades competentes.
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            4. Pagos y datos financieros
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Los pagos de suscripciones son procesados por
            Stripe. Servicios Pro México no almacena los
            números completos de tarjetas bancarias ni sus
            códigos de seguridad. Stripe tratará la
            información de pago conforme a sus propios
            términos y políticas de privacidad.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            5. Proveedores de servicios
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Para operar la plataforma podemos utilizar
            proveedores tecnológicos que prestan servicios de
            alojamiento, base de datos, autenticación,
            procesamiento de pagos, correo electrónico,
            seguridad y análisis. Entre estos proveedores se
            pueden encontrar Supabase, Vercel y Stripe.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            Algunos proveedores pueden procesar información
            fuera de México y deberán tratarla únicamente
            para prestar los servicios contratados y conforme
            a las medidas de seguridad aplicables.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            6. Derechos ARCO
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Usted puede solicitar el acceso, rectificación,
            cancelación u oposición al tratamiento de sus
            datos personales, así como revocar su
            consentimiento cuando corresponda.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            Envíe su solicitud a{" "}
            <a
              href={`mailto:${responsibleEmail}`}
              className="font-semibold text-blue-700 hover:underline"
            >
              {responsibleEmail}
            </a>
            , indicando su nombre, el derecho que desea
            ejercer, una descripción clara de su solicitud y
            la información necesaria para identificar su
            cuenta.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            7. Limitación del uso de los datos
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Puede solicitar que se limite el uso o divulgación
            de sus datos personales enviando un correo a{" "}
            <a
              href={`mailto:${responsibleEmail}`}
              className="font-semibold text-blue-700 hover:underline"
            >
              {responsibleEmail}
            </a>
            .
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            8. Cookies y tecnologías similares
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            La plataforma puede utilizar cookies o tecnologías
            similares necesarias para mantener sesiones,
            recordar preferencias, proteger cuentas y
            conocer el funcionamiento general del sitio.
            Puede controlar algunas de estas tecnologías
            mediante la configuración de su navegador.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            9. Conservación y seguridad
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Los datos serán conservados durante el tiempo
            necesario para prestar los servicios, cumplir las
            finalidades descritas y atender obligaciones
            legales. Aplicamos medidas administrativas,
            técnicas y organizativas razonables para proteger
            la información.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            10. Menores de edad
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            La plataforma no está dirigida a menores de edad.
            Si detectamos que se proporcionaron datos de un
            menor sin autorización, podremos eliminarlos.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            11. Cambios al aviso de privacidad
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Las modificaciones a este aviso serán publicadas
            en esta misma página. La fecha de actualización
            aparecerá al inicio del documento.
          </p>
        </section>

        <div className="mt-12 border-t pt-6">
          <a
            href="/"
            className="font-semibold text-blue-700 hover:underline"
          >
            ← Volver a la página principal
          </a>
        </div>
      </article>
    </main>
  );
}