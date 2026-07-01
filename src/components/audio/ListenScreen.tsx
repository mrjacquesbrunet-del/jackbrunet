"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { listPodcasts, uploadPodcast, deletePodcast, type AudioTrack } from "@/lib/audio-library";
import { useAuth } from "@/components/community/useAuth";
import { isAdminEmail } from "@/lib/community";
import { PlayGlyph, PauseGlyph } from "@/components/ui/DevoIcons";

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ListenScreen() {
  const { email } = useAuth();
  const admin = isAdminEmail(email);

  const [tracks, setTracks] = useState<AudioTrack[] | null>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [upload, setUpload] = useState<{ done: number; total: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => listPodcasts().then(setTracks), []);
  useEffect(() => {
    load();
  }, [load]);

  const playIndex = useCallback((i: number) => {
    setCurrent(i);
    setPlaying(true);
  }, []);

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
    if (el) el.currentTime = Number(e.target.value);
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setUpload({ done: 0, total: files.length });
    for (let i = 0; i < files.length; i++) {
      await uploadPodcast(files[i]);
      setUpload({ done: i + 1, total: files.length });
    }
    setUpload(null);
    load();
  }

  async function remove(t: AudioTrack) {
    if (!confirm(`Supprimer « ${t.title} » ?`)) return;
    await deletePodcast(t.id, t.path);
    load();
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

      {/* Admin : envoi des audios */}
      {admin ? (
        <div className="mt-6 rounded-3xl border border-dawn-400/40 bg-cream/70 p-5">
          <p className="font-display font-bold">🎧 Ajouter des audios (admin)</p>
          <p className="mt-1 text-sm text-night-900/60">
            Sélectionne un ou plusieurs fichiers — le nom du fichier devient le titre (accents
            et apostrophes conservés).
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={onFiles}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={!!upload}
            className="btn-primary mt-3 disabled:opacity-50"
          >
            {upload ? `Envoi… ${upload.done}/${upload.total}` : "Choisir des fichiers"}
          </button>
        </div>
      ) : null}

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
                  key={t.id}
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
                    download
                    aria-label="Télécharger"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-night-900/40 transition-colors hover:bg-night-900/5 hover:text-night-900/70"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.7}>
                      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                  {admin ? (
                    <button
                      type="button"
                      onClick={() => remove(t)}
                      aria-label="Supprimer"
                      className="shrink-0 text-night-900/25 transition-colors hover:text-red-600/70"
                    >
                      ✕
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

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
