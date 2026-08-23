import type { Metadata, Viewport } from "next";
import { Archivo, Playfair_Display, Fredoka } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EmailPopup } from "@/components/layout/EmailPopup";
import { PWA } from "@/components/pwa/PWA";
import { NativeBootstrap } from "@/components/pwa/NativeBootstrap";
import { CloudSync } from "@/components/community/CloudSync";
import { AppShell } from "@/components/app/AppShell";
import { GlobalAudioBar } from "@/components/audio/GlobalAudioBar";
import { Analytics } from "@/components/app/Analytics";

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

// Sans arrondie et joueuse, réservée au jeu de mémorisation (esprit jeu mobile)
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-game",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name}, ${siteConfig.tagline}`,
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
    title: `${siteConfig.name}, ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [{ url: "/img/og-app.png", width: 1200, height: 630, alt: "RHEMA – Ton temps avec Jésus" }],
  },
  // Prépare l'usage « installable » (PWA / future app)
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#0C0C0B",
  width: "device-width",
  initialScale: 1,
  // Empêche le zoom (pincer/double-tap) pour une appli stable, sans décalage.
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${archivo.variable} ${playfair.variable} ${fredoka.variable}`}>
      <body className="min-h-screen font-sans">
        {/* Grain de surface (texture subtile) */}
        <div className="bg-noise pointer-events-none fixed inset-0 z-[1] opacity-[0.035] mix-blend-multiply" />
        <Header />
        <main>{children}</main>
        <Footer />
        <EmailPopup />
        <PWA />
        <NativeBootstrap />
        <CloudSync />
        <AppShell />
        <GlobalAudioBar />
        <Analytics />
      </body>
    </html>
  );
}
