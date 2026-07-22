import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { legal } from "@/lib/content";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site de l'Église Tout est possible Pau.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: false },
};

export default function LegalPage() {
  return (
    <Section tone="light" className="!pt-40 sm:!pt-48">
      <div className="wrap max-w-3xl">
        <h1 className="display-2">{legal.mentions.title}</h1>
        {legal.mentions.sections.map((section) => (
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
