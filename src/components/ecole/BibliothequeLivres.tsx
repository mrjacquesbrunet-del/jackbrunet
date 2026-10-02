"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { asset } from "@/lib/asset";
import { FicheSheet, getFiches, type FichesData } from "@/components/bible/FichesChapitre";
import { COULEUR_GROUPE, IntroLivreCorps, getIntroductions, groupeDe, type IntrosData } from "@/components/bible/IntroLivre";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";

/**
 * LES 66 LIVRES — page cachée de l'Étude biblique (section Explorer).
 *
 * La bibliothèque biblique rangée par familles (Pentateuque, livres
 * historiques, prophètes, Évangiles, lettres…). Un tap ouvre l'introduction
 * du livre : auteur, date, destinataires, contexte, plan, thèmes, versets
 * clés, personnages, le Christ dans ce livre. Lien profond : ?livre=N.
 */

type Testament = "AT" | "NT";
type Livre = { id: number; name: string; chapters: number };
const MEMO = "jb.livres.v1";

export function BibliothequeLivres() {
  const router = useRouter();
  const [data, setData] = useState<IntrosData | null>(null);
  const [fiches, setFiches] = useState<FichesData | null>(null);
  const [livres, setLivres] = useState<Livre[]>([]);
  const [t, setT] = useState<Testament>("AT");
  const [ouvert, setOuvert] = useState<number | null>(null);
  const [fiche, setFiche] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getIntroductions().then(setData);
    getFiches().then(setFiches);
    fetch(asset("/bible/index.json"))
      .then((r) => (r.ok ? r.json() : []))
      .then(setLivres)
      .catch(() => {});
    const n = Number(new URLSearchParams(window.location.search).get("livre"));
    if (n >= 1 && n <= 66) {
      setOuvert(n);
      setT(n >= 40 ? "NT" : "AT");
      return;
    }
    try {
      if (sessionStorage.getItem(MEMO) === "NT") setT("NT");
    } catch {
      /* stockage indisponible */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(MEMO, t);
    } catch {
      /* stockage indisponible */
    }
  }, [t]);

  // L'URL suit le livre ouvert : en revenant de la Bible, on retrouve le livre.
  useEffect(() => {
    const url = ouvert ? `?livre=${ouvert}` : window.location.pathname;
    window.history.replaceState(null, "", url);
    detailRef.current?.scrollTo({ top: 0 });
  }, [ouvert]);

  const bookNames = Object.fromEntries(livres.map((b) => [b.id, b.name]));
  const groupes = (data?.groupes ?? []).filter((g) => (t === "AT" ? g.a <= 39 : g.de >= 40));
  const lire = (l: number, c: number, v?: number) => router.push(`/bible?livre=${l}&chap=${c}${v ? `&v=${v}` : ""}`);

  return (
    <div className="dark-ctx fixed inset-0 z-[70] flex flex-col bg-night-950 text-cream">
      <PlansDarkBg />
      <header className="shrink-0 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Link href="/ecole" aria-label="Retour à l'Étude biblique" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-cream/80">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2}>
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-dawn-300">Étude biblique</p>
            <h1 className="font-display text-xl font-extrabold leading-tight">Les 66 livres</h1>
          </div>
        </div>

        <div className="mx-auto mt-3 flex max-w-lg rounded-full border border-white/10 bg-white/[0.05] p-1">
          {(
            [
              ["AT", "Ancien Testament · 39"],
              ["NT", "Nouveau Testament · 27"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setT(k)}
              className={`flex-1 rounded-full py-2 text-sm font-bold transition-colors ${t === k ? "bg-dawn-400 text-night-950" : "text-cream/65"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        <div className="mx-auto max-w-lg">
          {!data ? <p className="py-12 text-center text-sm text-cream/50">Chargement…</p> : null}
          {groupes.map((g) => {
            const couleur = COULEUR_GROUPE[g.id] ?? "#CAF000";
            return (
              <section key={g.id} className="pt-6">
                <div className="flex items-center gap-2.5">
                  <span className="h-6 w-1.5 rounded-full" style={{ background: couleur }} />
                  <div className="min-w-0">
                    <h2 className="font-display text-[17px] font-extrabold leading-tight">{g.nom}</h2>
                    <p className="text-[12px] leading-snug text-cream/50">{g.desc}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {Array.from({ length: g.a - g.de + 1 }, (_, i) => g.de + i).map((n) => {
                    const intro = data?.livres[String(n)];
                    const b = livres.find((x) => x.id === n);
                    if (!intro) return null;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setOuvert(n)}
                        className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition-colors active:bg-white/10 ${g.de === g.a ? "col-span-2" : ""}`}
                      >
                        <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: couleur }} />
                        <span className="block font-display text-[16px] font-extrabold leading-tight">{b?.name ?? `Livre ${n}`}</span>
                        <span className="mt-1 line-clamp-2 block text-[12px] font-semibold leading-snug" style={{ color: couleur }}>
                          {intro.accroche}
                        </span>
                        <span className="mt-1.5 block text-[11px] font-semibold text-cream/40">
                          {b?.chapters ?? intro.plan.at(-1)?.[2]} chapitre{(b?.chapters ?? 2) > 1 ? "s" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {data ? (
            <p className="mt-8 text-center text-[11px] leading-relaxed text-cream/35">
              Auteurs et dates selon la tradition juive et chrétienne ; les débats sont signalés quand ils existent.
            </p>
          ) : null}
        </div>
      </div>

      {/* L'introduction ouverte */}
      {ouvert && data?.livres[String(ouvert)] ? (
        <div className="fixed inset-0 z-[90] flex flex-col bg-night-950">
          <div className="shrink-0 border-b border-white/10 px-4 pb-2.5 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
            <div className="mx-auto flex max-w-lg items-center gap-3">
              <button
                type="button"
                onClick={() => setOuvert(null)}
                aria-label="Retour aux 66 livres"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-cream/80"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2}>
                  <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <p className="min-w-0 flex-1 truncate text-[11px] font-black uppercase tracking-[0.2em] text-cream/55">Les 66 livres</p>
              <div className="flex gap-1.5">
                {[
                  [ouvert - 1, "Livre précédent", "M15 5l-7 7 7 7"],
                  [ouvert + 1, "Livre suivant", "M9 5l7 7-7 7"],
                ].map(([n, label, d]) => (
                  <button
                    key={label as string}
                    type="button"
                    disabled={(n as number) < 1 || (n as number) > 66}
                    onClick={() => setOuvert(n as number)}
                    aria-label={label as string}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-cream/80 disabled:opacity-25"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2}>
                      <path d={d as string} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div ref={detailRef} className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] pt-5">
            <div className="mx-auto max-w-lg">
              <IntroLivreCorps
                n={ouvert}
                nom={bookNames[ouvert] ?? ""}
                intro={data.livres[String(ouvert)]}
                groupe={groupeDe(data, ouvert)}
                fiches={fiches}
                onNavigate={lire}
                onFiche={setFiche}
              />
            </div>
          </div>
        </div>
      ) : null}

      {fiche && fiches ? (
        <FicheSheet
          id={fiche}
          data={fiches}
          bookId={-1}
          chapter={-1}
          bookNames={bookNames}
          zIndex="z-[130]"
          onClose={() => setFiche(null)}
          onNavigate={lire}
        />
      ) : null}
    </div>
  );
}
