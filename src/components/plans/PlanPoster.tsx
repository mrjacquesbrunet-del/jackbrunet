import Link from "next/link";
import { asset } from "@/lib/asset";
import { AuthorChip } from "@/components/plans/AuthorChip";
import { PosterRating } from "@/components/plans/PosterRating";

/** Position du halo lime sur la couverture (varie d'une affiche à l'autre pour
 * donner du rythme au catalogue, même sans photo). */
const GLOWS = [
  "80% 15%",
  "20% 20%",
  "50% 0%",
  "85% 80%",
  "15% 85%",
];

export type PlanPosterData = {
  href: string;
  title: string;
  days: number;
  subtitle?: string;
  cover?: string;
  author?: string;
  slug?: string;
};

/** Couverture d'un plan : image si fournie, sinon fond sombre RHEMA + halo lime
 * (position variable) + texture. Voile en bas pour la lisibilité du texte.
 * Réutilisée par les vignettes du catalogue et par le carrousel en vedette. */
export function PlanCover({ cover, glowIndex = 0 }: { cover?: string; glowIndex?: number }) {
  const glow = GLOWS[glowIndex % GLOWS.length];
  return (
    <>
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset(cover)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-night-800 to-night-950">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(60% 55% at ${glow}, rgb(202 240 0 / 0.30), transparent 70%)`,
            }}
          />
          <div className="bg-topo-dark absolute inset-0 opacity-[0.22]" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-night-950/85 via-night-950/10 to-transparent" />
    </>
  );
}

/**
 * Vignette de plan façon « affiche » (catalogue type Netflix) : couverture
 * (image ou dégradé de la charte), badge du nombre de jours, titre, auteur.
 */
export function PlanPoster({
  data,
  accentIndex = 0,
}: {
  data: PlanPosterData;
  accentIndex?: number;
}) {
  const glow = GLOWS[accentIndex % GLOWS.length];
  return (
    <Link
      href={data.href}
      className="group relative flex w-[46vw] max-w-[220px] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-white/10 shadow-card transition-transform duration-200 hover:-translate-y-1 sm:w-[210px]"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {data.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset(data.cover)}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-night-800 to-night-950">
            {/* Halo lime (position variable) pour un rendu premium sans photo */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(60% 55% at ${glow}, rgb(202 240 0 / 0.30), transparent 70%)`,
              }}
            />
            <div className="bg-topo-dark absolute inset-0 opacity-[0.22]" />
          </div>
        )}
        {/* Voile pour la lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-t from-night-950/85 via-night-950/10 to-transparent" />

        {/* Badge durée (haut gauche) */}
        <span className="absolute left-3 top-3 rounded-full border border-dawn-400/40 bg-night-950/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-dawn-300 backdrop-blur-sm">
          {data.days} jour{data.days > 1 ? "s" : ""}
        </span>

        {/* Note en étoiles (haut droite) */}
        {data.slug ? <PosterRating slug={data.slug} className="absolute right-3 top-3" /> : null}

        {/* Titre + auteur en bas de l'affiche */}
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <h3 className="font-display text-lg font-extrabold leading-tight text-cream">
            {data.title}
          </h3>
          <div className="mt-2">
            <AuthorChip dark name={data.author} />
          </div>
        </div>

        {/* Liseré lime au survol */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-0 ring-dawn-400/0 transition-all duration-200 group-hover:ring-2 group-hover:ring-dawn-400/60" />
      </div>
    </Link>
  );
}

/** Rangée horizontale scrollable d'affiches (une « catégorie » du catalogue). */
export function PlanRow({
  label,
  hint,
  items,
  startAccent = 0,
}: {
  label: string;
  hint?: string;
  items: PlanPosterData[];
  startAccent?: number;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8">
      <div className="container-x">
        <h2 className="font-display text-xl font-extrabold text-cream sm:text-2xl">{label}</h2>
        {hint ? <p className="mt-1 text-sm text-cream/55">{hint}</p> : null}
      </div>
      <div className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:px-8">
        {items.map((it, i) => (
          <PlanPoster key={it.href} data={it} accentIndex={startAccent + i} />
        ))}
      </div>
    </section>
  );
}
