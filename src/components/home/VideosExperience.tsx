"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LongVideo } from "@/lib/types";
import { isNativeApp } from "@/lib/notifications";
import { openYouTube } from "@/lib/youtube";

type Category = { category: string; videos: LongVideo[] };

/**
 * Vidéothèque : bannière cinématographique « À la une » + grille animée de
 * toutes les prédications (sans classification par thème). Lecture en modale.
 */
export function VideosExperience({ categories }: { categories: Category[] }) {
  const flat = categories.flatMap((c) => c.videos);
  const [openAt, setOpenAt] = useState<number | null>(null);
  const hero = flat[0];

  return (
    <>
      {/* Bannière « À la une » */}
      {hero ? (
        <div className="dark-ctx relative mb-12 overflow-hidden border-b border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${hero.id}/maxresdefault.jpg`}
            alt={hero.title}
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = `https://i.ytimg.com/vi/${hero.id}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/75 to-night-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-night-950/90 via-night-950/40 to-transparent" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="container-x relative flex min-h-[58vh] flex-col justify-end py-12 sm:min-h-[64vh]"
          >
            <span className="eyebrow w-fit">À la une</span>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-extrabold leading-tight text-cream drop-shadow sm:text-5xl">
              {hero.title}
            </h2>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={() => setOpenAt(0)} className="btn-primary">
                <PlayIcon className="h-5 w-5 translate-x-0.5" />
                Lire
              </button>
              <button
                type="button"
                onClick={() => setOpenAt(0)}
                className="btn-ghost border-white/25 bg-white/10 text-cream hover:bg-white/20"
              >
                Plus d'infos
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}

      {/* Grille animée (toutes les vidéos, sans classification) */}
      <div className="container-x">
        <h3 className="mb-6 font-display text-2xl font-bold sm:text-3xl">
          Toutes les <span className="text-gradient">prédications</span>
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {flat.map((v, i) => (
            <motion.button
              key={v.id}
              type="button"
              onClick={() => setOpenAt(i)}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: (i % 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="group text-left"
            >
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-night-900/10 bg-night-900 transition-shadow duration-300 group-hover:shadow-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                  alt={v.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-night-950/10 transition-opacity group-hover:opacity-0" />
                <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-dawn-400 text-night-900 opacity-0 shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
                  <PlayIcon className="h-5 w-5 translate-x-0.5" />
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-night-900 transition-colors group-hover:text-spirit-600">
                {v.title}
              </p>
            </motion.button>
          ))}
        </div>
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

  // En app native : ouvrir la vidéo dans le navigateur (embed bloqué).
  useEffect(() => {
    if (isNativeApp()) {
      openYouTube(videos[index]?.id);
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!v) return null;
  if (isNativeApp()) return null;

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
          <p className="font-display text-lg font-bold text-cream">{v.title}</p>
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
