import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-900 px-4 py-8 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div>
          <p className="font-bold">
            Servi Pro Monterrey
          </p>

          <p className="mt-1 text-sm text-gray-400">
            © 2026 Todos los derechos reservados.
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-5 text-sm">
          <Link
            href="/privacy"
            className="text-gray-300 hover:text-white hover:underline"
          >
            Aviso de Privacidad
          </Link>
          <Link
  href="/terms"
  className="text-gray-300 hover:text-white hover:underline"
>
  Términos y Condiciones
</Link>

          <Link
            href="/contact"
            className="text-gray-300 hover:text-white hover:underline"
          >
            Contacto
          </Link>
        </nav>
      </div>
    </footer>
  );
}