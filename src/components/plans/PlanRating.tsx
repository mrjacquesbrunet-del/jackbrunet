"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/community/useAuth";
import { myPlanRating, ratePlan, planRatingsSummary, type PlanStats } from "@/lib/community";

function Star({ fill, className }: { fill: number; className?: string }) {
  // fill: 0 (vide), 1 (plein). Étoile trait, remplie en lime.
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 3.2l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.8 6.8 20.5l1-5.8L3.5 9.4l5.9-.9z"
        fill={fill ? "rgb(202 240 0)" : "none"}
        stroke="rgb(202 240 0)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Note d'un plan : moyenne + nombre d'avis. Si la personne est connectée et
 * n'a pas encore noté, les étoiles sont cliquables pour donner sa note.
 * Pensé pour être posé en bas à droite de la photo du plan.
 */
export function PlanRating({ slug }: { slug: string }) {
  const { userId } = useAuth();
  const [stats, setStats] = useState<PlanStats | null>(null);
  const [mine, setMine] = useState<number | null>(null);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    planRatingsSummary().then((m) => setStats(m[slug] ?? { avg: 0, cnt: 0 }));
  }, [slug]);
  useEffect(() => {
    if (userId) myPlanRating(slug, userId).then(setMine);
    else setMine(null);
  }, [slug, userId]);

  const rated = mine != null;
  const shown = hover || mine || Math.round(stats?.avg ?? 0);

  async function rate(n: number) {
    if (!userId || busy) return;
    setBusy(true);
    const ok = await ratePlan(slug, n, userId);
    setBusy(false);
    if (ok) {
      setMine(n);
      planRatingsSummary().then((m) => setStats(m[slug] ?? null));
    }
  }

  const interactive = !!userId && !rated;

  return (
    <div className="flex flex-col items-end gap-1 text-right">
      <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) =>
          interactive ? (
            <button
              key={n}
              type="button"
              disabled={busy}
              onMouseEnter={() => setHover(n)}
              onClick={() => rate(n)}
              className="p-0.5"
              aria-label={`Noter ${n} sur 5`}
            >
              <Star fill={n <= shown ? 1 : 0} className="h-6 w-6" />
            </button>
          ) : (
            <Star key={n} fill={n <= shown ? 1 : 0} className="h-5 w-5" />
          )
        )}
      </div>
      <p className="text-[11px] font-semibold text-cream/80">
        {rated ? (
          <>Ta note · {stats?.cnt ?? 0} avis</>
        ) : stats && stats.cnt > 0 ? (
          <>
            {stats.avg.toFixed(1)} · {stats.cnt} avis
          </>
        ) : userId ? (
          <>Sois le premier à noter</>
        ) : (
          <>Connecte-toi pour noter</>
        )}
      </p>
    </div>
  );
}
