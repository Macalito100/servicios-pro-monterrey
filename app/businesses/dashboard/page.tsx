"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Business = {
  id: number;
  business_name: string;
  service: string;
  status: string;
  verified: boolean;
  logo_url: string | null;
  municipality: string[];
  profile_views: number;
  created_at: string;

plan: string;
accepted_jobs_this_month: number;
accepted_jobs_month: string | null;
};
type QuoteRequest = {
  id: number;
  created_at: string;

customer_id: string | null;
business_id: number;
  name: string;
  phone: string;
  email: string;

  
  responded_at: string | null;

  property_type: string | null;
  service: string | null;
  description: string | null;
  photo_urls: string[] | null;

  request_type: "quote" | "visit";

  preferred_date: string | null;
  preferred_time_window: string | null;
  alternative_date: string | null;
  

  is_read: boolean;
  status: string;
};
type Appointment = {
  id: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  appointment_date: string;
  appointment_time: string;
  property_type: string | null;
  service: string;
  address: string;
  municipality: string;
  notes: string | null;
  status: string;
};
export default function BusinessDashboardPage() {
  const router = useRouter();

  const [appointments, setAppointments] =
  useState<Appointment[]>([]);
  
  const [business, setBusiness] = useState<Business | null>(null);
 
  const [loading, setLoading] = useState(true);

  
  
const [requestFilter, setRequestFilter] = useState<
  "all" | "new" | "accepted" | "rejected"
>("all");

  const [errorMessage, setErrorMessage] = useState("");

  const [requests, setRequests] = useState<QuoteRequest[]>([]);

  const [averageRating, setAverageRating] = useState(0);

  const [reviewCount, setReviewCount] = useState(0);

  const [requestSearch, setRequestSearch] = useState("");

  const [portfolioCount, setPortfolioCount] = useState(0);

  const [unreadMessages, setUnreadMessages] =
  useState(0);

  const newRequests = requests.filter(
 
    (request) => request.status === "new"
).length;

const unreadRequests = requests.filter(
  (request) => !request.is_read
).length;

const filteredRequests = requests.filter((request) => {
  const matchesStatus =
    requestFilter === "all" ||
    request.status === requestFilter;

  const search = requestSearch.trim().toLowerCase();

  const matchesSearch =
    search === "" ||
    request.name.toLowerCase().includes(search) ||
    request.phone.toLowerCase().includes(search) ||
    request.email.toLowerCase().includes(search) ||
    request.service?.toLowerCase().includes(search) ||
    request.description?.toLowerCase().includes(search);

  return matchesStatus && matchesSearch;
});

const acceptedRequests = requests.filter(
  (request) => request.status === "accepted"
).length;

const rejectedRequests = requests.filter(
  (request) => request.status === "rejected"
).length;
const isTopRated =
  reviewCount >= 3 && averageRating >= 4.5;
useEffect(() => {
  async function loadDashboard() {
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
  "id, business_name, service, status, verified, logo_url, municipality, profile_views, created_at, plan, accepted_jobs_this_month, accepted_jobs_month"
)


        .eq("owner_user_id", user.id)
        .single();

      if (error || !data) {
        console.error("No se encontró el negocio:", error);
        setErrorMessage(
          "Tu cuenta todavía no está vinculada con un negocio."
        );
        setLoading(false);
        return;
      }

      setBusiness(data);
      const {
  data: conversationData,
  error: conversationError,
} = await supabase
  .from("conversations")
  .select("id")
  .eq("business_id", data.id);

if (conversationError) {
  console.error(
    "Error al cargar conversaciones:",
    conversationError
  );
} else {
  const conversationIds =
    (conversationData ?? []).map(
      (conversation) => conversation.id
    );

  if (conversationIds.length === 0) {
    setUnreadMessages(0);
  } else {
    const {
      count: unreadCount,
      error: unreadError,
    } = await supabase
      .from("messages")
      .select("id", {
        count: "exact",
        head: true,
      })
      .in("conversation_id", conversationIds)
      .eq("is_read", false);

    if (unreadError) {
      console.error(
        "Error contando mensajes:",
        unreadError
      );

      setUnreadMessages(0);
    } else {
      setUnreadMessages(unreadCount ?? 0);
    }
  }
}
const { data: reviewData, error: reviewError } = await supabase
  .from("business_reviews")
  .select("rating")
  .eq("business_id", data.id)
  .eq("status", "published");

if (reviewError) {
  console.error(
    "No se pudieron cargar las reseñas:",
    reviewError
  );
} else {
  const reviews = reviewData ?? [];

  setReviewCount(reviews.length);

  const average =
    reviews.length > 0
      ? reviews.reduce(
          (total, review) => total + review.rating,
          0
        ) / reviews.length
      : 0;

  setAverageRating(average);
}

// Load portfolio-photo count
const {
  count: portfolioTotal,
  error: portfolioError,
} = await supabase
  .from("business_portfolio")
  .select("id", {
    count: "exact",
    head: true,
  })
  .eq("business_id", data.id);

if (portfolioError) {
  console.error(
    "No se pudo cargar el total del portafolio:",
    portfolioError
  );
} else {
  setPortfolioCount(portfolioTotal ?? 0);
}
const { data: quoteData, error: quoteError } = await supabase
  .from("quote_requests")
.select(
  "id, created_at, customer_id, business_id, name, phone, email, property_type, service, description, photo_urls, status, is_read"
)
.eq("business_id", data.id)
.order("created_at", { ascending: false });

if (quoteError) {
  console.error(
    "No se pudieron cargar las solicitudes:",
    quoteError
  );
} else {
  setRequests((quoteData ?? []) as QuoteRequest[]);
}

const {
  data: appointmentData,
  error: appointmentError,
} = await supabase
  .from("business_appointments")
  .select(
    "id, created_at, customer_name, customer_phone, customer_email, appointment_date, appointment_time, property_type, service, address, municipality, notes, status"
  )
  .eq("business_id", data.id)
  .order("appointment_date", { ascending: true })
  .order("appointment_time", { ascending: true });

if (appointmentError) {
  console.error(
    "No se pudieron cargar las citas:",
    appointmentError
  );
} else {
  setAppointments(
    (appointmentData ?? []) as Appointment[]
  );
}
setLoading(false);
    }

    loadDashboard();

const channel = supabase

  .channel("business-dashboard-notifications")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "messages",
    },
    () => {
      loadDashboard();
    }
  )
  .subscribe();
const quoteChannel = supabase
  .channel("business-quote-notifications")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "quote_requests",
    },
    () => {
      loadDashboard();
    }
  )
  .subscribe();
return () => {
  supabase.removeChannel(channel);
  supabase.removeChannel(quoteChannel);
};
}, [router]);
async function updateAppointmentStatus(
  id: number,
  status: "confirmed" | "completed" | "rejected" | "cancelled"
) {
  const { data, error } = await supabase
    .from("business_appointments")
    .update({ status })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) {
    console.error(
      "No se pudo actualizar la cita:",
      error
    );

    alert("No se pudo cambiar el estado de la cita.");
    return;
  }

  setAppointments((current) =>
    current.map((appointment) =>
      appointment.id === id
        ? {
            ...appointment,
            status: data.status,
          }
        : appointment
    )
  );
}

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/businesses/login");
    router.refresh();
  }
async function updateRequestStatus(
  id: number,
  status:
    | "new"
    | "accepted"
    | "in_progress"
    | "completed"
    | "rejected"
) {
  const updateData: {
    status: string;
    is_read: boolean;
    responded_at?: string;
  } = {
    status,
    is_read: true,
  };

  if (
    status === "accepted" ||
    status === "rejected"
  ) {
    updateData.responded_at =
      new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("quote_requests")
    .update(updateData)
    .eq("id", id)
    .select(
      "id, status, is_read, responded_at"
    )
    .single();

  if (error) {
  console.error(
    "No se pudo actualizar la solicitud:",
    error
  );

  alert("No se pudo cambiar el estado.");
  return false;
}

  setRequests((current) =>
    current.map((request) =>
      request.id === id
        ? {
            ...request,
            status: data.status,
            is_read: data.is_read,
            responded_at: data.responded_at,
          }
        : request
    )
  );
  return true;
}

async function acceptRequest(
  request: QuoteRequest
) {
  if (!business) {
    alert("No se encontró la información del negocio.");
    return;
  }

  const { data, error } = await supabase.rpc(
    "accept_quote_request",
    {
      p_request_id: request.id,
    }
  );

  if (error) {
    console.error(
      "No se pudo aceptar la solicitud:",
      error
    );

    alert(
      "No se pudo aceptar la solicitud. Inténtalo nuevamente."
    );
    return;
  }

  const result = Array.isArray(data)
    ? data[0]
    : data;

  if (!result) {
    alert(
      "Supabase no devolvió información sobre la solicitud."
    );
    return;
  }

  if (!result.success) {
    if (result.reason === "free_limit_reached") {
      alert(
        "Has alcanzado el límite de 5 trabajos aceptados este mes en el plan Gratis. Actualiza tu plan para aceptar solicitudes ilimitadas."
      );

      router.push("/pricing");
      return;
    }

    if (result.reason === "not_authorized") {
      alert(
        "No tienes permiso para aceptar esta solicitud."
      );
      return;
    }

    if (result.reason === "request_not_found") {
      alert("No se encontró esta solicitud.");
      return;
    }

    if (result.reason === "invalid_status") {
      alert(
        "Esta solicitud ya no está disponible para aceptar."
      );
      return;
    }

    alert("No se pudo aceptar la solicitud.");
    return;
  }

  setRequests((current) =>
    current.map((currentRequest) =>
      currentRequest.id === request.id
        ? {
            ...currentRequest,
            status: "accepted",
            is_read: true,
            responded_at:
              new Date().toISOString(),
          }
        : currentRequest
    )
  );

  setBusiness((current) =>
    current
      ? {
          ...current,
          accepted_jobs_this_month:
            result.accepted_jobs_this_month,
          accepted_jobs_month:
            result.accepted_jobs_month,
        }
      : current
  );

  if (!request.customer_id) {
    alert(
      "Solicitud aceptada. Como el cliente envió la solicitud sin una cuenta, comunícate por teléfono o correo."
    );
    return;
  }

  await openRequestConversation({
    ...request,
    status: "accepted",
  });
}

async function openRequestConversation(
  request: QuoteRequest
) {
  if (!request.customer_id) {
  alert(
    "Esta solicitud fue enviada sin cuenta. Contacta al cliente por teléfono o correo."
  );
  return;
}
  const {
    data: existingConversation,
    error: searchError,
  } = await supabase
    .from("conversations")
    .select("id")
    .eq("quote_request_id", request.id)
    .maybeSingle();

  if (searchError) {
    console.error(
      "Error al buscar la conversación:",
      searchError
    );

    alert("No se pudo buscar la conversación.");
    return;
  }

  if (existingConversation) {
    router.push(
      `/businesses/messages/${existingConversation.id}`
    );
    return;
  }

  const {
    data: newConversation,
    error: createError,
  } = await supabase
    .from("conversations")
    .insert({
      quote_request_id: request.id,
      customer_id: request.customer_id,
      business_id: request.business_id,
    })
    .select("id")
    .single();

  if (createError) {
    console.error(
      "Error al crear la conversación:",
      createError
    );

    alert("No se pudo crear la conversación.");
    return;
  }

  router.push(
    `/businesses/messages/${newConversation.id}`
  );
}
 const freePlanLimit = 5;

const acceptedJobsThisMonth =
  business?.accepted_jobs_this_month ?? 0;

const remainingFreeJobs = Math.max(
  freePlanLimit - acceptedJobsThisMonth,
  0
);

const usagePercentage = Math.min(
  (acceptedJobsThisMonth / freePlanLimit) * 100,
  100
);
const hasAdvancedAnalytics = [
  "professional",
  "premium",
].includes(
  business?.plan?.toLowerCase() ?? "free"
);

const totalRequests = requests.length;

const acceptanceRate =
  totalRequests > 0
    ? Math.round(
        (acceptedRequests / totalRequests) * 100
      )
    : 0;

const respondedRequests = requests.filter(
  (request) => request.status !== "new"
).length;

const responseRate =
  totalRequests > 0
    ? Math.round(
        (respondedRequests / totalRequests) * 100
      )
    : 0;
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p>Cargando panel del negocio...</p>
      </main>
    );
  }

  if (errorMessage || !business) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
          <h1 className="text-3xl font-bold text-red-700">
            Negocio no encontrado
          </h1>

          <p className="mt-3 text-gray-600">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 rounded bg-gray-800 px-5 py-3 text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </main>
    );
  }
  async function openBillingPortal() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Debes iniciar sesión.");
        return;
      }

      const response = await fetch(
        "/api/stripe/create-portal-session",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "No se pudo abrir la suscripción."
        );
      }

      window.location.href = result.url;
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo abrir la suscripción."
      );
    }
  }
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap gap-3">
  <a
    href="/businesses/profile"
    className="rounded bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
  >
    Mi perfil
  </a>

<a
  href="/businesses/messages"
  className="relative rounded bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
>
  💬 Mensajes

  {unreadMessages > 0 && (
    <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-bold text-white">
      {unreadMessages}
    </span>
  )}
</a>

  <button
    type="button"
    onClick={handleLogout}
    className="rounded bg-gray-800 px-5 py-3 font-semibold text-white hover:bg-gray-900"
  >
    Cerrar sesión
  </button>
</div>

{unreadRequests > 0 && (
  <div className="mt-6 flex items-center justify-between rounded-xl border border-yellow-300 bg-yellow-50 p-5">
    <div>
      <h2 className="text-lg font-bold text-yellow-800">
        🔔 Tienes nuevas solicitudes
      </h2>

      <p className="mt-1 text-yellow-700">
        Tienes {unreadRequests}{" "}
        {unreadRequests === 1
          ? "solicitud sin revisar."
          : "solicitudes sin revisar."}
      </p>
    </div>

    <a
  href="#solicitudes"
  className="relative rounded-lg bg-yellow-600 px-4 py-2 font-semibold text-white hover:bg-yellow-700"
>
  Ver solicitudes

  {unreadRequests > 0 && (
    <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-bold text-white">
      {unreadRequests}
    </span>
  )}
</a>
  </div>
)}
<section className="mt-8 rounded-xl border border-blue-200 bg-white p-6 shadow">
  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
    <div className="flex-1">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-900">
          {business.plan === "free"
            ? "🆓 Plan Gratis"
            : business.plan === "basic"
              ? "⭐ Plan Básico"
              : business.plan === "professional"
                ? "🚀 Plan Profesional"
                : "👑 Plan Premium"}
        </h2>

        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
          Activo
        </span>
      </div>

      {business.plan === "free" ? (
        <>
          <p className="mt-3 text-gray-600">
            Trabajos aceptados este mes:
            <strong className="ml-2 text-gray-900">
              {acceptedJobsThisMonth} de {freePlanLimit}
            </strong>
          </p>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{
                width: `${usagePercentage}%`,
              }}
            />
          </div>

          <p className="mt-3 font-semibold text-gray-700">
            {remainingFreeJobs > 0
              ? `Te quedan ${remainingFreeJobs} ${
                  remainingFreeJobs === 1
                    ? "trabajo gratis"
                    : "trabajos gratis"
                } este mes.`
              : "Has alcanzado el límite mensual del Plan Gratis."}
          </p>

          {business.accepted_jobs_month && (
            <p className="mt-2 text-sm text-gray-500">
              Periodo actual:{" "}
              {business.accepted_jobs_month}
            </p>
          )}
        </>
      ) : (
        <>
  <p className="mt-3 font-semibold text-green-700">
    ✓ Trabajos aceptados ilimitados
  </p>

  <button
    type="button"
    onClick={openBillingPortal}
    className="mt-5 rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
  >
    💳 Administrar suscripción
  </button>
</>
      )}
    </div>

    {business.plan === "free" && (
      <a
        href="/pricing"
        className="rounded-lg bg-blue-700 px-6 py-3 text-center font-bold text-white hover:bg-blue-800"
      >
        Mejorar mi plan
      </a>
    )}
  </div>
</section>
<section className="mt-8 rounded-xl bg-white p-6 shadow">
  <div className="flex flex-col gap-6 md:flex-row md:items-center">
    {business.logo_url ? (
      <img
        src={business.logo_url}
        alt={`Logo de ${business.business_name}`}
        className="h-28 w-28 rounded-xl border bg-white object-contain p-2"
      />
    ) : (
      <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-blue-50 text-5xl">
        🛠️
      </div>
    )}

    <div className="flex-1">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold text-blue-700">
          {business.business_name}
        </h1>

        {business.verified && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            ✓ Verificado
          </span>
        )}

        {isTopRated && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
            🏆 Top Rated
          </span>
        )}
      </div>

      <p className="mt-3 text-gray-600">
        Miembro desde{" "}
        {new Date(business.created_at).toLocaleDateString("es-MX", {
          month: "long",
          year: "numeric",
        })}
      </p>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-700">
        <span>👀 {business.profile_views} visitas</span>

        <span>
          ⭐{" "}
          {averageRating > 0
            ? averageRating.toFixed(1)
            : "Sin calificación"}
        </span>

        <span>
          📝 {reviewCount}{" "}
          {reviewCount === 1 ? "reseña" : "reseñas"}
        </span>
      </div>
    </div>

    <a
      href={`/contractors/${business.id}`}
      className="rounded bg-blue-700 px-5 py-3 text-center font-semibold text-white hover:bg-blue-800"
    >
      Ver perfil público
    </a>
  </div>
</section>

<div className="mt-8 grid gap-6 md:grid-cols-3">
          <section className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Estado del negocio
            </p>

            <p className="mt-2 text-2xl font-bold capitalize">
              {business.status}
            </p>
          </section>

          <section className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Servicio principal
            </p>

            <p className="mt-2 text-2xl font-bold">
              {business.service}
            </p>
          </section>

          <section className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Verificación
            </p>

            <p className="mt-2 text-2xl font-bold">
              {business.verified
                ? "✓ Verificado"
                : "Pendiente"}
            </p>
          </section>
        </div>

        {hasAdvancedAnalytics ? (
  <section className="mt-8">
    <div className="flex flex-wrap items-center gap-3">
      <h2 className="text-2xl font-bold">
        Estadísticas avanzadas
      </h2>

      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
        {business.plan?.toLowerCase() === "premium"
          ? "👑 Premium"
          : "🚀 Profesional"}
      </span>
    </div>

    <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl bg-white p-5 shadow">
        <p className="text-sm text-gray-500">
          👀 Visitas al perfil
        </p>
        <p className="mt-2 text-3xl font-bold text-blue-700">
          {business.profile_views}
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <p className="text-sm text-gray-500">
          📩 Solicitudes recibidas
        </p>
        <p className="mt-2 text-3xl font-bold text-indigo-700">
          {totalRequests}
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <p className="text-sm text-gray-500">
          ✅ Solicitudes aceptadas
        </p>
        <p className="mt-2 text-3xl font-bold text-green-700">
          {acceptedRequests}
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <p className="text-sm text-gray-500">
          📈 Tasa de aceptación
        </p>
        <p className="mt-2 text-3xl font-bold text-emerald-700">
          {acceptanceRate}%
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <p className="text-sm text-gray-500">
          ⚡ Tasa de respuesta
        </p>
        <p className="mt-2 text-3xl font-bold text-orange-600">
          {responseRate}%
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <p className="text-sm text-gray-500">
          ⭐ Calificación promedio
        </p>
        <p className="mt-2 text-3xl font-bold text-yellow-500">
          {averageRating > 0
            ? averageRating.toFixed(1)
            : "-"}
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <p className="text-sm text-gray-500">
          📝 Reseñas publicadas
        </p>
        <p className="mt-2 text-3xl font-bold text-teal-700">
          {reviewCount}
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <p className="text-sm text-gray-500">
          📷 Fotos del portafolio
        </p>
        <p className="mt-2 text-3xl font-bold text-purple-700">
          {portfolioCount}
        </p>
      </div>
    </div>
  </section>
) : (
  <section className="mt-8 rounded-xl border border-purple-200 bg-purple-50 p-6 shadow">
    <h2 className="text-2xl font-bold text-purple-800">
      📊 Estadísticas avanzadas
    </h2>

    <p className="mt-2 text-gray-700">
      Mejora a Profesional o Premium para consultar el rendimiento completo de tu negocio.
    </p>

    <a
      href="/pricing"
      className="mt-4 inline-block rounded-lg bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800"
    >
      Ver planes
    </a>
  </section>
)}

<section className="mt-8 rounded-xl bg-white p-6 shadow">
  <h2 className="text-2xl font-bold">
    Municipios donde prestas servicio
  </h2>

  <p className="mt-3 text-gray-600">
    {business.municipality.join(" • ")}
  </p>
  {business.plan?.toLowerCase() === "free" && (
  <section className="mt-8">
    {(business.accepted_jobs_this_month ?? 0) < 5 ? (
      <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 shadow">
        <p className="text-sm font-semibold text-purple-700">
          Plan Gratis
        </p>

        <p className="mt-2 text-4xl font-bold text-purple-700">
          {Math.max(
            0,
            5 - (business.accepted_jobs_this_month ?? 0)
          )}
        </p>

        <p className="font-semibold text-gray-700">
          trabajos disponibles este mes
        </p>

        <p className="mt-2 text-sm text-gray-600">
          Has aceptado {business.accepted_jobs_this_month ?? 0} de 5 trabajos.
        </p>
      </div>
    ) : (
      <div className="rounded-xl border border-red-300 bg-red-50 p-5 shadow">
        <p className="text-xl font-bold text-red-700">
          Límite mensual alcanzado
        </p>

        <p className="mt-2 text-gray-700">
          Has aceptado 5 de 5 trabajos disponibles en el Plan Gratis.
        </p>

        <p className="mt-1 text-sm text-gray-600">
          Mejora tu plan para poder aceptar más trabajos.
        </p>

        <a
          href="/pricing"
          className="mt-4 inline-block rounded-lg bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800"
        >
          Mejorar mi plan
        </a>
      </div>
    )}
  </section>
)}
</section>
        <section className="mt-8">
  <h2 className="text-2xl font-bold">
    Resumen de solicitudes
  </h2>

<div className="mt-4">
  <input
    type="search"
    value={requestSearch}
    onChange={(event) => setRequestSearch(event.target.value)}
    placeholder="Buscar por nombre, teléfono, correo o servicio..."
    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
  />
</div>

<div className="mt-4 flex flex-wrap gap-2">
  <button
    type="button"
    onClick={() => setRequestFilter("all")}
    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
      requestFilter === "all"
        ? "bg-gray-800 text-white shadow"
        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
    }`}
  >
    📋 Todas ({requests.length})
  </button>

  <button
    type="button"
    onClick={() => setRequestFilter("new")}
    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
      requestFilter === "new"
        ? "bg-yellow-500 text-white shadow"
        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
    }`}
  >
    🟡 Nuevas (
    {requests.filter((request) => request.status === "new").length})
  </button>

  <button
    type="button"
    onClick={() => setRequestFilter("accepted")}
    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
      requestFilter === "accepted"
        ? "bg-blue-600 text-white shadow"
        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
    }`}
  >
    🔵 Aceptadas (
    {requests.filter((request) => request.status === "accepted").length})
  </button>

  <button
    type="button"
    onClick={() => setRequestFilter("rejected")}
    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
      requestFilter === "rejected"
        ? "bg-red-600 text-white shadow"
        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
    }`}
  >
    🔴 Rechazadas (
    {requests.filter((request) => request.status === "rejected").length})
  </button>
</div>
  <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
    <div className="rounded-xl bg-white p-5 shadow">
      <p className="text-sm text-gray-500">
        Nuevas
      </p>
      <p className="mt-2 text-3xl font-bold text-yellow-600">
        {newRequests}
      </p>
    </div>

    <div className="rounded-xl bg-white p-5 shadow">
      <p className="text-sm text-gray-500">
        Aceptadas
      </p>
      <p className="mt-2 text-3xl font-bold text-blue-600">
        {acceptedRequests}
      </p>
    </div>

    <div className="rounded-xl bg-white p-5 shadow">
      <p className="text-sm text-gray-500">
        Rechazadas
      </p>
      <p className="mt-2 text-3xl font-bold text-red-600">
        {rejectedRequests}
      </p>
    </div>
  </div>
</section>
<section className="mt-8">
  <div className="flex items-center justify-between gap-4">
    <h2 className="text-2xl font-bold">
      Citas solicitadas
    </h2>

    <span className="rounded-full bg-purple-100 px-3 py-1 font-semibold text-purple-700">
      {appointments.length}
    </span>
  </div>

  {appointments.length === 0 ? (
    <div className="mt-5 rounded-xl bg-white p-6 shadow">
      Todavía no has recibido solicitudes de cita.
    </div>
  ) : (
    <div className="mt-5 space-y-5">
      {appointments.map((appointment) => (
        <article
          key={appointment.id}
          className="rounded-xl bg-white p-6 shadow"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold">
                {appointment.customer_name}
              </h3>

              <p className="mt-2 text-gray-700">
                📅{" "}
                {new Date(
                  `${appointment.appointment_date}T00:00:00`
                ).toLocaleDateString("es-MX", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>

              <p className="mt-1 text-gray-700">
                🕒 {appointment.appointment_time.slice(0, 5)}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                appointment.status === "confirmed"
                  ? "bg-blue-100 text-blue-700"
                  : appointment.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : appointment.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : appointment.status === "cancelled"
                        ? "bg-gray-200 text-gray-700"
                        : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {appointment.status === "pending" && "Pendiente"}
              {appointment.status === "confirmed" && "Confirmada"}
              {appointment.status === "completed" && "Completada"}
              {appointment.status === "rejected" && "Rechazada"}
              {appointment.status === "cancelled" && "Cancelada"}
            </span>
          </div>

          <div className="mt-5 space-y-1 text-gray-700">
            <p>
              <strong>Servicio:</strong> {appointment.service}
            </p>

            <p>
              <strong>Propiedad:</strong>{" "}
              {appointment.property_type || "No especificada"}
            </p>

            <p>
              <strong>Teléfono:</strong>{" "}
              {appointment.customer_phone}
            </p>

            <p>
              <strong>Correo:</strong>{" "}
              {appointment.customer_email}
            </p>

            <p>
              <strong>Dirección:</strong>{" "}
              {appointment.address}
            </p>

            <p>
              <strong>Municipio:</strong>{" "}
              {appointment.municipality}
            </p>
          </div>

          {appointment.notes && (
            <p className="mt-4 rounded-lg bg-gray-50 p-4 text-gray-700">
              {appointment.notes}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={`tel:${appointment.customer_phone}`}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              📞 Llamar
            </a>

            <a
              href={`mailto:${appointment.customer_email}`}
              className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
            >
              ✉️ Correo
            </a>


            <button
              type="button"
              onClick={() =>
                updateAppointmentStatus(
                  appointment.id,
                  "confirmed"
                )
              }
              disabled={appointment.status === "confirmed"}
              className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Confirmar
            </button>

            <button
              type="button"
              onClick={() =>
                updateAppointmentStatus(
                  appointment.id,
                  "completed"
                )
              }
              disabled={appointment.status === "completed"}
              className="rounded bg-green-700 px-4 py-2 text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Completar
            </button>

            <button
              type="button"
              onClick={() =>
                updateAppointmentStatus(
                  appointment.id,
                  "rejected"
                )
              }
              disabled={appointment.status === "rejected"}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Rechazar
            </button>

            <button
              type="button"
              onClick={() =>
                updateAppointmentStatus(
                  appointment.id,
                  "cancelled"
                )
              }
              disabled={appointment.status === "cancelled"}
              className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </article>
      ))}
    </div>
  )}
</section>
        <section id="solicitudes" className="mt-8 scroll-mt-24">
  <div className="flex items-center justify-between">
    <h2 className="text-2xl font-bold">
      Solicitudes recibidas
    </h2>

    <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
      {requests.length}
    </span>
  </div>

  {filteredRequests.length === 0 ? (
  <div className="mt-5 rounded-xl bg-white p-6 text-center text-gray-600 shadow">
    No se encontraron solicitudes.
  </div>
) : (
    <div className="mt-5 space-y-5">
      {filteredRequests.map((request) => (
        <article
  key={request.id}
  className={`rounded-xl border-l-4 p-6 shadow ${
    request.is_read
      ? "border-gray-200 bg-white"
      : "border-yellow-500 bg-yellow-50"
  }`}
>
    {!request.is_read && (
  <div className="mb-4">
    <span className="rounded-full bg-yellow-200 px-3 py-1 text-sm font-bold text-yellow-800">
      🔔 Nueva solicitud
    </span>
  </div>
)}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">
              {request.name}
            </h3>

            <span
  className={`rounded-full px-3 py-1 text-sm font-semibold ${
    request.status === "accepted"
      ? "bg-blue-100 text-blue-700"
      : request.status === "rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700"
  }`}
>
  {request.status === "accepted"
    ? "🔵 Aceptada"
    : request.status === "rejected"
    ? "🔴 Rechazada"
    : "🟡 Nueva"}
</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
  <span
    className={`rounded-full px-3 py-1 text-sm font-semibold ${
      request.request_type === "visit"
        ? "bg-purple-100 text-purple-700"
        : "bg-green-100 text-green-700"
    }`}
  >
    {request.request_type === "visit"
      ? "🚗 Solicitud de visita"
      : "💰 Cotización"}
  </span>

  <span className="text-gray-600">
    <strong>Servicio:</strong>{" "}
    {request.service || "No especificado"}
  </span>
</div>

          <p>
            <strong>Teléfono:</strong> {request.phone}
          </p>

          <p>
            <strong>Correo:</strong> {request.email}
          </p>
{request.request_type === "visit" && (
  <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 p-4">
    <h4 className="font-bold text-purple-800">
      Información de la visita
    </h4>

    <p className="mt-2">
      <strong>Fecha preferida:</strong>{" "}
      {request.preferred_date || "No especificada"}
    </p>

    <p>
      <strong>Horario:</strong>{" "}
      {request.preferred_time_window || "Flexible"}
    </p>

    {request.alternative_date && (
      <p>
        <strong>Fecha alternativa:</strong>{" "}
        {request.alternative_date}
      </p>
    
    )}
  </div>
)}
{request.description && (
  <div className="mt-4 rounded-lg bg-gray-100 p-4">
    <h4 className="font-bold">
      Descripción del trabajo
    </h4>

    <p className="mt-2 whitespace-pre-wrap">
      {request.description}
    </p>
  </div>
)}
{request.photo_urls &&
  request.photo_urls.length > 0 && (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
      <h4 className="mb-3 font-bold">
        Fotos del proyecto
      </h4>

      <div className="flex flex-wrap gap-3">
        {request.photo_urls.map((url) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={url}
              alt="Foto del proyecto"
              className="h-28 w-28 rounded-lg border object-cover transition hover:scale-105"
            />
          </a>
        ))}
      </div>
    </div>
  )}

          <div className="mt-5 flex flex-wrap gap-3">

  {/* Nueva solicitud */}
  {request.status !== "accepted" &&
  request.status !== "rejected" && (
    <>
      <a
        href={`tel:${request.phone}`}
        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        📞 Llamar
      </a>

      <a
        href={`mailto:${request.email}`}
        className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
      >
        ✉️ Correo
      </a>

      <a
        href={`/businesses/dashboard/request/${request.id}`}
        className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
      >
        📄 Ver detalles
      </a>

      <button
  type="button"
  onClick={() => acceptRequest(request)}
  disabled={
    business.plan?.toLowerCase() === "free" &&
    (business.accepted_jobs_this_month ?? 0) >= 5
  }
  className={`rounded px-4 py-2 text-white ${
    business.plan?.toLowerCase() === "free" &&
    (business.accepted_jobs_this_month ?? 0) >= 5
      ? "cursor-not-allowed bg-gray-400"
      : "bg-blue-600 hover:bg-blue-700"
  }`}
>
  {business.plan?.toLowerCase() === "free" &&
  (business.accepted_jobs_this_month ?? 0) >= 5
    ? "🚫 Límite alcanzado"
    : "✔️ Aceptar"}
</button>

      <button
        type="button"
        onClick={() =>
          updateRequestStatus(request.id, "rejected")
        }
        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        ❌ Rechazar
      </button>
    </>
  )}

  {/* Solicitud aceptada */}
  {request.status === "accepted" && (
    <>
      {request.customer_id ? (
  <button
    type="button"
    onClick={() =>
      openRequestConversation(request)
    }
    className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
  >
    💬 Abrir conversación
  </button>
) : (
  <span className="rounded bg-gray-200 px-4 py-2 font-semibold text-gray-600">
    👤 Cliente sin cuenta
  </span>
)}

      <a
        href={`tel:${request.phone}`}
        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        📞 Llamar
      </a>

      <a
        href={`mailto:${request.email}`}
        className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
      >
        ✉️ Correo
      </a>

      <a
        href={`/businesses/dashboard/request/${request.id}`}
        className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
      >
        📄 Ver detalles
      </a>
    </>
  )}

  {/* Solicitud rechazada */}
  {request.status === "rejected" && (
    <a
      href={`/businesses/dashboard/request/${request.id}`}
      className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
    >
      📄 Ver detalles
    </a>
  )}

</div>
        </article>
      ))}
    </div>
  )}
</section>
      </div>
    </main>
  );
}