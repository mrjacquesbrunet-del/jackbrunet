"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
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
import { appShareUrl } from "@/config/app-links";
import { useAuth } from "@/components/community/useAuth";
import { isAdminEmail } from "@/lib/community";
import { siteConfig } from "@/config/site";
import {
  downloadFileOffline,
  deleteFileOffline,
  offlineFilePaths,
} from "@/lib/bible-offline";
import { PlayGlyph, PauseGlyph, HeadphonesGlyph } from "@/components/ui/DevoIcons";
import { localeApp } from "@/lib/i18n";

const FAV_KEY = "jb.podcast.favs.v1";
const DUR_KEY = "jb.podcast.dur.v1";

function when(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(localeApp(), { day: "numeric", month: "long" });
}

export function ListenScreen() {
  const { email } = useAuth();
  const admin = isAdminEmail(email);
  const pod = usePodcastPlayer();

  const [tracks, setTracks] = useState<AudioTrack[] | null>(null);
  const [upload, setUpload] = useState<{ done: number; total: number } | null>(null);
  const [tab, setTab] = useState<"all" | "fav" | "offline">("all");
  const [recherche, setRecherche] = useState("");
  const [favs, setFavs] = useState<Set<string>>(new Set());

  // Épisodes téléchargés pour l'écoute hors-ligne (stockés DANS l'app).
  const [offline, setOffline] = useState<Set<string>>(new Set()); // par path
  const [dlProgress, setDlProgress] = useState<Record<string, number>>({}); // path → 0..1
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

  // Fond nuit jusqu'aux bords (au-dessus et en dessous de la page).
  useEffect(() => {
    const h = document.documentElement;
    h.classList.add("page-nuit");
    return () => h.classList.remove("page-nuit");
  }, []);

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

  // Repère les épisodes déjà disponibles hors-ligne.
  useEffect(() => {
    if (!tracks) return;
    offlineFilePaths(tracks.map((t) => t.path)).then(setOffline);
  }, [tracks]);

  async function toggleOffline(t: AudioTrack) {
    if (dlProgress[t.path]!== undefined) return; // déjà en cours
    if (offline.has(t.path)) {
      // Retirer le téléchargement.
      if (!confirm(`Retirer « ${t.title} » des téléchargements ?`)) return;
      await deleteFileOffline(t.path);
      setOffline((prev) => {
        const next = new Set(prev);
        next.delete(t.path);
        return next;
      });
      return;
    }
    // Télécharger dans l'app (écoute hors-ligne).
    setDlProgress((p) => ({...p, [t.path]: 0 }));
    const ok = await downloadFileOffline(t.url, t.url, (r, total) =>
      setDlProgress((p) => ({...p, [t.path]: total? r / total: 0 })),
    );
    setDlProgress((p) => {
      const next = {...p };
      delete next[t.path];
      return next;
    });
    if (ok) setOffline((prev) => new Set(prev).add(t.path));
  }

  const parOnglet = tracks
? tab === "fav"
? tracks.filter((t) => favs.has(t.id))
: tab === "offline"
? tracks.filter((t) => offline.has(t.path))
: tracks
: null;
  // Recherche dans les titres et descriptions (sans tenir compte des accents).
  const sansAccent = (x: string) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const q = sansAccent(recherche.trim());
  const shown = parOnglet && q
? parOnglet.filter((t) => sansAccent(`${t.title} ${t.description ?? ""}`).includes(q))
: parOnglet;

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
    // Lien intelligent : ouvre l'app sur le podcast, sinon le store.
    const url = appShareUrl("/ecouter");
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


  const nbEpisodes = tracks?.length ?? 0;
  const minutesTotales = tracks
    ? Math.round(tracks.reduce((s, t) => s + (durations[t.id] > 0 ? durations[t.id] : 0), 0) / 60)
    : 0;
  const courantIci = !!pod.current && !!tracks?.some((t) => t.id === pod.current!.id);
  const compte = {
    all: nbEpisodes,
    fav: tracks ? tracks.filter((t) => favs.has(t.id)).length : 0,
    offline: tracks ? tracks.filter((t) => offline.has(t.path)).length : 0,
  };
  const icone = "grid h-9 w-9 place-items-center rounded-full transition-colors";

  return (
    <div className="keep-dark relative min-h-[100svh] bg-night-950 pb-32 text-cream">
      {/* En-tête : pochette sur fond flouté, halo lime quand ça joue */}
      <section className="relative overflow-hidden pb-8 pt-[calc(env(safe-area-inset-top)+5.5rem)] sm:pt-32">
        {coverUrl && !coverBroken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-40 blur-3xl"
          />
        ) : null}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 50% at 50% 30%, rgba(202,240,0,.13), transparent 70%), linear-gradient(to bottom, rgb(var(--n-950) / .55), rgb(var(--n-950) / .35) 40%, rgb(var(--n-950)) 96%)",
          }}
        />

        <div className="relative mx-auto max-w-md px-5 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={`mx-auto aspect-square w-[58vw] max-w-[250px] overflow-hidden rounded-[28px] bg-gradient-to-br from-spirit-500 to-night-900 shadow-[0_0_0_1px_rgba(202,240,0,.25),0_30px_60px_-20px_rgba(0,0,0,.8)] ${
              courantIci && pod.playing ? "pochette-joue" : ""
            }`}
          >
            {coverUrl && !coverBroken ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt="Podcast de Pasteur Jack"
                onError={() => setCoverBroken(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center">
                <HeadphonesGlyph className="h-14 w-14 text-dawn-400" />
              </div>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-dawn-400/40 bg-night-950/40 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-dawn-400 backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-dawn-400" />
            Podcast
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 font-display text-[32px] font-extrabold leading-[1.08] text-cream"
          >
            Podcast de <span className="text-dawn-400">Pasteur Jack</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="mt-2 text-[13px] font-semibold text-cream/55"
          >
            {tracks ? (
              <>
                <span>{nbEpisodes > 1 ? `${nbEpisodes} épisodes` : `${nbEpisodes} épisode`}</span>
                {minutesTotales > 0 ? <span>{` · ${minutesTotales} min d'écoute`}</span> : null}
              </>
            ) : (
              "Chargement…"
            )}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className="mx-auto mt-3 max-w-sm text-[14.5px] leading-relaxed text-cream/70"
          >
            Mes enseignements en audio. Écoute-les partout, télécharge-les pour le hors-ligne, garde tes
            préférés et partage-les.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="mt-6 flex items-center justify-center gap-3"
          >
            <button
              type="button"
              onClick={shufflePlay}
              aria-label="Lecture aléatoire"
              className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-cream/85 transition-colors active:bg-white/[0.12]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9} aria-hidden>
                <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={heroPlay}
              disabled={!nbEpisodes}
              className="inline-flex h-14 min-w-[150px] items-center justify-center gap-2.5 rounded-full bg-dawn-400 px-7 font-display text-[17px] font-extrabold text-night-950 shadow-[0_0_30px_-4px_rgba(202,240,0,.55)] transition-transform active:scale-[0.97] disabled:opacity-50"
            >
              {pod.playing ? <PauseGlyph className="h-5 w-5" /> : <PlayGlyph className="h-5 w-5" />}
              {pod.playing ? "Pause" : pod.current ? "Reprendre" : "Écouter"}
            </button>
            <Link
              href="/videos"
              aria-label="Vidéos"
              className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-cream/85 transition-colors active:bg-white/[0.12]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.7} aria-hidden>
                <path d="M4 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM17 10l5-3v10l-5-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </motion.div>

          {/* Épisode en cours (la progression est dans la barre du bas) */}
          <AnimatePresence>
            {pod.current ? (
              <motion.p
                key={pod.current.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-auto mt-4 flex max-w-xs items-center justify-center gap-2 text-[13px] font-semibold text-cream/70"
              >
                <span className={`eq shrink-0 text-dawn-400 ${pod.playing ? "" : "eq-pause"}`} aria-hidden>
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <span className="truncate">{pod.current.title}</span>
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4">
        {/* Admin : envoi des audios */}
        {admin ? (
          <div className="mb-5 rounded-3xl border border-dashed border-dawn-400/40 bg-white/[0.03] p-5">
            <p className="flex items-center gap-2 font-display font-bold text-cream">
              <HeadphonesGlyph className="h-5 w-5 text-dawn-400" />
              Ajouter des audios (admin)
            </p>
            <p className="mt-1 text-sm text-cream/60">
              Le nom du fichier devient le titre. Tu peux ensuite modifier titre & description avec le crayon.
            </p>
            <input ref={fileRef} type="file" accept="audio/*" multiple onChange={onFiles} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={!!upload}
              className="mt-3 rounded-full bg-dawn-400 px-5 py-2.5 text-sm font-extrabold text-night-950 disabled:opacity-50"
            >
              {upload ? `Envoi… ${upload.done}/${upload.total}` : "Choisir des fichiers"}
            </button>
          </div>
        ) : null}

        {/* Onglets */}
        <div className="flex gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
          {(
            [
              ["all", "Épisodes"],
              ["fav", "Favoris"],
              ["offline", "Hors ligne"],
            ] as const
          ).map(([key, lbl]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`relative flex-1 rounded-full px-2 py-2.5 text-[13.5px] font-bold transition-colors ${
                tab === key ? "text-night-950" : "text-cream/60"
              }`}
            >
              {tab === key ? (
                <motion.span
                  layoutId="onglet-podcast"
                  className="absolute inset-0 rounded-full bg-dawn-400"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span className="relative">
                {lbl}
                {tracks && compte[key] > 0 ? (
                  <span className={`ml-1.5 text-[11px] tabular-nums ${tab === key ? "text-night-950/60" : "text-cream/35"}`}>
                    {compte[key]}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
        </div>

        {/* Recherche (utile dès qu'il y a beaucoup d'épisodes) */}
        {tracks && tracks.length > 8 ? (
          <label className="mt-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 focus-within:border-dawn-400/60">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 fill-none stroke-current text-dawn-400" strokeWidth={2} aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un épisode"
              aria-label="Rechercher un épisode"
              className="min-w-0 flex-1 appearance-none bg-transparent py-3 text-[15px] text-cream outline-none placeholder:text-cream/40 [&::-webkit-search-cancel-button]:hidden"
            />
            {recherche ? (
              <button
                type="button"
                onClick={() => setRecherche("")}
                aria-label="Effacer"
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15 text-cream/80"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2.4} aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            ) : null}
          </label>
        ) : null}

        {/* Liste */}
        <div className="mt-5">
          {shown === null ? (
            <ul className="space-y-2.5" aria-label="Chargement">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="h-[88px] animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.04]" />
              ))}
            </ul>
          ) : shown.length === 0 && q ? (
            <p className="py-6 text-center text-sm text-cream/55">Aucun épisode ne correspond à « {recherche.trim()} ».</p>
          ) : shown.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-8 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-dawn-400/10 text-dawn-400">
                {tab === "fav" ? (
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
                    <path d={COEUR} strokeLinejoin="round" />
                  </svg>
                ) : tab === "offline" ? (
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
                    <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <HeadphonesGlyph className="h-6 w-6" />
                )}
              </span>
              <p className="mt-3 font-display text-lg font-bold text-cream">
                {tab === "fav"
                  ? "Aucun favori pour l'instant"
                  : tab === "offline"
                    ? "Aucun épisode hors-ligne"
                    : "Les audios arrivent bientôt"}
              </p>
              <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-cream/60">
                {tab === "fav"
                  ? "Touche le cœur sur un épisode pour le retrouver ici."
                  : tab === "offline"
                    ? "Touche l'icône de téléchargement sur un épisode : il sera écoutable sans connexion, dans l'app."
                    : "De nouveaux enseignements sont en préparation."}
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {shown.map((t, rang) => {
                const idx = tracks!.findIndex((x) => x.id === t.id);
                const isCur = pod.current?.id === t.id;
                const fav = favs.has(t.id);
                const isOff = offline.has(t.path);
                const prog = dlProgress[t.path];
                const downloading = prog !== undefined;
                const nouveau =
                  idx === 0 && !!t.created_at && Date.now() - new Date(t.created_at).getTime() < 14 * 864e5;
                return (
                  <motion.li
                    key={t.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(rang, 8) * 0.04, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className={`rounded-3xl border p-3.5 transition-colors ${
                      isCur ? "border-dawn-400/45 bg-dawn-400/[0.08]" : "border-white/[0.08] bg-white/[0.035]"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        type="button"
                        onClick={() => (isCur ? pod.toggle() : playAt(idx))}
                        aria-label={isCur && pod.playing ? "Pause" : "Lire"}
                        className={`relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl transition-transform active:scale-95 ${
                          isCur ? "bg-dawn-400 text-night-950" : "bg-gradient-to-br from-spirit-500/80 to-night-900 text-dawn-400"
                        }`}
                      >
                        {isCur && pod.playing ? (
                          <span className="eq !h-5" aria-hidden>
                            <i />
                            <i />
                            <i />
                            <i />
                          </span>
                        ) : (
                          <PlayGlyph className="h-6 w-6" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-cream/40">
                          {nouveau ? (
                            <span className="rounded-full bg-dawn-400 px-2 py-0.5 text-[9.5px] font-black tracking-[0.16em] text-night-950">
                              Nouveau
                            </span>
                          ) : null}
                          {[when(t.created_at), formatDuration(durations[t.id])].filter(Boolean).join(" · ")}
                        </p>
                        <p className={`mt-1 line-clamp-2 font-display text-[16px] font-bold leading-snug ${isCur ? "text-dawn-400" : "text-cream"}`}>
                          {t.title}
                        </p>
                        {t.description ? (
                          <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-cream/55">{t.description}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-0.5 pl-[66px] text-cream/50">
                      <button
                        type="button"
                        onClick={() => toggleFav(t.id)}
                        aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
                        className={`${icone} ${fav ? "text-dawn-400" : "active:bg-white/10"}`}
                      >
                        <motion.svg
                          key={fav ? "plein" : "vide"}
                          initial={{ scale: fav ? 0.6 : 1 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          viewBox="0 0 24 24"
                          className={`h-[19px] w-[19px] stroke-current ${fav ? "fill-current" : "fill-none"}`}
                          strokeWidth={1.8}
                          aria-hidden
                        >
                          <path d={COEUR} strokeLinejoin="round" />
                        </motion.svg>
                      </button>
                      <button type="button" onClick={() => share(t)} aria-label="Partager" className={`${icone} active:bg-white/10`}>
                        <svg viewBox="0 0 24 24" className="h-[19px] w-[19px] fill-none stroke-current" strokeWidth={1.8} aria-hidden>
                          <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v13M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleOffline(t)}
                        aria-label={
                          isOff ? "Retirer le téléchargement" : downloading ? "Téléchargement…" : "Télécharger pour écouter hors-ligne"
                        }
                        title={isOff ? "Disponible hors-ligne · toucher pour retirer" : "Télécharger dans l'app (écoute hors-ligne)"}
                        className={`${icone} ${isOff || downloading ? "text-dawn-400" : "active:bg-white/10"}`}
                      >
                        {downloading ? (
                          <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] -rotate-90" aria-hidden>
                            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth={2.4} />
                            <circle
                              cx="12"
                              cy="12"
                              r="9"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.4}
                              strokeLinecap="round"
                              strokeDasharray={56.5}
                              strokeDashoffset={56.5 * (1 - (prog ?? 0))}
                            />
                          </svg>
                        ) : isOff ? (
                          <svg viewBox="0 0 24 24" className="h-[19px] w-[19px] fill-none stroke-current" strokeWidth={2.1} aria-hidden>
                            <path d="M9 12.5l2 2 4-4.5M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="h-[19px] w-[19px] fill-none stroke-current" strokeWidth={1.8} aria-hidden>
                            <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      {isOff ? (
                        <span className="ml-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-dawn-400/80">Hors ligne</span>
                      ) : null}
                      {admin ? (
                        <span className="ml-auto flex items-center gap-0.5">
                          <button type="button" onClick={() => editTrack(t)} aria-label="Modifier" className={`${icone} active:bg-white/10`}>
                            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth={1.8} aria-hidden>
                              <path d="M16.5 4.5l3 3L8 19l-4 1 1-4L16.5 4.5z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(t)}
                            aria-label="Supprimer"
                            className={`${icone} text-cream/35 active:text-red-400`}
                          >
                            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth={1.8} aria-hidden>
                              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </span>
                      ) : null}
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const COEUR =
  "M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.9 4.02 3 6.5 3c1.74 0 3.4 1 4.22 2.44h.56C12.1 4 13.76 3 15.5 3 17.98 3 20 4.9 20 7.5c0 3.66-3.4 6.74-8.55 11.49L12 20.3z";
