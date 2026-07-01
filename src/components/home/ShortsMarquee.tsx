"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Short } from "@/lib/types";
import { ShortsPlayer } from "@/components/home/ShortsPlayer";
import { PlayIcon } from "@/components/ui/PlayIcon";

/**
 * Accueil: bande de Shorts qui défile automatiquement (façon landing page).
 * Au survol la bande se met en pause ; un clic ouvre le feed vertical complet.
 */
export function ShortsMarquee({ preview, all }: { preview: Short[]; all: Short[] }) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const loop = [...preview,...preview];

  return (
    <>
      <div className="group/marquee relative mt-10 overflow-hidden py-2">
        <div className="flex w-max gap-4 px-5 animate-marquee group-hover/marquee:[animation-play-state:paused]">
          {loop.map((s, i) => (
            <button
              key={`${s.id}-${i}`}
              type="button"
              onClick={() => setOpenAt(i % preview.length)}
              aria-label={s.title}
              className="group relative aspect-[9/16] w-40 shrink-0 overflow-hidden rounded-3xl border border-night-900/10 bg-night-900 text-left shadow-card transition-transform duration-300 hover:-translate-y-1 sm:w-44"
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
        </div>
        {/* Fondu sur les bords */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-cream to-transparent sm:w-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-cream to-transparent sm:w-20" />
      </div>

      <AnimatePresence>
        {openAt!== null? (
          <ShortsPlayer shorts={all} startIndex={openAt} onClose={() => setOpenAt(null)} />
        ): null}
      </AnimatePresence>
    </>
  );
}
