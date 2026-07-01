"use client";

import { useEffect, useRef, useState } from "react";
import type { Short } from "@/lib/types";
import { videoEmbedSrc } from "@/lib/youtube";

/**
 * Feed vertical façon « Reels » pour l'onglet Vidéos.
 *
 * - Les vidéos voisines sont préchargées (lecteurs YouTube gardés en mémoire).
 * - Au swipe, on lance la lecture de la vidéo active et on met les autres en
 * pause, sans recharger.
 * - Le son: iOS interdit de le garder automatiquement d'une vidéo YouTube à
 * l'autre (chaque cadre exige son propre geste). On propose donc un bouton
 * « son » qui réapparaît sur chaque vidéo (compact après la 1re fois): un
 * appui suffit à activer le son sur la vidéo en cours.
 */
export function ReelsView({ shorts }: { shorts: Short[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frames = useRef<Record<number, HTMLIFrameElement | null>>({});
  const [active, setActive] = useState(0);
  const [soundOn, setSoundOn] = useState(false); // son global: reste activé au swipe

  function post(i: number, jb: string) {
    frames.current[i]?.contentWindow?.postMessage({ jb }, "*");
  }

  // Suit la vidéo visible.
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

  // Pilote lecture + son quand la vidéo active (ou l'état du son) change.
  // Le son est GLOBAL: si activé, chaque vidéo qui devient active est jouée
  // avec le son (on tente l'unmute au swipe).
  useEffect(() => {
    for (const key of Object.keys(frames.current)) {
      const i = Number(key);
      if (i === active) {
        post(i, "play");
        post(i, soundOn? "unmute": "mute");
      } else {
        post(i, "pause");
        post(i, "mute");
      }
    }
  }, [active, soundOn]);

  function enableSound() {
    setSoundOn(true);
    // Dans le geste utilisateur: iOS autorise le son sur la vidéo en cours.
    post(active, "play");
    post(active, "unmute");
  }

  if (shorts.length === 0) {
    return (
      <div className="grid h-[70svh] place-items-center px-6 text-center text-night-900/55">
        Les vidéos arrivent bientôt
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="no-scrollbar snap-y snap-mandatory overflow-y-auto overscroll-contain bg-night-950"
      style={{ height: "calc(100dvh - 4.5rem)" }}
    >
      {shorts.map((s, i) => {
        const near = Math.abs(i - active) <= 1; // fenêtre préchargée
        const isActive = i === active;
        return (
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
              {near? (
                <iframe
                  ref={(el) => {
                    frames.current[i] = el;
                  }}
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  src={videoEmbedSrc(s.id, { autoplay: isActive, mute: true, loop: true })}
                  title={s.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ): (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://i.ytimg.com/vi/${s.id}/hqdefault.jpg`}
                  alt={s.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-70"
                />
              )}

              {/* Son coupé sur la vidéo active: bouton bien visible pour l'activer */}
              {isActive &&!soundOn? (
                <button
                  type="button"
                  onClick={enableSound}
                  aria-label="Activer le son"
                  className="absolute left-1/2 top-4 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-dawn-400 px-5 py-2.5 text-sm font-extrabold text-night-900 shadow-lg active:scale-95"
                >
                  <SoundOffIcon className="h-5 w-5" />
                  Touche pour le son
                </button>
              ): null}

              {/* Son actif: bouton pour couper */}
              {isActive && soundOn? (
                <button
                  type="button"
                  onClick={() => setSoundOn(false)}
                  aria-label="Couper le son"
                  className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-night-950/55 text-cream backdrop-blur transition-colors active:bg-night-950/75"
                >
                  <SoundOnIcon className="h-5 w-5" />
                </button>
              ): null}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-night-950/90 to-transparent p-5">
                {s.category? (
                  <span className="inline-flex rounded-full bg-dawn-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-night-900">
                    {s.category}
                  </span>
                ): null}
                <p className="mt-2 line-clamp-2 font-semibold text-cream">{s.title}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SoundOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className?? ""} fill-none stroke-current`} strokeWidth={1.8}>
      <path d="M4 9.5h3l4.5-3.5v12L7 14.5H4z" strokeLinejoin="round" />
      <path d="M16 9.5l4 5M20 9.5l-4 5" strokeLinecap="round" />
    </svg>
  );
}

function SoundOnIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className?? ""} fill-none stroke-current`} strokeWidth={1.8}>
      <path d="M4 9.5h3l4.5-3.5v12L7 14.5H4z" strokeLinejoin="round" />
      <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" strokeLinecap="round" />
    </svg>
  );
}
