"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type SelectedBusiness = {
  id: number;
  business_name: string;
  service: string;
  municipality: string[];
  logo_url: string | null;
  verified: boolean;
};
function QuoteContent() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedAsGuest, setSubmittedAsGuest] =
  useState(false);
const [selectedBusiness, setSelectedBusiness] =
  useState<SelectedBusiness | null>(null);

const [loadingBusiness, setLoadingBusiness] = useState(false);
  const searchParams = useSearchParams();
  const businessId = searchParams.get("business");
  
const [name, setName] = useState("");
const [phone, setPhone] = useState("");
const [email, setEmail] = useState("");
const [propertyType, setPropertyType] = useState("");
const [requestType, setRequestType] = useState<
  "quote" | "visit"
>("quote");
const [service, setService] = useState("");
const [description, setDescription] = useState("");
const [photos, setPhotos] = useState<File[]>([]);

const [preferredDate, setPreferredDate] = useState("");
const [preferredTimeWindow, setPreferredTimeWindow] = useState("");
const [alternativeDate, setAlternativeDate] = useState("");
useEffect(() => {
  async function loadSelectedBusiness() {
    if (!businessId) {
      return;
    }

    setLoadingBusiness(true);

    const { data, error } = await supabase
  .from("business_registrations")
  .select(
  "id, business_name, service, municipality, logo_url, verified"
)
      .eq("id", Number(businessId))
      .eq("status", "approved")
      .single();

    setLoadingBusiness(false);

    if (error || !data) {
      console.error("No se pudo cargar el negocio:", error);
      return;
    }

    setSelectedBusiness(data);
    setService(data.service);
  }

  loadSelectedBusiness();
}, [businessId]);
async function handleSubmit(
  e: React.FormEvent<HTMLFormElement>
) {
  e.preventDefault();

 const {
  data: { session },
} = await supabase.auth.getSession();

const user = session?.user ?? null;
setSubmittedAsGuest(!user);
let photoUrls: string[] = [];

if (photos.length > 0) {
  for (const photo of photos) {
    const folder =
  user?.id ?? "guest";

const fileName =
  `${folder}/${crypto.randomUUID()}-${photo.name}`;

    const { error: uploadError } = await supabase.storage
      .from("request-photos")
      .upload(fileName, photo);

    if (uploadError) {
      console.error(
        "Error al subir la foto:",
        uploadError
      );
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("request-photos")
      .getPublicUrl(fileName);

    photoUrls.push(publicUrl);
  }
}
  const { error } = await supabase
    .from("quote_requests")
    .insert({
      customer_id: user?.id ?? null,

      name,
      phone,
      email,
      property_type: propertyType,
      service,
      description,

      request_type: requestType,

      preferred_date:
        requestType === "visit" && preferredDate
          ? preferredDate
          : null,

      preferred_time_window:
        requestType === "visit" && preferredTimeWindow
          ? preferredTimeWindow
          : null,

      alternative_date:
        requestType === "visit" && alternativeDate
          ? alternativeDate
          : null,

      business_id: selectedBusiness?.id ?? null,

      contractor_id: selectedBusiness
        ? String(selectedBusiness.id)
        : null,

      contractor_name:
  selectedBusiness?.business_name ?? null,

photo_urls: photoUrls,

status: "new",
is_read: false,
    });

  if (error) {
    console.error("Error al enviar solicitud:", error);
    alert("No se pudo enviar la solicitud.");
    return;
  }

  setSubmitted(true);
}

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8">

        <h1 className="text-4xl font-bold text-blue-700">
  Solicitar cotización
</h1>

<p className="mt-3 text-gray-600">
  Completa el formulario y el profesional recibirá tu solicitud directamente.
</p>


       {submitted ? (
  <div className="mt-8 rounded-xl bg-green-100 p-6 text-center">
    <h2 className="text-2xl font-bold text-green-700">
      ¡Solicitud enviada!
    </h2>

    <p className="mt-3 text-gray-700">
  Tu solicitud fue enviada correctamente.
</p>

{submittedAsGuest && (
  <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
    <h3 className="text-xl font-bold text-blue-800">
      ¿Quieres darle seguimiento?
    </h3>

    <p className="mt-2 text-gray-700">
      Crea una cuenta gratuita para:
    </p>

    <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
      <li>💬 Chatear con la empresa</li>
      <li>📋 Ver el estado de tu solicitud</li>
      <li>⭐ Dejar una reseña</li>
      <li>❤️ Guardar empresas favoritas</li>
    </ul>

    <a
      href="/customer/register"
      className="mt-5 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
    >
      Crear cuenta gratis
    </a>
  </div>
)}

    <p className="mt-4 text-lg">
      <span className="font-bold text-blue-700">
        {selectedBusiness?.business_name}
      </span>{" "}
      recibió tu solicitud y se pondrá en contacto contigo muy pronto.
    </p>
  </div>
) : (
  <form
    onSubmit={handleSubmit}
    className="mt-8 space-y-4"
  >
    <div>
  <label className="mb-3 block font-semibold text-gray-700">
    ¿Qué necesitas?
  </label>

  <div className="space-y-3 rounded-lg border p-4">

    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="radio"
        name="requestType"
        value="quote"
        checked={requestType === "quote"}
        onChange={() => setRequestType("quote")}
      />

      <div>
        <p className="font-semibold">
          Solo quiero una cotización
        </p>

        <p className="text-sm text-gray-500">
          Necesito un precio o presupuesto.
        </p>
      </div>
    </label>

    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="radio"
        name="requestType"
        value="visit"
        checked={requestType === "visit"}
        onChange={() => setRequestType("visit")}
      />

      <div>
        <p className="font-semibold">
          Quiero programar una visita
        </p>

        <p className="text-sm text-gray-500">
          El profesional puede revisar el trabajo en persona.
        </p>
      </div>
    </label>

  </div>
</div>

            <input
  className="w-full border p-3 rounded"
  placeholder="Nombre"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
/>


           <input
  className="w-full border p-3 rounded"
  placeholder="Número telefónico"
  type="tel"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  required
/>


            <input
  className="w-full border p-3 rounded"
  placeholder="Correo electrónico"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>

<select
  className="w-full border p-3 rounded"
  required
  value={propertyType}
  onChange={(e) => setPropertyType(e.target.value)}
>
  <option value="" disabled>
    Tipo de propiedad
  </option>

  <option value="hogar">
    Hogar
  </option>

  <option value="negocio">
    Negocio
  </option>
</select>
           {loadingBusiness ? (
  <div className="w-full rounded border bg-gray-50 p-3 text-gray-600">
    Cargando información del negocio...
  </div>
) : selectedBusiness ? (
  <div className="mb-8 rounded-xl border bg-blue-50 p-6">
    <p className="text-center text-sm font-semibold uppercase tracking-wide text-blue-700">
      Solicitando cotización para
    </p>

    <div className="mt-6 flex flex-col items-center text-center">
      {selectedBusiness.logo_url ? (
        <img
          src={selectedBusiness.logo_url}
          alt={`Logo de ${selectedBusiness.business_name}`}
          className="h-32 w-32 rounded-xl bg-white p-3 object-contain shadow"
        />
      ) : (
        <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-white text-6xl shadow">
          🛠️
        </div>
      )}

      <h2 className="mt-6 text-4xl font-bold text-gray-900">
  {selectedBusiness.business_name}
</h2>

<div className="mt-3 flex flex-wrap items-center justify-center gap-3">
  <p className="text-sm text-gray-600">
  Sin reseñas todavía
</p>

  {selectedBusiness.verified && (
  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
    ✓ Empresa verificada
  </span>
)}
</div>

<p className="mt-4 text-xl text-gray-700">
  🔧 {selectedBusiness.service}
</p>

      <p className="mt-2 text-gray-600">
        📍 {selectedBusiness.municipality.join(" • ")}
      </p>
    </div>
  </div>
) : (
  <select
    className="w-full rounded border p-3"
    value={service}
    onChange={(e) => setService(e.target.value)}
    required
  >
    <option value="" disabled>
      Selecciona un servicio
    </option>

    <option value="electricidad">Electricidad</option>
    <option value="plomeria">Plomería</option>
    <option value="aire-acondicionado">
      Aire acondicionado
    </option>
    <option value="limpieza">Limpieza</option>
    <option value="pintura">Pintura</option>
    <option value="carpinteria">Carpintería</option>
    <option value="seguridad">Seguridad</option>
    <option value="jardineria">Jardinería</option>
    <option value="remodelacion">Remodelación</option>
    <option value="mantenimiento">
      Mantenimiento general
    </option>
  </select>
)}

            <textarea
  className="w-full border p-3 rounded"
  placeholder="Describe el trabajo que necesitas y en qué zona de Monterrey se encuentra"
  rows={5}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  required
/>
<div>
  <label
    htmlFor="project-photos"
    className="block font-semibold text-gray-700"
  >
    Fotos del proyecto
  </label>

  <input
    id="project-photos"
    type="file"
    accept="image/*"
    multiple
    onChange={(event) =>
      setPhotos(Array.from(event.target.files ?? []))
    }
    className="mt-2 block w-full rounded-lg border border-gray-300 bg-white p-3"
  />

  <p className="mt-2 text-sm text-gray-500">
    Puedes seleccionar varias imágenes.
  </p>

  {photos.length > 0 && (
    <div className="mt-3 rounded-lg bg-gray-100 p-3">
      <p className="font-semibold">
        {photos.length}{" "}
        {photos.length === 1
          ? "foto seleccionada"
          : "fotos seleccionadas"}
      </p>

      <ul className="mt-2 space-y-1 text-sm text-gray-600">
        {photos.map((photo) => (
          <li key={`${photo.name}-${photo.lastModified}`}>
            📷 {photo.name}
          </li>
        ))}
      </ul>
    </div>
  )}
</div>
{requestType === "visit" && (
  <div className="space-y-4 rounded-xl border border-blue-200 bg-blue-50 p-5">
    <div>
      <h3 className="text-lg font-bold text-blue-800">
        Información para la visita
      </h3>

      <p className="mt-1 text-sm text-gray-600">
        La fecha y el horario son una preferencia. El profesional deberá
        confirmar la visita contigo.
      </p>
    </div>

    <div>
      <label className="mb-2 block font-semibold text-gray-700">
        Fecha preferida
      </label>

      <input
        type="date"
        className="w-full rounded border bg-white p-3"
        value={preferredDate}
        onChange={(e) => setPreferredDate(e.target.value)}
        required={requestType === "visit"}
      />
    </div>

    <div>
      <label className="mb-2 block font-semibold text-gray-700">
        Horario preferido
      </label>

      <select
        className="w-full rounded border bg-white p-3"
        value={preferredTimeWindow}
        onChange={(e) => setPreferredTimeWindow(e.target.value)}
        required={requestType === "visit"}
      >
        <option value="" disabled>
          Selecciona un horario
        </option>

        <option value="morning">
          Mañana — 8:00 a. m. a 12:00 p. m.
        </option>

        <option value="afternoon">
          Tarde — 12:00 p. m. a 5:00 p. m.
        </option>

        <option value="evening">
          Noche — 5:00 p. m. a 8:00 p. m.
        </option>

        <option value="flexible">
          Horario flexible
        </option>
      </select>
    </div>

    <div>
      <label className="mb-2 block font-semibold text-gray-700">
        Fecha alternativa
        <span className="ml-1 text-sm font-normal text-gray-500">
          (opcional)
        </span>
      </label>

      <input
        type="date"
        className="w-full rounded border bg-white p-3"
        value={alternativeDate}
        onChange={(e) => setAlternativeDate(e.target.value)}
      />
    </div>
  </div>
)}

<button
  type="submit"
  className="w-full rounded bg-blue-700 p-3 font-bold text-white transition hover:bg-blue-800"
>
  {requestType === "visit"
    ? "Solicitar visita"
    : "Solicitar cotización"}
</button>


          </form>

        )}

      </div>

    </main>
  );
}
export default function QuotePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-8">
          <p>Cargando formulario...</p>
        </main>
      }
    >
      <QuoteContent />
    </Suspense>
  );
}