"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePodcastEtat, ouvrirChoixListe, basculerDansListe, creerListe } from "@/lib/podcast-etat";

/**
 * Feuille « Ajouter à une liste » (Mes listes) : cocher / décocher les listes
 * de l'épisode, ou en créer une nouvelle. Ouverte depuis le menu « … » d'un
 * épisode ou du lecteur plein écran.
 */
export function PodcastListesSheet() {
  const { choixListe, listes } = usePodcastEtat();
  const [nom, setNom] = useState("");
  const [creation, setCreation] = useState(false);

  useEffect(() => {
    setNom("");
    setCreation(false);
  }, [choixListe?.id]);

  const fermer = () => ouvrirChoixListe(null);

  function valider() {
    if (!choixListe || !nom.trim()) return;
    creerListe(nom, choixListe.id);
    setNom("");
    setCreation(false);
  }

  return (
    <AnimatePresence>
      {choixListe ? (
        <motion.div
          key="listes"
          className="fixed inset-0 z-[130] flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Ajouter à une liste"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" aria-label="Fermer" onClick={fermer} className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" />
          <motion.div
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="dark-ctx relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-[28px] border border-white/10 bg-night-900 px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3 text-cream"
          >
            <div className="mx-auto h-1 w-10 rounded-full bg-white/20" />
            <p className="mt-4 font-display text-[19px] font-bold">Ajouter à une liste</p>
            <p className="mt-0.5 truncate text-[13px] text-cream/55">{choixListe.titre}</p>

            <div className="mt-4 divide-y divide-white/[0.07] rounded-2xl border border-white/10 bg-white/[0.03]">
              {listes.map((l) => {
                const dedans = l.ids.includes(choixListe.id);
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => basculerDansListe(l.id, choixListe.id)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-white/[0.05]"
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${dedans ? "border-dawn-400 bg-dawn-400 text-night-950" : "border-white/30"}`}
                    >
                      {dedans ? (
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={3} aria-hidden>
                          <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{l.nom}</span>
                    <span className="shrink-0 text-[12.5px] text-cream/45">
                      {l.ids.length} épisode{l.ids.length > 1 ? "s" : ""}
                    </span>
                  </button>
                );
              })}
              {creation || !listes.length ? (
                <form
                  className="flex items-center gap-2 px-3 py-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    valider();
                  }}
                >
                  <input
                    autoFocus={listes.length > 0}
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Nom de la liste (ex. Pour mes trajets)"
                    maxLength={40}
                    className="min-w-0 flex-1 rounded-xl border border-white/15 bg-night-950 px-3 py-2.5 text-[15px] text-cream outline-none placeholder:text-cream/35 focus:border-dawn-400/60"
                  />
                  <button
                    type="submit"
                    disabled={!nom.trim()}
                    className="shrink-0 rounded-full bg-dawn-400 px-4 py-2.5 text-[14px] font-extrabold text-night-950 disabled:opacity-40"
                  >
                    Créer
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setCreation(true)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[15px] font-semibold text-dawn-400 active:bg-white/[0.05]"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                  Nouvelle liste
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={fermer}
              className="mt-4 w-full rounded-full border border-white/15 py-3 text-[14.5px] font-semibold text-cream/85"
            >
              Terminé
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
