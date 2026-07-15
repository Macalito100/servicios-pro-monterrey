"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
type PortfolioItem = {
  id: number;
  image_url: string;
  storage_path: string;
  title: string | null;
  description: string | null;
};
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

export default function BusinessProfilePage() {
  const router = useRouter();

  const [businessId, setBusinessId] = useState<number | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [description, setDescription] = useState("");

const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
const [portfolioImage, setPortfolioImage] = useState<File | null>(null);
const [portfolioTitle, setPortfolioTitle] = useState("");
const [portfolioDescription, setPortfolioDescription] = useState("");
const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/businesses/login");
        return;
      }

      const { data, error } = await supabase
        .from("business_registrations")
        .select(
          "id, business_name, phone, email, service, customer_type, municipality, description"
        )
        .eq("owner_user_id", user.id)
        .single();

      if (error || !data) {
        console.error("No se pudo cargar el perfil:", error);
        alert("No se encontró el negocio vinculado a esta cuenta.");
        setLoading(false);
        return;
      }

      setBusinessId(data.id);
setBusinessName(data.business_name);
setPhone(data.phone);
setEmail(data.email);
setService(data.service);
setCustomerType(data.customer_type);
setMunicipalities(data.municipality ?? []);
setDescription(data.description);

const { data: portfolioData, error: portfolioError } =
  await supabase
    .from("business_portfolio")
    .select(
      "id, image_url, storage_path, title, description"
    )
    .eq("business_id", data.id)
    .order("created_at", { ascending: false });

if (portfolioError) {
  console.error(
    "No se pudo cargar el portafolio:",
    portfolioError
  );
} else {
  setPortfolioItems(
    (portfolioData ?? []) as PortfolioItem[]
  );
}

setLoading(false);
    }

    loadProfile();
  }, [router]);

  function handleMunicipalityChange(value: string) {
  setMunicipalities((current) => {
    if (current.includes(value)) {
      return current.filter((item) => item !== value);
    }

    return [...current, value];
  });
}

async function handlePortfolioUpload() {
  if (!businessId) {
    return;
  }

  if (!portfolioImage) {
    alert("Selecciona una imagen.");
    return;
  }

  if (portfolioImage.size > 5 * 1024 * 1024) {
    alert("La imagen no puede pesar más de 5 MB.");
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(portfolioImage.type)) {
    alert("La imagen debe ser JPG, PNG o WEBP.");
    return;
  }

  setUploadingPortfolio(true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setUploadingPortfolio(false);
    router.push("/businesses/login");
    return;
  }

  const extension =
    portfolioImage.name.split(".").pop() || "jpg";

  const storagePath =
    `${user.id}/${businessId}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("business-portfolio")
    .upload(storagePath, portfolioImage, {
      contentType: portfolioImage.type,
      upsert: false,
    });

  if (uploadError) {
    console.error(uploadError);
    alert("No se pudo subir la imagen.");
    setUploadingPortfolio(false);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("business-portfolio")
    .getPublicUrl(storagePath);

  const { data: newItem, error: insertError } =
    await supabase
      .from("business_portfolio")
      .insert({
        business_id: businessId,
        image_url: publicUrlData.publicUrl,
        storage_path: storagePath,
        title: portfolioTitle.trim() || null,
        description: portfolioDescription.trim() || null,
      })
      .select(
        "id, image_url, storage_path, title, description"
      )
      .single();

  if (insertError || !newItem) {
    console.error(insertError);
    alert("La imagen subió, pero no se pudo guardar.");
    setUploadingPortfolio(false);
    return;
  }

  setPortfolioItems((current) => [
    newItem as PortfolioItem,
    ...current,
  ]);

  setPortfolioImage(null);
  setPortfolioTitle("");
  setPortfolioDescription("");
  setUploadingPortfolio(false);

  alert("Imagen agregada al portafolio.");
}
async function handleDeletePortfolio(item: PortfolioItem) {
  const confirmed = window.confirm(
    "¿Seguro que quieres eliminar este proyecto?"
  );

  if (!confirmed) {
    return;
  }

  const { error: storageError } = await supabase.storage
    .from("business-portfolio")
    .remove([item.storage_path]);

  if (storageError) {
    console.error(
      "No se pudo eliminar la imagen:",
      storageError
    );

    alert("No se pudo eliminar la imagen.");
    return;
  }

  const { error: databaseError } = await supabase
    .from("business_portfolio")
    .delete()
    .eq("id", item.id);

  if (databaseError) {
    console.error(
      "No se pudo eliminar el registro:",
      databaseError
    );

    alert("La imagen se eliminó, pero no se pudo borrar el registro.");
    return;
  }

  setPortfolioItems((current) =>
    current.filter(
      (portfolioItem) => portfolioItem.id !== item.id
    )
  );
}
async function handleSubmit(
  e: React.FormEvent<HTMLFormElement>
) {
  e.preventDefault();

    if (!businessId) {
      return;
    }

    if (municipalities.length === 0) {
      alert("Selecciona por lo menos un municipio.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("business_registrations")
      .update({
        business_name: businessName,
        phone,
        email,
        service,
        customer_type: customerType,
        municipality: municipalities,
        description,
      })
      .eq("id", businessId);

    setSaving(false);

    if (error) {
      console.error("No se pudo actualizar el perfil:", error);
      alert("No se pudieron guardar los cambios.");
      return;
    }

    alert("Perfil actualizado correctamente.");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p>Cargando perfil...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-blue-700">
              Mi perfil
            </h1>

            <p className="mt-3 text-gray-600">
              Actualiza la información pública de tu negocio.
            </p>
          </div>

          <a
            href="/businesses/dashboard"
            className="rounded bg-gray-800 px-5 py-3 text-white hover:bg-gray-900"
          >
            Volver al panel
          </a>
        </div>

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

            <div className="mt-3 grid gap-3 md:grid-cols-2">
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
          </fieldset>

          <textarea
            className="w-full rounded border p-3"
            placeholder="Describe tus servicios, experiencia y zonas de cobertura"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded bg-blue-700 p-3 font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
        <section className="mt-10 border-t pt-8">
  <h2 className="text-3xl font-bold text-blue-700">
    Portafolio de trabajos
  </h2>

  <p className="mt-2 text-gray-600">
    Agrega fotografías de tus mejores proyectos para que los clientes puedan ver tu trabajo.
  </p>

  <div className="mt-6 rounded-xl bg-gray-50 p-5 space-y-4">

    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      onChange={(e) =>
        setPortfolioImage(e.target.files?.[0] ?? null)
      }
      className="w-full rounded border bg-white p-3"
    />

    <input
      type="text"
      placeholder="Título del proyecto"
      value={portfolioTitle}
      onChange={(e) => setPortfolioTitle(e.target.value)}
      className="w-full rounded border bg-white p-3"
    />

    <textarea
      placeholder="Describe el proyecto"
      rows={4}
      value={portfolioDescription}
      onChange={(e) =>
        setPortfolioDescription(e.target.value)
      }
      className="w-full rounded border bg-white p-3"
    />

    <button
      type="button"
      onClick={handlePortfolioUpload}
      disabled={uploadingPortfolio}
      className="rounded bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60"
    >
      {uploadingPortfolio
        ? "Subiendo..."
        : "Agregar al portafolio"}
    </button>

  </div>

  <div className="mt-8 grid gap-6 md:grid-cols-2">
    {portfolioItems.map((item) => (
      <article
        key={item.id}
        className="overflow-hidden rounded-xl bg-white shadow"
      >
        <img
          src={item.image_url}
          alt={item.title || "Proyecto"}
          className="h-56 w-full object-cover"
        />

        <div className="p-5">
  {item.title && (
    <h3 className="text-xl font-bold">
      {item.title}
    </h3>
  )}

  {item.description && (
    <p className="mt-2 text-gray-600">
      {item.description}
    </p>
  )}

  <button
    type="button"
    onClick={() => handleDeletePortfolio(item)}
    className="mt-5 rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
  >
    Eliminar proyecto
  </button>
</div>
      </article>
    ))}
  </div>
</section>
      </div>
    </main>
  );
}