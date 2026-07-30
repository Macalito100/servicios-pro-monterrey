"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [accountType, setAccountType] =
    useState<string | null>(null);

  const [accessMenuOpen, setAccessMenuOpen] =
    useState(false);

  const [accountMenuOpen, setAccountMenuOpen] =
    useState(false);

  useEffect(() => {
    async function loadUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    setLoggedIn(false);
    setAccountType(null);
    return;
  }

  setLoggedIn(true);

  const metadataType =
    session.user.user_metadata?.account_type;

  setAccountType(
    metadataType === "customer"
      ? "customer"
      : "business"
  );
}

    loadUser();

    const {
  data: { subscription },
} = supabase.auth.onAuthStateChange(
  (_event, session) => {
    if (!session) {
      setLoggedIn(false);
      setAccountType(null);
      return;
    }

    setLoggedIn(true);

    const metadataType =
      session.user.user_metadata?.account_type;

    setAccountType(
      metadataType === "customer"
        ? "customer"
        : "business"
    );
  }
);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(
        "No se pudo cerrar la sesión:",
        error
      );

      alert("No se pudo cerrar la sesión.");
      return;
    }

    setLoggedIn(false);
    setAccountType(null);
    setAccountMenuOpen(false);

    router.push("/");
    router.refresh();
  }

  return (
    <nav className="relative z-50 bg-white shadow">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link
          href="/"
          className="max-w-64 text-xl font-bold leading-tight text-blue-700"
        >
          Servicios Pro Monterrey México
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link
            href="/"
            className="whitespace-nowrap rounded px-3 py-2 font-medium text-gray-700 hover:bg-gray-100"
          >
            Página principal
          </Link>

          <Link
            href="/services"
            className="whitespace-nowrap rounded px-3 py-2 font-medium text-gray-700 hover:bg-gray-100"
          >
            Servicios
          </Link>

          <Link
            href="/contractors"
            className="whitespace-nowrap rounded px-3 py-2 font-medium text-gray-700 hover:bg-gray-100"
          >
            Contratistas
          </Link>

          {loggedIn && accountType === "customer" && (
            <Link
              href="/favorites"
              className="whitespace-nowrap rounded px-3 py-2 font-medium text-gray-700 hover:bg-gray-100"
            >
              ❤️ Favoritos
            </Link>
          )}

          {!loggedIn && (
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setAccessMenuOpen((current) => !current)
                }
                className="rounded border border-blue-700 px-4 py-2 font-semibold text-blue-700 hover:bg-blue-50"
              >
                Acceder ▾
              </button>

              {accessMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                  <div className="border-b border-gray-100 p-4">
                    <p className="font-bold text-gray-900">
                      👤 Cliente
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Guarda favoritos y administra tus solicitudes.
                    </p>

                    <Link
                      href="/customer/login"
                      onClick={() =>
                        setAccessMenuOpen(false)
                      }
                      className="mt-3 block rounded bg-blue-700 px-4 py-2 text-center font-semibold text-white hover:bg-blue-800"
                    >
                      Iniciar sesión como cliente
                    </Link>

<Link
  href="/customer/register"
  onClick={() => setAccessMenuOpen(false)}
  className="mt-2 block rounded border border-blue-700 px-4 py-2 text-center font-semibold text-blue-700 hover:bg-blue-50"
>
  Crear cuenta de cliente
</Link>

                  </div>

                  <div className="p-4">
                    <p className="font-bold text-gray-900">
                      🏢 Empresa
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Administra tu perfil y recibe solicitudes.
                    </p>

                    <Link
                      href="/businesses/login"
                      onClick={() =>
                        setAccessMenuOpen(false)
                      }
                      className="mt-3 block rounded bg-gray-800 px-4 py-2 text-center font-semibold text-white hover:bg-gray-900"
                    >
                      Iniciar sesión como empresa
                    </Link>

                    <Link
  href="/businesses/signup"
  onClick={() => setAccessMenuOpen(false)}
  className="mt-2 block rounded border border-blue-700 px-4 py-2 text-center font-semibold text-blue-700"
>
  Registrar negocio
</Link>
                    
                  </div>
                </div>
              )}
            </div>
          )}

          {loggedIn && (
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setAccountMenuOpen((current) => !current)
                }
                className="rounded bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
              >
                👤 Mi cuenta ▾
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                  {accountType === "customer" && (
                    <>
                      <Link
                        href="/customer/dashboard"
                        onClick={() =>
                          setAccountMenuOpen(false)
                        }
                        className="block px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Mi panel
                      </Link>

                      <Link
                        href="/favorites"
                        onClick={() =>
                          setAccountMenuOpen(false)
                        }
                        className="block px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                      >
                        ❤️ Mis favoritos
                      </Link>
                    </>
                  )}

                  {accountType === "business" && (
  <>
    <Link
      href="/businesses/dashboard"
      onClick={() =>
        setAccountMenuOpen(false)
      }
      className="block px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
    >
      📊 Panel del negocio
    </Link>

    <Link
      href="/businesses/profile"
      onClick={() =>
        setAccountMenuOpen(false)
      }
      className="block px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
    >
      🏢 Mi perfil
    </Link>
  </>
)}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full border-t border-gray-100 px-4 py-3 text-left font-semibold text-red-600 hover:bg-red-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}

          {accountType !== "business" && (
  <Link
    href="/quote"
    className="whitespace-nowrap rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
  >
    Cotizar
  </Link>
)}
        </div>
      </div>
    </nav>
  );
}