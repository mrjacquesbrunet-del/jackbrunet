"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { FicheSheet, Medaillon, TexteAvecRefs, getFiches, type FichesData } from "@/components/bible/FichesChapitre";

/**
 * INTRODUCTIONS AUX LIVRES — une seule source (public/bible/introductions.json,
 * construite depuis content/introductions-livres.json), deux portes d'entrée :
 *   - le lecteur Bible : petit bouton « Intro » à côté de la référence + sélecteur ;
 *   - Étude › Explorer › Les 66 livres (/ecole/livres).
 */

export type IntroLivre = {
  accroche: string;
  resume: string;
  auteur: string;
  date: string;
  destinataires: string;
  contexte: string;
  /** [titre, chapitreDébut, chapitreFin, versets?] */
  plan: [string, number, number, string?][];
  themes: [string, string][];
  versets: { ref: string; l: number; c: number; t: string }[];
  pers: string[];
  christ: string;
  frise: string | null;
};
export type GroupeLivres = { id: string; nom: string; desc: string; de: number; a: number };
export type IntrosData = { groupes: GroupeLivres[]; livres: Record<string, IntroLivre> };

let introsPromise: Promise<IntrosData | null> | null = null;
export function getIntroductions(): Promise<IntrosData | null> {
  if (!introsPromise) {
    introsPromise = fetch(asset("/bible/introductions.json"))
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => {
        introsPromise = null;
        return null;
      });
  }
  return introsPromise;
}

/** Couleur de chaque famille de livres (repères visuels communs). */
export const COULEUR_GROUPE: Record<string, string> = {
  pentateuque: "#C99A3B",
  historiques: "#7FA33A",
  poetiques: "#8A6BFF",
  "grands-prophetes": "#D9692E",
  "petits-prophetes": "#4F9FD0",
  evangiles: "#CAF000",
  actes: "#E8B44A",
  paul: "#3FB59A",
  generales: "#C77DBA",
  apocalypse: "#D9542E",
};

export function groupeDe(data: IntrosData, n: number) {
  return data.groupes.find((g) => n >= g.de && n <= g.a);
}

const nomCourt = (nom: string) => nom.replace(/\s*\(.*\)$/, "");

function Glyphe({ d, className = "h-4 w-4" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0 fill-none stroke-current`} strokeWidth={1.9}>
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
const G = {
  plume: "M20 4c-6 0-11 4-13 11l-2 5M20 4c0 6-4 10-9 11M9 15c2-3 5-6 8-8",
  sablier: "M7 3h10M7 21h10M8 3c0 5 8 6 8 9s-8 4-8 9M16 3c0 5-8 6-8 9s8 4 8 9",
  gens: "M16 20v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 20v-.5a3 3 0 0 0-2.5-3M17 4.5a3 3 0 0 1 0 5.6M4 20v-.5a3 3 0 0 1 2.5-3M7 4.5a3 3 0 0 0 0 5.6",
  croix: "M12 3v18M7 8h10",
  frise: "M3 12h18M7 12v-3M12 12V7M17 12v-4M7 15v.01M12 17v.01M17 15v.01",
  galerie: "M4 6h10v14H4zM14 8l6 2-3 10-3-1",
  livre: "M12 6c-1.8-1.4-4.2-2-7-2v14c2.8 0 5.2.6 7 2 1.8-1.4 4.2-2 7-2V4c-2.8 0-5.2.6-7 2zM12 6v14",
  fleche: "M9 6l6 6-6 6",
};

function Titre({ children }: { children: React.ReactNode }) {
  return <p className="mt-7 text-[11px] font-black uppercase tracking-[0.2em] text-cream/45">{children}</p>;
}

/** Le contenu complet d'une introduction (fond sombre). */
export function IntroLivreCorps({
  n,
  nom,
  intro,
  groupe,
  fiches,
  onNavigate,
  onFiche,
  liens = true,
}: {
  n: number;
  nom: string;
  intro: IntroLivre;
  groupe?: GroupeLivres;
  fiches: FichesData | null;
  onNavigate: (livre: number, chapitre: number) => void;
  onFiche: (id: string) => void;
  /** Liens vers la frise et la galerie (masqués quand on y est déjà). */
  liens?: boolean;
}) {
  const couleur = (groupe && COULEUR_GROUPE[groupe.id]) || "#CAF000";
  const nbChap = intro.plan.at(-1)?.[2] ?? 1;
  const aDesFiches = !!fiches?.ordre?.[String(n)]?.some((id) => fiches.fiches[id]?.type === "personnage");

  return (
    <div className="font-sans text-cream">
      <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: couleur }}>
        {groupe?.nom ?? "Introduction"} · {nbChap} chapitre{nbChap > 1 ? "s" : ""}
      </p>
      <h2 className="mt-1 font-display text-3xl font-extrabold leading-tight">{nom}</h2>
      <p className="mt-1 font-display text-lg font-bold leading-snug" style={{ color: couleur }}>
        {intro.accroche}
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-cream/80">{intro.resume}</p>

      {/* Fiche d'identité du livre */}
      <div className="mt-5 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        {(
          [
            ["Auteur", G.plume, intro.auteur],
            ["Date", G.sablier, intro.date],
            ["Destinataires", G.gens, intro.destinataires],
          ] as const
        ).map(([label, icone, texte]) => (
          <div key={label} className="flex gap-3 px-4 py-3.5">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.07]" style={{ color: couleur }}>
              <Glyphe d={icone} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cream/45">{label}</p>
              <div className="mt-0.5 [&_p]:text-[14px]">
                <TexteAvecRefs texte={texte} onNavigate={onNavigate} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Titre>Contexte</Titre>
      <div className="mt-2 space-y-3">
        {intro.contexte.split("\n\n").map((p, i) => (
          <TexteAvecRefs key={i} texte={p} onNavigate={onNavigate} />
        ))}
      </div>

      <Titre>Plan du livre</Titre>
      <ol className="mt-2 space-y-1.5">
        {intro.plan.map(([titre, de, a, versets], i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onNavigate(n, de)}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left active:bg-white/10"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-display text-xs font-black text-night-950" style={{ background: couleur }}>
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold leading-snug text-cream/90">{titre}</span>
                <span className="block text-[11px] font-semibold text-cream/45">
                  {versets ? `Versets ${versets}` : de === a ? `Chapitre ${de}` : `Chapitres ${de} à ${a}`}
                </span>
              </span>
              <Glyphe d={G.fleche} className="h-4 w-4 text-cream/35" />
            </button>
          </li>
        ))}
      </ol>

      <Titre>Thèmes clés</Titre>
      <div className="mt-2 grid gap-2">
        {intro.themes.map(([titre, phrase]) => (
          <div key={titre} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="font-display text-[15px] font-extrabold">{titre}</p>
            <div className="mt-0.5 [&_p]:text-[14px] [&_p]:text-cream/75">
              <TexteAvecRefs texte={phrase} onNavigate={onNavigate} />
            </div>
          </div>
        ))}
      </div>

      {intro.versets.length ? (
        <>
          <Titre>Versets clés</Titre>
          <div className="mt-2 space-y-2">
            {intro.versets.map((v) => (
              <button
                key={v.ref}
                type="button"
                onClick={() => onNavigate(v.l, v.c)}
                className="block w-full rounded-2xl border-l-[3px] bg-white/[0.04] px-4 py-3 text-left active:bg-white/10"
                style={{ borderColor: couleur }}
              >
                <span className="block font-serif text-[15px] leading-relaxed text-cream/90">{v.t}</span>
                <span className="mt-1.5 block text-[12px] font-black" style={{ color: couleur }}>
                  {v.ref.replace(":", ".")}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {fiches && intro.pers.some((id) => fiches.fiches[id]) ? (
        <>
          <Titre>Personnages</Titre>
          <div className="mt-2 grid grid-cols-4 gap-x-2 gap-y-3">
            {intro.pers.map((id) => {
              const f = fiches.fiches[id];
              if (!f) return null;
              return (
                <button key={id} type="button" onClick={() => onFiche(id)} className="flex flex-col items-center gap-1 text-center">
                  <Medaillon id={id} fiche={f} size="h-14 w-14" />
                  <span className="line-clamp-2 text-[11px] font-bold leading-tight text-cream/85">{nomCourt(f.nom)}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {/* Le Christ dans ce livre : le fil rouge de toute l'Écriture */}
      <div className="mt-7 rounded-3xl p-[1.5px]" style={{ background: `linear-gradient(140deg, ${couleur}, rgba(255,255,255,.08))` }}>
        <div className="rounded-[22px] bg-night-900 px-4 py-4">
          <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: couleur }}>
            <Glyphe d={G.croix} />
            Le Christ dans ce livre
          </p>
          <div className="mt-2">
            <TexteAvecRefs texte={intro.christ} onNavigate={onNavigate} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-2">
        <button
          type="button"
          onClick={() => onNavigate(n, 1)}
          className="flex items-center justify-center gap-2 rounded-full bg-dawn-400 py-3 font-display text-sm font-bold text-night-950"
        >
          <Glyphe d={G.livre} />
          Lire {nom}, chapitre 1
        </button>
        {liens && (intro.frise || aDesFiches) ? (
          <div className="grid grid-cols-2 gap-2">
            {intro.frise ? (
              <Link
                href={`/ecole/chronologie?ev=${intro.frise}`}
                className="flex items-center justify-center gap-2 rounded-full border border-white/15 py-2.5 text-[13px] font-bold text-cream/85"
              >
                <Glyphe d={G.frise} />
                Sur la frise
              </Link>
            ) : null}
            {aDesFiches ? (
              <Link
                href={`/ecole/personnages?livre=${n}`}
                className={`flex items-center justify-center gap-2 rounded-full border border-white/15 py-2.5 text-[13px] font-bold text-cream/85 ${intro.frise ? "" : "col-span-2"}`}
              >
                <Glyphe d={G.galerie} />
                Galerie du livre
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Feuille plein écran (lecteur Bible) : charge ses données, gère ses fiches. */
export function IntroLivreSheet({
  n,
  nom,
  bookNames,
  onClose,
  onNavigate,
}: {
  n: number;
  nom: string;
  bookNames: Record<number, string>;
  onClose: () => void;
  onNavigate: (livre: number, chapitre: number) => void;
}) {
  const [data, setData] = useState<IntrosData | null>(null);
  const [fiches, setFiches] = useState<FichesData | null>(null);
  const [fiche, setFiche] = useState<string | null>(null);
  useEffect(() => {
    getIntroductions().then(setData);
    getFiches().then(setFiches);
  }, []);
  const intro = data?.livres[String(n)];

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" />
      <div className="dark-ctx relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-night-900 text-cream sm:rounded-3xl">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-3">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cream/55">Introduction au livre</p>
          <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-cream/70">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-4">
          {intro && data ? (
            <IntroLivreCorps
              n={n}
              nom={nom}
              intro={intro}
              groupe={data.groupes.find((g) => n >= g.de && n <= g.a)}
              fiches={fiches}
              onNavigate={onNavigate}
              onFiche={setFiche}
            />
          ) : (
            <p className="py-10 text-center text-sm text-cream/50">Chargement…</p>
          )}
        </div>
      </div>
      {fiche && fiches ? (
        <FicheSheet
          id={fiche}
          data={fiches}
          bookId={-1}
          chapter={-1}
          bookNames={bookNames}
          zIndex="z-[130]"
          onClose={() => setFiche(null)}
          onNavigate={(l, c) => {
            setFiche(null);
            onNavigate(l, c);
          }}
        />
      ) : null}
    </div>
  );
}
