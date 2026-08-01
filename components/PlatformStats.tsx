"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Stats = {
  professionals: number;
  projects: number;
  reviews: number;
  municipalities: number;
};

type BusinessMunicipalities = {
  municipality: string[] | null;
};

export default function PlatformStats() {
  const [stats, setStats] = useState<Stats>({
    professionals: 0,
    projects: 0,
    reviews: 0,
    municipalities: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [
        professionalsResult,
        projectsResult,
        reviewsResult,
        municipalitiesResult,
      ] = await Promise.all([
        supabase
          .from("business_registrations")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("approval_status", "approved"),

        supabase
          .from("business_portfolio")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("business_reviews")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("status", "published"),

        supabase
          .from("business_registrations")
          .select("municipality")
          .eq("approval_status", "approved"),
      ]);

      if (professionalsResult.error) {
        console.error(
          "Error al contar profesionales:",
          professionalsResult.error
        );
      }

      if (projectsResult.error) {
        console.error(
          "Error al contar proyectos:",
          projectsResult.error
        );
      }

      if (reviewsResult.error) {
        console.error(
          "Error al contar reseñas:",
          reviewsResult.error
        );
      }

      if (municipalitiesResult.error) {
        console.error(
          "Error al cargar municipios:",
          municipalitiesResult.error
        );
      }

      const businesses =
        (municipalitiesResult.data ?? []) as BusinessMunicipalities[];

      const uniqueMunicipalities = new Set<string>();

      businesses.forEach((business) => {
        business.municipality?.forEach((municipality) => {
          uniqueMunicipalities.add(municipality);
        });
      });

      setStats({
        professionals: professionalsResult.count ?? 0,
        projects: projectsResult.count ?? 0,
        reviews: reviewsResult.count ?? 0,
        municipalities: uniqueMunicipalities.size,
      });

      setLoading(false);
    }

    loadStats();
  }, []);

  const items = [
    {
      icon: "👷",
      value: stats.professionals,
      label:
        stats.professionals === 1
          ? "Profesional aprobado"
          : "Profesionales aprobados",
    },
    {
      icon: "📷",
      value: stats.projects,
      label:
        stats.projects === 1
          ? "Proyecto publicado"
          : "Proyectos publicados",
    },
    {
      icon: "⭐",
      value: stats.reviews,
      label:
        stats.reviews === 1
          ? "Reseña publicada"
          : "Reseñas publicadas",
    },
    {
      icon: "📍",
      value: stats.municipalities,
      label:
        stats.municipalities === 1
          ? "Municipio cubierto"
          : "Municipios cubiertos",
    },
  ];

  return (
    <section className="bg-blue-700 py-10 text-white sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 text-center sm:gap-8 lg:grid-cols-4">
          {items.map((item) => (
            <div
  key={item.label}
  className="min-w-0 rounded-xl bg-white/10 p-4 sm:bg-transparent sm:p-0"
>
              <div className="text-3xl sm:text-4xl">
                {item.icon}
              </div>

              <p className="mt-2 text-3xl font-extrabold sm:mt-3 sm:text-4xl">
                {loading ? "—" : item.value}
              </p>

              <p className="mt-2 text-sm leading-snug text-blue-100 sm:text-base">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}