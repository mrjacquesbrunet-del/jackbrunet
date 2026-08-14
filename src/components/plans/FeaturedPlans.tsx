"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PlanCover, type PlanPosterData } from "@/components/plans/PlanPoster";

/**
 * Carrousel « à la Netflix » des plans mis en avant : affiches larges qu'on
 * fait glisser, les voisines dépassent sur les côtés, l'affiche centrée est
 * mise en valeur. Cliquer une affiche ouvre le plan.
 */
export function FeaturedPlans({ items }: { items: PlanPosterData[] }) {
  const [active, setActive] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.i);
            if (!Number.isNaN(i)) setActive(i);
          }
        });
      },
      { root, threshold: 0.66 }
    );
    cards.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section className="pt-4">
      <div
        ref={scroller}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-[11vw] pb-3"
      >
        {items.map((it, i) => {
          const on = active === i;
          return (
            <Link
              key={it.href}
              href={it.href}
              ref={(el) => {
                cards.current[i] = el;
              }}
              data-i={i}
              className="group relative block w-[78vw] max-w-sm shrink-0 snap-center"
            >
              <div
                className={`relative aspect-[4/5] overflow-hidden rounded-[1.8rem] border border-white/10 shadow-card transition-all duration-300 ${
                  on ? "scale-100 opacity-100" : "scale-[0.94] opacity-60"
                }`}
              >
                <PlanCover cover={it.cover} glowIndex={i} />

                <span className="absolute left-4 top-4 rounded-full border border-dawn-400/40 bg-night-950/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-dawn-300 backdrop-blur-sm">
                  {it.days} jour{it.days > 1 ? "s" : ""}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-dawn-300">
                    Plan de lecture
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-extrabold leading-tight text-cream">
                    {it.title}
                  </h3>
                  {it.subtitle ? (
                    <p className="mt-1.5 line-clamp-2 text-sm text-cream/75">{it.subtitle}</p>
                  ) : null}
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-dawn-400 px-4 py-2 text-sm font-bold text-night-950">
                    Commencer
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.4} aria-hidden>
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Points de pagination */}
      <div className="mt-1 flex justify-center gap-1.5">
        {items.map((it, i) => (
          <span
            key={it.href}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              active === i ? "w-5 bg-dawn-400" : "w-1.5 bg-night-900/20"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
