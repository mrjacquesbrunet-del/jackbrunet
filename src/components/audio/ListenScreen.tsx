"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  listPodcasts,
  uploadPodcast,
  deletePodcast,
  updatePodcast,
  type AudioTrack,
} from "@/lib/audio-library";
import { useAuth } from "@/components/community/useAuth";
import { isAdminEmail } from "@/lib/community";
import { siteConfig } from "@/config/site";
import { PlayGlyph, PauseGlyph } from "@/components/ui/DevoIcons";

const FAV_KEY = "jb.podcast.favs.v1";

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function when(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
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
  const [tab, setTab] = useState<"all" | "fav">("all");
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => listPodcasts().then(setTracks), []);
  useEffect(() => {
    load();
  }, [load]);

  // Favoris (stockés sur l'appareil).
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(FAV_KEY) || "[]") as string[];
      setFavs(new Set(raw));
    } catch {
      /* indispo */
    }
  }, []);
  function toggleFav(id: string) {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(next)));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const shown = tracks
    ? tab === "fav"
      ? tracks.filter((t) => favs.has(t.id))
      : tracks
    : null;

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

  // Lien profond : /ecouter?e=<id> lance l'épisode.
  useEffect(() => {
    if (!tracks) return;
    const e = new URLSearchParams(window.location.search).get("e");
    if (!e) return;
    const i = tracks.findIndex((t) => t.id === e);
    if (i >= 0) playIndex(i);
  }, [tracks, playIndex]);

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

  async function share(t: AudioTrack) {
    const url = `${siteConfig.url}/ecouter?e=${t.id}`;
    try {
      const nav = navigator as Navigator & { share?: (d: object) => Promise<void> };
      if (nav.share) {
        await nav.share({ title: t.title, text: `Écoute « ${t.title} » — Pasteur Jack 🎧`, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* annulé */
    }
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

  async function editTrack(t: AudioTrack) {
    const title = prompt("Titre de l'épisode :", t.title);
    if (title === null) return;
    const description = prompt("Description (facultative) :", t.description ?? "");
    await updatePodcast(t.id, {
      title: title.trim() || t.title,
      description: (description ?? "").trim() || null,
    });
    load();
  }

  async function remove(t: AudioTrack) {
    if (!confirm(`Supprimer « ${t.title} » ?`)) return;
    await deletePodcast(t.id, t.path);
    load();
  }

  const cur = current !== null && tracks ? tracks[current] : null;

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

      {/* En-tête podcast (façon Spotify, charte) */}
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto grid aspect-square w-44 place-items-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-spirit-500 to-night-900 shadow-card sm:w-52">
          <div className="text-cream">
            <svg viewBox="0 0 24 24" className="mx-auto h-12 w-12 fill-none stroke-dawn-400" strokeWidth={1.6}>
              <path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14v3a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 1zM20 14v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 1z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2 font-display text-lg font-extrabold">Écouter</p>
          </div>
        </div>
        <h1 className="mt-4 font-display text-2xl font-extrabold">Podcast de Pasteur Jack</h1>
        <p className="mt-1 text-sm text-night-900/60">
          {tracks ? `${tracks.length} épisode${tracks.length > 1 ? "s" : ""}` : "Chargement…"} ·
          Nouveaux enseignements
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="btn-primary inline-flex items-center gap-2"
          >
            {playing ? <PauseGlyph className="h-5 w-5" /> : <PlayGlyph className="h-5 w-5" />}
            {playing ? "Pause" : "Lire"}
          </button>
          <Link
            href="/videos"
            className="inline-flex items-center gap-2 rounded-full border border-night-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-spirit-700 transition-colors hover:border-night-900/30"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.7}>
              <path d="M4 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM17 10l5-3v10l-5-3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Vidéo
          </Link>
        </div>
      </div>

      {/* Admin : envoi des audios */}
      {admin ? (
        <div className="mx-auto mt-6 max-w-md rounded-3xl border border-dawn-400/40 bg-cream/70 p-5">
          <p className="font-display font-bold">🎧 Ajouter des audios (admin)</p>
          <p className="mt-1 text-sm text-night-900/60">
            Le nom du fichier devient le titre. Tu peux ensuite modifier titre & description avec
            le crayon.
          </p>
          <input ref={fileRef} type="file" accept="audio/*" multiple onChange={onFiles} className="hidden" />
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

      {/* Onglets Épisodes / Favoris */}
      <div className="mx-auto mt-8 flex max-w-2xl gap-1 rounded-full border border-night-900/10 bg-night-900/[0.03] p-1">
        {(
          [
            ["all", "Épisodes"],
            ["fav", "Favoris"],
          ] as const
        ).map(([key, lbl]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === key ? "bg-white text-night-900 shadow-sm" : "text-night-900/55"
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="mx-auto mt-5 max-w-2xl">
        {shown === null ? (
          <p className="text-night-900/50">Chargement…</p>
        ) : shown.length === 0 ? (
          <div className="glass-strong p-6 text-center">
            <p className="font-display text-lg font-bold">
              {tab === "fav" ? "Aucun favori pour l'instant ⭐" : "Les audios arrivent bientôt 🎧"}
            </p>
            <p className="mt-1 text-sm text-night-900/60">
              {tab === "fav"
                ? "Touche le cœur sur un épisode pour le retrouver ici."
                : "De nouveaux enseignements sont en préparation."}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {shown.map((t) => {
              const idx = tracks!.findIndex((x) => x.id === t.id);
              const isCur = idx === current;
              const fav = favs.has(t.id);
              return (
                <li
                  key={t.id}
                  className={`rounded-2xl border p-3 transition-colors ${
                    isCur ? "border-dawn-400/50 bg-dawn-400/10" : "border-night-900/10 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => (isCur ? toggle() : playIndex(idx))}
                      aria-label={isCur && playing ? "Pause" : "Lire"}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-night-900 text-dawn-400"
                    >
                      {isCur && playing ? <PauseGlyph className="h-5 w-5" /> : <PlayGlyph className="h-5 w-5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      {t.created_at ? (
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-night-900/40">
                          {when(t.created_at)}
                        </p>
                      ) : null}
                      <p className="truncate font-semibold text-night-900/90">{t.title}</p>
                      {t.description ? (
                        <p className="mt-0.5 line-clamp-2 text-sm text-night-900/55">{t.description}</p>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions : favori · partager · télécharger (+ admin) */}
                  <div className="mt-2 flex items-center gap-1 pl-14">
                    <button
                      type="button"
                      onClick={() => toggleFav(t.id)}
                      aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
                      className="grid h-8 w-8 place-items-center rounded-full text-night-900/45 transition-colors hover:bg-night-900/5 hover:text-spirit-700"
                    >
                      <svg viewBox="0 0 24 24" className={`h-[18px] w-[18px] stroke-current ${fav ? "fill-current text-spirit-600" : "fill-none"}`} strokeWidth={1.8}>
                        <path d="M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.9 4.02 3 6.5 3c1.74 0 3.4 1 4.22 2.44h.56C12.1 4 13.76 3 15.5 3 17.98 3 20 4.9 20 7.5c0 3.66-3.4 6.74-8.55 11.49L12 20.3z" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => share(t)}
                      aria-label="Partager"
                      className="grid h-8 w-8 place-items-center rounded-full text-night-900/45 transition-colors hover:bg-night-900/5 hover:text-spirit-700"
                    >
                      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth={1.8}>
                        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v13M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <a
                      href={t.url}
                      download
                      aria-label="Télécharger"
                      className="grid h-8 w-8 place-items-center rounded-full text-night-900/45 transition-colors hover:bg-night-900/5 hover:text-spirit-700"
                    >
                      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth={1.8}>
                        <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                    {admin ? (
                      <>
                        <button
                          type="button"
                          onClick={() => editTrack(t)}
                          aria-label="Modifier"
                          className="grid h-8 w-8 place-items-center rounded-full text-night-900/45 transition-colors hover:bg-night-900/5 hover:text-spirit-700"
                        >
                          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth={1.8}>
                            <path d="M16.5 4.5l3 3L8 19l-4 1 1-4L16.5 4.5z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(t)}
                          aria-label="Supprimer"
                          className="grid h-8 w-8 place-items-center rounded-full text-night-900/30 transition-colors hover:text-red-600/70"
                        >
                          ✕
                        </button>
                      </>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Lecteur fixe en bas */}
      {cur ? (
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
              <p className="truncate text-sm font-semibold text-night-900/90">{cur.title}</p>
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
