import type { Metadata, Viewport } from "next";
import { Archivo, Playfair_Display } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EmailPopup } from "@/components/layout/EmailPopup";
import { PWA } from "@/components/pwa/PWA";

// Grotesque très gras pour le corps et les titres percutants
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Serif élégant à fort contraste pour « Jack » et les titres
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  manifest: "/manifest.webmanifest",
  keywords: [
    "ministère chrétien",
    "pensée du jour",
    "verset du jour",
    "plan de lecture biblique",
    "prière",
    "témoignages",
    "Jésus",
  ],
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  // Prépare l'usage « installable » (PWA / future app)
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#070512",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${archivo.variable} ${playfair.variable}`}>
      <body className="min-h-screen font-sans">
        {/* Grain de surface (texture subtile) */}
        <div className="bg-noise pointer-events-none fixed inset-0 z-[1] opacity-[0.035] mix-blend-multiply" />
        <Header />
        <main>{children}</main>
        <Footer />
        <EmailPopup />
        <PWA />
      </body>
    </html>
  );
}
