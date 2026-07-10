"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  listPodcasts,
  uploadPodcast,
  deletePodcast,
  updatePodcast,
  podcastCoverUrl,
  formatDuration,
  loadAudioDuration,
  type AudioTrack,
} from "@/lib/audio-library";
import { usePodcastPlayer } from "@/lib/podcast-player";
import { useAuth } from "@/components/community/useAuth";
import { isAdminEmail } from "@/lib/community";
import { siteConfig } from "@/config/site";
import { saveOrShareFile } from "@/lib/share";
import { PlayGlyph, PauseGlyph, HeadphonesGlyph } from "@/components/ui/DevoIcons";

const FAV_KEY = "jb.podcast.favs.v1";
const DUR_KEY = "jb.podcast.dur.v1";

/** Nom de fichier propre pour le téléchargement d'un épisode. */
function fileNameFor(title: string): string {
  const slug =
    (title || "podcast")
.normalize("NFD")
.replace(/[̀-ͯ]/g, "")
.replace(/[^a-zA-Z0-9]+/g, "-")
.replace(/^-+|-+$/g, "")
.toLowerCase()
.slice(0, 50) || "podcast";
  return `${slug}.mp3`;
}

function when(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

export function ListenScreen() {
  const { email } = useAuth();
  const admin = isAdminEmail(email);
  const pod = usePodcastPlayer();

  const [tracks, setTracks] = useState<AudioTrack[] | null>(null);
  const [upload, setUpload] = useState<{ done: number; total: number } | null>(null);
  const [tab, setTab] = useState<"all" | "fav">("all");
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [coverBroken, setCoverBroken] = useState(false);
  const coverUrl = podcastCoverUrl();
  const fileRef = useRef<HTMLInputElement>(null);

  // Durées des épisodes (calculées une fois, mémorisées sur l'appareil).
  const [durations, setDurations] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem(DUR_KEY) || "{}") as Record<string, number>;
    } catch {
      return {};
    }
  });

  const load = useCallback(() => listPodcasts().then(setTracks), []);
  useEffect(() => {
    load();
  }, [load]);

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

  // Calcule les durées manquantes (une par une, léger: métadonnées seules).
  useEffect(() => {
    if (!tracks) return;
    let cancelled = false;
    (async () => {
      for (const t of tracks) {
        if (cancelled) return;
        if (durations[t.id]!== undefined) continue;
        const d = await loadAudioDuration(t.url);
        if (cancelled) return;
        setDurations((prev) => {
          const next = {...prev, [t.id]: d };
          try {
            localStorage.setItem(DUR_KEY, JSON.stringify(next));
          } catch {
            /* ignore */
          }
          return next;
        });
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks]);

  async function download(t: AudioTrack) {
    await saveOrShareFile(t.url, fileNameFor(t.title), `« ${t.title} », Pasteur Jack`);
  }

  const shown = tracks? (tab === "fav"? tracks.filter((t) => favs.has(t.id)): tracks): null;

  // Lien profond: /ecouter?e=<id> lance l'épisode.
  useEffect(() => {
    if (!tracks) return;
    const e = new URLSearchParams(window.location.search).get("e");
    if (!e) return;
    const i = tracks.findIndex((t) => t.id === e);
    if (i >= 0) pod.playQueue(tracks, i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks]);

  function playAt(i: number) {
    if (tracks) pod.playQueue(tracks, i);
  }
  function heroPlay() {
    if (pod.current) pod.toggle();
    else if (tracks && tracks.length) pod.playQueue(tracks, 0);
  }
  // Lecture aléatoire de tous les podcasts (ordre mélangé).
  function shufflePlay() {
    if (!tracks || tracks.length === 0) return;
    const shuffled = [...tracks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    pod.playQueue(shuffled, 0);
  }

  async function share(t: AudioTrack) {
    const url = `${siteConfig.url}/ecouter?e=${t.id}`;
    try {
      const nav = navigator as Navigator & { share?: (d: object) => Promise<void> };
      if (nav.share) await nav.share({ title: t.title, text: `Écoute « ${t.title} », Pasteur Jack`, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* annulé */
    }
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files?? []);
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
    const title = prompt("Titre de l'épisode:", t.title);
    if (title === null) return;
    const description = prompt("Description (facultative):", t.description?? "");
    await updatePodcast(t.id, {
      title: title.trim() || t.title,
      description: (description?? "").trim() || null,
    });
    load();
  }

  async function remove(t: AudioTrack) {
    if (!confirm(`Supprimer « ${t.title} »?`)) return;
    await deletePodcast(t.id, t.path);
    load();
  }

  return (
    <section className="container-x pb-28 pt-24 sm:pt-28">
      {/* En-tête podcast */}
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto grid aspect-square w-[74vw] max-w-[320px] place-items-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-spirit-500 to-night-900 shadow-card">
          {coverUrl &&!coverBroken? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt="Podcast de Pasteur Jack"
              onError={() => setCoverBroken(true)}
              className="h-full w-full object-cover"
            />
          ): (
            <div className="text-cream">
              <svg viewBox="0 0 24 24" className="mx-auto h-12 w-12 fill-none stroke-dawn-400" strokeWidth={1.6}>
                <path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14v3a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 1zM20 14v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 1z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 font-display text-lg font-extrabold">Écouter</p>
            </div>
          )}
        </div>
        <h1 className="mt-4 font-display text-2xl font-extrabold">Podcast de Pasteur Jack</h1>
        <p className="mt-1 text-sm text-night-900/60">
          {tracks? `${tracks.length} épisode${tracks.length > 1? "s": ""}`: "Chargement…"} ·
          Nouveaux enseignements
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-night-900/55">
          Mes vidéos courtes, en version audio. Tu peux les écouter, les télécharger, les
          mettre en favori et les partager.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <button type="button" onClick={heroPlay} className="btn-primary inline-flex items-center gap-2">
            {pod.playing? <PauseGlyph className="h-5 w-5" />: <PlayGlyph className="h-5 w-5" />}
            {pod.playing? "Pause": "Lire"}
          </button>
          <button
            type="button"
            onClick={shufflePlay}
            aria-label="Lecture aléatoire"
            className="inline-flex items-center gap-2 rounded-full border border-night-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-spirit-700 transition-colors hover:border-night-900/30"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.9}>
              <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Aléatoire
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

      {/* Admin: envoi des audios */}
      {admin? (
        <div className="mx-auto mt-6 max-w-md rounded-3xl border border-dawn-400/40 bg-cream/70 p-5">
          <p className="flex items-center gap-2 font-display font-bold">
            <HeadphonesGlyph className="h-5 w-5 text-spirit-600" />
            Ajouter des audios (admin)
          </p>
          <p className="mt-1 text-sm text-night-900/60">
            Le nom du fichier devient le titre. Tu peux ensuite modifier titre & description avec le crayon.
          </p>
          <input ref={fileRef} type="file" accept="audio/*" multiple onChange={onFiles} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={!!upload}
            className="btn-primary mt-3 disabled:opacity-50"
          >
            {upload? `Envoi… ${upload.done}/${upload.total}`: "Choisir des fichiers"}
          </button>
        </div>
      ): null}

      {/* Onglets */}
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
              tab === key? "bg-white text-night-900 shadow-sm": "text-night-900/55"
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="mx-auto mt-5 max-w-2xl">
        {shown === null? (
          <p className="text-night-900/50">Chargement…</p>
        ): shown.length === 0? (
          <div className="glass-strong p-6 text-center">
            <p className="font-display text-lg font-bold">
              {tab === "fav"? "Aucun favori pour l'instant": "Les audios arrivent bientôt"}
            </p>
            <p className="mt-1 text-sm text-night-900/60">
              {tab === "fav"
? "Touche le cœur sur un épisode pour le retrouver ici."
: "De nouveaux enseignements sont en préparation."}
            </p>
          </div>
        ): (
          <ul className="space-y-2">
            {shown.map((t) => {
              const idx = tracks!.findIndex((x) => x.id === t.id);
              const isCur = pod.current?.id === t.id;
              const fav = favs.has(t.id);
              return (
                <li
                  key={t.id}
                  className={`rounded-2xl border p-3 transition-colors ${
                    isCur? "border-dawn-400/50 bg-dawn-400/10": "border-night-900/10 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => (isCur? pod.toggle(): playAt(idx))}
                      aria-label={isCur && pod.playing? "Pause": "Lire"}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-night-900 text-dawn-400"
                    >
                      {isCur && pod.playing? <PauseGlyph className="h-5 w-5" />: <PlayGlyph className="h-5 w-5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      {t.created_at || durations[t.id]? (
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-night-900/40">
                          {[when(t.created_at), formatDuration(durations[t.id])]
.filter(Boolean)
.join(" · ")}
                        </p>
                      ): null}
                      <p className="truncate font-semibold text-night-900/90">{t.title}</p>
                      {t.description? (
                        <p className="mt-0.5 line-clamp-2 text-sm text-night-900/55">{t.description}</p>
                      ): null}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-1 pl-14">
                    <button
                      type="button"
                      onClick={() => toggleFav(t.id)}
                      aria-label={fav? "Retirer des favoris": "Ajouter aux favoris"}
                      className="grid h-8 w-8 place-items-center rounded-full text-night-900/45 transition-colors hover:bg-night-900/5 hover:text-spirit-700"
                    >
                      <svg viewBox="0 0 24 24" className={`h-[18px] w-[18px] stroke-current ${fav? "fill-current text-spirit-600": "fill-none"}`} strokeWidth={1.8}>
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
                    <button
                      type="button"
                      onClick={() => download(t)}
                      aria-label="Télécharger"
                      className="grid h-8 w-8 place-items-center rounded-full text-night-900/45 transition-colors hover:bg-night-900/5 hover:text-spirit-700"
                    >
                      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth={1.8}>
                        <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {admin? (
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
                    ): null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
