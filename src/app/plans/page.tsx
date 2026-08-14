import type { Metadata } from "next";
import { getThemePlans } from "@/lib/content";
import { PlanRow, type PlanPosterData } from "@/components/plans/PlanPoster";
import { FeaturedPlans } from "@/components/plans/FeaturedPlans";

export const metadata: Metadata = {
  title: "Plans de lecture",
  description:
    "Choisis ton parcours comme dans un catalogue : plans mis en avant, recommandés pour toi, et le grand parcours de la Bible en 1 an.",
};

export default function PlansPage() {
  const plans = getThemePlans();

  const posters: PlanPosterData[] = plans.map((p) => ({
    href: `/plans/${p.slug}`,
    title: p.title,
    days: p.days.length,
    subtitle: p.subtitle,
    cover: p.cover,
    author: p.author,
  }));

  // Sélection mise en avant (carrousel) : les 3 premiers plans.
  const featured = posters.slice(0, 3);

  // Le grand parcours : la Bible en 1 an (route dédiée, couverture générée).
  const grand: PlanPosterData[] = [
    {
      href: "/bible-1-an",
      title: "La Bible en 1 an",
      days: 365,
      subtitle: "Un court passage chaque jour pour traverser toute la Parole en une année.",
      cover: "/img/plans/bible-1-an.svg",
    },
    ...posters.filter((p) => p.days > 60),
  ];

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
        hint="Des parcours courts selon ce que tu traverses."
        items={posters}
        startAccent={0}
      />

      {/* Grand parcours */}
      <PlanRow
        label="Grand parcours"
        hint="Un passage chaque jour, sur toute une année."
        items={grand}
        startAccent={4}
      />
    </div>
  );
}
