import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Faq } from "@/components/ui/Faq";
import { firstVisit } from "@/lib/content";

export const metadata: Metadata = {
  title: "Première visite — viens comme tu es",
  description:
    "Tu prépares ta première visite dans notre église à Pau ? Voici tout ce qu'il faut savoir : déroulement, tenue, enfants, questions fréquentes. Tu es attendu.",
  alternates: { canonical: "/premiere-visite" },
};

export default function FirstVisitPage() {
  return (
    <>
      <PageHero hero={firstVisit.hero} />

      <Section tone="light">
        <div className="wrap">
          <Reveal>
            <h2 className="display-3 max-w-2xl text-balance">{firstVisit.steps.title}</h2>
          </Reveal>
          <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {firstVisit.steps.items.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08}>
                <li className="h-full">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-night text-sm font-extrabold text-cream">
                    {i + 1}
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold tracking-tight">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-night/70">{step.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      <Section tone="dark">
        <div className="wrap grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
          <Reveal>
            <h2 className="display-3 text-balance">{firstVisit.reassurance.title}</h2>
          </Reveal>
          <div>
            {firstVisit.reassurance.items.map((item, i) => (
              <Reveal key={item} delay={i * 0.06}>
                <p className="flex items-start gap-4 border-b border-cream/10 py-6 text-lg font-semibold leading-snug">
                  <span className="mt-1.5 block h-2 w-2 shrink-0 rounded-full bg-leaf" aria-hidden />
                  {item}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="light">
        <div className="wrap">
          <Reveal>
            <h2 className="display-3 max-w-2xl text-balance">{firstVisit.faq.title}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-12 max-w-3xl">
              <Faq items={firstVisit.faq.items} />
            </div>
          </Reveal>
        </div>
      </Section>

      <Section tone="leaf">
        <div className="wrap text-center">
          <Reveal>
            <h2 className="display-2 text-balance">{firstVisit.cta.title}</h2>
            <p className="lead mx-auto mt-6 max-w-2xl text-night/75">{firstVisit.cta.text}</p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/reunions" className="btn-dark">
                {firstVisit.cta.primary}
              </Link>
              <Link href="/contact" className="btn-ghost-light">
                {firstVisit.cta.secondary}
              </Link>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
