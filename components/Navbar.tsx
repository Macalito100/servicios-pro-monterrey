import Link from "next/link";


export default function Navbar() {

  return (

    <nav className="bg-white shadow p-5 flex justify-between items-center">

      <Link
        href="/"
        className="text-xl font-bold text-blue-700"
      >
        Contratistas Monterrey Mexico
      </Link>


      <div className="flex gap-6">

        <Link href="/">
          Pagina principal
        </Link>


        <Link href="/services">
          Servicios
        </Link>


        <Link href="/contractors">
          Contratistas
        </Link>
        
<Link href="/register">
  Registrar negocio
</Link>

        <Link
          href="/quote"
          className="bg-blue-700 text-white px-4 py-2 rounded"
        >
          Cotizar
        </Link>

      </div>

    </nav>

  );
}