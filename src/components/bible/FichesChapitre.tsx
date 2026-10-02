"use client";

import { useEffect, useMemo, useState } from "react";
import { asset } from "@/lib/asset";
import { bibleHref } from "@/lib/bible-ref";
import { LieuCarte } from "@/components/bible/LieuCarte";

/** Rend un paragraphe d'histoire : les références entre parenthèses
 * (« (Genèse 12:1) ») deviennent des liens qui ouvrent le chapitre. */
export function TexteAvecRefs({
  texte,
  onNavigate,
  light = false,
  onRef,
}: {
  texte: string;
  onNavigate: (bookId: number, chapter: number) => void;
  /** Variante pour les pages à fond clair (École biblique). */
  light?: boolean;
  /** Si fourni, un tap sur une référence appelle ce rappel (pop-up verset)
   * au lieu de naviguer vers le lecteur biblique. */
  onRef?: (reference: string) => void;
}) {
  const parts = texte.split(/\(((?:[1-3]\s?)?[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s-]*?\s\d+(?:[.:]\d+(?:-\d+)?)?)\)/g);
  return (
    <p className={light ? "text-[15px] leading-relaxed text-night-900/85" : "text-[15px] leading-relaxed text-cream/85"}>
      {parts.map((part, i) => {
        if (i % 2 === 0) return <span key={i}>{part}</span>;
        const href = bibleHref(part);
        if (!href) return <span key={i}>({part})</span>;
        const params = new URLSearchParams(href.split("?")[1]);
        const l = Number(params.get("livre"));
        const c = Number(params.get("chap"));
        return (
          <button
            key={i}
            type="button"
            onClick={() => (onRef ? onRef(part) : onNavigate(l, c))}
            className={
              light
                ? "font-semibold text-[#5F7A00] underline decoration-[#5F7A00]/40 underline-offset-2"
                : "font-semibold text-dawn-300 underline decoration-dawn-300/40 underline-offset-2"
            }
          >
            ({part})
          </button>
        );
      })}
    </p>
  );
}

/**
 * « Dans ce chapitre » — les personnages et les lieux dont parle le chapitre,
 * présentés en PILE de médaillons : un tap sur la pile fait défiler les
 * figures (au lieu d'une longue grille), et « Lire sa fiche » ouvre la fiche
 * complète : portrait, bio, passages clés et tous les chapitres où la figure
 * apparaît (navigation croisée). Les données viennent de
 * public/bible/fiches.json (pré-généré par scripts/build-fiches-index.mjs).
 */

export type FicheMatch = { v: string; l?: [number, number]; c?: [number, number] };
export type ParcoursEtape = {
  t: string;
  d?: string;
  r?: string;
  e?: string;
  g?: [number, number];
};
export type Fiche = {
  nom: string;
  type: "personnage" | "lieu";
  bio: string;
  periode?: string;
  passages: [string, number, number][];
  /** Tribu d'Israël : id de la fiche du patriarche (ex. « juda-fils »). */
  tribu?: string;
  /** Liens familiaux/spirituels vers d'autres fiches : [étiquette, id]. */
  relations?: [string, string][];
  /** Récit long (paragraphes \n\n) avec références bibliques entre
   * parenthèses, rendues cliquables. */
  histoire?: string;
  /** Variantes de nom (bornées livre/chapitre) — détection par verset. */
  m?: FicheMatch[];
  /** [lon, lat] pour la carte stylisée (lieux). */
  geo?: [number, number];
  /** Parcours chronologique (grandes figures), étapes ordonnées. */
  parcours?: ParcoursEtape[];
  /** Chronologie des écrits (auteurs bibliques). */
  ecrits?: { t: string; e?: string; d?: string }[];
};
export type FichesData = {
  fiches: Record<string, Fiche>;
  chapitres: Record<string, string[]>;
  apparitions: Record<string, string[]>;
  /** Livre → fiches dans l'ordre d'entrée en scène (au verset près). */
  ordre?: Record<string, string[]>;
};

let dataPromise: Promise<FichesData | null> | null = null;
export function getFiches(): Promise<FichesData | null> {
  if (!dataPromise) {
    dataPromise = fetch(asset("/bible/fiches.json"))
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  return dataPromise;
}

/** Médaillon : portrait si présent (img/bible/fiches/<id>.jpg), sinon un
 * monogramme élégant sur dégradé — remplacé au fur et à mesure des portraits. */
export function Medaillon({ id, fiche, size = "h-16 w-16" }: { id: string; fiche: Fiche; size?: string }) {
  const [imgOk, setImgOk] = useState(true);
  const grad =
    fiche.type === "personnage"
      ? "linear-gradient(150deg,#8a5a2b,#5f3d1d)"
      : "linear-gradient(150deg,#365d7a,#1f3a4d)";
  return (
    <span className={`relative block ${size} overflow-hidden rounded-full border border-white/15 shadow-card`} style={{ background: grad }}>
      {imgOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset(`/img/bible/fiches/${id}.jpg`)}
          alt=""
          loading="lazy"
          decoding="async"
          width={1024}
          height={1024}
          onError={() => setImgOk(false)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center font-display text-xl font-extrabold text-cream/90">
          {fiche.nom.replace(/^(Le |La |Les |L')/, "").charAt(0)}
        </span>
      )}
    </span>
  );
}

export function FichesChapitre({
  bookId,
  chapter,
  bookNames,
  onNavigate,
  dark = false,
}: {
  bookId: number;
  chapter: number;
  /** id → nom du livre (pour afficher « Apparaît aussi dans »). */
  bookNames: Record<number, string>;
  onNavigate: (bookId: number, chapter: number) => void;
  /** Vrai quand la page est sur un thème de lecture sombre. */
  dark?: boolean;
}) {
  const [data, setData] = useState<FichesData | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  // La feuille listant TOUTES les figures du chapitre.
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    getFiches().then(setData);
  }, []);
  useEffect(() => setListOpen(false), [bookId, chapter]);

  // Personnages d'abord, puis lieux, alphabétique — l'ordre du défilement.
  const ordered = useMemo(() => {
    if (!data) return [];
    const ids = data.chapitres[`${bookId}-${chapter}`] ?? [];
    const of = (t: Fiche["type"]) =>
      ids
        .filter((id) => data.fiches[id]?.type === t)
        .sort((a, b) => data.fiches[a].nom.localeCompare(data.fiches[b].nom, "fr"));
    return [...of("personnage"), ...of("lieu")];
  }, [data, bookId, chapter]);

  if (!data || ordered.length === 0) return null;
  // L'anneau entre les cartes de la pile reprend le fond de la page pour
  // dessiner un vrai espace entre les médaillons.
  const ring = dark ? "#171716" : "#F3F3ED";
  const nPers = ordered.filter((id) => data.fiches[id].type === "personnage").length;
  const nLieux = ordered.length - nPers;

  return (
    <div className="mx-auto mt-10 max-w-2xl">
      <p className={`flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.22em] ${dark ? "text-cream/40" : "text-night-900/40"}`}>
        <span className="h-px flex-1 bg-current opacity-30" />
        Dans ce chapitre
        <span className="h-px flex-1 bg-current opacity-30" />
      </p>

      {/* La pile de médaillons : un tap ouvre la liste de TOUTES les figures */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => setListOpen(true)}
          aria-label="Voir les personnages et lieux du chapitre"
          className="group flex flex-col items-center gap-2.5"
        >
          <span className="relative h-24 transition-transform group-active:scale-95" style={{ width: `${6 + Math.min(3, ordered.length - 1) * 0.875}rem` }}>
            {ordered.slice(0, 4).map((id, n) => (
              <span
                key={id}
                className="absolute top-0 block h-24 w-24"
                style={{
                  left: `${(Math.min(4, ordered.length) - 1 - n) * 14}px`,
                  zIndex: 40 - n * 10,
                  transform: `scale(${1 - n * 0.045})`,
                  boxShadow: `0 0 0 3px ${ring}`,
                  borderRadius: "9999px",
                }}
              >
                <Medaillon id={id} fiche={data.fiches[id]} size="h-24 w-24" />
              </span>
            ))}
          </span>
          <span className={`font-display text-sm font-extrabold ${dark ? "text-cream" : "text-night-900"}`}>
            {nPers > 0 ? `${nPers} personnage${nPers > 1 ? "s" : ""}` : ""}
            {nPers > 0 && nLieux > 0 ? " · " : ""}
            {nLieux > 0 ? `${nLieux} lieu${nLieux > 1 ? "x" : ""}` : ""}
          </span>
          <span className={`-mt-1.5 text-xs ${dark ? "text-cream/45" : "text-night-900/45"}`}>
            Touche pour tout découvrir
          </span>
        </button>
      </div>

      {/* La feuille : toutes les figures du chapitre, en grille */}
      {listOpen ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center">
          <button type="button" aria-label="Fermer" onClick={() => setListOpen(false)} className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" />
          <div className="dark-ctx relative flex max-h-[84vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-night-900 text-cream sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
              <p className="font-display text-base font-extrabold">Dans ce chapitre</p>
              <button
                type="button"
                onClick={() => setListOpen(false)}
                aria-label="Fermer"
                className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-cream/70"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
              {[
                { titre: "Personnages", t: "personnage" as const },
                { titre: "Lieux", t: "lieu" as const },
              ].map((g) => {
                const ids = ordered.filter((id) => data.fiches[id].type === g.t);
                if (!ids.length) return null;
                return (
                  <div key={g.t} className="mb-5">
                    <p className="mb-3 px-1 text-[11px] font-black uppercase tracking-[0.18em] text-dawn-400">{g.titre}</p>
                    <div className="grid grid-cols-3 gap-x-3 gap-y-5">
                      {ids.map((id) => {
                        const f = data.fiches[id];
                        return (
                          <button key={id} type="button" onClick={() => setOpenId(id)} className="group flex flex-col items-center gap-1.5 text-center">
                            <span className="transition-transform group-active:scale-90">
                              <Medaillon id={id} fiche={f} />
                            </span>
                            <span className="line-clamp-2 text-[13px] font-bold leading-tight text-cream/90">{f.nom}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* Fiche : feuille qui monte du bas */}
      {openId ? (
        <FicheSheet
          id={openId}
          data={data}
          bookId={bookId}
          chapter={chapter}
          bookNames={bookNames}
          onClose={() => setOpenId(null)}
          onNavigate={(l, c) => {
            setOpenId(null);
            setListOpen(false);
            onNavigate(l, c);
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * La FICHE COMPLÈTE en feuille : portrait, bio, carte (lieux), famille &
 * liens (navigation de fiche en fiche), parcours chronologique, écrits,
 * histoire et passages. Réutilisée par « Dans ce chapitre » ET par l'outil
 * « Qui & où » de la feuille du verset.
 */
export function FicheSheet({
  id: initialId,
  data,
  bookId,
  chapter,
  bookNames,
  onClose,
  onNavigate,
  zIndex = "z-[120]",
}: {
  id: string;
  data: FichesData;
  bookId: number;
  chapter: number;
  bookNames: Record<number, string>;
  onClose: () => void;
  /** Le parent ferme ce qu'il faut puis navigue. */
  onNavigate: (bookId: number, chapter: number) => void;
  zIndex?: string;
}) {
  // La navigation entre fiches liées se fait ici, sans fermer la feuille.
  const [id, setId] = useState(initialId);
  useEffect(() => setId(initialId), [initialId]);
  const open = data.fiches[id];
  if (!open) return null;

  return (
    <div className={`fixed inset-0 ${zIndex} flex items-end justify-center sm:items-center`}>
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" />
      <div className="dark-ctx relative flex max-h-[84vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-night-900 text-cream sm:rounded-3xl">
        <div className="overflow-y-auto px-5 pb-6 pt-5">
          <div className="flex items-start gap-4">
            <Medaillon id={id} fiche={open} size="h-20 w-20" />
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dawn-400">
                {open.type === "personnage" ? "Personnage" : "Lieu"}
                {open.periode ? ` · ${open.periode}` : ""}
              </p>
              <h3 className="mt-0.5 font-display text-2xl font-extrabold leading-tight">{open.nom}</h3>
              {open.tribu && data.fiches[open.tribu] ? (
                <button
                  type="button"
                  onClick={() => setId(open.tribu!)}
                  className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-dawn-400/40 bg-dawn-400/10 px-2.5 py-1 text-[11px] font-bold text-dawn-300"
                >
                  <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth={2}>
                    <path d="M5 21V4h9l1 2h4v9h-6l-1-2H7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Tribu de {data.fiches[open.tribu].nom.replace(/\s*\(.*\)$/, "")}
                </button>
              ) : null}
            </div>
            <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-cream/70">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
            </button>
          </div>

          <FicheCorps
            id={id}
            data={data}
            bookNames={bookNames}
            onNavigate={onNavigate}
            onOpen={setId}
            here={{ bookId, chapter }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Le CORPS d'une fiche (tout sauf l'en-tête) : bio, carte, famille & liens,
 * parcours, écrits, histoire, passages clés et chapitres où la figure apparaît.
 * Partagé par la feuille (FicheSheet) et la galerie de la Formation.
 */
export function FicheCorps({
  id,
  data,
  bookNames,
  onNavigate,
  onOpen,
  here,
}: {
  id: string;
  data: FichesData;
  bookNames: Record<number, string>;
  onNavigate: (bookId: number, chapter: number) => void;
  /** Ouvre une fiche liée (relation, tribu). */
  onOpen: (id: string) => void;
  /** Chapitre en cours de lecture, désactivé dans la liste des apparitions. */
  here?: { bookId: number; chapter: number };
}) {
  const open = data.fiches[id];
  if (!open) return null;
  const bookId = here?.bookId ?? -1;
  const chapter = here?.chapter ?? -1;
  const setId = onOpen;
  return (
    <>
    <p className="mt-4 text-[15px] leading-relaxed text-cream/85">{open.bio}</p>

    {/* Lieu : la carte stylisée qui le situe */}
    {open.type === "lieu" && open.geo ? (
      <LieuCarte className="mt-4" points={[{ g: open.geo, label: open.nom.replace(/\s*\(.*\)$/, "") }]} />
    ) : null}

    {/* Famille & liens : un tap ouvre la fiche liée */}
    {open.relations?.length ? (
      <>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-cream/45">Famille &amp; liens</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {open.relations.map(([label, rid]) => {
            const rf = data.fiches[rid];
            if (!rf) return null;
            return (
              <button
                key={`${rid}-${label}`}
                type="button"
                onClick={() => setId(rid)}
                className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] py-1 pl-1 pr-3 transition-colors hover:bg-white/10"
              >
                <Medaillon id={rid} fiche={rf} size="h-8 w-8" />
                <span className="text-left leading-tight">
                  <span className="block text-[9px] font-black uppercase tracking-wide text-dawn-300">{label}</span>
                  <span className="block text-xs font-bold text-cream">{rf.nom}</span>
                </span>
              </button>
            );
          })}
        </div>
      </>
    ) : null}

    {/* Son parcours : carte du trajet + frise chronologique */}
    {open.parcours?.length ? (
      <>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-cream/45">Son parcours</p>
        {open.parcours.filter((s) => s.g).length > 1 ? (
          <LieuCarte
            className="mt-2"
            route
            points={open.parcours
              .filter((s) => s.g)
              .map((s) => ({ g: s.g as [number, number], label: s.t.split("—")[0].split("(")[0].trim() }))}
          />
        ) : null}
        <ol className="relative mt-3 space-y-0 border-l border-white/15 pl-5">
          {open.parcours.map((s, i) => (
            <li key={i} className="relative pb-4 last:pb-0">
              <span className="absolute -left-[1.45rem] top-0.5 grid h-4 w-4 place-items-center rounded-full border-2 border-dawn-400 bg-night-900 text-[8px] font-black text-dawn-300">
                {i + 1}
              </span>
              <p className="text-sm font-bold leading-snug text-cream">
                {s.t}
                {s.e ? <span className="ml-2 text-[11px] font-semibold text-cream/45">{s.e}</span> : null}
              </p>
              {s.d ? <p className="mt-0.5 text-[13px] leading-snug text-cream/70">{s.d}</p> : null}
              {s.r ? (
                <button
                  type="button"
                  onClick={() => {
                    const h = bibleHref(s.r);
                    if (!h) return;
                    const q = new URLSearchParams(h.split("?")[1]);
                    onNavigate(Number(q.get("livre")), Number(q.get("chap")));
                  }}
                  className="mt-0.5 text-xs font-bold text-dawn-300 underline decoration-dawn-300/40 underline-offset-2"
                >
                  {s.r}
                </button>
              ) : null}
            </li>
          ))}
        </ol>
      </>
    ) : null}

    {/* Ses écrits : la chronologie des livres */}
    {open.ecrits?.length ? (
      <>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-cream/45">Ses écrits</p>
        <div className="mt-2 space-y-2.5">
          {open.ecrits.map((w, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5">
              <p className="text-sm font-bold text-cream">
                {w.t}
                {w.e ? <span className="ml-2 text-[11px] font-semibold text-dawn-300">{w.e}</span> : null}
              </p>
              {w.d ? (
                <div className="mt-0.5 [&_p]:text-[13px] [&_p]:leading-snug [&_p]:text-cream/70">
                  <TexteAvecRefs texte={w.d} onNavigate={onNavigate} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </>
    ) : null}

    {/* Son histoire : le récit long, références cliquables */}
    {open.histoire ? (
      <>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-cream/45">
          {open.type === "personnage" ? "Son histoire" : "Dans l'histoire biblique"}
        </p>
        <div className="mt-2 space-y-3">
          {open.histoire.split("\n\n").map((par, i) => (
            <TexteAvecRefs key={i} texte={par} onNavigate={onNavigate} />
          ))}
        </div>
      </>
    ) : null}

    <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-cream/45">Passages clés</p>
    <div className="mt-2 flex flex-wrap gap-2">
      {open.passages.map(([label, l, c]) => (
        <button
          key={`${l}-${c}`}
          type="button"
          onClick={() => onNavigate(l, c)}
          className="rounded-full bg-dawn-400 px-3.5 py-2 font-display text-sm font-bold text-night-950"
        >
          {label}
        </button>
      ))}
    </div>

    {(() => {
      const apps = data.apparitions[id] ?? [];
      if (apps.length <= 1) return null;
      const shown = apps.slice(0, 18);
      return (
        <>
          <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-cream/45">
            Apparaît dans {apps.length} chapitre{apps.length > 1 ? "s" : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {shown.map((key) => {
              const [l, c] = key.split("-").map(Number);
              const here = l === bookId && c === chapter;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={here}
                  onClick={() => onNavigate(l, c)}
                  className={`rounded-full px-2.5 py-1.5 text-xs font-bold ${
                    here ? "bg-dawn-400/25 text-dawn-300" : "bg-white/[0.07] text-cream/80 hover:bg-white/15"
                  }`}
                >
                  {bookNames[l] ?? l} {c}
                </button>
              );
            })}
            {apps.length > shown.length ? (
              <span className="rounded-full px-2 py-1.5 text-xs font-semibold text-cream/45">
                +{apps.length - shown.length} autres
              </span>
            ) : null}
          </div>
        </>
      );
    })()}
    </>
  );
}
