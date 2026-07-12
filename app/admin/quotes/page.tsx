"use client";

import { useEffect, useState } from "react";

type QuoteRequest = {
  id: number;
  name: string;
  phone: string;
  email: string;
  propertyType: string;
  service: string;
  description: string;
  contractorId: string | null;
  contractorName: string | null;
  createdAt: string;
};

export default function QuotesAdminPage() {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);

  useEffect(() => {
    const savedRequests = JSON.parse(
      localStorage.getItem("quoteRequests") || "[]"
    );

    setRequests(savedRequests);
  }, []);
function deleteRequest(id: number) {
  const updatedRequests = requests.filter(
    (request) => request.id !== id
  );

  setRequests(updatedRequests);

  localStorage.setItem(
    "quoteRequests",
    JSON.stringify(updatedRequests)
  );
}
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold text-blue-700">
          Solicitudes de cotización
        </h1>

        <p className="mt-2 text-gray-600">
          Solicitudes guardadas en este navegador.
        </p>

        {requests.length === 0 ? (
          <div className="mt-8 rounded-xl bg-white p-6 shadow">
            No hay solicitudes guardadas.
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-xl bg-white p-6 shadow"
              >
                <h2 className="text-2xl font-bold">
                  {request.name}
                </h2>

                <p className="mt-3">
                  <strong>Teléfono:</strong> {request.phone}
                </p>

                <p>
                  <strong>Correo:</strong> {request.email}
                </p>

                <p>
                  <strong>Propiedad:</strong> {request.propertyType}
                </p>

                <p>
                  <strong>Servicio:</strong> {request.service}
                </p>

                {request.contractorName && (
                  <p>
                    <strong>Profesional:</strong> {request.contractorName}
                  </p>
                )}

                <p className="mt-3 text-gray-700">
                  {request.description}
                </p>

                <p className="mt-3 text-sm text-gray-500">
                  {new Date(request.createdAt).toLocaleString("es-MX")}
                </p>
                <button
  onClick={() => deleteRequest(request.id)}
  className="mt-5 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
>
  Eliminar solicitud
</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}