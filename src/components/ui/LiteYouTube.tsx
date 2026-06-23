"use client";

import { useState } from "react";

type LiteYouTubeProps = {
  id: string;
  title?: string;
  /** Format vertical (Shorts) ou paysage. */
  vertical?: boolean;
};

/**
 * Embed YouTube léger « click-to-play » : on n'affiche que la miniature
 * (aucun script YouTube chargé) jusqu'au clic, puis l'iframe nocookie.
 * Bon pour la performance et la confidentialité.
 */
export function LiteYouTube({ id, title = "Vidéo", vertical = false }: LiteYouTubeProps) {
  const [active, setActive] = useState(false);
  const ratio = vertical ? "aspect-[9/16]" : "aspect-video";
  const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  return (
    <div className={`relative ${ratio} w-full overflow-hidden rounded-3xl border border-night-900/10 bg-night-900`}>
      {active ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={`Lire : ${title}`}
          className="group absolute inset-0 h-full w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-night-950/70 via-transparent to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-dawn-400 text-night-900 shadow-glow transition-transform duration-300 group-hover:scale-110">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 translate-x-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
