"use client";

import { useToolkit } from "@/lib/toolkit";
import { useAuth } from "@/components/community/useAuth";

const KIND_LABEL: Record<string, string> = {
  verset: "Versets",
  méditation: "Méditations",
  punchline: "Paroles fortes",
  déclaration: "Déclarations",
  texte: "Textes",
};

export function MyFavorites() {
  const { saved, removeSnippet, highlightItems, clearHighlight } = useToolkit();
  const { profile } = useAuth();
  const verses = profile?.favorite_verses?? [];

  // Regroupe les enregistrements par type.
  const groups = saved.reduce<Record<string, typeof saved>>((acc, s) => {
    const k = KIND_LABEL[s.kind]? s.kind: "texte";
    (acc[k]??= []).push(s);
    return acc;
  }, {});

  const isEmpty =
    saved.length === 0 && verses.length === 0 && highlightItems.length === 0;

  return (
    <section className="py-10">
      <div className="container-x max-w-3xl">
        {isEmpty? (
          <div className="glass p-8 text-center">
            <p className="font-display text-xl font-bold">Rien d'enregistré pour l'instant</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-night-900/65">
              Touche un verset, une méditation ou une parole forte puis « Enregistrer »: tu la
              retrouveras ici, regroupée au même endroit.
            </p>
          </div>
        ): (
          <div className="space-y-10">
            {/* Versets préférés du profil (publics) */}
            {verses.length > 0? (
              <div>
                <h2 className="font-display text-lg font-bold">
                  Mes versets préférés{" "}
                  <span className="text-sm font-semibold text-night-900/50">({verses.length})</span>
                </h2>
                <ul className="mt-3 space-y-2">
                  {verses.map((v, i) => (
                    <li key={`fav-${i}`} className="rounded-2xl border border-night-900/10 bg-white/70 p-4">
                      <p className="text-[15px] leading-relaxed text-night-900/85">« {v.text} »</p>
                      {v.reference? (
                        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-spirit-700">
                          {v.reference}
                        </p>
                      ): null}
                    </li>
                  ))}
                </ul>
              </div>
            ): null}

            {/* Passages surlignés */}
            {highlightItems.length > 0? (
              <div>
                <h2 className="font-display text-lg font-bold">
                  Mes surlignages{" "}
                  <span className="text-sm font-semibold text-night-900/50">
                    ({highlightItems.length})
                  </span>
                </h2>
                <ul className="mt-3 space-y-2">
                  {highlightItems.map((h) => (
                    <li
                      key={h.id}
                      className="rounded-2xl border border-night-900/10 bg-white/70 p-4"
                    >
                      <p className="text-[15px] leading-relaxed text-night-900/85">{h.text}</p>
                      <div className="mt-2 flex items-center justify-between">
                        {h.reference? (
                          <span className="text-xs font-bold uppercase tracking-wide text-spirit-700">
                            {h.reference}
                          </span>
                        ): (
                          <span />
                        )}
                        <button
                          type="button"
                          onClick={() => clearHighlight(h.id)}
                          className="text-xs font-semibold text-night-900/40 transition-colors hover:text-red-500"
                        >
                          Retirer
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ): null}

            {/* Enregistrements locaux, par type */}
            {Object.entries(groups).map(([kind, items]) => (
              <div key={kind}>
                <h2 className="font-display text-lg font-bold">
                  {KIND_LABEL[kind]?? "Textes"}{" "}
                  <span className="text-sm font-semibold text-night-900/50">({items.length})</span>
                </h2>
                <ul className="mt-3 space-y-2">
                  {items.map((s) => (
                    <li
                      key={s.id}
                      className="group rounded-2xl border border-night-900/10 bg-white/70 p-4"
                    >
                      <p className="text-[15px] leading-relaxed text-night-900/85">{s.text}</p>
                      <div className="mt-2 flex items-center justify-between">
                        {s.reference? (
                          <span className="text-xs font-bold uppercase tracking-wide text-spirit-700">
                            {s.reference}
                          </span>
                        ): (
                          <span />
                        )}
                        <button
                          type="button"
                          onClick={() => removeSnippet(s.id)}
                          className="text-xs font-semibold text-night-900/40 transition-colors hover:text-red-500"
                        >
                          Retirer
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
