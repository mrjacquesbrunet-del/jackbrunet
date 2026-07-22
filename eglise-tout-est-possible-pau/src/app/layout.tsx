import type { Metadata, Viewport } from "next";
import { Caveat, Montserrat, Righteous } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { settings, meetings } from "@/lib/content";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

// Corps de texte : Montserrat, moderne et lisible.
// latin-ext inclus partout : couverture complète du français (œ, accents…).
const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

// Display stylé pour les titres géants : Righteous, l'équivalent libre
// le plus proche de Loubag (géométrique, arrondi, rétro).
//
// Pour passer à la vraie Loubag (licence requise) : déposer les fichiers
// dans src/fonts/ puis remplacer le bloc ci-dessous par :
//   import localFont from "next/font/local";
//   const displayFont = localFont({
//     src: [{ path: "../fonts/Loubag-Bold.woff2", weight: "700" }],
//     variable: "--font-display",
//     display: "swap",
//   });
const displayFont = Righteous({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

// Manuscrite élégante : les mots d'accent qui contrastent avec l'affiche.
const caveat = Caveat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.fullName} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.fullName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.fullName,
  keywords: [
    "église Pau",
    "église évangélique Pau",
    "église protestante Pau",
    "église Pyrénées-Atlantiques",
    "église Béarn",
    "culte Pau",
    "Tout est possible Pau",
    "découvrir la foi",
    "Jésus",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.fullName,
    title: `${siteConfig.fullName} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.fullName} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
};

// Données structurées Schema.org — SEO local (Pau, Pyrénées-Atlantiques)
// et fiche Google Business Profile.
function churchJsonLd() {
  const sunday = meetings.items.find((m) => m.highlight);
  return {
    "@context": "https://schema.org",
    "@type": "Church",
    name: siteConfig.fullName,
    alternateName: settings.shortName,
    description: siteConfig.description,
    url: siteConfig.url,
    email: settings.contactEmail,
    address: {
      "@type": "PostalAddress",
      addressLocality: settings.address.city,
      postalCode: settings.address.postalCode,
      addressRegion: "Pyrénées-Atlantiques",
      addressCountry: "FR",
    },
    areaServed: ["Pau", "Pyrénées-Atlantiques", "Béarn"],
    sameAs: Object.values(settings.social).filter(Boolean),
    ...(sunday
      ? {
          event: {
            "@type": "Event",
            name: sunday.title,
            description: sunday.description,
            eventSchedule: {
              "@type": "Schedule",
              byDay: "https://schema.org/Sunday",
              startTime: "10:30",
              repeatFrequency: "P1W",
            },
            location: {
              "@type": "Place",
              name: settings.address.venue,
              address: {
                "@type": "PostalAddress",
                addressLocality: settings.address.city,
                postalCode: settings.address.postalCode,
                addressCountry: "FR",
              },
            },
          },
        }
      : {}),
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${montserrat.variable} ${displayFont.variable} ${caveat.variable}`}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(churchJsonLd()) }}
        />
        <ScrollProgress />
        <Header />
        <main id="contenu">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
