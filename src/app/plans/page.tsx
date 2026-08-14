import type { Metadata } from "next";
import { getThemePlans } from "@/lib/content";
import { PlanRow, type PlanPosterData } from "@/components/plans/PlanPoster";
import { FeaturedPlans } from "@/components/plans/FeaturedPlans";

export const metadata: Metadata = {
  title: "Plans de lecture",
  description:
    "Choisis ton parcours comme dans un catalogue : plans mis en avant, recommandés, parcours courts, moyens et le grand parcours de la Bible en 1 an.",
};

const DEFAULT_AUTHOR = "Pasteur Jack Brunet";

export default function PlansPage() {
  const plans = getThemePlans();

  const posters: PlanPosterData[] = plans.map((p) => ({
    href: `/plans/${p.slug}`,
    title: p.title,
    days: p.days.length,
    subtitle: p.subtitle,
    cover: p.cover,
    author: p.author ?? DEFAULT_AUTHOR,
  }));

  // Carrousel mis en avant : les 3 premiers plans.
  const featured = posters.slice(0, 3);

  // Sections par longueur de parcours. On ne les affiche que lorsqu'il existe
  // vraiment plusieurs longueurs parmi les plans thématiques : sinon
  // « Parcours courts » ferait doublon avec « Recommandé pour toi ».
  const courts = posters.filter((p) => p.days <= 10);
  const moyens = posters.filter((p) => p.days > 10 && p.days <= 60);
  const longsThematiques = posters.filter((p) => p.days > 60);
  const lengthVariety =
    [courts.length, moyens.length, longsThematiques.length].filter((n) => n > 0).length > 1;
  const grand: PlanPosterData[] = [
    {
      href: "/bible-1-an",
      title: "La Bible en 1 an",
      days: 365,
      subtitle: "Un court passage chaque jour pour traverser toute la Parole en une année.",
      cover: "/img/plans/bible-1-an.webp",
      author: DEFAULT_AUTHOR,
    },
    ...posters.filter((p) => p.days > 60),
  ];

  // Sections par auteur : n'apparaissent que lorsqu'il y a plusieurs auteurs.
  const authors = Array.from(new Set(posters.map((p) => p.author ?? DEFAULT_AUTHOR)));
  const authorRows =
    authors.length > 1
      ? authors.map((a) => ({ author: a, items: posters.filter((p) => (p.author ?? DEFAULT_AUTHOR) === a) }))
      : [];

  return (
    <div className="pb-16">
      {/* En-tête compact */}
      <div className="container-x pt-6">
        <span className="eyebrow text-spirit-600">Plans de lecture</span>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-night-900">
          Trouve ton <span className="text-gradient">parcours</span>
        </h1>
      </div>

      {/* Carrousel des plans mis en avant */}
      <FeaturedPlans items={featured} />

      {/* Recommandé pour toi */}
      <PlanRow
        label="Recommandé pour toi"
        hint="Nos parcours à découvrir en premier."
        items={posters}
        startAccent={0}
      />

      {/* Sections par longueur — visibles dès qu'il existe plusieurs longueurs */}
      {lengthVariety ? (
        <>
          <PlanRow
            label="Parcours courts"
            hint="Quelques jours, pour une saison précise."
            items={courts}
            startAccent={0}
          />
          <PlanRow
            label="Parcours moyens"
            hint="Un peu plus long, pour aller en profondeur."
            items={moyens}
            startAccent={2}
          />
        </>
      ) : null}

      <PlanRow
        label="Grand parcours"
        hint="Un passage chaque jour, sur toute une année."
        items={grand}
        startAccent={4}
      />

      {/* Sections par auteur (dès qu'il y a plusieurs auteurs) */}
      {authorRows.map((row, i) => (
        <PlanRow
          key={row.author}
          label={`Les plans de ${row.author}`}
          items={row.items}
          startAccent={i}
        />
      ))}
    </div>
  );
}
