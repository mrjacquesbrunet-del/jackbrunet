"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Rubriques repliables de l'espace admin. Chaque rubrique se réduit à une
 * ligne (titre + flèche) ; le sommaire en haut de page permet d'ouvrir
 * seulement celles dont on a besoin. Le choix est mémorisé sur l'appareil.
 */

const CLE = "jb.admin.ouvertes.v1";

export type RubriqueDef = { id: string; titre: string; icone: ReactNode };

type Ctx = { ouvertes: Set<string>; basculer: (id: string, ouvrir?: boolean) => void };
const RubriquesCtx = createContext<Ctx | null>(null);

export function useRubriques(ids: string[]) {
  const [ouvertes, setOuvertes] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const brut = JSON.parse(localStorage.getItem(CLE) || "[]") as string[];
      setOuvertes(new Set(brut.filter((id) => ids.includes(id))));
    } catch {
      /* stockage indisponible : tout replié */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function memoriser(s: Set<string>) {
    try {
      localStorage.setItem(CLE, JSON.stringify(Array.from(s)));
    } catch {
      /* ignore */
    }
  }

  function basculer(id: string, ouvrir?: boolean) {
    setOuvertes((prev) => {
      const s = new Set(prev);
      const ouvre = ouvrir ?? !s.has(id);
      if (ouvre) s.add(id);
      else s.delete(id);
      memoriser(s);
      return s;
    });
  }

  function toutes(ouvrir: boolean) {
    const s = ouvrir ? new Set(ids) : new Set<string>();
    memoriser(s);
    setOuvertes(s);
  }

  return { ouvertes, basculer, toutes };
}

export function RubriquesProvider({ value, children }: { value: Ctx; children: ReactNode }) {
  return <RubriquesCtx.Provider value={value}>{children}</RubriquesCtx.Provider>;
}

function Chevron({ ouvert }: { ouvert: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 fill-none stroke-current transition-transform ${ouvert ? "rotate-180" : ""}`}
      strokeWidth={2}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Sommaire : une pastille par rubrique (pleine = affichée). */
export function SommaireAdmin({
  rubriques,
  ouvertes,
  basculer,
  toutes,
}: {
  rubriques: RubriqueDef[];
  ouvertes: Set<string>;
  basculer: (id: string, ouvrir?: boolean) => void;
  toutes: (ouvrir: boolean) => void;
}) {
  const aucune = ouvertes.size === 0;
  return (
    <div className="mt-6 rounded-3xl border border-night-900/10 bg-white p-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-night-900/45">Afficher</p>
        <button
          type="button"
          onClick={() => toutes(aucune)}
          className="text-xs font-semibold text-spirit-600 hover:underline"
        >
          {aucune ? "Tout ouvrir" : "Tout replier"}
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {rubriques.map((r) => {
          const on = ouvertes.has(r.id);
          return (
            <button
              key={r.id}
              type="button"
              aria-pressed={on}
              onClick={() => {
                basculer(r.id);
                if (!on) {
                  // Ouvre puis amène la rubrique à l'écran.
                  setTimeout(() => {
                    document.getElementById(`admin-${r.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 60);
                }
              }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                on ? "bg-night-900 text-cream" : "bg-night-900/[0.05] text-night-900/65 hover:bg-night-900/10"
              }`}
            >
              <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{r.icone}</span>
              {r.titre}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Une rubrique : repliée, une simple ligne cliquable ; ouverte, le contenu
 * habituel avec un bouton pour la replier.
 */
export function Rubrique({ def, children }: { def: RubriqueDef; children: ReactNode }) {
  const ctx = useContext(RubriquesCtx);
  const ouvert = ctx?.ouvertes.has(def.id) ?? true;

  return (
    <div id={`admin-${def.id}`} className="mt-4 scroll-mt-24">
      {ouvert ? (
        <div className="relative [&>div:first-child]:mt-0 [&_h2]:pr-10">
          {children}
          <button
            type="button"
            onClick={() => ctx?.basculer(def.id, false)}
            aria-label={`Replier ${def.titre}`}
            title="Replier"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-night-900/[0.05] text-night-900/55 transition-colors hover:bg-night-900/10 hover:text-night-900"
          >
            <Chevron ouvert />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ctx?.basculer(def.id, true)}
          className="flex w-full items-center gap-3 rounded-3xl border border-night-900/10 bg-white px-5 py-4 text-left transition-colors hover:border-night-900/20"
        >
          <span className="text-spirit-600 [&>svg]:h-5 [&>svg]:w-5">{def.icone}</span>
          <span className="flex-1 font-display text-lg font-bold">{def.titre}</span>
          <span className="text-night-900/40">
            <Chevron ouvert={false} />
          </span>
        </button>
      )}
    </div>
  );
}
