import type { Metadata } from "next";
import { getThemePlans } from "@/lib/content";
import { PlanRow, type PlanPosterData } from "@/components/plans/PlanPoster";
import { FeaturedPlans } from "@/components/plans/FeaturedPlans";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";

export const metadata: Metadata = {
  title: "Plans de lecture",
  description:
    "Choisis ton parcours comme dans un catalogue : plans mis en avant, recommandés, parcours courts, moyens et le grand parcours de la Bible en 1 an.",
};

const DEFAULT_AUTHOR = "Pasteur Jack Brunet";

const YEAR_PLAN: PlanPosterData = {
  href: "/bible-1-an",
  title: "La Bible en 1 an",
  days: 365,
  subtitle: "Un court passage chaque jour pour traverser toute la Parole en une année.",
  cover: "/img/plans/bible-1-an.webp",
  author: DEFAULT_AUTHOR,
  slug: "bible-1-an",
};

export default function PlansPage() {
  const plans = getThemePlans();

  const posters: PlanPosterData[] = plans.map((p) => ({
    href: `/plans/${p.slug}`,
    title: p.title,
    days: p.days.length,
    subtitle: p.subtitle,
    cover: p.cover,
    author: p.author ?? DEFAULT_AUTHOR,
    authorPhoto: p.authorPhoto,
    slug: p.slug,
  }));

  // Carrousel en vedette : TOUS les plans (6-7 affiches à faire défiler),
  // avec le grand parcours glissé au milieu.
  const featured: PlanPosterData[] = [...posters];
  featured.splice(Math.ceil(featured.length / 2), 0, YEAR_PLAN);

  // Sections par longueur (visibles dès qu'il existe plusieurs longueurs).
  const courts = posters.filter((p) => p.days <= 10);
  const moyens = posters.filter((p) => p.days > 10 && p.days <= 60);
  const longsThematiques = posters.filter((p) => p.days > 60);
  const lengthVariety =
    [courts.length, moyens.length, longsThematiques.length].filter((n) => n > 0).length > 1;
  const grand: PlanPosterData[] = [YEAR_PLAN, ...longsThematiques];

  // Sections par auteur : dès qu'il y a plusieurs auteurs.
  const authors = Array.from(new Set(posters.map((p) => p.author ?? DEFAULT_AUTHOR)));
  const authorRows =
    authors.length > 1
      ? authors.map((a) => ({ author: a, items: posters.filter((p) => (p.author ?? DEFAULT_AUTHOR) === a) }))
      : [];

  return (
    <div className="min-h-screen bg-night-950 pb-20 text-cream">
      <PlansDarkBg />
      {/* En-tête compact — fond noir-gris, accent lime (pas d'olive) */}
      <div className="container-x pt-7">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-dawn-400">
          Plans de lecture
        </span>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-cream">
          Trouve ton <span className="text-dawn-400">parcours</span>
        </h1>
      </div>

      {/* Carrousel des plans mis en avant (défile, auto-avance) */}
      <FeaturedPlans items={featured} />

      {/* Recommandé pour toi */}
      <PlanRow
        label="Recommandé pour toi"
        hint="Nos parcours à découvrir en premier."
        items={posters}
      />

      {/* Sections par longueur */}
      {lengthVariety ? (
        <>
          <PlanRow label="Parcours courts" hint="Quelques jours, pour une saison précise." items={courts} />
          <PlanRow label="Parcours moyens" hint="Un peu plus long, pour aller en profondeur." items={moyens} />
        </>
      ) : null}

      {/* Grand parcours */}
      <PlanRow
        label="Grand parcours"
        hint="Un passage chaque jour, sur toute une année."
        items={grand}
      />

      {/* Sections par auteur (dès qu'il y a plusieurs auteurs) */}
      {authorRows.map((row) => (
        <PlanRow key={row.author} label={`Les plans de ${row.author}`} items={row.items} />
      ))}
    </div>
  );
}
