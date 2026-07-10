"use client";

import { useEffect, useRef, useState } from "react";
import {
  useReading,
  FONT_LABEL,
  FONT_STACK,
  THEME_LABEL,
  THEME_STYLE,
  SCALE_MIN,
  SCALE_MAX,
  SCALE_STEP,
  type ReadingFont,
  type ReadingTheme,
} from "@/lib/reading-settings";

/**
 * Bouton « Aa » + panneau de personnalisation de la lecture: taille du texte
 * et police. Réglages mémorisés sur l'appareil.
 */
export function ReadingSettings() {
  const r = useReading();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current &&!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pct = Math.round(r.scale * 100);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) =>!o)}
        aria-label="Confort de lecture"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-night-900/15 bg-white text-spirit-700 transition-colors hover:bg-night-900/5"
      >
        <span className="font-display font-bold leading-none">
          <span className="text-base">A</span>
          <span className="text-xs">a</span>
        </span>
      </button>

      {open? (
        <>
        {/* Voile sur mobile: un toucher à l'extérieur referme la feuille. */}
        <button
          type="button"
          aria-label="Fermer"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 sm:hidden"
        />
        {/* Mobile: feuille ancrée en bas (toujours visible, jamais tronquée).
            Écran large: petit panneau ancré sous le bouton. */}
        <div className="fixed inset-x-3 bottom-3 z-50 max-h-[80vh] w-auto overflow-y-auto rounded-2xl border border-night-900/10 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl sm:absolute sm:inset-auto sm:right-0 sm:bottom-auto sm:mt-2 sm:w-72 sm:pb-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-night-900/45">
            Taille du texte
          </p>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => r.setScale(r.scale - SCALE_STEP)}
              disabled={r.scale <= SCALE_MIN}
              className="grid h-9 w-9 place-items-center rounded-full border border-night-900/15 text-lg font-bold disabled:opacity-40"
              aria-label="Réduire"
            >
              A
            </button>
            <input
              type="range"
              min={SCALE_MIN}
              max={SCALE_MAX}
              step={SCALE_STEP}
              value={r.scale}
              onChange={(e) => r.setScale(Number(e.target.value))}
              className="h-1 flex-1 accent-spirit-600"
              aria-label="Taille du texte"
            />
            <button
              type="button"
              onClick={() => r.setScale(r.scale + SCALE_STEP)}
              disabled={r.scale >= SCALE_MAX}
              className="grid h-9 w-9 place-items-center rounded-full border border-night-900/15 text-2xl font-bold disabled:opacity-40"
              aria-label="Agrandir"
            >
              A
            </button>
          </div>
          <p className="mt-1 text-center text-xs tabular-nums text-night-900/45">{pct}%</p>

          <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-night-900/45">
            Police
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(Object.keys(FONT_LABEL) as ReadingFont[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => r.setFont(f)}
                style={{ fontFamily: FONT_STACK[f] }}
                className={`rounded-xl border px-2 py-2 text-sm transition-colors ${
                  r.font === f
? "border-spirit-600 bg-spirit-500/10 font-bold text-spirit-700"
: "border-night-900/15 text-night-900/70 hover:bg-night-900/[0.03]"
                }`}
              >
                {FONT_LABEL[f]}
              </button>
            ))}
          </div>

          <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-night-900/45">
            Thème
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(Object.keys(THEME_LABEL) as ReadingTheme[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => r.setTheme(t)}
                style={{
                  backgroundColor: THEME_STYLE[t].swatch,
                  color: THEME_STYLE[t].text,
                }}
                className={`rounded-xl border px-2 py-2 text-sm transition-colors ${
                  r.theme === t? "border-spirit-600 font-bold ring-1 ring-spirit-600": "border-night-900/15"
                }`}
              >
                {THEME_LABEL[t]}
              </button>
            ))}
          </div>
        </div>
        </>
      ): null}
    </div>
  );
}
