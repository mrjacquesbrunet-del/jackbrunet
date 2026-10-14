"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePodcastPlayer } from "@/lib/podcast-player";
import { PlayGlyph } from "@/components/ui/DevoIcons";

/**
 * Fin d'un épisode : « Épisode suivant dans 5 s », avec Annuler / Lire.
 * `plein` = carte du lecteur plein écran ; sinon la ligne de la barre du bas.
 */
export function PodcastASuivre({ plein = false }: { plein?: boolean }) {
  const pod = usePodcastPlayer();
  const s = pod.aSuivre;
  const [maintenant, setMaintenant] = useState(() => Date.now());

  useEffect(() => {
    if (!s) return;
    const t = setInterval(() => setMaintenant(Date.now()), 200);
    return () => clearInterval(t);
  }, [s]);

  if (!s) return null;
  const reste = Math.max(0, s.finA - maintenant);
  const secondes = Math.ceil(reste / 1000);
  const part = 1 - reste / 5000;

  const anneau = (taille: number) => (
    <span className="relative grid shrink-0 place-items-center" style={{ width: taille, height: taille }}>
      <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeOpacity={0.18} strokeWidth={3} />
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={100.5}
          strokeDashoffset={100.5 * (1 - part)}
        />
      </svg>
      <span className="text-[13px] font-bold tabular-nums">{secondes}</span>
    </span>
  );

  if (!plein) {
    return (
      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-dawn-400/30 bg-dawn-400/[0.08] px-3 py-2.5 text-dawn-400">
        {anneau(34)}
        <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-cream">
          <span className="text-cream/55">À suivre · </span>
          {s.track.title}
        </p>
        <button type="button" onClick={pod.annulerSuivant} className="shrink-0 px-1 text-[13px] font-semibold text-cream/60">
          Annuler
        </button>
        <button
          type="button"
          onClick={pod.lancerSuivant}
          aria-label="Lire l'épisode suivant"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950"
        >
          <PlayGlyph className="ml-0.5 h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-dawn-400/35 bg-night-900/90 p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,.9)] backdrop-blur-md"
    >
      <div className="flex items-center gap-3.5 text-dawn-400">
        {anneau(46)}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-dawn-400">
            Épisode suivant dans {secondes} s
          </p>
          <p className="mt-0.5 line-clamp-2 text-[15.5px] font-semibold leading-snug text-cream">
            {s.track.numero ? `Épisode ${s.track.numero} · ` : ""}
            {s.track.title}
          </p>
        </div>
      </div>
      <div className="mt-3.5 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={pod.annulerSuivant}
          className="rounded-full border border-white/15 bg-white/[0.06] py-3 text-[14px] font-semibold text-cream/85 active:bg-white/[0.12]"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={pod.lancerSuivant}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-dawn-400 py-3 text-[14px] font-extrabold text-night-950 active:scale-[0.98]"
        >
          <PlayGlyph className="h-4 w-4" /> Lire maintenant
        </button>
      </div>
    </motion.div>
  );
}
