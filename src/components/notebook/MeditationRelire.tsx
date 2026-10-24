"use client";

import { useState } from "react";
import type { Devotion } from "@/lib/types";

/**
 * « Relire la méditation » : déplie le texte complet d'une méditation
 * enregistrée (paragraphes + déclaration), sous le verset ou l'extrait gardé.
 */
export function MeditationRelire({
  dev,
  tone = "light",
  sansTitre = false,
}: {
  dev: Devotion;
  tone?: "light" | "dark";
  /** Le titre est déjà affiché au-dessus de la carte. */
  sansTitre?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const sombre = tone === "dark";
  const paragraphes = dev.meditation.split("\n\n").filter((p) => p.trim());
  return (
    <div className="relative">
      {open ? (
        <div className={`mt-4 space-y-3 border-t pt-4 ${sombre ? "border-white/10" : "border-night-900/10"}`}>
          {sansTitre ? null : (
            <p className={`font-display text-lg font-extrabold leading-snug ${sombre ? "text-cream" : "text-night-900"}`}>
              {dev.theme}
            </p>
          )}
          {paragraphes.map((p, i) => (
            <p key={i} className={`text-[14px] leading-relaxed ${sombre ? "text-cream/80" : "text-night-900/75"}`}>
              {p}
            </p>
          ))}
          {dev.declarationText ? (
            <div
              className={`rounded-2xl border p-3.5 ${
                sombre ? "border-dawn-400/25 bg-dawn-400/[0.07]" : "border-spirit-600/20 bg-spirit-500/[0.06]"
              }`}
            >
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.16em] ${sombre ? "text-dawn-300" : "text-spirit-700"}`}
              >
                À déclarer sur ta vie
              </p>
              <p className={`mt-1.5 font-display text-[15px] font-bold leading-snug ${sombre ? "text-cream" : "text-night-900"}`}>
                {dev.declarationText}
              </p>
              {dev.declarationReference ? (
                <p className={`mt-1 text-right text-xs italic ${sombre ? "text-dawn-200" : "text-spirit-700"}`}>
                  — {dev.declarationReference}
                </p>
              ) : null}
            </div>
          ) : null}
          {dev.author ? <p className={`text-xs ${sombre ? "text-cream/50" : "text-night-900/50"}`}>{dev.author}</p> : null}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
          sombre ? "bg-white/10 text-cream/85 hover:bg-white/15" : "bg-night-900/[0.06] text-night-900/75 hover:bg-night-900/10"
        }`}
      >
        <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 fill-none stroke-current transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2.2} aria-hidden>
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {open ? "Replier" : "Relire la méditation"}
      </button>
    </div>
  );
}
