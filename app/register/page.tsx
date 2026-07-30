"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const municipalityOptions = [
  "Monterrey",
  "San Pedro Garza García",
  "San Nicolás de los Garza",
  "Guadalupe",
  "Apodaca",
  "Santa Catarina",
  "General Escobedo",
  "García",
  "Juárez",
  "Santiago",
];

export default function RegisterPage() {
    const router = useRouter();

  const [checkingAccount, setCheckingAccount] =
    useState(true);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [description, setDescription] = useState("");
const [logo, setLogo] = useState<File | null>(null);

  useEffect(() => {
    async function protectRegistrationPage() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error(
          "Error al verificar la sesión:",
          error
        );

        router.push("/businesses/login");
        return;
      }

      if (!session) {
        router.push("/businesses/login");
        return;
      }

      const accountType =
        session.user.user_metadata?.account_type;

      if (accountType === "customer") {
        router.push("/customer/dashboard");
        return;
      }

      if (accountType !== "business") {
        router.push("/businesses/login");
        return;
      }

      setCheckingAccount(false);
    }

    protectRegistrationPage();
  }, [router]);

  function handleMunicipalityChange(value: string) {
    setMunicipalities((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value);
      }

      return [...current, value];
    });
  }

  function selectAllMunicipalities() {
    setMunicipalities(municipalityOptions);
  }

  function clearMunicipalities() {
    setMunicipalities([]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

    const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error(
      "Error al verificar la sesión:",
      sessionError
    );

    alert("No se pudo verificar tu cuenta.");
    return;
  }

  if (!session) {
    alert(
      "Debes iniciar sesión con una cuenta de empresa antes de registrar tu negocio."
    );
    return;
  }

  const accountType =
    session.user.user_metadata?.account_type;

  if (accountType !== "business") {
    alert(
      "Debes usar una cuenta de empresa para registrar un negocio."
    );
    return;
  }

  if (municipalities.length === 0) {
    alert("Selecciona por lo menos un municipio.");
    return;
  }

  if (!logo) {
    alert("Selecciona un logo para el negocio.");
    return;
  }

  if (logo.size > 2 * 1024 * 1024) {
    alert("El logo no puede pesar más de 2 MB.");
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(logo.type)) {
    alert("El logo debe ser JPG, PNG o WEBP.");
    return;
  }

  setSubmitting(true);

  const fileExtension = logo.name.split(".").pop();
  const safeBusinessName = businessName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const filePath = `${Date.now()}-${safeBusinessName}.${fileExtension}`;

  const { error: uploadError } = await supabase.storage
    .from("business-logos")
    .upload(filePath, logo, {
      cacheControl: "3600",
      upsert: false,
      contentType: logo.type,
    });

  if (uploadError) {
    console.error("Error al subir el logo:", uploadError);
    alert("No se pudo subir el logo.");
    setSubmitting(false);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("business-logos")
    .getPublicUrl(filePath);

  const logoUrl = publicUrlData.publicUrl;

  const { error: registrationError } = await supabase
    .from("business_registrations")
    .insert({
      business_name: businessName,
      owner_name: ownerName,
      phone,
      email,
      service,
      customer_type: customerType,
      municipality: municipalities,
      description,
      owner_user_id: session.user.id,
      logo_url: logoUrl,
    });

  setSubmitting(false);

  if (registrationError) {
    console.error(
      "Error al registrar el negocio:",
      registrationError
    );

    alert("No se pudo guardar el registro.");
    return;
  }

  setSubmitted(true);
}

  if (checkingAccount) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p className="text-gray-600">
          Verificando cuenta...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow">
        <h1 className="text-4xl font-bold text-blue-700">
          Registra tu negocio
        </h1>

        <p className="mt-3 text-gray-600">
          Publica tus servicios para hogares y negocios en Monterrey y su área
          metropolitana.
        </p>

        {submitted ? (
          <div className="mt-8 rounded-lg bg-green-100 p-5">
            <h2 className="text-xl font-bold">
              ¡Registro recibido!
            </h2>

            <p className="mt-2">
              Hemos recibido la información de tu negocio.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-4"
          >
            <input
              className="w-full rounded border p-3"
              placeholder="Nombre del negocio"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />

            <input
              className="w-full rounded border p-3"
              placeholder="Nombre del responsable"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />

            <input
              className="w-full rounded border p-3"
              placeholder="Número telefónico"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <input
              className="w-full rounded border p-3"
              placeholder="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <select
              className="w-full rounded border p-3"
              value={service}
              onChange={(e) => setService(e.target.value)}
              required
            >
              <option value="" disabled>
                Selecciona el servicio principal
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

            <select
              className="w-full rounded border p-3"
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
              required
            >
              <option value="" disabled>
                ¿A quién atiendes?
              </option>

              <option value="hogares">Hogares</option>
              <option value="negocios">Negocios</option>
              <option value="ambos">Hogares y negocios</option>
            </select>

            <fieldset className="rounded-lg border p-4">
              <legend className="px-2 font-bold text-blue-700">
                Municipios donde prestas servicio
              </legend>

              <div className="mb-4 mt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={selectAllMunicipalities}
                  className="rounded bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-200"
                >
                  Seleccionar todos
                </button>

                <button
                  type="button"
                  onClick={clearMunicipalities}
                  className="rounded bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                >
                  Limpiar selección
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {municipalityOptions.map((municipality) => (
                  <label
                    key={municipality}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={municipalities.includes(municipality)}
                      onChange={() =>
                        handleMunicipalityChange(municipality)
                      }
                    />

                    <span>{municipality}</span>
                  </label>
                ))}
              </div>

              {municipalities.length === 0 && (
                <p className="mt-3 text-sm text-gray-500">
                  Selecciona por lo menos un municipio.
                </p>
              )}
            </fieldset>

<div>
  <label className="mb-2 block font-semibold text-gray-700">
    Logo del negocio
  </label>

  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
    className="w-full rounded border p-3"
    required
  />

  <p className="mt-2 text-sm text-gray-500">
    Formatos permitidos: JPG, PNG o WEBP. Máximo 2 MB.
  </p>
</div>
            <textarea
              className="w-full rounded border p-3"
              placeholder="Describe tus servicios, experiencia y zonas de cobertura"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-blue-700 p-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Enviando..." : "Enviar registro"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}