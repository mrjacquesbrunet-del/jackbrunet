"use client";

import { useEffect, useState } from "react";
import { usePodcastPlayer, getPodcastAudio } from "@/lib/podcast-player";
import { useSoaking } from "@/lib/soaking";
import { PlayGlyph, PauseGlyph, MusicGlyph } from "@/components/ui/DevoIcons";
import { SleepTimer } from "@/components/audio/SleepTimer";

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Barre de lecture GLOBALE, affichée en bas sur toutes les pages tant qu'un
 * audio est en cours (podcast en priorité, sinon musique soaking). Reste
 * visible quand on change d'onglet ; la lecture continue en arrière-plan.
 */
export function GlobalAudioBar() {
  const pod = usePodcastPlayer();
  const soak = useSoaking();
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const a = getPodcastAudio();
    if (!a) return;
    const onT = () => setTime(a.currentTime);
    const onM = () => setDur(a.duration || 0);
    a.addEventListener("timeupdate", onT);
    a.addEventListener("loadedmetadata", onM);
    setTime(a.currentTime);
    setDur(a.duration || 0);
    return () => {
      a.removeEventListener("timeupdate", onT);
      a.removeEventListener("loadedmetadata", onM);
    };
  }, [pod.index]);

  // Podcast en priorité.
  if (pod.current) {
    return (
      <div className="global-audio-bar fixed inset-x-0 z-[55] border-t border-night-900/10 bg-white/95 px-4 py-3.5 backdrop-blur">
        <div className="container-x flex items-center gap-2 px-0">
          <button
            type="button"
            onClick={pod.toggle}
            aria-label={pod.playing? "Pause": "Lire"}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950"
          >
            {pod.playing? <PauseGlyph className="h-6 w-6" />: <PlayGlyph className="h-6 w-6" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-night-900/90">{pod.current.title}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[10px] tabular-nums text-night-900/45">{fmt(time)}</span>
              <input
                type="range"
                min={0}
                max={dur || 0}
                value={time}
                onChange={(e) => pod.seek(Number(e.target.value))}
                className="h-1.5 flex-1 accent-spirit-600"
                aria-label="Position"
              />
              <span className="text-[10px] tabular-nums text-night-900/45">{fmt(dur)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (pod.queue.length < 2) return;
              const q = [...pod.queue];
              for (let i = q.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [q[i], q[j]] = [q[j], q[i]];
              }
              pod.playQueue(q, 0);
            }}
            aria-label="Lecture aléatoire"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-night-900/50 transition-colors hover:bg-night-900/5"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2} aria-hidden>
              <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              const speeds = [1, 1.25, 1.5, 0.8];
              const i = speeds.indexOf(pod.rate);
              pod.setRate(speeds[(i + 1) % speeds.length]);
            }}
            aria-label="Vitesse de lecture"
            className="h-9 shrink-0 rounded-full border border-night-900/10 bg-night-900/[0.04] px-2.5 text-xs font-bold tabular-nums text-night-900/70"
          >
            {pod.rate}×
          </button>
          <SleepTimer />
          <button
            type="button"
            onClick={pod.next}
            aria-label="Suivant"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-night-900/50 transition-colors hover:bg-night-900/5"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
              <path d="M6 5l9 7-9 7zM17 5h2v14h-2z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={pod.stop}
            aria-label="Fermer le lecteur"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-night-900/40 transition-colors hover:bg-night-900/5 hover:text-night-900/70"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // Sinon: musique soaking en cours.
  if (soak.playing) {
    return (
      <div className="global-audio-bar fixed inset-x-0 z-[55] border-t border-spirit-600/20 bg-spirit-500/[0.12] px-4 py-3.5 backdrop-blur">
        <div className="container-x flex items-center gap-3 px-0">
          <button
            type="button"
            onClick={soak.toggle}
            aria-label="Pause"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-spirit-500 text-cream"
          >
            <PauseGlyph className="h-6 w-6" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[15px] font-semibold text-night-900/90">
              <MusicGlyph className="h-4 w-4 text-spirit-600" />
              Musique soaking
            </p>
            <p className="truncate text-xs text-night-900/55">En cours · {soak.label}</p>
          </div>
          <button
            type="button"
            onClick={soak.toggle}
            aria-label="Fermer le lecteur"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-night-900/40 transition-colors hover:bg-night-900/5 hover:text-night-900/70"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return null;
}
