"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Commentary } from "@/components/bible/CommentaryPanel";
import { FicheSheet, getFiches, Medaillon, TexteAvecRefs as TexteAvecRefsVerset, type FichesData } from "@/components/bible/FichesChapitre";
import { nettoyerMarquesIA } from "@/lib/texte";
import { numeroStrong } from "@/lib/strong";
import { Markable } from "@/components/ui/Markable";
import { useAuth } from "@/components/community/useAuth";
import { askAssistant } from "@/lib/assistant";
import { useToolkit, HIGHLIGHT_COLORS, paletteLabels, setPaletteLabel } from "@/lib/toolkit";
import { shareText } from "@/lib/share";
import { appShareUrl } from "@/config/app-links";
import { bibleHref } from "@/lib/bible-ref";
import { addMemorizeVerse, isMemorizing } from "@/lib/memorize";
import { isNativeApp } from "@/lib/notifications";
import { addNote, updateNote, removeNote, useNotebook } from "@/lib/notebook";
import {
  CopyGlyph,
  BookmarkGlyph,
  BookmarkFilledGlyph,
  PenGlyph,
} from "@/components/ui/DevoIcons";

/**
 * La feuille d'ÉTUDE DU VERSET : rangée de surlignage en tête, puis trois
 * onglets — Annoter (note, enregistrer, mémoriser), Étudier (mots grec/hébreu,
 * contexte, culture, interprétation, commentaire, personnages & lieux) et
 * Partager (copier, partager, mur de prière). Tout est embarqué, rien n'est
 * généré en direct.
 */

type Outil = "mots" | "contexte" | "culture" | "interpretation" | "commentaire" | "fiches" | "question";
type Onglet = "annoter" | "etudier" | "partager";

const OUTILS: { id: Outil; label: (at: boolean) => string; lettre: (at: boolean) => string; couleur: string }[] = [
  { id: "mots", label: (at) => (at ? "Hébreu" : "Grec"), lettre: (at) => (at ? "א" : "α"), couleur: "#2DD4BF" },
  { id: "contexte", label: () => "Contexte", lettre: () => "C", couleur: "#FBBF24" },
  { id: "culture", label: () => "Culture", lettre: () => "L", couleur: "#F472B6" },
  { id: "interpretation", label: () => "Interprétation", lettre: () => "I", couleur: "#60A5FA" },
  { id: "commentaire", label: () => "Commentaire", lettre: () => "M", couleur: "#A78BFA" },
  { id: "fiches", label: () => "Qui & où", lettre: () => "P", couleur: "#CAF000" },
];

/* ——— Relier un mot grec/hébreu au mot du verset français ——— */
type MotEtude = { mot: string; translit?: string; sens?: string; fr?: string; strong?: string };

/** Le terme français qu'évoque ce mot d'origine (champ fr, sinon extrait du sens). */
function termeFrancais(m: MotEtude): string | null {
  if (m.fr) return m.fr;
  const sens = m.sens ?? "";
  const quote = sens.match(/'([^']{2,28})'/) || sens.match(/«\s*([^»]{2,28})\s*»/);
  if (quote) return quote[1].trim();
  const verbe = sens.match(
    /(?:signifie|se traduit par|désigne)\s+(?:le |la |les |l'|un |une |du |des )?([A-Za-zÀ-ÖØ-öø-ÿ-]{3,22})/i,
  );
  return verbe ? verbe[1].replace(/[.,;:]$/, "") : null;
}

/** Cherche le terme dans le verset (sans accents ni casse, radical en repli).
 * Renvoie [début, fin] dans le texte original, ou null. */
function chercherDansVerset(verset: string, terme: string): [number, number] | null {
  const cle = (txt: string) =>
    Array.from(txt)
      .map((ch) => ch.normalize("NFD")[0].toLowerCase())
      .join("");
  const vk = cle(verset);
  const etendre = (debut: number, lg: number): [number, number] => {
    let fin = debut + lg;
    while (fin < verset.length && /[a-zà-öø-ÿ]/i.test(verset[fin])) fin++;
    return [debut, fin];
  };
  const tk = cle(terme);
  if (tk.length <= 4) {
    const m = new RegExp(`(?:^|[^a-z])(${tk})(?:$|[^a-z])`).exec(vk);
    if (m) return etendre(m.index + m[0].indexOf(m[1]), tk.length);
    return null;
  }
  let t = tk;
  while (t.length >= 5) {
    const i = vk.indexOf(t);
    if (i >= 0) return etendre(i, t.length);
    t = t.slice(0, -1);
  }
  return null;
}

/** Le verset de l'en-tête, avec le mot étudié surligné quand il y en a un. */
function VersetSurligne({ texte, plage }: { texte: string; plage: [number, number] | null }) {
  if (!plage) return <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-cream/70">{texte}</p>;
  const [d, f] = plage;
  return (
    <p className="mt-1 text-sm leading-relaxed text-cream/70">
      {texte.slice(0, d)}
      <mark className="rounded bg-dawn-400/90 px-1 py-0.5 font-bold text-night-950">{texte.slice(d, f)}</mark>
      {texte.slice(f)}
    </p>
  );
}

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
  const router = useRouter();
  const [onglet, setOnglet] = useState<Onglet>("etudier");
  const [outil, setOutil] = useState<Outil>("mots");
  const [ficheId, setFicheId] = useState<string | null>(null);
  const [fiches, setFiches] = useState<FichesData | null>(null);

  useEffect(() => {
    getFiches().then(setFiches);
  }, []);

  const idBase = `bible:${bookId}:${chapter}:${verse}`;

  // Mot grec/hébreu sélectionné : on montre de quel mot du verset il s'agit.
  const [motActif, setMotActif] = useState<number | null>(null);
  useEffect(() => {
    setMotActif(null);
  }, [idBase]);
  const motsEtude = (commentary?.mots ?? []) as MotEtude[];
  const motSel = motActif !== null ? motsEtude[motActif] : null;
  const termeSel = motSel ? termeFrancais(motSel) : null;
  const plageSel = motSel && termeSel ? chercherDansVerset(verseText, termeSel) : null;

  // Légende personnelle de la palette (modifiable, mémorisée sur l'appareil).
  const [legendes, setLegendes] = useState<Record<string, string>>({});
  const [editPalette, setEditPalette] = useState(false);
  useEffect(() => {
    setLegendes(paletteLabels());
  }, []);

  // ————— Surlignage (mêmes couleurs et même mémoire que sur le verset) —————
  const tk = useToolkit();
  const highlighted = tk.isHighlighted(idBase);
  const hlColor = tk.highlightColor(idBase);
  const saved = tk.isSaved(idBase);

  // ————— Note reliée au passage (carnet) —————
  const notes = useNotebook();
  const existingNote = notes.find((n) => n.ref === idBase);
  const [noting, setNoting] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  function openNote() {
    setNoteText(existingNote?.body ?? "");
    setNoting(true);
  }
  function saveNote() {
    if (!noteText.trim()) return;
    if (existingNote) {
      updateNote(existingNote.id, { body: noteText.trim() });
    } else {
      const dateStr = new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      addNote({ category: "Note", title: `${reference} · ${dateStr}`, body: noteText.trim(), ref: idBase });
      tk.markNoted(idBase);
    }
    setNoting(false);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2500);
  }

  // ————— Partage —————
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(`${verseText}\n${reference}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* presse-papiers indisponible */
    }
  }
  const [memorizing, setMemorizing] = useState(false);
  const [nativeApp, setNativeApp] = useState(false);

  // ————— « Pose ta question » : l'assistant, avec le verset en contexte —————
  const { userId } = useAuth();
  const [question, setQuestion] = useState("");
  const [reponse, setReponse] = useState<string | null>(null);
  const [qBusy, setQBusy] = useState(false);
  const [qErr, setQErr] = useState<string | null>(null);
  async function poserQuestion() {
    const q = question.trim();
    if (!q || qBusy) return;
    setQErr(null);
    setQBusy(true);
    const res = await askAssistant([
      {
        role: "user",
        content: `À propos de ${reference} — « ${verseText} » : ${q}`,
      },
    ]);
    setQBusy(false);
    if (res.ok) {
      setReponse(res.answer);
    } else {
      setQErr(
        res.error === "quota"
          ? "Tu as posé tes 10 questions des dernières 24 h. Reviens un peu plus tard."
          : res.error === "auth"
            ? "Connecte-toi pour poser ta question."
            : "Petit souci de connexion. Réessaie dans un instant.",
      );
    }
  }
  useEffect(() => setNativeApp(isNativeApp()), []);

  // Personnages & lieux mentionnés DANS CE VERSET (parmi ceux du chapitre),
  // repérés par les vraies variantes de nom de l'index (mot entier, bornes
  // livre/chapitre respectées) — exactement la logique du générateur.
  const versetFiches = useMemo(() => {
    if (!fiches) return [];
    const ids = fiches.chapitres[`${bookId}-${chapter}`] ?? [];
    const WORD = "[A-Za-zÀ-ÖØ-öø-ÿ-]";
    return ids.filter((id) => {
      const f = fiches.fiches[id];
      if (!f) return false;
      const variants =
        f.m
          ?.filter(
            (m) =>
              (!m.l || (bookId >= m.l[0] && bookId <= m.l[1])) &&
              (!m.c || (chapter >= m.c[0] && chapter <= m.c[1])),
          )
          .map((m) => m.v) ?? [];
      const pool = variants.length ? variants : [f.nom];
      return pool.some((v) => {
        const esc = v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        try {
          return new RegExp(`(?<!${WORD})${esc}(?!${WORD})`).test(verseText);
        } catch {
          return verseText.includes(v);
        }
      });
    });
  }, [fiches, bookId, chapter, verseText]);

  const dispo = (o: Outil): boolean => {
    if (o === "question") return true;
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

  function Bloc({ label, text, suffix }: { label: string; text?: string; suffix: string }) {
    if (!text) return null;
    const propre = nettoyerMarquesIA(text);
    return (
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-dawn-400">{label}</p>
        <Markable id={`${idBase}:comm:${suffix}`} text={propre} reference={reference} kind="commentaire">
          <p className="mt-1 text-[15px] leading-relaxed text-cream/85">{propre}</p>
        </Markable>
      </div>
    );
  }

  /** Bouton carré icône + libellé (onglets Annoter / Partager). */
  function Carre({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: ReactNode }) {
    return (
      <button type="button" onClick={onClick} className="flex flex-col items-center gap-1.5">
        <span
          className={`grid h-14 w-14 place-items-center rounded-2xl border transition-colors ${
            active ? "border-dawn-400 bg-dawn-400/15 text-dawn-300" : "border-white/10 bg-white/[0.06] text-cream/85"
          }`}
        >
          {children}
        </span>
        <span className={`text-[11px] font-bold leading-none ${active ? "text-dawn-300" : "text-cream/70"}`}>{label}</span>
      </button>
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
              <VersetSurligne texte={verseText} plage={plageSel} />
            </div>
            <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-cream/70">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>

        {/* L'onglet Étudier garde la grille d'outils ronds */}
        {onglet === "etudier" ? (
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
                    className="grid h-10 w-10 place-items-center rounded-full border-2 font-display text-base font-extrabold transition-all"
                    style={
                      actif
                        ? { borderColor: o.couleur, backgroundColor: o.couleur, color: "#0C0C0B", boxShadow: `0 0 14px ${o.couleur}66` }
                        : { borderColor: `${o.couleur}55`, color: o.couleur, backgroundColor: "rgba(255,255,255,.04)" }
                    }
                  >
                    {o.lettre(at)}
                  </span>
                  <span className={`text-[9px] font-bold leading-none ${actif ? "text-cream" : "text-cream/55"}`}>{o.label(at)}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {/* Pose ta question : bouton dédié sous la rangée d'outils */}
        {onglet === "etudier" ? (
          <div className="border-b border-white/10 px-4 py-2.5">
            <button
              type="button"
              onClick={() => setOutil("question")}
              className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition-colors ${
                outil === "question"
                  ? "border-[#FB923C] bg-[#FB923C]/15"
                  : "border-white/10 bg-white/[0.05]"
              }`}
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 font-display text-sm font-extrabold"
                style={
                  outil === "question"
                    ? { borderColor: "#FB923C", backgroundColor: "#FB923C", color: "#0C0C0B" }
                    : { borderColor: "#FB923C88", color: "#FB923C" }
                }
              >
                ?
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-sm font-bold ${outil === "question" ? "text-cream" : "text-cream/85"}`}>
                  Tu as une question sur ce verset ?
                </span>
                <span className="block text-xs text-cream/50">Pose-la directement — l'assistant répond.</span>
              </span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-cream/40" strokeWidth={2}>
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : null}

        {/* Le contenu de l'onglet */}
        <div className="min-h-[9rem] flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {onglet === "annoter" ? (
            <>
              {/* Surligner : la palette, avec le sens que TU donnes à chaque couleur */}
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cream/50">Surligner</p>
                  <button
                    type="button"
                    onClick={() => setEditPalette((v) => !v)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${
                      editPalette ? "border-dawn-400 text-dawn-300" : "border-white/15 text-cream/60"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth={2}>
                      <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {editPalette ? "Terminer" : "Personnaliser"}
                  </button>
                </div>
                <div className="mt-2.5 flex items-start justify-between gap-1.5">
                  {HIGHLIGHT_COLORS.map((c) => {
                    const actif = highlighted && hlColor === c.key;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        aria-label={actif ? "Retirer le surlignage" : `Surligner — ${legendes[c.key] ?? c.label}`}
                        onClick={() =>
                          actif
                            ? tk.clearHighlight(idBase)
                            : tk.highlightWith(idBase, c.key, { text: verseText, reference, kind: "verset" })
                        }
                        className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
                      >
                        <span
                          className={`h-8 w-8 rounded-lg ${c.swatch} transition-transform active:scale-90 ${
                            actif ? "ring-2 ring-white ring-offset-2 ring-offset-night-900" : ""
                          }`}
                        />
                        <span className={`w-full truncate text-center text-[9px] font-bold leading-tight ${actif ? "text-cream" : "text-cream/55"}`}>
                          {legendes[c.key] ?? c.label}
                        </span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    aria-label="Retirer le surlignage"
                    disabled={!highlighted}
                    onClick={() => tk.clearHighlight(idBase)}
                    className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/20 text-cream/60 disabled:opacity-25"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2}>
                      <circle cx="12" cy="12" r="9" />
                      <path d="M5.5 5.5l13 13" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                {editPalette ? (
                  <div className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs text-cream/55">
                      Donne ton propre sens à chaque couleur — il apparaîtra sous la palette.
                    </p>
                    {HIGHLIGHT_COLORS.map((c) => (
                      <div key={c.key} className="flex items-center gap-2.5">
                        <span className={`h-6 w-6 shrink-0 rounded-md ${c.swatch}`} />
                        <input
                          value={legendes[c.key] ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setLegendes((cur) => ({ ...cur, [c.key]: v }));
                            setPaletteLabel(c.key, v);
                          }}
                          placeholder={c.label}
                          maxLength={24}
                          className="min-w-0 flex-1 rounded-full border border-white/15 bg-night-950/50 px-3.5 py-2 text-sm text-cream placeholder:text-cream/35 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                <Carre label={existingNote ? "Ma note" : "Note"} active={Boolean(existingNote)} onClick={openNote}>
                  <PenGlyph className="h-6 w-6" />
                </Carre>
                <Carre
                  label={saved ? "Enregistré" : "Enregistrer"}
                  active={saved}
                  onClick={() => tk.toggleSnippet({ id: idBase, text: verseText, reference, kind: "verset" })}
                >
                  {saved ? <BookmarkFilledGlyph className="h-6 w-6" /> : <BookmarkGlyph className="h-6 w-6" />}
                </Carre>
                {nativeApp ? (
                  <Carre
                    label={memorizing || isMemorizing(reference) ? "À mémoriser" : "Mémoriser"}
                    active={memorizing || isMemorizing(reference)}
                    onClick={() => {
                      addMemorizeVerse(reference, verseText);
                      setMemorizing(true);
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={1.9}>
                      <path
                        d="M12 3a6 6 0 0 0-3.5 10.9c.7.5 1 1.3 1 2.1h5c0-.8.3-1.6 1-2.1A6 6 0 0 0 12 3zM10 19h4M10.8 21.5h2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Carre>
                ) : null}
              </div>
              {noting ? (
                <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-3">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Ta note sur ce passage…"
                    rows={3}
                    className="w-full resize-y rounded-xl border border-white/15 bg-night-950/60 px-3 py-2 text-sm text-cream placeholder:text-cream/35 focus:outline-none"
                    autoFocus
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={saveNote}
                      disabled={!noteText.trim()}
                      className="rounded-full bg-dawn-400 px-4 py-1.5 font-display text-xs font-bold text-night-950 disabled:opacity-40"
                    >
                      Enregistrer
                    </button>
                    {existingNote ? (
                      <button
                        type="button"
                        onClick={() => {
                          removeNote(existingNote.id);
                          tk.unmarkNoted(idBase);
                          setNoting(false);
                          setNoteText("");
                        }}
                        className="rounded-full border border-red-400/40 px-4 py-1.5 text-xs font-bold text-red-300"
                      >
                        Supprimer
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setNoting(false);
                        setNoteText("");
                      }}
                      className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-bold text-cream/70"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : null}
              {noteSaved ? (
                <p className="text-xs font-semibold text-dawn-300">Note enregistrée dans ton carnet.</p>
              ) : null}
            </>
          ) : onglet === "partager" ? (
            <div className="flex flex-wrap gap-3">
              <Carre label={copied ? "Copié !" : "Copier"} active={copied} onClick={copy}>
                <CopyGlyph className="h-6 w-6" />
              </Carre>
              <Carre
                label="Partager"
                onClick={() => shareText(`${verseText}\n${reference}`, appShareUrl(bibleHref(reference) || undefined))}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={1.9}>
                  <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v13M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Carre>
              <Carre
                label="Sur le mur"
                onClick={() => {
                  // Pré-remplit le composeur du mur de prière avec ce verset.
                  try {
                    localStorage.setItem("jb.wall.draft", `« ${verseText} »\n${reference}`);
                  } catch {
                    /* stockage indisponible */
                  }
                  onClose();
                  router.push("/communaute");
                }}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={1.9}>
                  <path d="M4 6h16M4 12h16M4 18h9" strokeLinecap="round" />
                </svg>
              </Carre>
            </div>
          ) : outil === "fiches" ? (
            fiches && versetFiches.length ? (
              versetFiches.map((id) => {
                const f = fiches.fiches[id];
                return (
                  <button key={id} type="button" onClick={() => setFicheId(id)} className="flex w-full items-start gap-3 text-left">
                    <Medaillon id={id} fiche={f} size="h-12 w-12" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 font-display text-base font-extrabold">
                        {f.nom}
                        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-cream/35" strokeWidth={2.2}>
                          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-cream/75 line-clamp-2">{f.bio}</span>
                      <span className="mt-1 block text-xs font-bold text-dawn-300">Voir la fiche complète</span>
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-cream/55">Aucun personnage ou lieu identifié dans ce verset.</p>
            )
          ) : outil === "question" ? (
            <div>
              {!userId ? (
                <p className="text-sm text-cream/60">Connecte-toi pour poser ta question sur ce verset.</p>
              ) : reponse ? (
                <>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-dawn-400">Réponse</p>
                  <div className="mt-2 space-y-2.5">
                    {reponse.split("\n\n").map((par, i) => (
                      <TexteAvecRefsVerset key={i} texte={par} onNavigate={(l, c) => { onClose(); onNavigate(l, c); }} />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReponse(null);
                      setQuestion("");
                    }}
                    className="mt-3 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-cream/70"
                  >
                    Poser une autre question
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-cream/60">
                    Pose ta question sur <span className="font-bold text-cream/85">{reference}</span> — la réponse
                    s'appuie sur la Bible, versets cliquables.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") poserQuestion();
                      }}
                      placeholder="Que signifie ce verset… ?"
                      disabled={qBusy}
                      className="flex-1 rounded-full border border-white/15 bg-night-950/50 px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:outline-none disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={poserQuestion}
                      disabled={!question.trim() || qBusy}
                      aria-label="Envoyer"
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950 disabled:opacity-40"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}>
                        <path d="M20 12L4 5l4.5 7L4 19zM20 12H9" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  {qBusy ? <p className="mt-2.5 text-xs font-semibold text-cream/50">L'assistant médite ta question…</p> : null}
                  {qErr ? <p className="mt-2.5 text-xs font-semibold text-red-300">{qErr}</p> : null}
                </>
              )}
            </div>
          ) : chargement ? (
            <p className="text-sm text-cream/55">Chargement de l'étude…</p>
          ) : commentaryState === "none" || !commentary ? (
            <p className="text-sm text-cream/55">Étude bientôt disponible pour ce verset.</p>
          ) : outil === "mots" ? (
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-dawn-400">
                Mots d'origine ({at ? "hébreu" : "grec"})
              </p>
              <p className="mt-1 text-xs text-cream/50">
                Tape un mot : le mot du verset qu'il traduit s'affiche et se surligne en haut.
              </p>
              <ul className="mt-2 space-y-2">
                {motsEtude.map((m, i) => {
                  const actif = motActif === i;
                  const terme = termeFrancais(m);
                  const strong = m.strong ?? numeroStrong(m.translit, m.mot);
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => setMotActif(actif ? null : i)}
                        className={`w-full rounded-2xl border px-3.5 py-3 text-left transition-colors ${
                          actif ? "border-dawn-400/70 bg-dawn-400/10" : "border-white/10 bg-white/[0.04]"
                        }`}
                      >
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-display text-lg font-extrabold">{m.mot}</span>
                          {m.translit ? <span className="text-sm font-semibold italic text-cream/55">{m.translit}</span> : null}
                          {terme ? (
                            <span className="rounded-full bg-dawn-400 px-2 py-0.5 text-[11px] font-black text-night-950">
                              = {terme}
                            </span>
                          ) : null}
                          {strong ? (
                            <span className="rounded-full border border-white/20 px-2 py-0.5 text-[11px] font-bold text-cream/70">
                              Strong {strong}
                            </span>
                          ) : null}
                        </span>
                        {m.sens ? <span className="mt-1 block text-[15px] leading-relaxed text-cream/85">{nettoyerMarquesIA(m.sens)}</span> : null}
                      </button>
                    </li>
                  );
                })}
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

        {/* Fiche complète par-dessus la feuille du verset */}
        {ficheId && fiches ? (
          <FicheSheet
            id={ficheId}
            data={fiches}
            bookId={bookId}
            chapter={chapter}
            bookNames={bookNames}
            zIndex="z-[140]"
            onClose={() => setFicheId(null)}
            onNavigate={(l, c) => {
              setFicheId(null);
              onClose();
              onNavigate(l, c);
            }}
          />
        ) : null}

        {/* La barre des trois onglets : Annoter · Étudier · Partager */}
        <div className="border-t border-white/10 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          <div className="flex rounded-full bg-white/[0.06] p-1">
            {(
              [
                ["annoter", "Annoter"],
                ["etudier", "Étudier"],
                ["partager", "Partager"],
              ] as [Onglet, string][]
            ).map(([t, label]) => (
              <button
                key={t}
                type="button"
                onClick={() => setOnglet(t)}
                aria-pressed={onglet === t}
                className={`flex-1 rounded-full py-2 font-display text-sm font-bold transition-colors ${
                  onglet === t ? "bg-night-950 text-dawn-300 shadow-card" : "text-cream/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
