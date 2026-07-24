import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { settings, meetings } from "@/lib/content";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

// Police unique du site : Archivo variable (axe de largeur) — la
// typographie de la référence. Corps en largeur normale, titres
// étendus ultra-gras (font-stretch 125 %, graisse 800, capitales).
// latin-ext inclus : couverture complète du français (œ, accents…).
const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  axes: ["wdth"],
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
    <html lang="fr" className={archivo.variable}>
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
