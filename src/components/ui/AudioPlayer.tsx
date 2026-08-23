"use client";

import { useEffect, useRef, useState } from "react";

/** Vitesses proposées (mémorisées via la même clé que le podcast). */
const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;
const RATE_KEY = "jb.audio.rate";
/** Volume de la voix (indépendant de la musique soaking), mémorisé. */
const VOL_KEY = "jb.audio.vol.v1";
const VOL_MIN = 0.1;
const VOL_MAX = 1;

/**
 * Lecteur audio simple (voix clonée). Affiche un libellé + le lecteur natif,
 * avec le choix de la vitesse (0,75× → 2×) et le volume de la voix,
 * enregistrés sur l'appareil. iOS ignore le volume HTML classique : on passe
 * par un GainNode Web Audio quand c'est possible.
 */
export function AudioPlayer({ src, label = "Écouter" }: { src: string; label?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [rate, setRate] = useState(1);
  const [vol, setVol] = useState(1);

  useEffect(() => {
    try {
      const r = Number(localStorage.getItem(RATE_KEY));
      if ((SPEEDS as readonly number[]).includes(r)) setRate(r);
      const v = Number(localStorage.getItem(VOL_KEY));
      if (Number.isFinite(v) && v >= VOL_MIN && v <= VOL_MAX) setVol(v);
    } catch {
      /* stockage indisponible */
    }
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.playbackRate = rate;
  }, [rate]);

  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = vol;
    if (ref.current) ref.current.volume = vol;
  }, [vol]);

  // Ferme le graphe Web Audio au démontage.
  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => undefined);
      ctxRef.current = null;
      gainRef.current = null;
    };
  }, []);

  /** Branche la voix sur un GainNode (volume fiable, iPhone compris). */
  function ensureGain() {
    if (gainRef.current || !ref.current) return;
    try {
      const AC =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const src = ctx.createMediaElementSource(ref.current);
      const gain = ctx.createGain();
      gain.gain.value = vol;
      src.connect(gain).connect(ctx.destination);
      ctxRef.current = ctx;
      gainRef.current = gain;
    } catch {
      /* Web Audio indisponible : repli sur .volume */
    }
  }

  function pick(r: number) {
    setRate(r);
    try {
      localStorage.setItem(RATE_KEY, String(r));
    } catch {
      /* ignore */
    }
    if (ref.current) ref.current.playbackRate = r;
  }

  function pickVol(v: number) {
    setVol(v);
    try {
      localStorage.setItem(VOL_KEY, String(v));
    } catch {
      /* ignore */
    }
  }

  const volPct = Math.round(((vol - VOL_MIN) / (VOL_MAX - VOL_MIN)) * 100);

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
        crossOrigin="anonymous"
        src={src}
        className="w-full"
        onPlay={(e) => {
          // Certains navigateurs remettent la vitesse à 1 au démarrage.
          e.currentTarget.playbackRate = rate;
          // Volume fiable (iOS) : brancher le GainNode au premier démarrage.
          ensureGain();
          if (ctxRef.current?.state === "suspended") {
            ctxRef.current.resume().catch(() => undefined);
          }
        }}
      >
        Ton navigateur ne peut pas lire l&apos;audio.
      </audio>
      {/* Volume de la voix (indépendant de la musique soaking) */}
      <div className="mt-2.5 flex items-center gap-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-night-900/45">
          Voix
        </span>
        <input
          type="range"
          min={VOL_MIN}
          max={VOL_MAX}
          step={0.01}
          value={vol}
          onChange={(e) => pickVol(Number(e.target.value))}
          className="h-1 flex-1 accent-spirit-600"
          aria-label="Volume de la voix"
        />
        <span className="w-9 text-right text-[11px] tabular-nums text-night-900/45">
          {volPct}%
        </span>
      </div>
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
