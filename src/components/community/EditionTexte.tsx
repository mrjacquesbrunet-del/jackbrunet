"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Modifier un texte déjà publié (sujet, commentaire, publication de groupe) :
 * zone de texte ouverte sur le texte actuel, clavier ouvert, « Annuler » et
 * « Enregistrer ».
 */
export function EditionTexte({
  valeur,
  onAnnuler,
  onEnregistrer,
  sombre = false,
  className = "",
}: {
  valeur: string;
  onAnnuler: () => void;
  onEnregistrer: (texte: string) => Promise<boolean> | boolean;
  sombre?: boolean;
  className?: string;
}) {
  const [texte, setTexte] = useState(valeur);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 260)}px`;
  }, [texte]);

  async function enregistrer() {
    if (!texte.trim() || envoi) return;
    if (texte.trim() === valeur.trim()) return onAnnuler();
    setEnvoi(true);
    setErreur(false);
    const ok = await onEnregistrer(texte.trim());
    setEnvoi(false);
    if (!ok) setErreur(true);
  }

  // Dans une bulle qui réagit à l'appui long / double toucher : les gestes
  // faits dans le champ ne doivent pas déclencher de réaction.
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  return (
    <div
      className={`select-text ${className}`}
      onTouchStart={stop}
      onTouchMove={stop}
      onTouchEnd={stop}
      onDoubleClick={stop}
      onContextMenu={stop}
      onClick={stop}
    >
      <textarea
        ref={ref}
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onAnnuler();
        }}
        rows={2}
        aria-label="Modifier le texte"
        className={`w-full resize-none rounded-2xl border px-3.5 py-2.5 text-[14px] leading-snug outline-none ${
          sombre
            ? "border-dawn-400/50 bg-white/[0.06] text-cream placeholder:text-cream/40"
            : "border-spirit-500/50 bg-white text-night-900"
        }`}
      />
      {erreur ? (
        <p className="mt-1 text-xs font-semibold text-red-400">La modification n&apos;a pas pu être enregistrée. Réessaie.</p>
      ) : null}
      <div className="mt-1.5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onAnnuler}
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${sombre ? "text-cream/70 hover:bg-white/10" : "text-night-900/60 hover:bg-night-900/[0.05]"}`}
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={() => void enregistrer()}
          disabled={envoi || !texte.trim()}
          className="rounded-full bg-dawn-400 px-4 py-1.5 text-[13px] font-bold text-night-950 disabled:opacity-40"
        >
          {envoi ? "…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

/** Petite mention « modifié » à côté d'un texte corrigé. */
export function MentionModifie({ sombre = false }: { sombre?: boolean }) {
  return <span className={`text-[11px] font-medium ${sombre ? "text-cream/40" : "text-night-900/40"}`}>modifié</span>;
}
