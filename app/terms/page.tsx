import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Servi Pro Monterrey",
  description:
    "Términos y condiciones de uso de Servi Pro Monterrey.",
};

const contactEmail =
  "contacto.servipromonterrey@gmail.com";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 sm:px-6">
      <article className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow sm:p-10">
        <p className="font-semibold text-blue-700">
          Servi Pro Monterrey
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
          Términos y Condiciones
        </h1>

        <p className="mt-4 text-gray-600">
          Última actualización: 3 de agosto de 2026
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            1. Aceptación de los términos
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Al crear una cuenta, registrar un negocio,
            utilizar la plataforma o contratar una
            suscripción, usted reconoce que leyó y aceptó
            estos Términos y Condiciones y el Aviso de
            Privacidad.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            Si no está de acuerdo, no debe utilizar la
            plataforma ni contratar una suscripción.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            2. Responsable de la plataforma
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Servi Pro Monterrey es administrado por Mario
            Jokzan Camarena Vazquez. El domicilio completo
            del responsable se encuentra disponible en el{" "}
            <Link
              href="/privacy"
              className="font-semibold text-blue-700 hover:underline"
            >
              Aviso de Privacidad
            </Link>
            .
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            Correo de contacto:{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="font-semibold text-blue-700 hover:underline"
            >
              {contactEmail}
            </a>
            .
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            3. Función de Servi Pro Monterrey
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Servi Pro Monterrey es una plataforma digital que
            ayuda a clientes a localizar y contactar
            profesionales y negocios independientes.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            Servi Pro Monterrey no es empleador, representante,
            socio ni contratista de los profesionales
            registrados. Los precios, alcances, garantías,
            fechas, materiales y condiciones de cada trabajo
            deben acordarse directamente entre el cliente y el
            profesional.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            4. Registro y seguridad de las cuentas
          </h2>

          <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
            <li>
              Los usuarios deben proporcionar información
              verdadera, actual y completa.
            </li>
            <li>
              Cada usuario es responsable de proteger su
              contraseña y acceso a la cuenta.
            </li>
            <li>
              No se permite suplantar personas o negocios.
            </li>
            <li>
              El usuario debe notificarnos si detecta acceso no
              autorizado a su cuenta.
            </li>
            <li>
              La plataforma no está dirigida a menores de edad.
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            5. Registro de profesionales y negocios
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Los profesionales son responsables de la exactitud
            de su perfil, servicios, experiencia, fotografías,
            disponibilidad, capacidad para emitir factura y
            demás información publicada.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            Servi Pro Monterrey puede revisar, aprobar, rechazar,
            suspender o solicitar correcciones a un perfil
            cuando detecte información incompleta, falsa,
            engañosa o contraria a estos términos.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            La aprobación de un perfil no constituye una
            garantía sobre la calidad, licencia, solvencia,
            identidad o resultado del trabajo del profesional.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            6. Solicitudes y contratación de servicios
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Las solicitudes enviadas mediante la plataforma no
            obligan al cliente ni al profesional a celebrar un
            contrato.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            Antes de contratar, ambas partes deben confirmar el
            precio, alcance, materiales, fechas, permisos,
            garantías, forma de pago y cualquier otra condición
            necesaria.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            Los pagos por trabajos realizados entre clientes y
            profesionales se acuerdan directamente entre ellos.
            Las suscripciones de la plataforma son operaciones
            diferentes a los pagos por trabajos contratados.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            7. Planes de suscripción
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            La plataforma ofrece un plan gratuito y planes
            mensuales para profesionales:
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
            <li>
              <strong>Gratis:</strong> hasta 5 trabajos aceptados
              por mes.
            </li>
            <li>
              <strong>Básico:</strong> $149 MXN al mes.
            </li>
            <li>
              <strong>Profesional:</strong> $299 MXN al mes.
            </li>
            <li>
              <strong>Premium:</strong> $499 MXN al mes.
            </li>
          </ul>

          <p className="mt-4 leading-relaxed text-gray-700">
            Las características vigentes de cada plan se
            muestran en la página de precios. Antes de pagar,
            Stripe mostrará el plan, periodicidad, moneda,
            importe y, cuando corresponda, impuestos o cargos
            aplicables.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            Si existe una diferencia, prevalecerá el precio
            total claramente mostrado y aceptado en la pantalla
            de pago antes de confirmar la operación.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            8. Renovación automática
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Los planes de pago se renuevan automáticamente cada
            mes utilizando el método de pago registrado, hasta
            que el titular solicite su cancelación.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            La contratación requiere la autorización expresa
            del titular. Antes de confirmar el pago se mostrará
            que se trata de un cobro recurrente, así como su
            periodicidad, monto y fecha aproximada de cobro.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            Servi Pro Monterrey notificará al titular por correo
            electrónico al menos cinco días naturales antes de
            una renovación automática, conforme a la
            legislación aplicable.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            9. Cancelación
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            El titular puede cancelar su suscripción sin
            penalización desde el botón para administrar su
            suscripción disponible en el panel del negocio.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            El mecanismo registra la cancelación de forma
            inmediata y evita la siguiente renovación. Salvo
            disposición legal diferente, el titular podrá
            conservar el acceso a las funciones pagadas hasta
            que finalice el periodo ya cubierto.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            Si no puede utilizar el portal, puede solicitar la
            cancelación escribiendo a{" "}
            <a
              href={`mailto:${contactEmail}?subject=Cancelación de suscripción`}
              className="font-semibold text-blue-700 hover:underline"
            >
              {contactEmail}
            </a>
            .
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            10. Reembolsos y aclaraciones
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Los periodos de suscripción que ya comenzaron
            generalmente no son reembolsables ni se calculan de
            manera proporcional, salvo cuando la legislación
            aplicable lo exija o exista un cobro duplicado,
            incorrecto o atribuible a un error de la plataforma.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            Las solicitudes de aclaración deben enviarse a{" "}
            <a
              href={`mailto:${contactEmail}?subject=Aclaración de pago`}
              className="font-semibold text-blue-700 hover:underline"
            >
              {contactEmail}
            </a>
            , indicando el correo de la cuenta, fecha del cobro
            y motivo de la solicitud. No envíe números completos
            de tarjeta ni códigos de seguridad.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            11. Reseñas y contenido
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Los usuarios únicamente deben publicar contenido
            verdadero, relacionado con su experiencia y que no
            vulnere derechos de terceros.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            Podemos moderar o retirar reseñas, fotografías,
            mensajes o perfiles que contengan información falsa,
            amenazas, discriminación, datos personales de
            terceros, contenido ilegal, publicidad no autorizada
            o material que infrinja derechos de propiedad
            intelectual.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            12. Conductas prohibidas
          </h2>

          <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
            <li>Utilizar identidades o documentos falsos.</li>
            <li>
              Publicar servicios ilegales, engañosos o
              fraudulentos.
            </li>
            <li>
              Acosar, amenazar o discriminar a otros usuarios.
            </li>
            <li>
              Intentar vulnerar la seguridad o funcionamiento
              de la plataforma.
            </li>
            <li>
              Copiar, extraer o comercializar datos de la
              plataforma sin autorización.
            </li>
            <li>
              Manipular reseñas, calificaciones o estadísticas.
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            13. Suspensión o terminación de cuentas
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Podemos limitar, suspender o cerrar cuentas que
            incumplan estos términos, afecten a otros usuarios,
            representen un riesgo de fraude o seguridad, o
            utilicen la plataforma para actividades ilegales.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            Cuando resulte razonablemente posible, se informará
            al titular sobre la medida y el medio disponible
            para solicitar una aclaración.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            14. Disponibilidad y responsabilidad
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Procuramos mantener la plataforma disponible y
            segura, pero no podemos garantizar que opere sin
            interrupciones, errores o mantenimiento.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            Servi Pro Monterrey no garantiza que un cliente
            reciba propuestas ni que un profesional sea
            contratado. Tampoco controla la ejecución,
            seguridad, calidad o resultado de los trabajos
            acordados directamente entre usuarios.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            Ninguna disposición de estos términos limita los
            derechos que la legislación mexicana reconoce de
            manera obligatoria a consumidores y usuarios.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            15. Privacidad
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            El tratamiento de datos personales se encuentra
            explicado en nuestro{" "}
            <Link
              href="/privacy"
              className="font-semibold text-blue-700 hover:underline"
            >
              Aviso de Privacidad Integral
            </Link>
            .
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            16. Modificaciones
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Podemos actualizar estos términos cuando cambien
            las funciones, planes o disposiciones legales. La
            versión vigente y su fecha de actualización se
            publicarán en esta página.
          </p>

          <p className="mt-3 leading-relaxed text-gray-700">
            Cuando un cambio afecte de manera importante una
            suscripción activa, procuraremos informar al titular
            mediante la plataforma o el correo registrado.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            17. Legislación aplicable
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Estos términos se interpretarán conforme a la
            legislación aplicable en México. Los consumidores
            conservarán el derecho de acudir ante la
            Procuraduría Federal del Consumidor u otras
            autoridades competentes cuando corresponda.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            18. Contacto
          </h2>

          <p className="mt-4 leading-relaxed text-gray-700">
            Para preguntas, cancelaciones o aclaraciones
            relacionadas con estos términos, escriba a{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="font-semibold text-blue-700 hover:underline"
            >
              {contactEmail}
            </a>
            .
          </p>
        </section>

        <div className="mt-12 flex flex-wrap gap-4 border-t pt-6">
          <Link
            href="/"
            className="font-semibold text-blue-700 hover:underline"
          >
            ← Página principal
          </Link>

          <Link
            href="/privacy"
            className="font-semibold text-blue-700 hover:underline"
          >
            Aviso de Privacidad
          </Link>

          <Link
            href="/contact"
            className="font-semibold text-blue-700 hover:underline"
          >
            Contacto
          </Link>
        </div>
      </article>
    </main>
  );
}