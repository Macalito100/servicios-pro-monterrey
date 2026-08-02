"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [loggedIn, setLoggedIn] = useState(false);
  const [accountType, setAccountType] =
    useState<string | null>(null);

  const [accessMenuOpen, setAccessMenuOpen] =
    useState(false);

  const [accountMenuOpen, setAccountMenuOpen] =
    useState(false);
const [mobileMenuOpen, setMobileMenuOpen] =
  useState(false);
useEffect(() => {
  setMobileMenuOpen(false);
  setAccessMenuOpen(false);
  setAccountMenuOpen(false);
}, [pathname]);
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

const isAdmin =
  session.user.app_metadata?.role === "admin";

setAccountType(
  isAdmin
    ? "admin"
    : metadataType === "customer"
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

const isAdmin =
  session.user.app_metadata?.role === "admin";

setAccountType(
  isAdmin
    ? "admin"
    : metadataType === "customer"
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
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <Link
          href="/"
          className="max-w-[13rem] text-lg font-bold leading-tight text-blue-700 sm:max-w-64 sm:text-xl"
        >
          Servicios Pro Monterrey México
        </Link>
<button
  type="button"
  onClick={() =>
    setMobileMenuOpen((current) => !current)
  }
  aria-label="Abrir menú"
  aria-expanded={mobileMenuOpen}
  className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 text-2xl text-gray-700 md:hidden"
>
  {mobileMenuOpen ? "✕" : "☰"}
</button>
        <div
  className={`${
    mobileMenuOpen ? "flex" : "hidden"
  } order-3 w-full flex-col gap-2 border-t border-gray-100 pt-3 md:order-none md:flex md:w-auto md:flex-row md:items-center md:justify-end md:gap-3 md:border-0 md:pt-0`}
>
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
            <div className="relative w-full md:w-auto">
              <button
                type="button"
                onClick={() =>
                  setAccessMenuOpen((current) => !current)
                }
                className="w-full rounded border border-blue-700 px-4 py-3 font-semibold text-blue-700 hover:bg-blue-50 md:w-auto md:py-2"
              >
                Acceder ▾
              </button>

              {accessMenuOpen && (
                <div className="mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl md:absolute md:right-0 md:top-full md:w-72">
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
            <div className="relative w-full md:w-auto">
              <button
                type="button"
                onClick={() =>
                  setAccountMenuOpen((current) => !current)
                }
                className="w-full rounded bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 md:w-auto md:py-2"
              >
                👤 Mi cuenta ▾
              </button>

              {accountMenuOpen && (
                <div className="mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl md:absolute md:right-0 md:top-full md:w-60">
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
{accountType === "admin" && (
  <Link
    href="/admin/businesses"
    onClick={() =>
      setAccountMenuOpen(false)
    }
    className="block px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
  >
    🛡️ Panel de administración
  </Link>
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

          {(!loggedIn || accountType === "customer") && (
  <Link
    href="/quote"
    className="block w-full whitespace-nowrap rounded bg-green-600 px-4 py-3 text-center font-semibold text-white hover:bg-green-700 md:w-auto md:py-2"
  >
    Cotizar
  </Link>
)}
        </div>
      </div>
    </nav>
  );
}