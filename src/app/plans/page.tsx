import type { Metadata } from "next";
import { getThemePlans } from "@/lib/content";
import { PlanRow, type PlanPosterData } from "@/components/plans/PlanPoster";

export const metadata: Metadata = {
  title: "Plans de lecture",
  description:
    "Choisis ton parcours comme dans un catalogue : petits parcours de quelques jours, parcours moyens, ou le grand parcours de la Bible en 1 an.",
};

export default function PlansPage() {
  const plans = getThemePlans();

  // Chaque plan devient une « affiche » du catalogue.
  const posters: PlanPosterData[] = plans.map((p) => ({
    href: `/plans/${p.slug}`,
    title: p.title,
    days: p.days.length,
    subtitle: p.subtitle,
    cover: p.cover,
    author: p.author,
  }));

  // Répartition par longueur de parcours.
  const petits = posters.filter((p) => p.days <= 10);
  const moyens = posters.filter((p) => p.days > 10 && p.days <= 60);

  // Le grand parcours : la Bible en 1 an (route dédiée).
  const grand: PlanPosterData[] = [
    { href: "/bible-1-an", title: "La Bible en 1 an", days: 365 },
    ...posters.filter((p) => p.days > 60),
  ];

  return (
    <>
      {/* Héros du catalogue — photo en arrière-plan, texte centré au-dessus.
          Pour changer l'image : dépose ta photo dans public/img/plans-hero.webp
          puis décommente la balise <img> ci-dessous (le dégradé sert de repli). */}
      <section className="relative overflow-hidden">
        <div className="relative aspect-[16/10] w-full sm:aspect-[21/9] lg:max-h-[460px]">
          {/* Repli visuel : dégradé de la charte + texture topographique */}
          <div className="absolute inset-0 bg-gradient-to-br from-spirit-700 via-night-900 to-night-950" />
          <div className="bg-topo-dark absolute inset-0 opacity-20" />
          {/*
          <img
            src={asset("/img/plans-hero.webp")}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          */}
          <div className="absolute inset-0 bg-gradient-to-t from-night-950/90 via-night-950/40 to-night-950/30" />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <span className="eyebrow text-dawn-300">Tes parcours</span>
            <h1 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight text-cream sm:text-4xl lg:text-5xl">
              Avance un jour <span className="text-dawn-300">à la fois</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-cream/75 sm:text-base">
              Choisis ton parcours selon ce que tu traverses. Une méditation
              courte et des versets chaque jour, à ton rythme.
            </p>
          </div>
        </div>
      </section>

      <div className="pb-16 pt-2">
        <PlanRow
          label="Petits parcours"
          hint="Quelques jours pour traverser une saison précise."
          items={petits}
          startAccent={0}
        />
        <PlanRow
          label="Parcours moyens"
          hint="Un peu plus long, pour aller en profondeur."
          items={moyens}
          startAccent={2}
        />
        <PlanRow
          label="Grand parcours"
          hint="Un passage chaque jour, sur toute une année."
          items={grand}
          startAccent={4}
        />
      </div>
    </>
  );
}
