"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Short } from "@/lib/types";

type Category = { category: string; shorts: Short[] };

export function ShortsExperience({ categories }: { categories: Category[] }) {
  // Liste à plat (ordre global) pour la navigation dans le lecteur.
  const flat = categories.flatMap((c) => c.shorts);
  const [openAt, setOpenAt] = useState<number | null>(null);

  const indexOf = (id: string) => flat.findIndex((s) => s.id === id);

  return (
    <>
      <div className="mt-10 flex flex-col gap-10">
        {categories.map((cat) => (
          <div key={cat.category}>
            <div className="container-x mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold sm:text-2xl">{cat.category}</h3>
              <span className="text-xs font-semibold uppercase tracking-wider text-night-900/45">
                {cat.shorts.length} vidéo{cat.shorts.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:px-8 lg:px-12">
              {cat.shorts.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setOpenAt(indexOf(s.id))}
                  className="group relative aspect-[9/16] w-40 shrink-0 snap-start overflow-hidden rounded-3xl border border-night-900/10 bg-night-900 text-left transition-transform duration-300 hover:-translate-y-1 hover:shadow-card sm:w-48"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.ytimg.com/vi/${s.id}/hqdefault.jpg`}
                    alt={s.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-night-950/85 via-transparent to-night-950/10" />
                  <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-dawn-400 text-night-900 opacity-0 shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
                    <PlayIcon className="h-5 w-5 translate-x-0.5" />
                  </span>
                  <span className="absolute inset-x-0 bottom-0 p-3">
                    <span className="line-clamp-2 text-sm font-semibold leading-snug text-cream">
                      {s.title}
                    </span>
                  </span>
                </button>
              ))}
              <span className="w-1 shrink-0" aria-hidden />
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {openAt !== null ? (
          <ShortsPlayer
            shorts={flat}
            startIndex={openAt}
            onClose={() => setOpenAt(null)}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function ShortsPlayer({
  shorts,
  startIndex,
  onClose,
}: {
  shorts: Short[];
  startIndex: number;
  onClose: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(startIndex);

  // Verrouille le scroll de la page.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Positionne sur le short choisi à l'ouverture.
  useEffect(() => {
    const el = slideRefs.current[startIndex];
    if (el) el.scrollIntoView({ block: "center" });
  }, [startIndex]);

  // Détecte le short visible.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.index);
            if (!Number.isNaN(i)) setActive(i);
          }
        }
      },
      { root, threshold: 0.6 },
    );
    slideRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      const next = Math.min(Math.max(active + dir, 0), shorts.length - 1);
      slideRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    [active, shorts.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") go(1);
      if (e.key === "ArrowUp") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[70] bg-night-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* En-tête */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4">
        <span className="font-display text-lg font-bold uppercase tracking-tight text-cream">
          Shorts
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-cream backdrop-blur transition-colors hover:bg-white/20"
        >
          ✕
        </button>
      </div>

      {/* Navigation (desktop) */}
      <div className="pointer-events-none absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 md:flex">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Précédent"
          className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 text-cream backdrop-blur transition-colors hover:bg-white/20"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Suivant"
          className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 text-cream backdrop-blur transition-colors hover:bg-white/20"
        >
          ↓
        </button>
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar h-[100svh] snap-y snap-mandatory overflow-y-auto overscroll-contain"
      >
        {shorts.map((s, i) => (
          <div
            key={s.id}
            data-index={i}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="flex h-[100svh] snap-start snap-always items-center justify-center px-3"
          >
            <div className="relative h-full max-h-[88svh] overflow-hidden rounded-2xl border border-white/10 bg-night-900 [aspect-ratio:9/16]">
              {Math.abs(i - active) <= 1 ? (
                i === active ? (
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${s.id}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${s.id}`}
                    title={s.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://i.ytimg.com/vi/${s.id}/hqdefault.jpg`}
                    alt={s.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-70"
                  />
                )
              ) : null}

              {/* Légende */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-night-950/90 to-transparent p-5">
                {s.category ? (
                  <span className="inline-flex rounded-full bg-dawn-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-night-900">
                    {s.category}
                  </span>
                ) : null}
                <p className="mt-2 line-clamp-2 font-semibold text-cream">{s.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
