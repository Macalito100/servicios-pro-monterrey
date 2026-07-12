type Props = {
  params: Promise<{
    id: string;
  }>;
};
import { contractors } from "@/data/contractors";

export default async function ContractorProfile({ params }: Props) {

  const { id } = await params;

  const contractor = contractors.find((c) => c.id === id);

if (!contractor) {
  return <h1 className="p-8">Profesional no encontrado.</h1>;
}


  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">

        <h1 className="text-4xl font-bold text-blue-700 capitalize">
          {contractor.name}
        </h1>


        <p className="mt-4 text-yellow-500 text-xl">
          {"★".repeat(contractor.rating)}
        </p>


        <h2 className="text-2xl font-bold mt-8">
  Servicio
</h2>

<p className="mt-3 text-gray-700">
  🔧 {contractor.service}
</p>

<p className="mt-3 text-gray-700">
  {contractor.description}
</p>


        <h2 className="text-2xl font-bold mt-8">
  Ubicación
</h2>

<p className="text-gray-700 mt-2">
  📍 {contractor.location}
</p>

<p className="text-gray-700 mt-2">
  🏠🏢 {contractor.customerType}
</p>


       <a
  href={`/quote?contractor=${contractor.id}`}
  className="inline-block mt-8 bg-blue-700 text-white px-8 py-3 rounded hover:bg-blue-800 transition"
>
  Solicitar cotización
</a>

      </div>

    </main>
  );
}