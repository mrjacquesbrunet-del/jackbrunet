"use client";

import { useRef } from "react";
import { Media } from "@/components/ui/Media";
import { LiteYouTube } from "@/components/ui/LiteYouTube";
import type { Testimony } from "@/lib/types";
import { t } from "@/i18n";

function youtubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/);
  return match ? match[1] : null;
}

// Carrousel immersif : défilement natif (scroll-snap) — fluide au doigt,
// accessible au clavier, boutons de navigation en renfort.
export function TestimonyCarousel({ items }: { items: Testimony[] }) {
  const track = useRef<HTMLUListElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  return (
    <div>
      <ul
        ref={track}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const videoId = item.videoUrl ? youtubeId(item.videoUrl) : null;
          return (
            <li
              key={item.name + item.title}
              className="w-[85%] max-w-md shrink-0 snap-start sm:w-[60%] lg:w-[42%]"
            >
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-night-soft transition-shadow duration-500 ease-smooth hover:shadow-[0_0_60px_rgba(163,205,134,0.12)]">
                {videoId ? (
                  <LiteYouTube videoId={videoId} title={item.title} className="!rounded-none" />
                ) : (
                  <Media
                    src={item.photo || undefined}
                    alt={`Portrait de ${item.name}`}
                    ratio="aspect-video"
                    variant="portrait"
                    className="!rounded-none"
                  />
                )}
                <div className="flex flex-1 flex-col p-8">
                  <h3 className="text-xl font-extrabold leading-snug tracking-tight text-cream">
                    {item.title}
                  </h3>
                  <p className="mt-4 flex-1 leading-relaxed text-cream/70">{item.text}</p>
                  <p className="mt-6 text-sm font-bold text-leaf">
                    {item.name}
                    {item.age ? <span className="font-normal text-cream/50"> · {item.age}</span> : null}
                  </p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label={t("a11y.previous")}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/20 text-cream transition-all duration-300 ease-smooth hover:border-pulse hover:text-pulse"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden>
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label={t("a11y.next")}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/20 text-cream transition-all duration-300 ease-smooth hover:border-pulse hover:text-pulse"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden>
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
