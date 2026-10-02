"use client";

import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";

/**
 * VERSETS LIÉS — dans la feuille d'étude d'un verset :
 *   - Récits parallèles : le même événement raconté ailleurs (Évangiles,
 *     Samuel-Rois / Chroniques…), d'après content/paralleles.json ;
 *   - Références croisées : les passages qui éclairent ce verset, texte
 *     affiché directement (base OpenBible.info, licence CC BY).
 * Données construites par scripts/build-liens.py.
 */

/** [livre, chapitre, verset] ou [livre, chapitre, verset, versetFin] */
type Lien = [number, number, number, number?];
/** [livre, chapitreDébut, versetDébut, chapitreFin, versetFin] */
type Passage = [number, number, number, number, number];
type Groupe = { titre: string; p: Passage[] };

let parallelesP: Promise<Groupe[]> | null = null;
function getParalleles(): Promise<Groupe[]> {
  if (!parallelesP) {
    parallelesP = fetch(asset("/bible/paralleles.json"))
      .then((r) => (r.ok ? r.json() : { groupes: [] }))
      .then((d) => d.groupes as Groupe[])
      .catch(() => {
        parallelesP = null;
        return [];
      });
  }
  return parallelesP;
}

const liensP = new Map<number, Promise<Record<string, Lien[]>>>();
function getLiens(livre: number) {
  if (!liensP.has(livre)) {
    liensP.set(
      livre,
      fetch(asset(`/bible/liens/${livre}.json`))
        .then((r) => (r.ok ? r.json() : {}))
        .catch(() => {
          liensP.delete(livre);
          return {};
        }),
    );
  }
  return liensP.get(livre)!;
}

const livresP = new Map<number, Promise<string[][]>>();
function getLivre(livre: number) {
  if (!livresP.has(livre)) {
    livresP.set(
      livre,
      fetch(asset(`/bible/${livre}.json`))
        .then((r) => r.json())
        .then((b) => b.chapters as string[][])
        .catch(() => {
          livresP.delete(livre);
          return [];
        }),
    );
  }
  return livresP.get(livre)!;
}

const dans = (p: Passage, c: number, v: number) => {
  const [, c1, v1, c2, v2] = p;
  return (c > c1 || (c === c1 && v >= v1)) && (c < c2 || (c === c2 && v <= v2));
};

/** Combien de liens pour ce verset (pour le bouton d'accès). */
export function useNombreLiens(livre: number, chapitre: number, verset: number) {
  const [n, setN] = useState<{ paralleles: number; croisees: number } | null>(null);
  useEffect(() => {
    let actif = true;
    Promise.all([getParalleles(), getLiens(livre)]).then(([groupes, liens]) => {
      if (!actif) return;
      const paralleles = groupes
        .filter((g) => g.p.some((p) => p[0] === livre && dans(p, chapitre, verset)))
        .reduce((s, g) => s + g.p.filter((p) => !(p[0] === livre && dans(p, chapitre, verset))).length, 0);
      setN({ paralleles, croisees: liens[`${chapitre}:${verset}`]?.length ?? 0 });
    });
    return () => {
      actif = false;
    };
  }, [livre, chapitre, verset]);
  return n;
}

export function VersetsLies({
  livre,
  chapitre,
  verset,
  bookNames,
  onNavigate,
}: {
  livre: number;
  chapitre: number;
  verset: number;
  bookNames: Record<number, string>;
  onNavigate: (livre: number, chapitre: number) => void;
}) {
  const [groupes, setGroupes] = useState<Groupe[] | null>(null);
  const [liens, setLiens] = useState<Lien[] | null>(null);
  const [textes, setTextes] = useState<Record<string, string>>({});
  const [tout, setTout] = useState(false);

  useEffect(() => {
    let actif = true;
    setTout(false);
    getParalleles().then((g) => actif && setGroupes(g.filter((x) => x.p.some((p) => p[0] === livre && dans(p, chapitre, verset)))));
    getLiens(livre).then((d) => actif && setLiens(d[`${chapitre}:${verset}`] ?? []));
    return () => {
      actif = false;
    };
  }, [livre, chapitre, verset]);

  const visibles = (liens ?? []).slice(0, tout ? 8 : 4);

  // Le texte des versets liés, chargé livre par livre.
  useEffect(() => {
    let actif = true;
    for (const [b, c, v, v2] of visibles) {
      const k = `${b}:${c}:${v}`;
      if (textes[k]) continue;
      getLivre(b).then((ch) => {
        if (!actif) return;
        const t = (ch[c - 1] ?? []).slice(v - 1, v2 ?? v).join(" ").replace(/\s+/g, " ").trim();
        if (t) setTextes((x) => ({ ...x, [k]: t }));
      });
    }
    return () => {
      actif = false;
    };
  }, [liens, tout]); // eslint-disable-line react-hooks/exhaustive-deps

  const nom = (b: number) => bookNames[b] ?? "";
  const refLien = ([b, c, v, v2]: Lien) => `${nom(b)} ${c}.${v}${v2 ? `-${v2}` : ""}`;
  const refPassage = ([b, c1, v1, c2, v2]: Passage) =>
    `${nom(b)} ${c1}.${v1}${c1 === c2 ? (v2 > v1 ? `-${v2}` : "") : `-${c2}.${v2}`}`;

  if (!groupes || !liens) return <p className="text-sm text-cream/55">Chargement…</p>;

  return (
    <div className="space-y-5">
      {groupes.length ? (
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-dawn-400">Le même récit ailleurs</p>
          <div className="mt-2 space-y-2">
            {groupes.map((g) => (
              <div key={g.titre} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="text-[13px] font-bold text-cream/90">{g.titre}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {g.p.map((p) => {
                    const ici = p[0] === livre && dans(p, chapitre, verset);
                    return (
                      <button
                        key={p.join("-")}
                        type="button"
                        disabled={ici}
                        onClick={() => onNavigate(p[0], p[1])}
                        className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${
                          ici ? "border border-white/15 text-cream/45" : "bg-dawn-400 text-night-950"
                        }`}
                      >
                        {refPassage(p)}
                        {ici ? " · ici" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-dawn-400">Versets qui éclairent celui-ci</p>
        {liens.length ? (
          <>
            <ul className="mt-2 space-y-2">
              {visibles.map((l) => {
                const k = `${l[0]}:${l[1]}:${l[2]}`;
                return (
                  <li key={k}>
                    <button
                      type="button"
                      onClick={() => onNavigate(l[0], l[1])}
                      className="block w-full rounded-2xl border-l-[3px] border-dawn-400/60 bg-white/[0.04] px-3.5 py-2.5 text-left active:bg-white/10"
                    >
                      <span className="block text-[12px] font-black text-dawn-300">{refLien(l)}</span>
                      <span className="mt-0.5 block font-serif text-[14px] leading-relaxed text-cream/85">
                        {textes[k] ?? "…"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {liens.length > 4 && !tout ? (
              <button type="button" onClick={() => setTout(true)} className="mt-2 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-cream/75">
                Voir {liens.length - 4} autre{liens.length - 4 > 1 ? "s" : ""}
              </button>
            ) : null}
          </>
        ) : (
          <p className="mt-1.5 text-sm text-cream/55">Pas de renvoi pour ce verset.</p>
        )}
        <p className="mt-3 text-[10px] text-cream/35">Références croisées : OpenBible.info (licence CC BY).</p>
      </div>
    </div>
  );
}
