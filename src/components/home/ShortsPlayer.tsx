"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Short } from "@/lib/types";
import { videoEmbedSrc } from "@/lib/youtube";

/**
 * Lecteur immersif vertical (feed) — même comportement que l'onglet Vidéos :
 * vidéos voisines préchargées, lecture pilotée au swipe, et son qui se lance
 * après une seule touche puis reste actif.
 */
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
  const frames = useRef<Record<number, HTMLIFrameElement | null>>({});
  const [active, setActive] = useState(startIndex);
  const [soundOn, setSoundOn] = useState(false);

  function post(i: number, jb: string) {
    frames.current[i]?.contentWindow?.postMessage({ jb }, "*");
  }

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

  // Pilote lecture + son quand la vidéo active (ou le son) change.
  useEffect(() => {
    for (const key of Object.keys(frames.current)) {
      const i = Number(key);
      if (i === active) {
        post(i, "play");
        post(i, soundOn ? "unmute" : "mute");
      } else {
        post(i, "pause");
        post(i, "mute");
      }
    }
  }, [active, soundOn]);

  function enableSound() {
    setSoundOn(true);
    post(active, "play");
    post(active, "unmute");
  }

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
        {shorts.map((s, i) => {
          const near = Math.abs(i - active) <= 1;
          return (
            <div
              key={s.id}
              data-index={i}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              className="flex h-[100svh] snap-start snap-always items-center justify-center px-3"
            >
              <div className="relative h-full max-h-[88svh] overflow-hidden rounded-2xl border border-white/10 bg-night-900 [aspect-ratio:9/16]">
                {near ? (
                  <iframe
                    ref={(el) => {
                      frames.current[i] = el;
                    }}
                    className="absolute inset-0 h-full w-full"
                    src={videoEmbedSrc(s.id, { autoplay: i === active, mute: true, loop: true })}
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
                )}

                {/* Touche claire pour activer le son (une seule fois) */}
                {i === active && !soundOn ? (
                  <button
                    type="button"
                    onClick={enableSound}
                    aria-label="Activer le son"
                    className="absolute inset-0 z-[15] flex flex-col items-center justify-center gap-3 bg-night-950/30 transition-colors active:bg-night-950/45"
                  >
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-cream/95 text-night-900 shadow-lg">
                      <SoundOffIcon className="h-7 w-7" />
                    </span>
                    <span className="rounded-full bg-night-950/70 px-4 py-1.5 text-sm font-bold text-cream">
                      Touche pour le son
                    </span>
                  </button>
                ) : null}

                {/* Bouton couper le son (une fois activé) */}
                {i === active && soundOn ? (
                  <button
                    type="button"
                    onClick={() => setSoundOn(false)}
                    aria-label="Couper le son"
                    className="absolute left-3 top-3 z-[15] grid h-10 w-10 place-items-center rounded-full bg-night-950/55 text-cream backdrop-blur transition-colors active:bg-night-950/75"
                  >
                    <SoundOnIcon className="h-5 w-5" />
                  </button>
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
          );
        })}
      </div>
    </motion.div>
  );
}

function SoundOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className ?? ""} fill-none stroke-current`} strokeWidth={1.8}>
      <path d="M4 9.5h3l4.5-3.5v12L7 14.5H4z" strokeLinejoin="round" />
      <path d="M16 9.5l4 5M20 9.5l-4 5" strokeLinecap="round" />
    </svg>
  );
}

function SoundOnIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className ?? ""} fill-none stroke-current`} strokeWidth={1.8}>
      <path d="M4 9.5h3l4.5-3.5v12L7 14.5H4z" strokeLinejoin="round" />
      <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" strokeLinecap="round" />
    </svg>
  );
}
