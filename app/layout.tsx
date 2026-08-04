import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BusinessRequestAlerts from "@/components/BusinessRequestAlerts";
import SiteFooter from "@/components/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://servicios-pro-monterrey.vercel.app"
  ),

  title: {
    default: "Servicios Pro Monterrey México",
    template:
      "%s | Servicios Pro Monterrey México",
  },

  description:
    "Encuentra profesionales confiables para tu hogar o negocio en Monterrey y su área metropolitana. Solicita cotizaciones y consulta perfiles, portafolios y reseñas.",

  applicationName:
    "Servicios Pro Monterrey México",

  keywords: [
    "servicios profesionales Monterrey",
    "contratistas Monterrey",
    "profesionales para el hogar",
    "servicios para negocios",
    "electricistas Monterrey",
    "plomeros Monterrey",
    "cotizaciones Monterrey",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Servicios Pro Monterrey México",
    description:
      "Encuentra profesionales confiables para tu hogar o negocio en Monterrey y su área metropolitana.",
    url: "/",
    siteName: "Servicios Pro Monterrey México",
    locale: "es_MX",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Servicios Pro Monterrey México",
    description:
      "Encuentra profesionales confiables para tu hogar o negocio en Monterrey.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
    <body className="flex min-h-full flex-col">
  <Navbar />
  <BusinessRequestAlerts />
  {children}
  <SiteFooter />
</body>
    </html>
  );
}
