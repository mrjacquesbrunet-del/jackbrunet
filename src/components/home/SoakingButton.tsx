"use client";

import { useSoaking } from "@/lib/soaking";

/**
 * Bouton play/pause de la musique de fond (soaking) pour méditer.
 */
export function SoakingButton() {
  const { playing, toggle, label } = useSoaking();

  return (
    <div className="glass flex items-center gap-4 p-4 sm:p-5">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Mettre en pause la musique" : "Lancer la musique"}
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-xl transition-colors ${
          playing ? "bg-spirit-500 text-cream" : "bg-dawn-400 text-night-950"
        }`}
      >
        {playing ? "⏸" : "▶"}
      </button>
      <div className="min-w-0 flex-1">
        <p className="font-display text-base font-bold leading-tight">
          Musique pour méditer
        </p>
        <p className="mt-0.5 text-xs text-night-900/60">
          {playing ? `En cours · ${label}` : "Lance une ambiance douce pendant ton temps avec Dieu."}
        </p>
      </div>
      {playing ? (
        <span className="flex items-end gap-0.5" aria-hidden="true">
          <span className="h-3 w-1 animate-pulse rounded-full bg-spirit-500" />
          <span className="h-5 w-1 animate-pulse rounded-full bg-spirit-500 [animation-delay:150ms]" />
          <span className="h-2 w-1 animate-pulse rounded-full bg-spirit-500 [animation-delay:300ms]" />
        </span>
      ) : null}
    </div>
  );
}
