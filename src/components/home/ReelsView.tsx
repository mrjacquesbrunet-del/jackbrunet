"use client";

import { useEffect, useRef, useState } from "react";
import type { Short } from "@/lib/types";
import { videoEmbedSrc } from "@/lib/youtube";

/**
 * Feed vertical façon « Reels » pour l'onglet Vidéos de l'app : le premier
 * Short se lance automatiquement, on scrolle pour passer au suivant.
 * Hauteur calculée pour laisser la barre de navigation visible en bas.
 */
export function ReelsView({ shorts }: { shorts: Short[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.index);
            if (!Number.isNaN(i)) setActive(i);
          }
        }
      },
      { root, threshold: 0.6 },
    );
    slideRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [shorts.length]);

  if (shorts.length === 0) {
    return (
      <div className="grid h-[70svh] place-items-center px-6 text-center text-night-900/55">
        Les vidéos arrivent bientôt 🙏
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="no-scrollbar snap-y snap-mandatory overflow-y-auto overscroll-contain bg-night-950"
      style={{ height: "calc(100dvh - 4.5rem)" }}
    >
      {shorts.map((s, i) => (
        <div
          key={s.id}
          data-index={i}
          ref={(el) => {
            slideRefs.current[i] = el;
          }}
          className="flex snap-start snap-always items-center justify-center px-2 py-2"
          style={{ height: "calc(100dvh - 4.5rem)" }}
        >
          <div className="relative h-full w-full max-w-[480px] overflow-hidden rounded-2xl border border-white/10 bg-night-900">
            {Math.abs(i - active) <= 1 ? (
              i === active ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={videoEmbedSrc(s.id, { autoplay: true, mute: true, loop: true })}
                  title={s.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://i.ytimg.com/vi/${s.id}/hqdefault.jpg`}
                  alt={s.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-70"
                />
              )
            ) : null}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-night-950/90 to-transparent p-5">
              {s.category ? (
                <span className="inline-flex rounded-full bg-dawn-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-night-900">
                  {s.category}
                </span>
              ) : null}
              <p className="mt-2 line-clamp-2 font-semibold text-cream">{s.title}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
