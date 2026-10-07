import type { Metadata, Viewport } from "next";
import { Archivo, Playfair_Display, Fredoka, Caveat, Cormorant_Garamond, Bebas_Neue } from "next/font/google";
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
import { Traducteur } from "@/components/i18n/Traducteur";

// Grotesque très gras pour le corps et les titres percutants
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Serif élégant à fort contraste pour « Jack », les titres, et le mot accentué
// (italique) des cartes punchline.
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
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

// Polices du STUDIO du verset (personnalisation des images partagées).
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-script",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600"],
  style: ["normal", "italic"],
  variable: "--font-fine",
  display: "swap",
});
const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-impact",
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
    <html lang="fr" className={`${archivo.variable} ${playfair.variable} ${fredoka.variable} ${caveat.variable} ${cormorant.variable} ${bebas.variable}`}>
      <head>
        {/* Autre langue que le français : masque l'écran le temps de traduire
            (le composant Traducteur le réaffiche, 2,5 s au plus). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var l=localStorage.getItem('jb.langue');if(!l){var n=((navigator.languages&&navigator.languages[0])||navigator.language||'fr').toLowerCase();l=n.indexOf('pt')===0?'pt':n.indexOf('en')===0?'en':'fr'}if(l!=='fr'){var d=document.documentElement;d.classList.add('i18n-attente');d.lang=l==='pt'?'pt-BR':l;setTimeout(function(){d.classList.remove('i18n-attente')},2500)}}catch(e){}try{var h=document.documentElement,c=window.Capacitor,nat=!!(c&&c.isNativePlatform&&c.isNativePlatform()),pv=sessionStorage.getItem('jb.appPreview')==='1'||/[?&]app=1/.test(location.search);if((nat||pv)&&localStorage.getItem('jb.onboarded')!=='1'){h.classList.add('accueil-attente');setTimeout(function(){h.classList.remove('accueil-attente')},8000)}}catch(e){}",
          }}
        />
      </head>
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
        <Traducteur />
      </body>
    </html>
  );
}
