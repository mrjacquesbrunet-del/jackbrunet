"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Short } from "@/lib/types";
import { isNativeApp } from "@/lib/notifications";
import { openYouTube } from "@/lib/youtube";

/** Lecteur immersif vertical (feed) — scroll/swipe pour passer au Short suivant. */
export function ShortsPlayer({
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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const el = slideRefs.current[startIndex];
    if (el) el.scrollIntoView({ block: "center" });
  }, [startIndex]);

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

  // En app native, l'embed YouTube est bloqué → on ouvre la vidéo dans le
  // navigateur et on referme le lecteur immersif.
  useEffect(() => {
    if (isNativeApp()) {
      openYouTube(shorts[startIndex]?.id);
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isNativeApp()) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[70] bg-night-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
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
