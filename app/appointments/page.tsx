"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Business = {
  id: number;
  business_name: string;
  service: string;
  municipality: string[];
  logo_url: string | null;
};

function AppointmentContent() {
  const searchParams = useSearchParams();
  const businessId = searchParams.get("business");

  const [business, setBusiness] =
    useState<Business | null>(null);

  const [loadingBusiness, setLoadingBusiness] =
    useState(true);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [address, setAddress] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadBusiness() {
      if (!businessId) {
        setLoadingBusiness(false);
        return;
      }

      const { data, error } = await supabase
        .from("business_registrations")
        .select(
          "id, business_name, service, municipality, logo_url"
        )
        .eq("id", Number(businessId))
        .eq("status", "approved")
        .single();

      if (error || !data) {
        console.error(
          "No se pudo cargar el negocio:",
          error
        );

        setLoadingBusiness(false);
        return;
      }

      setBusiness(data);
      setLoadingBusiness(false);
    }

    loadBusiness();
  }, [businessId]);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!business) {
      alert("No se encontró el negocio.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("business_appointments")
      .insert({
        business_id: business.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        property_type: propertyType || null,
        service: business.service,
        address,
        municipality,
        notes: notes.trim() || null,
        status: "pending",
      });

    setSubmitting(false);

    if (error) {
      console.error(
        "No se pudo solicitar la cita:",
        error
      );

      if (error.code === "23505") {
        alert(
          "Ese horario ya no está disponible. Selecciona otro."
        );
        return;
      }

      alert("No se pudo enviar la solicitud de cita.");
      return;
    }

    setSubmitted(true);
  }

  if (loadingBusiness) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p>Cargando negocio...</p>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-xl rounded-xl bg-white p-8 shadow">
          <h1 className="text-3xl font-bold text-red-700">
            Negocio no encontrado
          </h1>

          <p className="mt-3 text-gray-600">
            Selecciona un profesional antes de solicitar una cita.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 shadow">
        <h1 className="text-4xl font-bold text-blue-700">
          Solicitar cita
        </h1>

        <div className="mt-6 rounded-xl bg-blue-50 p-5">
          <p className="text-sm font-semibold text-blue-700">
            Cita con
          </p>

          <div className="mt-4 flex items-center gap-4">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={`Logo de ${business.business_name}`}
                className="h-20 w-20 rounded-lg bg-white object-contain p-2"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-white text-4xl">
                🛠️
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold">
                {business.business_name}
              </h2>

              <p className="mt-1 text-gray-700">
                🔧 {business.service}
              </p>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="mt-8 rounded-xl bg-green-100 p-6 text-center">
            <h2 className="text-2xl font-bold text-green-700">
              ¡Solicitud enviada!
            </h2>

            <p className="mt-3 text-gray-700">
              El profesional revisará tu solicitud y confirmará el horario.
            </p>

            <a
              href={`/contractors/${business.id}`}
              className="mt-6 inline-block rounded bg-blue-700 px-5 py-3 font-semibold text-white"
            >
              Volver al perfil
            </a>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-4"
          >
            <input
              type="text"
              placeholder="Tu nombre"
              value={customerName}
              onChange={(e) =>
                setCustomerName(e.target.value)
              }
              className="w-full rounded border p-3"
              required
            />

            <input
              type="tel"
              placeholder="Número telefónico"
              value={customerPhone}
              onChange={(e) =>
                setCustomerPhone(e.target.value)
              }
              className="w-full rounded border p-3"
              required
            />

            <input
              type="email"
              placeholder="Correo electrónico"
              value={customerEmail}
              onChange={(e) =>
                setCustomerEmail(e.target.value)
              }
              className="w-full rounded border p-3"
              required
            />

            <select
              value={propertyType}
              onChange={(e) =>
                setPropertyType(e.target.value)
              }
              className="w-full rounded border p-3"
              required
            >
              <option value="" disabled>
                Tipo de propiedad
              </option>

              <option value="hogar">Hogar</option>
              <option value="negocio">Negocio</option>
            </select>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) =>
                  setAppointmentDate(e.target.value)
                }
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded border p-3"
                required
              />

              <input
                type="time"
                value={appointmentTime}
                onChange={(e) =>
                  setAppointmentTime(e.target.value)
                }
                className="w-full rounded border p-3"
                required
              />
            </div>

            <input
              type="text"
              placeholder="Dirección de la cita"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded border p-3"
              required
            />

            <select
              value={municipality}
              onChange={(e) =>
                setMunicipality(e.target.value)
              }
              className="w-full rounded border p-3"
              required
            >
              <option value="" disabled>
                Municipio
              </option>

              {business.municipality.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <textarea
              placeholder="Describe el servicio o visita que necesitas"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="w-full rounded border p-3"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-blue-700 p-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {submitting
                ? "Enviando..."
                : "Solicitar cita"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
export default function AppointmentPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-8">
          <p>Cargando citas...</p>
        </main>
      }
    >
      <AppointmentContent />
    </Suspense>
  );
}