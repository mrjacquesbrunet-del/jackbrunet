import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Archivo, Playfair_Display } from "next/font/google";
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
  // Empêche le zoom (pincer/double-tap) pour une appli stable, sans décalage.
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${archivo.variable} ${playfair.variable}`}>
      <body className="min-h-screen font-sans">
        {/*
          Garde d'accueil « avant React » : dans l'app (ou l'aperçu ?app=1),
          l'accueil marketing « / » ne doit JAMAIS s'afficher. On redirige vers
          « Mon temps avec Jésus » dès l'analyse du HTML, AVANT même le
          chargement de React — ainsi un clic sur le rappel du matin ne peut
          plus rester bloqué sur un voile olive si l'hydratation tarde/échoue.
          Sur le site web classique (pas de Capacitor, pas de ?app=1) : sans
          effet, l'accueil s'affiche normalement.
        */}
        <Script id="app-home-redirect" strategy="beforeInteractive">
          {"(function(){try{var p=(location.pathname||'').replace(/\\/+$/,'');" +
            "if(!(p===''||p==='/index'||/(^|\\/)index$/.test(p)))return;" +
            "var n=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());" +
            "var s=new URLSearchParams(location.search),pv=s.get('app')==='1';" +
            "try{if(!pv)pv=sessionStorage.getItem('jb.appPreview')==='1';}catch(e){}" +
            "if(n||pv){location.replace('/devotionnel/');}}catch(e){}})();"}
        </Script>
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
