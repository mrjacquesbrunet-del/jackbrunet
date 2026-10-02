"use client";

import { useEffect, useRef, useState } from "react";
import { getBook } from "@/lib/bible-client";

/**
 * APERÇU D'UN PASSAGE — on touche une référence (commentaire, verset lié,
 * fiche, introduction…) : le passage s'ouvre par-dessus, verset(s) mis en
 * évidence au milieu de leur chapitre. « Fermer » ramène exactement où l'on
 * était ; « Ouvrir dans la Bible » y va (avec le bouton « Revenir »).
 */
export function PassageApercu({
  livre,
  chapitre,
  verset,
  versetFin,
  nomLivre,
  onClose,
  onOuvrir,
}: {
  livre: number;
  chapitre: number;
  verset: number;
  versetFin?: number;
  nomLivre: string;
  onClose: () => void;
  onOuvrir: () => void;
}) {
  const [versets, setVersets] = useState<string[] | null>(null);
  const cibleRef = useRef<HTMLParagraphElement>(null);
  const fin = Math.max(verset, versetFin ?? verset);

  useEffect(() => {
    let actif = true;
    setVersets(null);
    getBook(livre)
      .then((b) => actif && setVersets(b.chapters[chapitre - 1] ?? []))
      .catch(() => actif && setVersets([]));
    return () => {
      actif = false;
    };
  }, [livre, chapitre]);

  // Le passage visé apparaît d'emblée, avec un peu de contexte au-dessus.
  useEffect(() => {
    if (versets?.length) requestAnimationFrame(() => cibleRef.current?.scrollIntoView({ block: "center" }));
  }, [versets]);

  const reference = `${nomLivre} ${chapitre}.${verset}${fin > verset ? `-${fin}` : ""}`;

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-night-950/60 backdrop-blur-[2px]" />
      <div className="dark-ctx relative flex max-h-[78vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-night-900 text-cream shadow-card sm:rounded-3xl">
        <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-5 pb-3 pt-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/45">Aperçu</p>
            <p className="truncate font-display text-lg font-extrabold text-dawn-300">{reference}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-cream/70">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3 font-serif text-[16px] leading-relaxed">
          {!versets ? (
            <p className="py-6 text-center font-sans text-sm text-cream/50">Chargement…</p>
          ) : !versets.length ? (
            <p className="py-6 text-center font-sans text-sm text-cream/50">Passage introuvable.</p>
          ) : (
            versets.map((t, i) => {
              const n = i + 1;
              const vise = n >= verset && n <= fin;
              return (
                <p
                  key={n}
                  ref={n === verset ? cibleRef : undefined}
                  className={`py-0.5 ${vise ? "-mx-2 rounded-lg bg-dawn-400/15 px-2 text-cream" : "text-cream/50"}`}
                >
                  <sup className={`mr-1 font-sans text-[10px] font-bold ${vise ? "text-dawn-300" : "text-cream/40"}`}>{n}</sup>
                  {t}
                </p>
              );
            })
          )}
        </div>

        <div className="flex shrink-0 gap-2 border-t border-white/10 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-white/15 py-2.5 text-sm font-bold text-cream/85">
            Fermer
          </button>
          <button type="button" onClick={onOuvrir} className="flex-1 rounded-full bg-dawn-400 py-2.5 font-display text-sm font-bold text-night-950">
            Ouvrir dans la Bible
          </button>
        </div>
      </div>
    </div>
  );
}
