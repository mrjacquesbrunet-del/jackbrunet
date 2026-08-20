"use client";

import { useEffect, useRef, useState } from "react";

/** Vitesses proposées (mémorisées via la même clé que le podcast). */
const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;
const RATE_KEY = "jb.audio.rate";

/**
 * Lecteur audio simple (voix clonée). Affiche un libellé + le lecteur natif,
 * avec le choix de la vitesse de lecture (0,75× → 2×), enregistré sur
 * l'appareil. S'utilise uniquement quand un fichier audio existe.
 */
export function AudioPlayer({ src, label = "Écouter" }: { src: string; label?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    try {
      const r = Number(localStorage.getItem(RATE_KEY));
      if ((SPEEDS as readonly number[]).includes(r)) setRate(r);
    } catch {
      /* stockage indisponible */
    }
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.playbackRate = rate;
  }, [rate]);

  function pick(r: number) {
    setRate(r);
    try {
      localStorage.setItem(RATE_KEY, String(r));
    } catch {
      /* ignore */
    }
    if (ref.current) ref.current.playbackRate = r;
  }

  return (
    <div className="rounded-2xl border border-night-900/10 bg-night-900/[0.03] p-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-spirit-700">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M3 10v4a1 1 0 0 0 1 1h3l4 4V5L7 9H4a1 1 0 0 0-1 1zm13.5 2a4.5 4.5 0 0 0-2.5-4.03v8.06A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z" />
        </svg>
        {label}
      </p>
      <audio
        ref={ref}
        controls
        preload="none"
        src={src}
        className="w-full"
        onPlay={(e) => {
          // Certains navigateurs remettent la vitesse à 1 au démarrage.
          e.currentTarget.playbackRate = rate;
        }}
      >
        Ton navigateur ne peut pas lire l&apos;audio.
      </audio>
      {/* Vitesse de lecture */}
      <div className="mt-2.5 flex flex-wrap items-center justify-end gap-1.5">
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-night-900/45">
          Vitesse
        </span>
        {SPEEDS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => pick(r)}
            className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
              rate === r
                ? "bg-dawn-400 text-night-950"
                : "border border-night-900/15 bg-night-900/[0.03] text-night-900/65 hover:border-night-900/35"
            }`}
          >
            {String(r).replace(".", ",")}×
          </button>
        ))}
      </div>
    </div>
  );
}
