"use client";

import { useState } from "react";
import Image from "next/image";
import { t } from "@/i18n";

type Props = {
  videoId: string;
  title: string;
  className?: string;
};

// Lecteur YouTube "léger" : l'iframe (et ses traceurs) ne se charge
// qu'au clic — performance et vie privée. Miniature servie par YouTube.
export function LiteYouTube({ videoId, title, className = "" }: Props) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={`group relative aspect-video overflow-hidden rounded-2xl bg-night-soft ${className}`}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`${t("a11y.playVideo")} : ${title}`}
          className="absolute inset-0 h-full w-full"
        >
          <Image
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-night/40 transition-colors duration-300 group-hover:bg-night/20" />
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream/95 transition-all duration-300 ease-smooth group-hover:scale-110 group-hover:bg-pulse">
            <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-night" aria-hidden>
              <path d="M8 5.5v13l11-6.5-11-6.5z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
