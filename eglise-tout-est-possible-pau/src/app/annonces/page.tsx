import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import newsletter from "../../../content/newsletter.json";

export const metadata: Metadata = {
  title: "Reçois les annonces par mail",
  description:
    "Inscris-toi pour recevoir les annonces de l'Église Tout est possible Pau directement par e-mail : événements, horaires et infos de la semaine.",
  alternates: { canonical: "/annonces" },
};

export default function NewsletterPage() {
  return (
    <>
      <PageHero hero={newsletter.hero} />

      <Section tone="light">
        <div className="wrap grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
          <Reveal>
            <div className="rounded-3xl bg-pulse p-8 sm:p-12">
              <h2 className="display-3">Inscris-toi en 10 secondes.</h2>
              <div className="mt-8">
                <NewsletterForm />
              </div>
            </div>
          </Reveal>

          <div className="space-y-8">
            {newsletter.benefits.map((benefit, i) => (
              <Reveal key={benefit.title} delay={i * 0.06}>
                <div className="border-b border-night/10 pb-8">
                  <h3 className="text-xl font-extrabold tracking-tight">{benefit.title}</h3>
                  <p className="mt-3 leading-relaxed text-night/70">{benefit.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
