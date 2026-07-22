import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { giving, settings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Faire un don — la générosité change des vies",
  description:
    "Soutiens l'Église Tout est possible Pau : dons sécurisés via HelloAsso, transparence totale, reçu fiscal (66 % déductible). Merci de faire partie de l'histoire.",
  alternates: { canonical: "/dons" },
};

export default function GivingPage() {
  return (
    <>
      <PageHero hero={giving.hero} />

      <Section tone="light">
        <div className="wrap">
          <Reveal>
            <h2 className="display-3">{giving.why.title}</h2>
          </Reveal>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {giving.why.items.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="h-full rounded-3xl border border-night/10 p-10 transition-colors duration-500 ease-smooth hover:border-leaf-deep">
                  <h3 className="text-2xl font-extrabold tracking-tight">{item.title}</h3>
                  <p className="mt-4 leading-relaxed text-night/70">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Don HelloAsso */}
      <Section tone="dark" className="grain overflow-hidden">
        <div className="glow-leaf absolute -top-32 right-0 h-[30rem] w-[40rem]" aria-hidden />
        <div className="wrap relative grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <h2 className="display-2 text-balance">{giving.how.title}</h2>
            <p className="lead mt-6 text-cream/75">{giving.how.text}</p>
            <a
              href={settings.helloasso.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-10"
            >
              {giving.how.cta}
            </a>
            <p className="mt-6 text-sm text-cream/55">
              {giving.how.note}{" "}
              <Link href="/contact" className="link-underline font-semibold text-cream/80">
                Nous contacter
              </Link>
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            {settings.helloasso.widgetUrl ? (
              <iframe
                src={settings.helloasso.widgetUrl}
                title="Faire un don — HelloAsso"
                className="h-[560px] w-full rounded-3xl border-0 bg-cream"
                loading="lazy"
              />
            ) : (
              <div className="rounded-3xl bg-night-soft p-10 sm:p-12">
                <p className="kicker">Reçu fiscal</p>
                <p className="mt-4 text-5xl font-extrabold tracking-tight text-leaf sm:text-6xl">
                  66 %
                </p>
                <p className="mt-4 leading-relaxed text-cream/70">
                  de ton don est déductible de tes impôts. Un don de 100 € ne te coûte
                  réellement que 34 €, dans les limites prévues par la loi.
                </p>
              </div>
            )}
          </Reveal>
        </div>
      </Section>

      <Section tone="light">
        <div className="wrap max-w-4xl">
          <Reveal>
            <h2 className="display-3">{giving.transparency.title}</h2>
            <ul className="mt-10 space-y-0 divide-y divide-night/10">
              {giving.transparency.items.map((item) => (
                <li key={item} className="flex items-start gap-4 py-5 text-lg leading-snug">
                  <span className="mt-2 block h-2 w-2 shrink-0 rounded-full bg-leaf-deep" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
