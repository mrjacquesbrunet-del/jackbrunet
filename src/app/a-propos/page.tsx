import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { supportCta } from "@/config/site";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Notre histoire, notre vision et notre mission : conduire chaque personne à rencontrer Jésus et grandir en Lui, chaque jour.",
};

const milestones = [
  { year: "2018", text: "Premières vidéos publiées depuis un salon, avec un téléphone." },
  { year: "2021", text: "La communauté dépasse les 100 000 personnes touchées chaque mois." },
  { year: "2023", text: "Lancement du plan de lecture quotidien et de l'espace prière." },
  { year: "2026", text: "Naissance de la plateforme — et bientôt, l'application mobile." },
];

const values = [
  {
    title: "Centré sur Jésus",
    text: "Tout part de Lui et revient à Lui. Pas une marque, pas une performance : une Personne.",
    icon: "✝",
  },
  {
    title: "Profond mais accessible",
    text: "Une foi solide, expliquée simplement, qui rejoint la vraie vie.",
    icon: "💡",
  },
  {
    title: "Quotidien",
    text: "La transformation se joue dans les petites habitudes répétées chaque jour.",
    icon: "🌅",
  },
  {
    title: "Communauté",
    text: "Personne ne grandit seul. On prie, on témoigne, on avance ensemble.",
    icon: "🤝",
  },
];

export default function AProposPage() {
  return (
    <>
      <PageHero
        eyebrow="Notre histoire"
        title={
          <>
            Conduire chacun vers <span className="text-gradient">Jésus</span>, chaque jour
          </>
        }
        description="Ce qui a commencé comme quelques vidéos est devenu une famille de plus de 120 000 personnes qui cherchent Dieu au quotidien. Voici la vision derrière tout ça."
      />

      {/* Vision */}
      <section className="container-x py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal from="left">
            <SectionHeader
              eyebrow="La vision"
              title={
                <>
                  Une foi <span className="text-gradient">vivante</span>, pas une religion poussiéreuse
                </>
              }
              description="Nous voulons offrir un espace moderne, chaleureux et profond où la rencontre avec Dieu fait partie du rythme normal de la vie — comme on consulte ses messages le matin, on vient nourrir son âme."
            />
            <p className="mt-5 text-cream/70">
              Notre mission : que personne ne se sente seul dans sa foi, et que chacun
              dispose chaque jour de ce dont il a besoin pour grandir — une parole, une
              prière, un message, une communauté.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/#aujourdhui" className="btn-primary">
                Commencer aujourd'hui
              </Link>
              <Link href={supportCta.href} className="btn-ghost">
                {supportCta.label}
              </Link>
            </div>
          </Reveal>

          <Reveal from="right" delay={0.1}>
            <div className="relative aspect-square overflow-hidden rounded-5xl border border-white/10 bg-gradient-to-br from-spirit-600 via-night-700 to-night-900">
              <div className="blob -right-10 -top-10 h-56 w-56 bg-dawn-500/30" />
              <div className="absolute inset-0 grid place-items-center p-10 text-center">
                <div>
                  <span className="font-display text-6xl">🕊</span>
                  <p className="mt-6 font-display text-2xl font-bold leading-snug text-white">
                    « Lève-toi, sois éclairée, car ta lumière arrive. »
                  </p>
                  <p className="mt-3 text-dawn-200">Ésaïe 60.1</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Valeurs */}
      <section className="border-y border-white/10 bg-night-900/50 py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeader align="center" eyebrow="Nos valeurs" title="Ce qui nous guide" />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} from="up" delay={i * 0.08}>
                <div className="glass flex h-full flex-col p-7">
                  <span className="text-3xl">{v.icon}</span>
                  <h3 className="mt-4 font-display text-lg font-bold">{v.title}</h3>
                  <p className="mt-2 text-sm text-cream/65">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Parcours */}
      <section className="container-x py-20">
        <Reveal>
          <SectionHeader align="center" eyebrow="Le chemin parcouru" title="Notre parcours" />
        </Reveal>
        <div className="mx-auto mt-12 max-w-2xl">
          {milestones.map((m, i) => (
            <Reveal key={m.year} from="left" delay={i * 0.08}>
              <div className="flex gap-5 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-dawn-400 to-spirit-500 font-display text-xs font-bold text-night-950">
                    {m.year}
                  </span>
                  {i < milestones.length - 1 ? (
                    <span className="mt-1 w-px flex-1 bg-gradient-to-b from-spirit-500/60 to-transparent" />
                  ) : null}
                </div>
                <p className="pt-3 text-cream/75">{m.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Captation email */}
      <section className="container-x pb-8">
        <Reveal>
          <div className="glass flex flex-col items-center gap-5 p-7 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="font-display text-xl font-bold">Fais partie de l'histoire</h3>
              <p className="mt-1 text-sm text-cream/65">
                Reçois la pensée du jour et suis les coulisses de la mission.
              </p>
            </div>
            <div className="w-full max-w-sm">
              <NewsletterForm source="page-a-propos" cta="Me joindre" note="" />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
