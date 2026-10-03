"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";
import { MotLexique } from "@/components/ecole/MotLexique";
import { getIndexLexique, nomLangue, plat, type EntreeIndex } from "@/lib/lexique";

/**
 * LEXIQUE GREC / HÉBREU — page de l'Étude biblique (/ecole/lexique).
 * Liste alphabétique (par la vedette française), une lettre à la fois,
 * recherche par code (« G5465 », « 7462 »), mot français, translittération ou
 * mot original. Un tap ouvre l'étude du mot. Liens : ?langue=g|h, ?mot=CODE.
 */

type Fonds = "g" | "h";
const MEMO = "jb.lexique.v1";
const LOT = 120;

const initiale = (s: string) => {
  const c = plat(s).replace(/^[^a-z]+/, "")[0];
  return c && c >= "a" && c <= "z" ? c.toUpperCase() : "#";
};

export function LexiqueView() {
  const [index, setIndex] = useState<EntreeIndex[] | null>(null);
  const [erreur, setErreur] = useState(false);
  const [fonds, setFonds] = useState<Fonds>("g");
  const [lettre, setLettre] = useState("A");
  const [q, setQ] = useState("");
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [nb, setNb] = useState(LOT);
  const listeRef = useRef<HTMLDivElement>(null);
  const champRef = useRef<HTMLInputElement>(null);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getIndexLexique()
      .then(setIndex)
      .catch(() => setErreur(true));
    const p = new URLSearchParams(window.location.search);
    const l = p.get("langue");
    const m = p.get("mot");
    try {
      const memo = JSON.parse(sessionStorage.getItem(MEMO) ?? "{}");
      if (memo.fonds) setFonds(memo.fonds);
      if (memo.lettre) setLettre(memo.lettre);
    } catch {
      /* stockage indisponible */
    }
    if (l === "g" || l === "h") setFonds(l);
    // Arrivée par « Rechercher » : le champ est prêt à taper.
    if (p.get("recherche") === "1") window.setTimeout(() => champRef.current?.focus(), 250);
    if (m) {
      setOuvert(m);
      if (m.startsWith("G")) setFonds("g");
      if (m.startsWith("H")) setFonds("h");
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(MEMO, JSON.stringify({ fonds, lettre }));
    } catch {
      /* stockage indisponible */
    }
  }, [fonds, lettre]);

  const duFonds = useMemo(
    () => (index ?? []).filter((e) => (fonds === "g" ? e[5].startsWith("g") : !e[5].startsWith("g"))),
    [index, fonds],
  );
  const lettres = useMemo(() => {
    const s = new Set(duFonds.map((e) => initiale(e[3])));
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").filter((l) => s.has(l));
  }, [duFonds]);

  const recherche = q.trim();
  const resultats = useMemo(() => {
    if (!recherche) return duFonds.filter((e) => initiale(e[3]) === lettre);
    const code = recherche.toUpperCase().match(/^([GH])?\s*0*(\d{1,5})([A-Z])?$/);
    if (code) {
      const num = code[2].padStart(4, "0");
      const pref = code[1] ?? (fonds === "g" ? "G" : "H");
      return (index ?? []).filter((e) => e[0].startsWith(pref + num) && (!code[3] || e[0].endsWith(code[3])));
    }
    const k = plat(recherche);
    const debut: EntreeIndex[] = [];
    const dedans: EntreeIndex[] = [];
    for (const e of duFonds) {
      const champs = [plat(e[3]), plat(e[2]), plat(e[1])];
      if (champs.some((c) => c.startsWith(k))) debut.push(e);
      else if (champs.some((c) => c.includes(k))) dedans.push(e);
    }
    return [...debut, ...dedans].slice(0, 300);
  }, [recherche, duFonds, lettre, index, fonds]);

  useEffect(() => {
    setNb(LOT);
    listeRef.current?.scrollTo({ top: 0 });
  }, [lettre, fonds, recherche]);

  // Affichage progressif (certaines lettres comptent un millier de mots).
  useEffect(() => {
    const el = finRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((ent) => ent[0]?.isIntersecting && setNb((n) => n + LOT), { root: listeRef.current, rootMargin: "400px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [resultats]);

  useEffect(() => {
    if (lettres.length && !lettres.includes(lettre)) setLettre(lettres[0]);
  }, [lettres, lettre]);

  return (
    <div className="dark-ctx fixed inset-0 z-[70] flex flex-col bg-night-950 text-cream">
      <PlansDarkBg />
      <header className="relative shrink-0 border-b border-white/10 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Link href="/ecole" aria-label="Retour à l'Étude biblique" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-cream/80">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2}>
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-dawn-300">Étude biblique</p>
            <h1 className="font-display text-xl font-extrabold leading-tight">Lexique</h1>
          </div>
        </div>
        <div className="mx-auto mt-3 flex max-w-lg rounded-full border border-white/10 bg-white/[0.05] p-1">
          {(
            [
              ["g", "Grec · Nouveau Testament"],
              ["h", "Hébreu · Ancien Testament"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFonds(k)}
              className={`flex-1 rounded-full py-2 text-[13px] font-bold transition-colors ${fonds === k ? "bg-dawn-400 text-night-950" : "text-cream/65"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="mx-auto mt-3 flex max-w-lg items-center gap-2.5 rounded-2xl bg-white/[0.07] px-3.5 py-2.5">
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-cream/50" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            ref={champRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={fonds === "g" ? "Chercher un mot grec : français, grec ou code" : "Chercher un mot hébreu : français, hébreu ou code"}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-cream placeholder:text-cream/40 focus:outline-none"
            enterKeyHint="search"
            autoCorrect="off"
            autoCapitalize="off"
          />
          {q ? (
            <button type="button" onClick={() => setQ("")} aria-label="Effacer" className="text-cream/50">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.4}>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
        </label>
      </header>

      <div ref={listeRef} className="relative min-h-0 flex-1 overflow-y-auto px-4">
        <div className="mx-auto max-w-lg pb-6">
          {erreur ? (
            <p className="py-16 text-center text-sm text-cream/55">Le lexique n&apos;a pas pu être chargé. Vérifie ta connexion et réessaie.</p>
          ) : !index ? (
            <p className="py-16 text-center text-sm text-cream/50">Chargement du lexique…</p>
          ) : (
            <>
              <div className="flex items-center gap-3 pt-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-dawn-400 font-display text-lg font-extrabold text-night-950">
                  {recherche ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.4}>
                      <circle cx="11" cy="11" r="6.5" />
                      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    lettre
                  )}
                </span>
                <span className="text-[13px] font-semibold text-cream/50">
                  {resultats.length} mot{resultats.length > 1 ? "s" : ""}
                  {recherche ? " trouvé" + (resultats.length > 1 ? "s" : "") : ""}
                </span>
              </div>
              <ul>
                {resultats.slice(0, nb).map((e) => (
                  <li key={e[0]} className="border-b border-white/10">
                    <button type="button" onClick={() => setOuvert(e[0])} className="flex w-full items-center gap-3 py-3.5 text-left active:bg-white/[0.04]">
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] font-semibold text-cream/60">{nomLangue(e[5])}</span>
                          <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] font-semibold text-cream/60">{e[0]}</span>
                          {e[5].endsWith("n") ? (
                            <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] font-semibold text-cream/60">Nom propre</span>
                          ) : null}
                        </span>
                        <span className="mt-1 block truncate font-display text-[18px] font-extrabold">{e[3]}</span>
                      </span>
                      <span
                        className="max-w-[45%] shrink-0 truncate font-serif text-[22px] text-cream/85"
                        dir={e[0].startsWith("H") ? "rtl" : undefined}
                        lang={e[0].startsWith("H") ? "he" : "grc"}
                      >
                        {e[1]}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <div ref={finRef} className="h-4" />
              {!resultats.length ? <p className="py-10 text-center text-sm text-cream/50">Aucun mot ne correspond.</p> : null}
            </>
          )}
        </div>
      </div>

      {/* Les lettres */}
      {index && !recherche ? (
        <nav className="relative shrink-0 border-t border-white/10 bg-night-950/95 pb-[calc(env(safe-area-inset-bottom)+0.4rem)] pt-1.5">
          <div className="mx-auto flex max-w-lg gap-1 overflow-x-auto px-3" style={{ scrollbarWidth: "none" }}>
            {lettres.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLettre(l)}
                className={`grid h-9 min-w-9 shrink-0 place-items-center rounded-full px-2 text-[15px] font-bold ${
                  l === lettre ? "bg-dawn-400 text-night-950" : "text-cream/60"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </nav>
      ) : null}

      {ouvert ? <MotLexique code={ouvert} onClose={() => setOuvert(null)} zIndex="z-[90]" /> : null}
    </div>
  );
}
