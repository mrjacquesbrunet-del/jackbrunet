"use client";

import { useEffect, useRef, useState } from "react";
import { usePodcastPlayer } from "@/lib/podcast-player";

const OPTIONS = [5, 10, 15, 30, 45, 60];

function fmtRemaining(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/**
 * Minuteur de veille (« sleep timer ») pour le lecteur audio: l'écoute
 * s'arrête toute seule au bout du temps choisi, ou à la fin de l'épisode.
 * Idéal pour s'endormir en écoutant un enseignement.
 */
export function SleepTimer({ tone = "light" }: { tone?: "light" | "dark" }) {
  const pod = usePodcastPlayer();
  const [open, setOpen] = useState(false);
  const [, force] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const active = pod.sleepEndsAt!== null || pod.sleepEpisodeEnd;

  // Rafraîchit l'affichage du compte à rebours chaque seconde.
  useEffect(() => {
    if (pod.sleepEndsAt === null) return;
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [pod.sleepEndsAt]);

  // Ferme le menu si on touche ailleurs.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current &&!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const label =
    pod.sleepEndsAt!== null
? fmtRemaining(pod.sleepEndsAt - Date.now())
: pod.sleepEpisodeEnd
? "fin"
: null;

  const btnBase =
    tone === "dark"
? "border-white/15 bg-white/10 text-cream"
: "border-night-900/10 bg-night-900/[0.04] text-night-900/70";

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) =>!o)}
        aria-label="Minuteur de veille"
        className={`flex h-9 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold transition-colors ${btnBase} ${
          active? "!border-dawn-400 !text-dawn-500": ""
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2.5 2M9 2h6" strokeLinecap="round" />
        </svg>
        {label? <span className="tabular-nums">{label}</span>: null}
      </button>

      {open? (
        <div className="absolute bottom-full right-0 z-[60] mb-2 w-44 overflow-hidden rounded-2xl border border-night-900/10 bg-white shadow-xl">
          <p className="px-4 pt-3 text-[11px] font-bold uppercase tracking-wide text-night-900/45">
            Minuteur de veille
          </p>
          <ul className="py-1">
            {OPTIONS.map((min) => (
              <li key={min}>
                <button
                  type="button"
                  onClick={() => {
                    pod.setSleepTimer(min);
                    setOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-night-900/80 transition-colors hover:bg-night-900/[0.04]"
                >
                  {min} minutes
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => {
                  pod.setSleepEpisodeEnd(true);
                  setOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-night-900/80 transition-colors hover:bg-night-900/[0.04]"
              >
                Fin de l'épisode
              </button>
            </li>
            {active? (
              <li className="border-t border-night-900/10">
                <button
                  type="button"
                  onClick={() => {
                    pod.cancelSleep();
                    setOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                >
                  Désactiver
                </button>
              </li>
            ): null}
          </ul>
        </div>
      ): null}
    </div>
  );
}
