"use client";

import { useEffect, useState } from "react";
import { planRatingsSummary, type PlanStats } from "@/lib/community";

// Cache partagé : la moyenne des notes n'est récupérée qu'UNE fois, quel que
// soit le nombre d'affiches à l'écran.
let cache: Record<string, PlanStats> | null = null;
let promise: Promise<Record<string, PlanStats>> | null = null;
function getSummary() {
  if (cache) return Promise.resolve(cache);
  if (!promise) promise = planRatingsSummary().then((m) => (cache = m));
  return promise;
}

/**
 * Badge « note » posé en haut à droite d'une affiche de plan (façon jaquette) :
 * étoile lime + moyenne. Ne s'affiche que lorsqu'il y a au moins un avis.
 */
export function PosterRating({ slug, className }: { slug: string; className?: string }) {
  const [s, setS] = useState<PlanStats | null>(cache?.[slug] ?? null);

  useEffect(() => {
    let on = true;
    getSummary().then((m) => on && setS(m[slug] ?? { avg: 0, cnt: 0 }));
    return () => {
      on = false;
    };
  }, [slug]);

  if (!s || s.cnt === 0) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-night-950/60 px-2 py-1 text-[10px] font-bold text-cream backdrop-blur-sm ${className ?? ""}`}
    >
      <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden>
        <path
          d="M12 3.2l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.8 6.8 20.5l1-5.8L3.5 9.4l5.9-.9z"
          fill="rgb(202 240 0)"
        />
      </svg>
      {s.avg.toFixed(1)}
    </span>
  );
}
