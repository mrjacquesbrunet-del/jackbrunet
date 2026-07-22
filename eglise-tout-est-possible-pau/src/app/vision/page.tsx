import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { WordReveal } from "@/components/ui/WordReveal";
import { withScript } from "@/lib/script";
import { vision } from "@/lib/content";

export const metadata: Metadata = {
  title: "Vision — Annoncer, Restaurer, Équiper, Envoyer",
  description:
    "La vision de l'Église Tout est possible Pau : annoncer la bonne nouvelle, restaurer des vies, équiper chacun et envoyer une génération rayonner à Pau et au-delà.",
  alternates: { canonical: "/vision" },
};

export default function VisionPage() {
  return (
    <>
      <PageHero hero={vision.hero} />

      <Section tone="light">
        <div className="wrap">
          <Reveal>
            <h2 className="display-3 max-w-2xl text-balance">{vision.mission.title}</h2>
          </Reveal>
          <div className="mt-14 space-y-8">
            {vision.mission.items.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.05}>
                <article className="grid gap-6 rounded-3xl border border-night/10 p-10 transition-colors duration-500 ease-smooth hover:border-leaf-deep sm:p-12 lg:grid-cols-[1fr_2fr] lg:gap-14">
                  <div>
                    <span className="text-sm font-bold text-leaf-deep">0{i + 1}</span>
                    <h3 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                      {item.title}
                    </h3>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-kicker text-night/50">
                      {item.verse}
                    </p>
                    <p className="lead mt-4 text-night/70">{item.text}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="dark" className="grain overflow-hidden">
        <div className="glow-leaf absolute -top-32 left-1/2 h-[36rem] w-[56rem] -translate-x-1/2" aria-hidden />
        <div className="wrap relative text-center">
          <Reveal>
            <p className="kicker">{vision.love.kicker}</p>
            <h2 className="display-1 mt-6 text-pulse drop-shadow-[0_0_40px_rgba(48,255,18,0.3)]">
              {withScript(vision.love.title)}
            </h2>
            <WordReveal
              text={vision.love.text}
              dimOpacity={0.3}
              className="lead mx-auto mt-8 max-w-2xl text-cream"
            />
          </Reveal>
        </div>
      </Section>

      <Section tone="light">
        <div className="wrap max-w-4xl">
          <Reveal>
            <h2 className="display-3">{vision.dream.title}</h2>
            {vision.dream.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="lead mt-6 text-night/70">
                {paragraph}
              </p>
            ))}
          </Reveal>
        </div>
      </Section>
    </>
  );
}
