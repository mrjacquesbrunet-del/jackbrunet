"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import type { Short } from "@/lib/types";
import { ShortsPlayer } from "@/components/home/ShortsPlayer";
import { PlayIcon } from "@/components/ui/PlayIcon";

/** Colonne « Vidéo du jour »: le dernier Short publié, jouable sur place. */
export function DailyShort({ latest, all }: { latest: Short; all: Short[] }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-dawn-500/50 bg-dawn-400 p-7 text-night-950 sm:p-9">
      <div className="blob -right-12 top-1/4 h-44 w-44 bg-night-950/10" />
      <div className="relative flex h-full flex-col">
        <span className="inline-flex w-fit items-center rounded-full border border-night-950/15 bg-night-950/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-night-900">
          Vidéo du jour
        </span>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Lire: ${latest.title}`}
          className="group relative mx-auto mt-6 block aspect-[9/16] w-full max-w-[220px] overflow-hidden rounded-2xl border border-night-950/15 bg-night-900"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${latest.id}/hqdefault.jpg`}
            alt={latest.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-night-950/80 via-transparent to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cream text-night-950 shadow-card transition-transform duration-300 group-hover:scale-110">
            <PlayIcon className="h-6 w-6 translate-x-0.5" />
          </span>
        </button>

        <p className="mt-5 line-clamp-2 text-center font-semibold text-night-950">
          {latest.title}
        </p>

        <div className="mt-auto pt-6 text-center">
          <Link
            href="/videos"
            className="text-sm font-bold uppercase tracking-wider text-night-900 underline-offset-4 transition-colors hover:underline"
          >
            Voir tous les Shorts →
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {open? (
          <ShortsPlayer shorts={all} startIndex={0} onClose={() => setOpen(false)} />
        ): null}
      </AnimatePresence>
    </article>
  );
}

/**
 * Bulle flottante RONDE « Vidéo du jour » : la vidéo tourne en muet dans un
 * petit cercle en bas à droite ; un toucher fait défiler la page jusqu'à la
 * section « La vidéo du jour ». La petite croix la masque pour la session.
 */
export function FloatingDailyShort({ latest, targetId = "video-jour" }: { latest: Short; targetId?: string }) {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <>
      {/* Petite bulle RONDE et discrète : vignette VIVANTE de la vidéo du
          jour (lent zoom-panoramique en boucle). iOS/YouTube refusent le
          démarrage automatique d'une vidéo intégrée sans geste dans son
          cadre : la vignette animée donne le mouvement, sans bouton rouge. */}
      <style>{`
        @keyframes fds-kb{0%{transform:scale(1.05) translate(0,0)}50%{transform:scale(1.22) translate(-4%,-5%)}100%{transform:scale(1.05) translate(3%,2%)}}
        @keyframes fds-pulse{0%,100%{box-shadow:0 0 0 0 rgba(202,240,0,.5)}70%{box-shadow:0 0 0 8px rgba(202,240,0,0)}}
      `}</style>
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] right-3 z-40">
        <div className="relative h-[4.5rem] w-[4.5rem]">
          <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-dawn-400 bg-night-950 shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${latest.id}/hqdefault.jpg`}
              alt=""
              aria-hidden
              className="pointer-events-none h-full w-full object-cover"
              style={{ animation: "fds-kb 14s ease-in-out infinite alternate" }}
            />
            {/* Pastille lecture, pulsante */}
            <span
              className="pointer-events-none absolute bottom-1 left-1/2 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full bg-dawn-400 text-night-950"
              style={{ animation: "fds-pulse 2.2s ease-out infinite" }}
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>
          <button
            type="button"
            onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" })}
            aria-label={`Aller à la vidéo du jour : ${latest.title}`}
            className="absolute inset-0 rounded-full"
          />
          <button
            type="button"
            onClick={() => setHidden(true)}
            aria-label="Masquer la vidéo du jour"
            className="absolute -right-1 -top-1 grid h-[18px] w-[18px] place-items-center rounded-full bg-night-950/85 text-cream/85 ring-1 ring-white/20"
          >
            <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 fill-none stroke-current" strokeWidth={2.6} aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
