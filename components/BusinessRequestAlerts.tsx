"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export default function BusinessRequestAlerts() {
  const [businessId, setBusinessId] =
    useState<number | null>(null);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [showToast, setShowToast] =
    useState(false);

  const toastTimerRef =
    useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let setupVersion = 0;

    let realtimeChannel:
      | ReturnType<typeof supabase.channel>
      | null = null;

    function clearToastTimer() {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    }

    function removeRealtimeChannel() {
      if (realtimeChannel) {
        void supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
    }

    function showNewRequestNotification() {
      setShowToast(true);

      clearToastTimer();

      toastTimerRef.current = window.setTimeout(
        () => {
          setShowToast(false);
          toastTimerRef.current = null;
        },
        8000
      );
    }

    async function startForSession(
      session: Session | null
    ) {
      const currentVersion = ++setupVersion;

      removeRealtimeChannel();

      setBusinessId(null);
      setUnreadCount(0);
      setShowToast(false);

      if (!session) {
        return;
      }

      const isAdmin =
  session.user.app_metadata?.role === "admin";

if (isAdmin) {
  return;
}

      const { data: business, error: businessError } =
        await supabase
          .from("business_registrations")
          .select("id")
          .eq("owner_user_id", session.user.id)
          .maybeSingle();

      if (
        cancelled ||
        currentVersion !== setupVersion
      ) {
        return;
      }

      if (businessError || !business) {
        if (businessError) {
          console.error(
            "No se pudo cargar el negocio para las notificaciones:",
            businessError
          );
        }

        return;
      }

      const currentBusinessId = business.id;

      setBusinessId(currentBusinessId);

      async function refreshUnreadCount() {
        const { count, error } = await supabase
          .from("quote_requests")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq(
            "business_id",
            currentBusinessId
          )
          .eq("is_read", false);

        if (
          cancelled ||
          currentVersion !== setupVersion
        ) {
          return;
        }

        if (error) {
          console.error(
            "No se pudieron contar las solicitudes nuevas:",
            error
          );

          return;
        }

        setUnreadCount(count ?? 0);
      }

      await refreshUnreadCount();

      if (
        cancelled ||
        currentVersion !== setupVersion
      ) {
        return;
      }

      realtimeChannel = supabase
        .channel(
          `business-notifications-${currentBusinessId}`
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "quote_requests",
            filter:
              `business_id=eq.${currentBusinessId}`,
          },
          () => {
            setUnreadCount(
              (current) => current + 1
            );

            showNewRequestNotification();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "quote_requests",
            filter:
              `business_id=eq.${currentBusinessId}`,
          },
          () => {
            void refreshUnreadCount();
          }
        )
        .subscribe();
    }

    async function initialize() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) {
        return;
      }

      await startForSession(session);
    }

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        window.setTimeout(() => {
          if (!cancelled) {
            void startForSession(session);
          }
        }, 0);
      }
    );

    return () => {
      cancelled = true;
      setupVersion += 1;

      subscription.unsubscribe();
      removeRealtimeChannel();
      clearToastTimer();
    };
  }, []);

  if (businessId === null) {
    return null;
  }

  return (
    <>
      <Link
        href="/businesses/dashboard"
        aria-label={`${unreadCount} solicitudes nuevas`}
        title="Solicitudes del negocio"
        className="fixed bottom-5 right-4 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-2xl text-white shadow-xl transition hover:scale-105 hover:bg-blue-800 sm:bottom-6 sm:right-6"
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </Link>

      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-4 right-4 top-20 z-[80] rounded-xl border border-yellow-300 bg-yellow-50 p-4 shadow-2xl sm:left-auto sm:right-6 sm:w-96"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-yellow-900">
                🔔 Nueva solicitud de cotización
              </p>

              <p className="mt-1 text-sm text-yellow-800">
                Un cliente envió una solicitud nueva a tu negocio.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowToast(false);

                if (
                  toastTimerRef.current !== null
                ) {
                  window.clearTimeout(
                    toastTimerRef.current
                  );

                  toastTimerRef.current = null;
                }
              }}
              aria-label="Cerrar notificación"
              className="text-xl font-bold text-yellow-900"
            >
              ✕
            </button>
          </div>

          <Link
            href="/businesses/dashboard"
            onClick={() =>
              setShowToast(false)
            }
            className="mt-3 inline-block font-bold text-blue-700 hover:underline"
          >
            Ver solicitudes →
          </Link>
        </div>
      )}
    </>
  );
}