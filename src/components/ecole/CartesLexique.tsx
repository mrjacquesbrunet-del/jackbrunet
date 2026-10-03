"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { mediaUrl } from "@/lib/asset";
import { MotLexique } from "@/components/ecole/MotLexique";

/**
 * Cartes « Grec » et « Hébreu » de l'Étude biblique : un mot du lexique
 * (celui du jour, puis au hasard avec le bouton), et l'accès au lexique.
 */

type Vedette = [string, string, string]; // code, mot, vedette française

/** Couleurs de la charte : le grec en lime, l'hébreu en nuit (accents lime). */
const CARTES = [
  {
    langue: "g",
    nom: "Grec",
    fond: "linear-gradient(135deg,#D7F53A 0%,#CAF000 100%)",
    encre: "text-night-950",
    doux: "text-night-950/55",
    pastille: "bg-night-950/10",
    pied: "border-t border-night-950/10",
    separateur: "bg-night-950/15",
  },
  {
    langue: "h",
    nom: "Hébreu",
    fond: "linear-gradient(135deg,#262624 0%,#0C0C0B 100%)",
    encre: "text-cream",
    doux: "text-dawn-300",
    pastille: "bg-dawn-400 text-night-950",
    pied: "border-t border-white/10",
    separateur: "bg-white/15",
  },
] as const;

const jour = () => Math.floor(Date.now() / 86400000);

export function CartesLexique() {
  const [vedettes, setVedettes] = useState<Vedette[] | null>(null);
  const [choix, setChoix] = useState<Record<string, Vedette | undefined>>({});
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [tour, setTour] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch(mediaUrl("/lexique/vedettes.json"))
      .then((r) => (r.ok ? r.json() : []))
      .then((v: Vedette[]) => {
        setVedettes(v);
        const g = v.filter((x) => x[0].startsWith("G"));
        const h = v.filter((x) => x[0].startsWith("H"));
        setChoix({ g: g[(jour() * 7) % g.length], h: h[(jour() * 11) % h.length] });
      })
      .catch(() => setVedettes([]));
  }, []);

  function autre(langue: "g" | "h") {
    const liste = (vedettes ?? []).filter((x) => x[0].startsWith(langue === "g" ? "G" : "H"));
    if (!liste.length) return;
    setChoix((c) => ({ ...c, [langue]: liste[Math.floor(Math.random() * liste.length)] }));
    setTour((t) => ({ ...t, [langue]: (t[langue] ?? 0) + 1 }));
  }

  if (vedettes && !vedettes.length) return null;

  return (
    <section className="mt-7">
      <h2 className="font-display text-lg font-extrabold">Grec &amp; hébreu</h2>
      <p className="mt-0.5 text-[13px] text-night-900/55">Le sens des mots d&apos;origine, et où ils se trouvent dans la Bible.</p>
      <div className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: "none" }}>
        {CARTES.map(({ langue, nom, fond, encre, doux, pastille, pied, separateur }) => {
          const v = choix[langue];
          return (
            <div
              key={langue}
              className={`relative w-[78%] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-[28px] ${encre} shadow-[0_16px_34px_-18px_rgba(12,12,11,0.55)]`}
              style={{ background: fond }}
            >
              <button
                type="button"
                onClick={() => autre(langue)}
                aria-label={`Un autre mot ${nom.toLowerCase()}`}
                className="absolute left-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full opacity-80 active:bg-black/10"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 fill-none stroke-current transition-transform duration-500"
                  strokeWidth={2}
                  style={{ transform: `rotate(${(tour[langue] ?? 0) * 360}deg)` }}
                >
                  <path d="M20 11a8 8 0 0 0-14.6-4.5M4 4.5V8h3.5M4 13a8 8 0 0 0 14.6 4.5M20 19.5V16h-3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                disabled={!v}
                onClick={() => v && setOuvert(v[0])}
                className="block w-full px-4 pb-4 pt-5 text-center"
              >
                <span className={`inline-block rounded-full px-3 py-1 text-[13px] font-bold ${pastille}`}>{nom}</span>
                <span className="mt-2 block truncate font-display text-[22px] font-extrabold leading-tight">{v?.[2] ?? "…"}</span>
                <span className={`mt-1 block truncate font-serif text-[22px] ${doux}`} dir={langue === "h" ? "rtl" : undefined}>
                  {v?.[1] ?? ""}
                </span>
              </button>
              {/* Deux accès : chercher un mot, ou parcourir le lexique */}
              <div className={`flex ${pied}`}>
                <Link
                  href={`/ecole/lexique?langue=${langue}&recherche=1`}
                  className="flex flex-1 items-center justify-center gap-2 py-3.5 font-display text-[15px] font-extrabold active:bg-black/10"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2}>
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="M20 20l-3.8-3.8" strokeLinecap="round" />
                  </svg>
                  Rechercher
                </Link>
                <span className={`my-2.5 w-px ${separateur}`} />
                <Link
                  href={`/ecole/lexique?langue=${langue}`}
                  className="flex flex-1 items-center justify-center gap-2 py-3.5 font-display text-[15px] font-extrabold active:bg-black/10"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-md border-2 border-current font-serif text-[13px] leading-none">
                    {langue === "g" ? "Ω" : "א"}
                  </span>
                  Lexique
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      {ouvert ? <MotLexique code={ouvert} onClose={() => setOuvert(null)} /> : null}
    </section>
  );
}
