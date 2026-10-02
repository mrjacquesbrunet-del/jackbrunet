"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToolkit, HIGHLIGHT_COLORS } from "@/lib/toolkit";
import { shareText } from "@/lib/share";
import { appShareUrl } from "@/config/app-links";
import { CopyGlyph, HighlighterGlyph } from "@/components/ui/DevoIcons";

/**
 * SÉLECTION DE PLUSIEURS VERSETS — appui long sur un verset (ou « Plusieurs
 * versets » dans la feuille du verset), puis on touche les suivants. La barre
 * du bas agit sur l'ensemble : copier, image, partager, surligner, mur.
 */

/** Suites de versets consécutifs : [16,17,18,21] → [[16,18],[21,21]]. */
function suites(versets: number[]): [number, number][] {
  const out: [number, number][] = [];
  for (const v of [...versets].sort((a, b) => a - b)) {
    const der = out[out.length - 1];
    if (der && v === der[1] + 1) der[1] = v;
    else out.push([v, v]);
  }
  return out;
}

/** « Jean 3:16-18, 21 » */
export function referenceSelection(nom: string, chapitre: number, versets: number[]): string {
  const parts = suites(versets).map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`));
  return `${nom} ${chapitre}:${parts.join(", ")}`;
}

/** Texte des versets, avec « […] » entre deux passages non consécutifs. */
export function texteSelection(textes: string[], versets: number[]): string {
  return suites(versets)
    .map(([a, b]) => textes.slice(a - 1, b).join(" ").replace(/\s+/g, " ").trim())
    .join(" […] ");
}

/** Lien vers la sélection dans la Bible (du premier au dernier verset). */
export function cheminSelection(livre: number, chapitre: number, versets: number[]): string {
  const tri = [...versets].sort((a, b) => a - b);
  const a = tri[0];
  const b = tri[tri.length - 1];
  return `/bible?livre=${livre}&chap=${chapitre}&v=${a}${b > a ? `-${b}` : ""}`;
}

export function SelectionVersets({
  livre,
  chapitre,
  nomLivre,
  versets,
  textes,
  onImage,
  onClose,
}: {
  livre: number;
  chapitre: number;
  nomLivre: string;
  versets: number[];
  /** Tous les versets du chapitre (index 0 = verset 1). */
  textes: string[];
  onImage: (texte: string, reference: string, lien: string) => void;
  onClose: () => void;
}) {
  const tk = useToolkit();
  const router = useRouter();
  const [copie, setCopie] = useState(false);
  const [palette, setPalette] = useState(false);

  const reference = referenceSelection(nomLivre, chapitre, versets);
  const texte = texteSelection(textes, versets);
  const lien = appShareUrl(cheminSelection(livre, chapitre, versets));
  const ids = versets.map((v) => `bible:${livre}:${chapitre}:${v}`);
  const tousSurlignes = ids.every((id) => tk.isHighlighted(id));

  async function copier() {
    try {
      await navigator.clipboard.writeText(`${texte}\n${reference}`);
      setCopie(true);
      setTimeout(() => setCopie(false), 1500);
    } catch {
      /* presse-papiers indisponible */
    }
  }

  function surligner(couleur: string | null) {
    versets.forEach((v, i) => {
      if (couleur === null) tk.clearHighlight(ids[i]);
      else tk.highlightWith(ids[i], couleur, { text: textes[v - 1] ?? "", reference: `${nomLivre} ${chapitre}:${v}`, kind: "verset" });
    });
    onClose();
  }

  const bouton = (label: string, onClick: () => void, icone: ReactNode, actif = false) => (
    <button type="button" onClick={onClick} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
      <span
        className={`grid h-12 w-12 place-items-center rounded-2xl border transition-colors ${
          actif ? "border-dawn-400 bg-dawn-400/15 text-dawn-300" : "border-white/10 bg-white/[0.06] text-cream/85"
        }`}
      >
        {icone}
      </span>
      <span className={`text-[11px] font-bold leading-none ${actif ? "text-dawn-300" : "text-cream/70"}`}>{label}</span>
    </button>
  );

  return (
    <div
      className="dark-ctx fixed inset-x-0 bottom-0 z-[100] rounded-t-3xl border-t border-white/10 bg-night-900/[0.97] px-4 pb-[calc(env(safe-area-inset-bottom)+0.9rem)] pt-3 text-cream shadow-[0_-12px_40px_rgba(0,0,0,0.35)] backdrop-blur"
      role="toolbar"
      aria-label="Versets sélectionnés"
    >
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[17px] font-extrabold text-dawn-300">{reference}</p>
            <p className="text-[12px] font-semibold text-cream/50">
              {versets.length} verset{versets.length > 1 ? "s" : ""} · touche d&apos;autres versets pour les ajouter
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Annuler la sélection"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-cream/70"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {palette ? (
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                aria-label={`Surligner en ${c.label.toLowerCase()}`}
                onClick={() => surligner(c.key)}
                className={`h-8 w-8 shrink-0 rounded-full ${c.swatch} transition-transform active:scale-90`}
              />
            ))}
            {tousSurlignes ? (
              <button
                type="button"
                onClick={() => surligner(null)}
                className="ml-auto rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-cream/70"
              >
                Retirer
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="mt-3 flex gap-1">
          {bouton(copie ? "Copié !" : "Copier", copier, <CopyGlyph className="h-5 w-5" />, copie)}
          {bouton(
            "Image",
            () => onImage(texte, reference, lien),
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9}>
              <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
              <circle cx="9" cy="10" r="1.6" />
              <path d="M4 17l4.5-4.5 3.5 3.5 2.5-2.5L20 19" strokeLinecap="round" strokeLinejoin="round" />
            </svg>,
          )}
          {bouton(
            "Partager",
            () => shareText(`${texte}\n${reference}`, lien),
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9}>
              <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v13M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>,
          )}
          {bouton("Surligner", () => setPalette((p) => !p), <HighlighterGlyph className="h-5 w-5" />, palette)}
          {bouton(
            "Sur le mur",
            () => {
              // Pré-remplit le composeur du mur de prière avec ces versets.
              try {
                localStorage.setItem("jb.wall.draft", `« ${texte} »\n${reference}`);
              } catch {
                /* stockage indisponible */
              }
              onClose();
              router.push("/communaute");
            },
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9}>
              <path d="M4 6h16M4 12h16M4 18h9" strokeLinecap="round" />
            </svg>,
          )}
        </div>
      </div>
    </div>
  );
}
