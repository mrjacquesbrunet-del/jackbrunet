"use client";

import { useEffect, useMemo, useState } from "react";
import type { Commentary } from "@/components/bible/CommentaryPanel";
import { getFiches, Medaillon, type FichesData } from "@/components/bible/FichesChapitre";
import { Markable } from "@/components/ui/Markable";

/**
 * La feuille d'ÉTUDE DU VERSET : une grille d'outils (mots grec/hébreu,
 * contexte, culture, interprétation, commentaire, personnages & lieux)
 * alimentée par les commentaires pré-générés et les fiches — tout est
 * embarqué, rien n'est généré en direct.
 */

type Outil = "mots" | "contexte" | "culture" | "interpretation" | "commentaire" | "fiches";

const OUTILS: { id: Outil; label: (at: boolean) => string; lettre: (at: boolean) => string; couleur: string }[] = [
  { id: "mots", label: (at) => (at ? "Hébreu" : "Grec"), lettre: (at) => (at ? "א" : "α"), couleur: "#2DD4BF" },
  { id: "contexte", label: () => "Contexte", lettre: () => "C", couleur: "#FBBF24" },
  { id: "culture", label: () => "Culture", lettre: () => "L", couleur: "#F472B6" },
  { id: "interpretation", label: () => "Interprétation", lettre: () => "I", couleur: "#60A5FA" },
  { id: "commentaire", label: () => "Commentaire", lettre: () => "M", couleur: "#A78BFA" },
  { id: "fiches", label: () => "Personnages", lettre: () => "P", couleur: "#CAF000" },
];

export function VersetOutils({
  bookId,
  chapter,
  verse,
  verseText,
  reference,
  commentary,
  commentaryState,
  bookNames,
  onNavigate,
  onClose,
}: {
  bookId: number;
  chapter: number;
  verse: number;
  verseText: string;
  reference: string;
  commentary?: Commentary;
  commentaryState: "idle" | "loading" | "loaded" | "none";
  bookNames: Record<number, string>;
  onNavigate: (bookId: number, chapter: number) => void;
  onClose: () => void;
}) {
  const at = bookId <= 39;
  const [outil, setOutil] = useState<Outil>("mots");
  const [ficheId, setFicheId] = useState<string | null>(null);
  const [fiches, setFiches] = useState<FichesData | null>(null);

  useEffect(() => {
    getFiches().then(setFiches);
  }, []);

  // Personnages & lieux mentionnés DANS CE VERSET (parmi ceux du chapitre).
  const versetFiches = useMemo(() => {
    if (!fiches) return [];
    const ids = fiches.chapitres[`${bookId}-${chapter}`] ?? [];
    return ids.filter((id) => {
      const nom = fiches.fiches[id]?.nom ?? "";
      const base = nom.replace(/\s*\(.*\)$/, "").replace(/^(Le |La |Les |L')/, "");
      return base.split(" ").some((w) => w.length >= 3 && verseText.includes(w));
    });
  }, [fiches, bookId, chapter, verseText]);

  const dispo = (o: Outil): boolean => {
    if (o === "fiches") return versetFiches.length > 0;
    if (commentaryState !== "loaded" || !commentary) return true; // en attente
    if (o === "mots") return (commentary.mots?.length ?? 0) > 0;
    if (o === "contexte") return Boolean(commentary.epoque || commentary.passage);
    if (o === "culture") return Boolean(commentary.culture);
    if (o === "interpretation") return Boolean(commentary.interpretation);
    return Boolean(commentary.commentaire);
  };

  // Si l'outil courant est vide une fois le commentaire chargé, on glisse
  // vers le premier disponible.
  useEffect(() => {
    if (!dispo(outil)) {
      const first = OUTILS.find((o) => dispo(o.id));
      if (first) setOutil(first.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentaryState, versetFiches.length]);

  const idBase = `bible:${bookId}:${chapter}:${verse}`;

  function Bloc({ label, text, suffix }: { label: string; text?: string; suffix: string }) {
    if (!text) return null;
    return (
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-dawn-400">{label}</p>
        <Markable id={`${idBase}:comm:${suffix}`} text={text} reference={reference} kind="commentaire">
          <p className="mt-1 text-[15px] leading-relaxed text-cream/85">{text}</p>
        </Markable>
      </div>
    );
  }

  const chargement = commentaryState === "loading" || commentaryState === "idle";

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" />
      <div className="dark-ctx relative flex max-h-[86vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-night-900 text-cream sm:rounded-3xl">
        {/* Poignée + référence + verset */}
        <div className="border-b border-white/10 px-5 pb-3.5 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-base font-extrabold text-dawn-400">{reference}</p>
              <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-cream/70">{verseText}</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-cream/70">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>

        {/* La grille d'outils */}
        <div className="grid grid-cols-6 gap-1 border-b border-white/10 px-3 py-3">
          {OUTILS.map((o) => {
            const actif = outil === o.id;
            const ok = dispo(o.id);
            return (
              <button
                key={o.id}
                type="button"
                disabled={!ok}
                onClick={() => setOutil(o.id)}
                className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 transition-colors ${actif ? "bg-white/[0.08]" : ""} disabled:opacity-25`}
              >
                <span
                  className="grid h-9 w-9 place-items-center rounded-lg border font-display text-base font-extrabold"
                  style={{ borderColor: `${o.couleur}66`, color: o.couleur, backgroundColor: actif ? `${o.couleur}1f` : "transparent" }}
                >
                  {o.lettre(at)}
                </span>
                <span className={`text-[9px] font-bold leading-none ${actif ? "text-cream" : "text-cream/55"}`}>{o.label(at)}</span>
              </button>
            );
          })}
        </div>

        {/* Le contenu de l'outil */}
        <div className="min-h-[9rem] flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {outil === "fiches" ? (
            fiches && versetFiches.length ? (
              versetFiches.map((id) => {
                const f = fiches.fiches[id];
                return (
                  <button key={id} type="button" onClick={() => setFicheId(ficheId === id ? null : id)} className="flex w-full items-start gap-3 text-left">
                    <Medaillon id={id} fiche={f} size="h-12 w-12" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-base font-extrabold">{f.nom}</span>
                      <span className={`mt-0.5 block text-sm leading-relaxed text-cream/75 ${ficheId === id ? "" : "line-clamp-2"}`}>{f.bio}</span>
                      {ficheId === id ? (
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          {f.passages.map(([label, l, c]) => (
                            <span
                              key={`${l}-${c}`}
                              role="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                                onNavigate(l, c);
                              }}
                              className="rounded-full bg-dawn-400 px-3 py-1.5 font-display text-xs font-bold text-night-950"
                            >
                              {label}
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-cream/55">Aucun personnage identifié dans ce verset.</p>
            )
          ) : chargement ? (
            <p className="text-sm text-cream/55">Chargement de l'étude…</p>
          ) : commentaryState === "none" || !commentary ? (
            <p className="text-sm text-cream/55">Étude bientôt disponible pour ce verset.</p>
          ) : outil === "mots" ? (
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-dawn-400">
                Mots d'origine ({at ? "hébreu" : "grec"})
              </p>
              <ul className="mt-2 space-y-3">
                {(commentary.mots ?? []).map((m, i) => (
                  <li key={i}>
                    <p className="font-display text-lg font-extrabold">
                      {m.mot}
                      {m.translit ? <span className="ml-2 text-sm font-semibold italic text-cream/55">{m.translit}</span> : null}
                    </p>
                    {m.sens ? <p className="mt-0.5 text-[15px] leading-relaxed text-cream/85">{m.sens}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : outil === "contexte" ? (
            <>
              <Bloc label="Contexte de l'époque" text={commentary.epoque} suffix="epoque" />
              <Bloc label="Contexte du passage" text={commentary.passage} suffix="passage" />
            </>
          ) : outil === "culture" ? (
            <Bloc label="Éclairage culturel" text={commentary.culture} suffix="culture" />
          ) : outil === "interpretation" ? (
            <Bloc label="Interprétation" text={commentary.interpretation} suffix="interpretation" />
          ) : (
            <Bloc label="Commentaire" text={commentary.commentaire} suffix="commentaire" />
          )}
        </div>
      </div>
    </div>
  );
}
