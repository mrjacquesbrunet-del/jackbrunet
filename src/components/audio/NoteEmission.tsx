"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/community/useAuth";
import { Star, FracStar } from "@/components/plans/PlanRating";
import { maNoteEmission, noterEmission, notesEmissions, type NoteStats } from "@/lib/audio-library";

/**
 * Note d'une émission de podcast, comme celle des plans : la moyenne
 * (étoiles partielles + nombre de notes) et « Ta note », modifiable d'un
 * toucher. Une note par membre et par émission.
 */
export function NoteEmission({ showId, onNote }: { showId: string; onNote?: () => void }) {
  const { userId } = useAuth();
  const [stats, setStats] = useState<NoteStats>({ avg: 0, cnt: 0 });
  const [mine, setMine] = useState<number | null>(null);
  const [merci, setMerci] = useState(false);
  // Ma note se replie une fois donnée ; un toucher sur la moyenne la rouvre.
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    notesEmissions().then((m) => setStats(m[showId] ?? { avg: 0, cnt: 0 }));
  }, [showId]);
  useEffect(() => {
    if (userId) maNoteEmission(showId, userId).then(setMine);
    else setMine(null);
  }, [showId, userId]);

  async function noter(n: number) {
    if (!userId) return;
    const avant = mine;
    setMine(n);
    setMerci(true);
    setTimeout(() => {
      setMerci(false);
      setOuvert(false);
    }, 1400);
    setStats((s) => {
      const total = s.avg * s.cnt;
      return avant != null ? { avg: (total - avant + n) / Math.max(1, s.cnt), cnt: s.cnt } : { avg: (total + n) / (s.cnt + 1), cnt: s.cnt + 1 };
    });
    const ok = await noterEmission(showId, n, userId);
    if (!ok) setMine(avant);
    else {
      notesEmissions().then((m) => setStats(m[showId] ?? { avg: 0, cnt: 0 }));
      onNote?.();
    }
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={() => userId && mine != null && setOuvert((o) => !o)}
        aria-expanded={mine != null ? ouvert : undefined}
        aria-label={mine != null ? (ouvert ? "Cacher ma note" : "Voir ma note") : undefined}
        className="flex items-center gap-1.5"
      >
        {stats.cnt > 0 ? <span className="font-display text-lg font-extrabold leading-none text-cream">{stats.avg.toFixed(1).replace(".", ",")}</span> : null}
        <span className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <FracStar key={n} frac={stats.avg - (n - 1)} />
          ))}
        </span>
        <span className="text-[11px] font-semibold text-cream/60">
          {stats.cnt > 0 ? `(${stats.cnt} note${stats.cnt > 1 ? "s" : ""})` : "Pas encore de note"}
        </span>
      </button>
      {userId && (mine == null || ouvert || merci) ? (
        <div className="flex items-center gap-1.5">
          <span className={`text-[11px] font-semibold ${merci ? "text-dawn-300" : "text-cream/55"}`}>
            {merci ? "Merci pour ta note !" : mine != null ? "Ta note" : "Note cette émission"}
          </span>
          <span className="flex items-center">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => void noter(n)}
                className="p-0.5 transition-transform active:scale-125"
                aria-label={`${mine != null ? "Modifier ma note :" : "Noter"} ${n} sur 5`}
              >
                <Star fill={mine != null && n <= mine} className="h-5 w-5" />
              </button>
            ))}
          </span>
        </div>
      ) : !userId ? (
        <p className="text-[11px] font-semibold text-cream/55">Connecte-toi pour noter</p>
      ) : null}
    </div>
  );
}
