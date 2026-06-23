"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LongVideo } from "@/lib/types";

type Category = { category: string; videos: LongVideo[] };

export function VideosExperience({ categories }: { categories: Category[] }) {
  const flat = categories.flatMap((c) => c.videos);
  const [openAt, setOpenAt] = useState<number | null>(null);

  const starts: number[] = [];
  let acc = 0;
  for (const c of categories) {
    starts.push(acc);
    acc += c.videos.length;
  }

  const PER_RAIL = 8;

  return (
    <>
      <div className="mt-10 flex flex-col gap-10">
        {categories.map((cat, ci) => {
          const start = starts[ci];
          const preview = cat.videos.slice(0, PER_RAIL);
          const extra = cat.videos.length - preview.length;
          return (
            <div key={cat.category}>
              <div className="container-x mb-4 flex items-center justify-between gap-3">
                <h3 className="font-display text-xl font-bold sm:text-2xl">{cat.category}</h3>
                <button
                  type="button"
                  onClick={() => setOpenAt(start)}
                  className="shrink-0 text-xs font-semibold uppercase tracking-wider text-spirit-600 transition-colors hover:text-night-900"
                >
                  Tout voir · {cat.videos.length}
                </button>
              </div>
              <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:px-8 lg:px-12">
                {preview.map((v, i) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setOpenAt(start + i)}
                    className="group w-72 shrink-0 snap-start text-left sm:w-80"
                  >
                    <div className="relative aspect-video overflow-hidden rounded-2xl border border-night-900/10 bg-night-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                        alt={v.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute inset-0 bg-night-950/10 transition-opacity group-hover:opacity-0" />
                      <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-dawn-400 text-night-900 opacity-0 shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
                        <PlayIcon className="h-5 w-5 translate-x-0.5" />
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-night-900 transition-colors group-hover:text-spirit-600">
                      {v.title}
                    </p>
                  </button>
                ))}
                {extra > 0 ? (
                  <button
                    type="button"
                    onClick={() => setOpenAt(start + preview.length)}
                    className="grid aspect-video w-72 shrink-0 snap-start place-items-center self-start rounded-2xl border border-dashed border-night-900/25 bg-night-900/[0.03] transition-colors hover:border-dawn-500 hover:bg-night-900/[0.06] sm:w-80"
                  >
                    <span>
                      <span className="block font-display text-2xl font-extrabold text-night-900">
                        +{extra}
                      </span>
                      <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-night-900/55">
                        Tout voir
                      </span>
                    </span>
                  </button>
                ) : (
                  <span className="w-1 shrink-0" aria-hidden />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {openAt !== null ? (
          <VideoPlayer videos={flat} index={openAt} onIndex={setOpenAt} onClose={() => setOpenAt(null)} />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function VideoPlayer({
  videos,
  index,
  onIndex,
  onClose,
}: {
  videos: LongVideo[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const v = videos[index];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => onIndex(Math.min(Math.max(index + dir, 0), videos.length - 1)),
    [index, videos.length, onIndex],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  if (!v) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-night-950/95 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-cream backdrop-blur transition-colors hover:bg-white/20"
      >
        ✕
      </button>

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Précédent"
        disabled={index === 0}
        className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-cream backdrop-blur transition-colors hover:bg-white/20 disabled:opacity-30 md:grid"
      >
        ←
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Suivant"
        disabled={index === videos.length - 1}
        className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-cream backdrop-blur transition-colors hover:bg-white/20 disabled:opacity-30 md:grid"
      >
        →
      </button>

      <div className="w-full max-w-4xl">
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-night-900">
          <iframe
            key={v.id}
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1`}
            title={v.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            {v.category ? (
              <span className="inline-flex rounded-full bg-dawn-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-night-900">
                {v.category}
              </span>
            ) : null}
            <p className="mt-2 font-display text-lg font-bold text-cream">{v.title}</p>
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${v.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost dark-ctx shrink-0 border-white/20 text-cream hover:bg-white/10"
          >
            YouTube ↗
          </a>
        </div>
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
