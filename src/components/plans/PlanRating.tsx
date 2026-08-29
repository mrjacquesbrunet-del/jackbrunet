"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/community/useAuth";
import { myPlanRating, ratePlan, planRatingsSummary, type PlanStats } from "@/lib/community";

const STAR_PATH = "M12 3.2l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.8 6.8 20.5l1-5.8L3.5 9.4l5.9-.9z";

function Star({ fill, className }: { fill: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d={STAR_PATH}
        fill={fill ? "rgb(202 240 0)" : "none"}
        stroke="rgb(202 240 0)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Étoile à remplissage PARTIEL (ex. 4,6/5 → 60 % de la 5e) — façon Google.
 * L'étoile pleine garde une taille FIXE sous le clip, sinon elle rétrécirait
 * avec la fenêtre de découpe au lieu d'être rognée. */
function FracStar({ frac }: { frac: number }) {
  const pct = Math.max(0, Math.min(1, frac)) * 100;
  return (
    <span className="relative inline-block h-4 w-4">
      <Star fill={false} className="h-4 w-4" />
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <Star fill className="h-4 w-4 max-w-none" />
      </span>
    </span>
  );
}

/**
 * Note d'un plan, façon Google :
 *  - la MOYENNE toujours visible (chiffre + étoiles à remplissage partiel +
 *    nombre d'avis) — jamais mélangée avec ta note ;
 *  - « Ta note » : étoiles toujours cliquables — on note OU on modifie d'un
 *    simple toucher, la moyenne se met à jour instantanément.
 */
export function PlanRating({ slug }: { slug: string }) {
  const { userId } = useAuth();
  const [stats, setStats] = useState<PlanStats | null>(null);
  const [mine, setMine] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    planRatingsSummary().then((m) => setStats(m[slug] ?? { avg: 0, cnt: 0 }));
  }, [slug]);
  useEffect(() => {
    if (userId) myPlanRating(slug, userId).then(setMine);
    else setMine(null);
  }, [slug, userId]);

  async function rate(n: number) {
    if (!userId) return;
    const prev = mine;
    // Optimiste : ta note et la moyenne bougent immédiatement.
    setMine(n);
    setFlash(true);
    setTimeout(() => setFlash(false), 1200);
    setStats((s) => {
      if (!s) return s;
      const total = s.avg * s.cnt;
      return prev != null
        ? { avg: (total - prev + n) / Math.max(1, s.cnt), cnt: s.cnt }
        : { avg: (total + n) / (s.cnt + 1), cnt: s.cnt + 1 };
    });
    const ok = await ratePlan(slug, n, userId);
    if (!ok) setMine(prev); // échec réseau : on revient en arrière
    else planRatingsSummary().then((m) => setStats(m[slug] ?? null));
  }

  const avg = stats?.avg ?? 0;
  const cnt = stats?.cnt ?? 0;

  return (
    <div className="flex flex-col items-end gap-1.5 text-right">
      {/* La note du plan (moyenne), toujours affichée telle quelle */}
      <div className="flex items-center gap-1.5">
        {cnt > 0 ? (
          <span className="font-display text-lg font-extrabold leading-none text-cream">
            {avg.toFixed(1).replace(".", ",")}
          </span>
        ) : null}
        <span className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <FracStar key={n} frac={avg - (n - 1)} />
          ))}
        </span>
        <span className="text-[11px] font-semibold text-cream/70">
          {cnt > 0 ? `(${cnt})` : "Nouveau"}
        </span>
      </div>

      {/* Ta note : toujours modifiable d'un toucher */}
      {userId ? (
        <div className="flex items-center gap-1.5">
          <span className={`text-[11px] font-semibold ${flash ? "text-dawn-300" : "text-cream/60"}`}>
            {flash ? "Merci pour ta note !" : mine != null ? "Ta note" : "Note ce plan"}
          </span>
          <span className="flex items-center">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => rate(n)}
                className="p-0.5 transition-transform active:scale-125"
                aria-label={`${mine != null ? "Modifier ma note :" : "Noter"} ${n} sur 5`}
              >
                <Star fill={mine != null && n <= mine} className="h-5 w-5" />
              </button>
            ))}
          </span>
        </div>
      ) : (
        <p className="text-[11px] font-semibold text-cream/60">Connecte-toi pour noter</p>
      )}
    </div>
  );
}
