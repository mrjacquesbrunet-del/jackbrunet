import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { legal } from "@/lib/content";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité du site de l'Église Tout est possible Pau : données collectées, cookies, droits RGPD.",
  alternates: { canonical: "/confidentialite" },
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <Section tone="light" className="!pt-40 sm:!pt-48">
      <div className="wrap max-w-3xl">
        <h1 className="display-2">{legal.privacy.title}</h1>
        <p className="lead mt-8 text-night/70">{legal.privacy.intro}</p>
        {legal.privacy.sections.map((section) => (
          <section key={section.title} className="mt-14">
            <h2 className="text-2xl font-extrabold tracking-tight">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="mt-4 leading-relaxed text-night/70">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </Section>
  );
}
