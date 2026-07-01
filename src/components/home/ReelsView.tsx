"use client";

import { useEffect, useRef, useState } from "react";
import type { Short } from "@/lib/types";
import { videoEmbedSrc } from "@/lib/youtube";

/**
 * Feed vertical façon « Reels » pour l'onglet Vidéos.
 *
 * - Les vidéos voisines sont préchargées (lecteurs YouTube gardés en mémoire).
 * - Au swipe, on lance la lecture de la vidéo active (et on met les autres en
 *   pause) via des messages envoyés au lecteur — sans recharger la vidéo.
 * - Le son démarre coupé (contrainte iOS). Une seule touche « active le son »,
 *   puis il reste activé sur toutes les vidéos suivantes.
 */
export function ReelsView({ shorts }: { shorts: Short[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frames = useRef<Record<number, HTMLIFrameElement | null>>({});
  const [active, setActive] = useState(0);
  const [soundOn, setSoundOn] = useState(false);

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

  // Pilote lecture + son quand la vidéo active (ou le son) change.
  useEffect(() => {
    for (const key of Object.keys(frames.current)) {
      const i = Number(key);
      if (i === active) {
        post(i, "play");
        post(i, soundOn ? "unmute" : "mute");
      } else {
        post(i, "pause");
        post(i, "mute");
      }
    }
  }, [active, soundOn]);

  function enableSound() {
    setSoundOn(true);
    // Dans le geste utilisateur : meilleure chance que iOS autorise le son.
    post(active, "play");
    post(active, "unmute");
  }

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
      {shorts.map((s, i) => {
        const near = Math.abs(i - active) <= 1; // fenêtre préchargée
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
              {near ? (
                <iframe
                  ref={(el) => {
                    frames.current[i] = el;
                  }}
                  className="absolute inset-0 h-full w-full"
                  src={videoEmbedSrc(s.id, { autoplay: i === active, mute: true, loop: true })}
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
              )}

              {/* Touche claire pour activer le son (une seule fois) */}
              {i === active && !soundOn ? (
                <button
                  type="button"
                  onClick={enableSound}
                  aria-label="Activer le son"
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-night-950/30 transition-colors active:bg-night-950/45"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-cream/95 text-night-900 shadow-lg">
                    <SoundOffIcon className="h-7 w-7" />
                  </span>
                  <span className="rounded-full bg-night-950/70 px-4 py-1.5 text-sm font-bold text-cream">
                    Touche pour le son
                  </span>
                </button>
              ) : null}

              {/* Bouton couper le son (une fois activé) */}
              {i === active && soundOn ? (
                <button
                  type="button"
                  onClick={() => setSoundOn(false)}
                  aria-label="Couper le son"
                  className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-night-950/55 text-cream backdrop-blur transition-colors active:bg-night-950/75"
                >
                  <SoundOnIcon className="h-5 w-5" />
                </button>
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
        );
      })}
    </div>
  );
}

function SoundOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className ?? ""} fill-none stroke-current`} strokeWidth={1.8}>
      <path d="M4 9.5h3l4.5-3.5v12L7 14.5H4z" strokeLinejoin="round" />
      <path d="M16 9.5l4 5M20 9.5l-4 5" strokeLinecap="round" />
    </svg>
  );
}

function SoundOnIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className ?? ""} fill-none stroke-current`} strokeWidth={1.8}>
      <path d="M4 9.5h3l4.5-3.5v12L7 14.5H4z" strokeLinejoin="round" />
      <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" strokeLinecap="round" />
    </svg>
  );
}
