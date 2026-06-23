"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import type { Short } from "@/lib/types";
import { ShortsPlayer } from "@/components/home/ShortsPlayer";
import { PlayIcon } from "@/components/ui/PlayIcon";

/** Colonne « Vidéo du jour » : le dernier Short publié, jouable sur place. */
export function DailyShort({ latest, all }: { latest: Short; all: Short[] }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="dark-ctx bg-topo-dark relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 p-7 sm:p-9">
      <div className="blob -right-12 top-1/4 h-44 w-44 bg-dawn-400/25" />
      <div className="relative flex h-full flex-col">
        <span className="eyebrow">🎬 Vidéo du jour</span>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Lire : ${latest.title}`}
          className="group relative mx-auto mt-6 block aspect-[9/16] w-full max-w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-night-900"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${latest.id}/hqdefault.jpg`}
            alt={latest.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-night-950/80 via-transparent to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-dawn-400 text-night-900 shadow-glow transition-transform duration-300 group-hover:scale-110">
            <PlayIcon className="h-6 w-6 translate-x-0.5" />
          </span>
        </button>

        <p className="mt-5 line-clamp-2 text-center font-semibold text-cream">
          {latest.title}
        </p>

        <div className="mt-auto pt-6 text-center">
          <Link
            href="/videos"
            className="text-sm font-semibold uppercase tracking-wider text-dawn-300 transition-colors hover:text-dawn-200"
          >
            Voir tous les Shorts →
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <ShortsPlayer shorts={all} startIndex={0} onClose={() => setOpen(false)} />
        ) : null}
      </AnimatePresence>
    </article>
  );
}
