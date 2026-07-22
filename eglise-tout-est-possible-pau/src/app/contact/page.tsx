import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { contact, settings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact — parle-nous, on répond vraiment",
  description:
    "Contacte l'Église Tout est possible Pau : première visite, demande de prière, question sur la foi. Un membre de l'équipe te répond personnellement.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero hero={contact.hero} />

      <Section tone="light">
        <div className="wrap grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-24">
          <div>
            <div className="space-y-8">
              {contact.reasons.map((reason, i) => (
                <Reveal key={reason.title} delay={i * 0.06}>
                  <div className="rounded-3xl border border-night/10 p-8 transition-colors duration-500 ease-smooth hover:border-leaf-deep sm:p-10">
                    <h2 className="text-xl font-extrabold tracking-tight">{reason.title}</h2>
                    <p className="mt-3 leading-relaxed text-night/70">{reason.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.15}>
            <div className="flex h-full flex-col justify-between rounded-3xl bg-night p-10 text-cream sm:p-12">
              <div>
                <p className="kicker">Écris-nous</p>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="link-underline mt-5 block break-words text-2xl font-extrabold tracking-tight hover:text-pulse"
                >
                  {settings.contactEmail}
                </a>
                <p className="mt-6 leading-relaxed text-cream/65">
                  Chaque message est lu par une vraie personne de l&apos;équipe. Réponse
                  sous quelques jours, souvent bien plus vite.
                </p>
              </div>
              <div className="mt-12 border-t border-cream/10 pt-8">
                <p className="kicker">Nous trouver</p>
                <address className="mt-4 space-y-1 text-sm not-italic leading-relaxed text-cream/75">
                  <p>{settings.address.venue}</p>
                  <p>{settings.address.street}</p>
                  <p>
                    {settings.address.postalCode} {settings.address.city}
                  </p>
                </address>
                <a
                  href={settings.address.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-7"
                >
                  Itinéraire
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
