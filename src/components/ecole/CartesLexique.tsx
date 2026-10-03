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

const CARTES = [
  { langue: "g", nom: "Grec", fond: "linear-gradient(135deg,#4B86D6 0%,#6A86E8 100%)" },
  { langue: "h", nom: "Hébreu", fond: "linear-gradient(135deg,#E8877A 0%,#E05A5E 100%)" },
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
        {CARTES.map(({ langue, nom, fond }) => {
          const v = choix[langue];
          return (
            <div
              key={langue}
              className="relative w-[78%] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-[28px] text-white shadow-[0_16px_34px_-18px_rgba(12,12,11,0.55)]"
              style={{ background: fond }}
            >
              <button
                type="button"
                onClick={() => autre(langue)}
                aria-label={`Un autre mot ${nom.toLowerCase()}`}
                className="absolute left-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full text-white/90 active:bg-white/15"
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
                <span className="inline-block rounded-full bg-black/15 px-3 py-1 text-[13px] font-semibold">{nom}</span>
                <span className="mt-2 block truncate font-display text-[22px] font-extrabold leading-tight">{v?.[2] ?? "…"}</span>
                <span className="mt-1 block truncate font-serif text-[22px] text-white/60" dir={langue === "h" ? "rtl" : undefined}>
                  {v?.[1] ?? ""}
                </span>
              </button>
              <Link
                href={`/ecole/lexique?langue=${langue}`}
                className="flex items-center justify-center gap-2.5 bg-black/10 py-3.5 font-display text-[17px] font-extrabold"
              >
                <span className="grid h-8 w-8 place-items-center rounded-md border-2 border-white/90 font-serif text-[17px] leading-none">
                  {langue === "g" ? "Ω" : "א"}
                </span>
                Lexique
              </Link>
            </div>
          );
        })}
      </div>
      {ouvert ? <MotLexique code={ouvert} onClose={() => setOuvert(null)} /> : null}
    </section>
  );
}
