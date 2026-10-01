"use client";

import { useEffect, useMemo, useState } from "react";
import { asset } from "@/lib/asset";
import { bibleHref } from "@/lib/bible-ref";

/** Rend un paragraphe d'histoire : les références entre parenthèses
 * (« (Genèse 12:1) ») deviennent des liens qui ouvrent le chapitre. */
export function TexteAvecRefs({
  texte,
  onNavigate,
}: {
  texte: string;
  onNavigate: (bookId: number, chapter: number) => void;
}) {
  const parts = texte.split(/\(((?:[1-3]\s?)?[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s-]*?\s\d+(?:[.:]\d+(?:-\d+)?)?)\)/g);
  return (
    <p className="text-[15px] leading-relaxed text-cream/85">
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
            onClick={() => onNavigate(l, c)}
            className="font-semibold text-dawn-300 underline decoration-dawn-300/40 underline-offset-2"
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

export type Fiche = {
  nom: string;
  type: "personnage" | "lieu";
  bio: string;
  periode?: string;
  passages: [string, number, number][];
  /** Liens familiaux/spirituels vers d'autres fiches : [étiquette, id]. */
  relations?: [string, string][];
  /** Récit long (paragraphes \n\n) avec références bibliques entre
   * parenthèses, rendues cliquables. */
  histoire?: string;
};
export type FichesData = {
  fiches: Record<string, Fiche>;
  chapitres: Record<string, string[]>;
  apparitions: Record<string, string[]>;
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
  const open = openId ? data.fiches[openId] : null;
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
      {open && openId ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center">
          <button type="button" aria-label="Fermer" onClick={() => setOpenId(null)} className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" />
          <div className="dark-ctx relative flex max-h-[84vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-night-900 text-cream sm:rounded-3xl">
            <div className="overflow-y-auto px-5 pb-6 pt-5">
              <div className="flex items-start gap-4">
                <Medaillon id={openId} fiche={open} size="h-20 w-20" />
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dawn-400">
                    {open.type === "personnage" ? "Personnage" : "Lieu"}
                    {open.periode ? ` · ${open.periode}` : ""}
                  </p>
                  <h3 className="mt-0.5 font-display text-2xl font-extrabold leading-tight">{open.nom}</h3>
                </div>
                <button type="button" onClick={() => setOpenId(null)} aria-label="Fermer" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-cream/70">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
                </button>
              </div>

              <p className="mt-4 text-[15px] leading-relaxed text-cream/85">{open.bio}</p>

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
                          onClick={() => setOpenId(rid)}
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

              {/* Son histoire : le récit long, références cliquables */}
              {open.histoire ? (
                <>
                  <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-cream/45">
                    {open.type === "personnage" ? "Son histoire" : "Dans l'histoire biblique"}
                  </p>
                  <div className="mt-2 space-y-3">
                    {open.histoire.split("\n\n").map((par, i) => (
                      <TexteAvecRefs
                        key={i}
                        texte={par}
                        onNavigate={(l, c) => {
                          setOpenId(null);
                          setListOpen(false);
                          onNavigate(l, c);
                        }}
                      />
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
                    onClick={() => {
                      setOpenId(null);
                      setListOpen(false);
                      onNavigate(l, c);
                    }}
                    className="rounded-full bg-dawn-400 px-3.5 py-2 font-display text-sm font-bold text-night-950"
                  >
                    {label}
                  </button>
                ))}
              </div>

              {(() => {
                const apps = data.apparitions[openId] ?? [];
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
                            onClick={() => {
                              setOpenId(null);
                              setListOpen(false);
                              onNavigate(l, c);
                            }}
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
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
