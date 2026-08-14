"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PlanCover, type PlanPosterData } from "@/components/plans/PlanPoster";
import { PosterRating } from "@/components/plans/PosterRating";

/**
 * Carrousel « coverflow » à la Netflix : l'affiche centrée est agrandie, les
 * deux voisines dépassent de chaque côté. Il défile tout seul (auto-avance),
 * se met en pause dès qu'on le touche, et repart après quelques secondes.
 */
export function FeaturedPlans({ items }: { items: PlanPosterData[] }) {
  const mid = Math.floor(items.length / 2);
  const [active, setActive] = useState(mid);
  const activeRef = useRef(mid);
  const scroller = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const paused = useRef(false);
  const resumeT = useRef<ReturnType<typeof setTimeout> | null>(null);

  const centerOn = (i: number, smooth = true) => {
    const root = scroller.current;
    const el = cards.current[i];
    if (!root || !el) return;
    root.scrollTo({
      left: el.offsetLeft - (root.clientWidth - el.clientWidth) / 2,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  // Centre l'affiche du milieu au montage (sans animation).
  useEffect(() => {
    centerOn(mid, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mid]);

  // Suit l'affiche la plus centrée (agrandissement + points).
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.i);
            if (!Number.isNaN(i)) {
              activeRef.current = i;
              setActive(i);
            }
          }
        });
      },
      { root, threshold: 0.72 }
    );
    cards.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [items.length]);

  // Auto-avance : passe à l'affiche suivante toutes les 4,5 s, sauf si en pause.
  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => {
      if (paused.current) return;
      centerOn((activeRef.current + 1) % items.length);
    }, 4500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // Met en pause l'auto-avance quand l'utilisateur interagit, reprend après 7 s.
  const pause = () => {
    paused.current = true;
    if (resumeT.current) clearTimeout(resumeT.current);
    resumeT.current = setTimeout(() => {
      paused.current = false;
    }, 7000);
  };

  if (items.length === 0) return null;

  return (
    <section className="pt-4">
      <div
        ref={scroller}
        onPointerDown={pause}
        onTouchStart={pause}
        onWheel={pause}
        className="no-scrollbar flex snap-x snap-mandatory items-center gap-3 overflow-x-auto px-[20vw] py-6"
      >
        {items.map((it, i) => {
          const on = active === i;
          return (
            <Link
              key={`${it.href}-${i}`}
              href={it.href}
              ref={(el) => {
                cards.current[i] = el;
              }}
              data-i={i}
              className="group block w-[58vw] max-w-[260px] shrink-0 snap-center"
            >
              <div
                className={`relative aspect-[3/4] overflow-hidden rounded-[1.6rem] border transition-all duration-500 ease-out ${
                  on
                    ? "scale-105 border-dawn-400/40 opacity-100 shadow-[0_18px_50px_-12px_rgba(202,240,0,0.35)]"
                    : "scale-90 border-white/10 opacity-70"
                }`}
              >
                <PlanCover cover={it.cover} glowIndex={i} />

                <span className="absolute left-3 top-3 rounded-full border border-dawn-400/40 bg-night-950/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-dawn-300 backdrop-blur-sm">
                  {it.days} j
                </span>
                {it.slug ? <PosterRating slug={it.slug} className="absolute right-3 top-3" /> : null}

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-dawn-300">
                    Plan de lecture
                  </p>
                  <h3 className="mt-1 font-display text-xl font-extrabold leading-tight text-cream">
                    {it.title}
                  </h3>
                  {on && it.subtitle ? (
                    <p className="mt-1 line-clamp-2 text-xs text-cream/75">{it.subtitle}</p>
                  ) : null}
                </div>
              </div>
              <div className={`mt-3 flex justify-center transition-opacity duration-300 ${on ? "opacity-100" : "opacity-0"}`}>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-dawn-400 px-5 py-2 text-sm font-bold text-night-950">
                  Commencer
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.4} aria-hidden>
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Points de pagination */}
      <div className="mt-1 flex flex-wrap justify-center gap-1.5">
        {items.map((it, i) => (
          <span
            key={`${it.href}-dot-${i}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              active === i ? "w-5 bg-dawn-400" : "w-1.5 bg-cream/25"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
