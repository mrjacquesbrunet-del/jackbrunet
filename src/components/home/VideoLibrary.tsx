"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LongVideo, Short } from "@/lib/types";
import { ShortsPlayer } from "@/components/home/ShortsPlayer";
import { PlayIcon } from "@/components/ui/PlayIcon";
import { videoEmbedSrc } from "@/lib/youtube";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const reveal = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, margin: "-40px" },
};

export function VideoLibrary({
  videos,
  shorts,
}: {
  videos: LongVideo[];
  shorts: Short[];
}) {
  const [query, setQuery] = useState("");
  const [openVideo, setOpenVideo] = useState<number | null>(null);
  const [openShort, setOpenShort] = useState<number | null>(null);

  const q = norm(query.trim());
  const searching = q.length > 0;

  const fvideos = useMemo(
    () => (q ? videos.filter((v) => norm(v.title).includes(q)) : videos),
    [q, videos],
  );
  const fshorts = useMemo(
    () => (q ? shorts.filter((s) => norm(s.title).includes(q)) : shorts),
    [q, shorts],
  );

  const hero = videos[0];

  return (
    <>
      {/* Bannière « À la une » (masquée pendant une recherche) */}
      {hero && !searching ? (
        <div className="dark-ctx relative mb-10 overflow-hidden border-b border-white/10">
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
            className="container-x relative flex min-h-[56vh] flex-col justify-end py-12 sm:min-h-[62vh]"
          >
            <span className="eyebrow w-fit">À la une</span>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-extrabold leading-tight text-cream drop-shadow sm:text-5xl">
              {hero.title}
            </h2>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={() => setOpenVideo(0)} className="btn-primary">
                <PlayIcon className="h-5 w-5 translate-x-0.5" />
                Lire
              </button>
              <button
                type="button"
                onClick={() => setOpenVideo(0)}
                className="btn-ghost border-white/25 bg-white/10 text-cream hover:bg-white/20"
              >
                Plus d'infos
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}

      {/* Recherche */}
      <div className="container-x">
        <div className="relative max-w-md">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-night-900/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une vidéo, un short…"
            aria-label="Rechercher une vidéo"
            className="field pl-12"
          />
        </div>
      </div>

      {/* Prédications */}
      <div className="container-x mt-10">
        <h3 className="mb-6 font-display text-2xl font-bold sm:text-3xl">
          Prédications
          {searching ? (
            <span className="ml-2 text-base font-semibold text-night-900/40">
              · {fvideos.length}
            </span>
          ) : null}
        </h3>
        {fvideos.length ? (
          <div className="no-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-4">
            {fvideos.map((v, i) => (
              <motion.button
                key={v.id}
                type="button"
                onClick={() => setOpenVideo(i)}
                {...reveal}
                transition={{ duration: 0.45, delay: (i % 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="group w-72 shrink-0 snap-start text-left sm:w-80"
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
        ) : (
          <p className="text-night-900/50">Aucune prédication ne correspond à ta recherche.</p>
        )}
      </div>

      {/* Shorts */}
      <div className="container-x mt-14">
        <h3 className="mb-6 font-display text-2xl font-bold sm:text-3xl">
          Shorts
          {searching ? (
            <span className="ml-2 text-base font-semibold text-night-900/40">
              · {fshorts.length}
            </span>
          ) : null}
        </h3>
        {fshorts.length ? (
          <div className="no-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-4">
            {fshorts.map((s, i) => (
              <motion.button
                key={s.id}
                type="button"
                onClick={() => setOpenShort(i)}
                {...reveal}
                transition={{ duration: 0.45, delay: (i % 10) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="group w-40 shrink-0 snap-start text-left sm:w-44"
              >
                <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-night-900/10 bg-night-900 transition-shadow duration-300 group-hover:shadow-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.ytimg.com/vi/${s.id}/hqdefault.jpg`}
                    alt={s.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-night-950/50 via-transparent to-transparent transition-opacity group-hover:opacity-0" />
                  <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-dawn-400 text-night-900 opacity-0 shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
                    <PlayIcon className="h-5 w-5 translate-x-0.5" />
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-night-900 transition-colors group-hover:text-spirit-600">
                  {s.title}
                </p>
              </motion.button>
            ))}
          </div>
        ) : (
          <p className="text-night-900/50">Aucun short ne correspond à ta recherche.</p>
        )}
      </div>

      <AnimatePresence>
        {openVideo !== null ? (
          <VideoModal
            videos={fvideos}
            index={openVideo}
            onIndex={setOpenVideo}
            onClose={() => setOpenVideo(null)}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {openShort !== null ? (
          <ShortsPlayer shorts={fshorts} startIndex={openShort} onClose={() => setOpenShort(null)} />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function VideoModal({
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
            src={videoEmbedSrc(v.id, { autoplay: true })}
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
