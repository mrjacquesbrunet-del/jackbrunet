"use client";

import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";
import { videoEmbedSrc, youtubeWatchUrl } from "@/lib/youtube";

/**
 * Les vidéos de Jack reliées aux passages bibliques (index pré-généré par
 * scripts/generate-video-refs.mjs depuis les TRANSCRIPTIONS YouTube).
 *  - bouton vidéo à côté du verset précis quand il est connu ;
 *  - carte « Jack en parle » en fin de chapitre pour la vidéo du chapitre ;
 *  - lecture dans une feuille, sans quitter la Bible.
 */

export type BibleVideo = { id: string; t: string; v?: number[] };
type VideosIndex = Record<string, BibleVideo[]>;

let dataPromise: Promise<VideosIndex | null> | null = null;
export function getBibleVideos(): Promise<VideosIndex | null> {
  if (!dataPromise) {
    dataPromise = fetch(asset("/bible/videos.json"))
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  return dataPromise;
}

/** Les vidéos du chapitre courant (hook léger). */
export function useChapterVideos(bookId: number, chapter: number): BibleVideo[] {
  const [vids, setVids] = useState<BibleVideo[]>([]);
  useEffect(() => {
    let active = true;
    getBibleVideos().then((idx) => {
      if (active) setVids(idx?.[`${bookId}-${chapter}`] ?? []);
    });
    return () => {
      active = false;
    };
  }, [bookId, chapter]);
  return vids;
}

/** Petit bouton vidéo à poser à côté d'un verset. */
export function VerseVideoButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label="Jack en parle en vidéo"
      title="Jack en parle en vidéo"
      className="ml-1.5 inline-grid h-6 w-6 translate-y-[4px] shrink-0 place-items-center rounded-full bg-red-500/15 align-baseline text-red-600 transition-colors hover:bg-red-500/30"
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2}>
        <rect x="3" y="6" width="13" height="12" rx="2.5" />
        <path d="M16 10.5l5-3v9l-5-3" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** Carte « Jack en parle » (fin de chapitre) : miniature + titre + lecture. */
export function ChapterVideoCard({ video, dark, onPlay }: { video: BibleVideo; dark: boolean; onPlay: () => void }) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className={`group flex w-full items-center gap-3.5 rounded-2xl border p-3 text-left shadow-card transition-transform hover:-translate-y-0.5 ${
        dark ? "border-white/10 bg-white/[0.06]" : "border-night-900/10 bg-white"
      }`}
    >
      <span className="relative block h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-night-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-night-950/70 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-3.5 w-3.5 fill-current">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[10px] font-black uppercase tracking-[0.18em] ${dark ? "text-dawn-300" : "text-dawn-600"}`}>
          Jack en parle
        </span>
        <span className={`mt-0.5 line-clamp-2 font-display text-sm font-extrabold leading-snug ${dark ? "text-cream" : "text-night-900"}`}>
          {video.t}
        </span>
      </span>
    </button>
  );
}

/** Feuille de lecture : la vidéo se lance dans l'app, sans la quitter. */
export function VideoSheet({ video, onClose }: { video: BibleVideo; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-night-950/80 backdrop-blur-sm" />
      <div className="dark-ctx relative w-full max-w-md overflow-hidden rounded-t-3xl border border-white/10 bg-night-900 text-cream sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-dawn-300">Jack en parle</p>
            <p className="mt-0.5 line-clamp-2 font-display text-base font-extrabold leading-snug">{video.t}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-cream/70">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-3 pb-3">
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-night-950">
            <iframe
              src={videoEmbedSrc(video.id, { autoplay: true })}
              title={video.t}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
        <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <a
            href={youtubeWatchUrl(video.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-cream/50 underline-offset-2 hover:underline"
          >
            Voir sur YouTube
          </a>
        </div>
      </div>
    </div>
  );
}
