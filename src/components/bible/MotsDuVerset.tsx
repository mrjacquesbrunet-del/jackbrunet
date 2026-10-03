"use client";

import { useEffect, useState } from "react";
import { getIndexLexique, getMotsDuVerset, type EntreeIndex } from "@/lib/lexique";

/**
 * Les mots grecs ou hébreux d'un verset, dans l'ordre du texte français :
 * « berger → רָעָה », chacun ouvrant son étude dans le lexique.
 */
export function MotsDuVerset({
  livre,
  chapitre,
  verset,
  texte,
  onOuvrir,
}: {
  livre: number;
  chapitre: number;
  verset: number;
  texte: string;
  onOuvrir: (code: string) => void;
}) {
  const [mots, setMots] = useState<[string, number?, number?][] | null>(null);
  const [index, setIndex] = useState<Map<string, EntreeIndex> | null>(null);

  useEffect(() => {
    let actif = true;
    setMots(null);
    getMotsDuVerset(livre, chapitre, verset)
      .then((m) => actif && setMots(m))
      .catch(() => actif && setMots([]));
    getIndexLexique()
      .then((i) => actif && setIndex(new Map(i.map((e) => [e[0], e]))))
      .catch(() => {});
    return () => {
      actif = false;
    };
  }, [livre, chapitre, verset]);

  if (mots && !mots.length) return null;
  const hebreu = livre <= 39;

  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-dawn-400">Les mots du verset</p>
      <p className="mt-1 text-xs text-cream/50">Touche un mot pour l&apos;étudier dans le lexique : sens, mots liés, concordance.</p>
      {!mots || !index ? (
        <p className="mt-2 text-sm text-cream/50">Chargement…</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {mots.map(([code, s, e], i) => {
            const ent = index.get(code);
            if (!ent) return null;
            const fr = s !== undefined && e !== undefined ? texte.slice(s, e) : ent[3];
            return (
              <button
                key={`${code}-${i}`}
                type="button"
                onClick={() => onOuvrir(code)}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-left active:bg-white/10"
              >
                <span className="text-[14px] font-bold text-cream/90">{fr}</span>
                <span className="font-serif text-[17px] text-dawn-300" dir={hebreu ? "rtl" : undefined}>
                  {ent[1]}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
