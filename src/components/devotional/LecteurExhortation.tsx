"use client";

import { AnimatePresence, motion } from "framer-motion";
import { toggleSnippet, useToolkit } from "@/lib/toolkit";
import { useEngagement } from "@/lib/engagement";
import { idFavoriExhortation } from "@/lib/exhortations";
import { localeApp } from "@/lib/i18n";
import { BookmarkFilledGlyph, BookmarkGlyph } from "@/components/ui/DevoIcons";
import type { Devotion } from "@/lib/types";

/**
 * Relire une exhortation du « Temps avec Jésus » en plein écran : thème,
 * verset, méditation, déclaration et questions, avec « Mettre en favori ».
 */
export function LecteurExhortation({
  ouverte,
  fermer,
}: {
  ouverte: { dev: Devotion; index: number; date?: Date | null } | null;
  fermer: () => void;
}) {
  const { saved } = useToolkit();
  const eng = useEngagement();
  const favori = ouverte ? saved.some((s) => s.id === idFavoriExhortation(ouverte.index)) : false;

  function basculerFavori() {
    if (!ouverte) return;
    const { dev, index } = ouverte;
    toggleSnippet({ id: idFavoriExhortation(index), text: dev.verseText, reference: dev.verseReference, kind: "méditation" });
    // Même état que le bouton de l'écran du jour.
    if (eng.isFavorite(index) === favori) eng.toggleFavorite(index);
  }

  return (
    <AnimatePresence>
      {ouverte ? (
        <motion.div
          className="keep-dark fixed inset-0 z-[140] flex flex-col bg-night-950 text-left text-cream"
          role="dialog"
          aria-modal="true"
          aria-label={ouverte.dev.theme}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2 border-b border-white/[0.08] px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <button type="button" onClick={fermer} aria-label="Fermer" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-cream/80">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="min-w-0 flex-1 truncate text-sm font-semibold capitalize text-cream/60">
              {ouverte.date
                ? ouverte.date.toLocaleDateString(localeApp(), { weekday: "long", day: "numeric", month: "long" })
                : "Temps avec Jésus"}
            </p>
            <button
              type="button"
              onClick={basculerFavori}
              aria-pressed={favori}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-bold ${
                favori ? "border-dawn-400 bg-dawn-400 text-night-950" : "border-white/20 text-cream/85"
              }`}
            >
              {favori ? <BookmarkFilledGlyph className="h-4 w-4" /> : <BookmarkGlyph className="h-4 w-4" />}
              {favori ? "En favori" : "Favori"}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-5">
            <div className="mx-auto max-w-2xl">
              <h1 className="font-display text-[26px] font-extrabold leading-tight">{ouverte.dev.theme}</h1>
              {ouverte.dev.verseText ? (
                <blockquote className="mt-4 rounded-2xl border border-dawn-400/25 bg-dawn-400/[0.07] p-4">
                  <p className="text-[15px] italic leading-relaxed text-cream/90">« {ouverte.dev.verseText} »</p>
                  <p className="mt-1.5 text-xs font-bold uppercase tracking-wide text-dawn-300">{ouverte.dev.verseReference}</p>
                </blockquote>
              ) : null}
              <div className="mt-5 space-y-3.5">
                {ouverte.dev.meditation
                  .split("\n\n")
                  .filter((p) => p.trim())
                  .map((p, k) => (
                    <p key={k} className="text-[15.5px] leading-relaxed text-cream/85">
                      {p}
                    </p>
                  ))}
              </div>
              {ouverte.dev.declarationText ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-dawn-300">Je déclare</p>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-cream/90">{ouverte.dev.declarationText}</p>
                  {ouverte.dev.declarationReference ? (
                    <p className="mt-1 text-xs font-semibold text-cream/50">{ouverte.dev.declarationReference}</p>
                  ) : null}
                </div>
              ) : null}
              {ouverte.dev.questions?.length ? (
                <div className="mt-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-dawn-300">Pour aller plus loin</p>
                  <ul className="mt-2 space-y-2">
                    {ouverte.dev.questions.map((q, k) => (
                      <li key={k} className="flex gap-2.5 text-[14.5px] leading-snug text-cream/80">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-dawn-400" />
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {ouverte.dev.author ? <p className="mt-6 text-sm text-cream/45">{ouverte.dev.author}</p> : null}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
