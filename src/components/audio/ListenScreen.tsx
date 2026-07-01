"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { listAudio, type AudioTrack } from "@/lib/audio-library";
import { PlayGlyph, PauseGlyph } from "@/components/ui/DevoIcons";

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ListenScreen() {
  const [tracks, setTracks] = useState<AudioTrack[] | null>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    listAudio().then(setTracks);
  }, []);

  const playIndex = useCallback(
    (i: number) => {
      setCurrent(i);
      setPlaying(true);
    },
    [],
  );

  // Charge et lit la piste courante.
  useEffect(() => {
    const el = audioRef.current;
    if (!el || current === null || !tracks) return;
    el.src = tracks[current].url;
    el.play().catch(() => setPlaying(false));
  }, [current, tracks]);

  function toggle() {
    const el = audioRef.current;
    if (!el || current === null) {
      if (tracks && tracks.length) playIndex(0);
      return;
    }
    if (el.paused) el.play().catch(() => undefined);
    else el.pause();
  }

  const next = useCallback(() => {
    if (!tracks || current === null) return;
    if (current + 1 < tracks.length) playIndex(current + 1);
  }, [tracks, current, playIndex]);

  const prev = useCallback(() => {
    if (!tracks || current === null) return;
    if (current - 1 >= 0) playIndex(current - 1);
  }, [tracks, current, playIndex]);

  // Contrôles écran verrouillé (Media Session).
  useEffect(() => {
    if (current === null || !tracks) return;
    const ms = (navigator as Navigator & { mediaSession?: MediaSession }).mediaSession;
    if (!ms) return;
    try {
      ms.metadata = new MediaMetadata({
        title: tracks[current].title,
        artist: "Pasteur Jack Brunet",
        album: "Jack Brunet — Écouter",
      });
      ms.setActionHandler("play", () => audioRef.current?.play());
      ms.setActionHandler("pause", () => audioRef.current?.pause());
      ms.setActionHandler("nexttrack", next);
      ms.setActionHandler("previoustrack", prev);
    } catch {
      /* API partielle */
    }
  }, [current, tracks, next, prev]);

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Number(e.target.value);
  }

  return (
    <section className="container-x pb-28 pt-24 sm:pt-28">
      <audio
        ref={audioRef}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={next}
        preload="metadata"
      />

      {/* En-tête + bouton vers les vidéos */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="eyebrow">Podcasts</span>
          <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Écouter</h1>
          <p className="mt-1 text-sm text-night-900/60">
            Les enseignements de Pasteur Jack, à écouter partout.
          </p>
        </div>
        <Link
          href="/videos"
          className="inline-flex items-center gap-2 rounded-full border border-night-900/15 bg-white px-4 py-2 text-sm font-semibold text-spirit-700 transition-colors hover:border-night-900/30"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.7}>
            <path
              d="M4 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM17 10l5-3v10l-5-3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Regarder en vidéo
        </Link>
      </div>

      {/* Liste des épisodes */}
      <div className="mt-8">
        {tracks === null ? (
          <p className="text-night-900/50">Chargement…</p>
        ) : tracks.length === 0 ? (
          <div className="glass-strong p-6 text-center">
            <p className="font-display text-lg font-bold">Les audios arrivent très bientôt 🎧</p>
            <p className="mt-1 text-sm text-night-900/60">
              Reviens dans un instant — de nouveaux enseignements sont en préparation.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {tracks.map((t, i) => {
              const isCur = i === current;
              return (
                <li
                  key={t.name}
                  className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${
                    isCur ? "border-dawn-400/50 bg-dawn-400/10" : "border-night-900/10 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => (isCur ? toggle() : playIndex(i))}
                    aria-label={isCur && playing ? "Pause" : "Lire"}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-night-900 text-dawn-400"
                  >
                    {isCur && playing ? (
                      <PauseGlyph className="h-5 w-5" />
                    ) : (
                      <PlayGlyph className="h-5 w-5" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-night-900/90">{t.title}</p>
                    <p className="text-xs text-night-900/45">Pasteur Jack Brunet</p>
                  </div>
                  <a
                    href={t.url}
                    download={t.name}
                    aria-label="Télécharger"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-night-900/40 transition-colors hover:bg-night-900/5 hover:text-night-900/70"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.7}>
                      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Lecteur fixe en bas (quand une piste est active) */}
      {current !== null && tracks && tracks[current] ? (
        <div className="fixed inset-x-0 bottom-[4.75rem] z-40 border-t border-night-900/10 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="container-x flex items-center gap-3 px-0">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause" : "Lire"}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950"
            >
              {playing ? <PauseGlyph className="h-5 w-5" /> : <PlayGlyph className="h-5 w-5" />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-night-900/90">
                {tracks[current].title}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] tabular-nums text-night-900/45">{fmt(time)}</span>
                <input
                  type="range"
                  min={0}
                  max={dur || 0}
                  value={time}
                  onChange={seek}
                  className="h-1 flex-1 accent-spirit-600"
                  aria-label="Position"
                />
                <span className="text-[10px] tabular-nums text-night-900/45">{fmt(dur)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
