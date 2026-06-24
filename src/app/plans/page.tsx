import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { getThemePlans } from "@/lib/content";

export const metadata: Metadata = {
  title: "Plans thématiques",
  description:
    "Des parcours de méditation par thème — peur, anxiété, foi, Saint-Esprit, identité — avec une méditation et des versets chaque jour.",
};

export default function PlansPage() {
  const plans = getThemePlans();

  return (
    <>
      <PageHero
        eyebrow="Plans thématiques"
        title={
          <>
            Avance pas à pas, <span className="text-gradient">thème par thème</span>
          </>
        }
        description="Choisis un parcours selon ce que tu traverses. Chaque jour : une méditation courte et des versets à lire. À ton rythme."
      />

      <section className="container-x py-12">
        <div className="grid gap-6 sm:grid-cols-2">
          {plans.map((p, i) => (
            <Reveal key={p.slug} from="up" delay={i * 0.06}>
              <Link
                href={`/plans/${p.slug}`}
                className="group flex h-full flex-col rounded-3xl border border-night-900/10 bg-white p-7 transition-all hover:-translate-y-1 hover:border-dawn-400/50 hover:shadow-card"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-spirit-600">
                  {p.days.length} jours
                </span>
                <h2 className="mt-3 font-display text-2xl font-extrabold">{p.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-night-900/65">
                  {p.subtitle}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 font-semibold text-spirit-700">
                  Commencer
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
