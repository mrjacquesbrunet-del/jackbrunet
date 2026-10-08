"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLangue } from "@/lib/i18n";
import { chargerCorpus, chercher, segments, type LivreTexte, type Portee, type Resultat } from "@/lib/bible-recherche";

/** Mots proposés quand le champ est vide (dans la langue de la Bible lue). */
const SUGGESTIONS: Record<string, string[]> = {
  fr: ["amour", "paix", "foi", "grâce", "berger", "lumière", "ne crains point", "espérance"],
  en: ["love", "peace", "faith", "grace", "shepherd", "light", "fear not", "hope"],
  pt: ["amor", "paz", "fé", "graça", "pastor", "luz", "não temas", "esperança"],
};

const PAR_PAGE = 60;

/**
 * La loupe de la Bible : on tape un mot ou une expression, on obtient toutes
 * les références (toute la Bible, Ancien ou Nouveau Testament, ou le livre
 * ouvert) ; toucher un résultat ouvre le verset dans le lecteur.
 */
export function RechercheBible({
  ouvert,
  onFermer,
  livreCourant,
  nomLivre,
  onAller,
}: {
  ouvert: boolean;
  onFermer: () => void;
  livreCourant: number;
  nomLivre: string;
  onAller: (livre: number, chap: number, verset: number) => void;
}) {
  const langue = useLangue();
  const [q, setQ] = useState("");
  const [portee, setPortee] = useState<Portee>("tout");
  const [corpus, setCorpus] = useState<LivreTexte[] | null>(null);
  const [chargement, setChargement] = useState(false);
  const [res, setRes] = useState<{ resultats: Resultat[]; total: number; q: string } | null>(null);
  const [vus, setVus] = useState(PAR_PAGE);
  const champ = useRef<HTMLInputElement>(null);

  // Le texte complet est chargé à la première ouverture (puis gardé en mémoire).
  useEffect(() => {
    if (!ouvert) return;
    setTimeout(() => champ.current?.focus(), 250);
    if (corpus) return;
    setChargement(true);
    chargerCorpus()
      .then(setCorpus)
      .catch(() => setCorpus([]))
      .finally(() => setChargement(false));
  }, [ouvert, corpus]);

  // Recherche au fil de la frappe (à partir de 2 lettres).
  useEffect(() => {
    if (!corpus) return;
    const t = setTimeout(() => {
      const r = chercher(corpus, q, portee, livreCourant);
      setRes(q.trim().length >= 2 ? { ...r, q } : null);
      setVus(PAR_PAGE);
    }, 280);
    return () => clearTimeout(t);
  }, [q, portee, corpus, livreCourant]);

  // Retour Android / Échap : referme.
  useEffect(() => {
    if (!ouvert) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onFermer();
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [ouvert, onFermer]);

  const portees = useMemo(
    () =>
      [
        { k: "tout", label: "Toute la Bible" },
        { k: "at", label: "Ancien Testament" },
        { k: "nt", label: "Nouveau Testament" },
        { k: "livre", label: nomLivre },
      ] as { k: Portee; label: string }[],
    [nomLivre],
  );

  const suggestions = SUGGESTIONS[langue] ?? SUGGESTIONS.fr;

  return (
    <AnimatePresence>
      {ouvert ? (
        <motion.div
          className="keep-dark fixed inset-0 z-[75] flex flex-col bg-night-950 text-cream"
          role="dialog"
          aria-modal="true"
          aria-label="Rechercher dans la Bible"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-dawn-400/10 blur-3xl" />

          {/* Champ de recherche */}
          <div className="relative px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onFermer}
                aria-label="Fermer"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-cream/85"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2} aria-hidden>
                  <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  champ.current?.blur();
                }}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-dawn-400/40 bg-white/[0.06] px-4 shadow-[0_0_18px_rgba(202,240,0,0.12)] focus-within:border-dawn-400"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-current text-dawn-400" strokeWidth={2} aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
                <input
                  ref={champ}
                  type="search"
                  enterKeyHint="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Un mot, une expression…"
                  className="min-w-0 flex-1 appearance-none bg-transparent py-3 [&::-webkit-search-cancel-button]:hidden text-[16px] font-semibold text-cream outline-none placeholder:text-cream/40"
                />
                {q ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQ("");
                      champ.current?.focus();
                    }}
                    aria-label="Effacer"
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15 text-cream/80"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2.4} aria-hidden>
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                    </svg>
                  </button>
                ) : null}
              </form>
            </div>

            {/* Où chercher */}
            <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
              {portees.map((p) => (
                <button
                  key={p.k}
                  type="button"
                  onClick={() => setPortee(p.k)}
                  translate={p.k === "livre" ? "no" : undefined}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors ${
                    portee === p.k ? "bg-dawn-400 text-night-950" : "border border-white/12 bg-white/[0.04] text-cream/70"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Résultats */}
          <div className="relative flex-1 overflow-y-auto px-4 pb-[calc(2rem+env(safe-area-inset-bottom))]">
            {chargement ? (
              <p className="mt-6 flex items-center gap-2 text-sm text-cream/60">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-dawn-400 border-t-transparent" />
                Préparation de la recherche…
              </p>
            ) : !res ? (
              <div className="mt-5">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cream/40">Idées de recherche</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      translate="no"
                      onClick={() => setQ(s)}
                      className="rounded-full border border-dawn-400/30 bg-dawn-400/[0.07] px-3.5 py-2 text-[14px] font-semibold text-cream"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="mt-6 text-[13.5px] leading-relaxed text-cream/50">
                  Tape un mot pour retrouver toutes les références où il apparaît, puis touche un verset pour
                  l&apos;ouvrir.
                </p>
              </div>
            ) : (
              <>
                <p className="mt-2 text-[13px] font-semibold text-cream/55">
                  {res.total === 0
                    ? "Aucun verset trouvé. Essaie un autre mot."
                    : res.total === 1
                      ? "1 verset"
                      : `${res.total} versets`}
                </p>
                <ul className="mt-3 space-y-2.5">
                  {res.resultats.slice(0, vus).map((h) => (
                    <li key={`${h.livre}:${h.chap}:${h.verset}`}>
                      <button
                        type="button"
                        onClick={() => onAller(h.livre, h.chap, h.verset)}
                        className="block w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition-colors active:bg-white/[0.08]"
                      >
                        <span translate="no" className="font-display text-[15px] font-extrabold text-dawn-400">
                          {h.nom} {h.chap}:{h.verset}
                        </span>
                        <p translate="no" className="mt-1 font-display text-[15.5px] leading-relaxed text-cream/85">
                          {segments(h.texte, res.q).map((s, i) =>
                            s.m ? (
                              <mark key={i} className="rounded-sm bg-dawn-400/30 text-cream">
                                {s.t}
                              </mark>
                            ) : (
                              <span key={i}>{s.t}</span>
                            ),
                          )}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
                {vus < res.resultats.length ? (
                  <button
                    type="button"
                    onClick={() => setVus((v) => v + PAR_PAGE)}
                    className="mx-auto mt-4 block rounded-full border border-dawn-400/50 px-5 py-2.5 text-sm font-bold text-dawn-400"
                  >
                    Voir plus de versets
                  </button>
                ) : res.total > res.resultats.length ? (
                  <p className="mt-4 text-center text-xs text-cream/45">
                    {`Les ${res.resultats.length} premiers versets sont affichés : précise ta recherche.`}
                  </p>
                ) : null}
              </>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
