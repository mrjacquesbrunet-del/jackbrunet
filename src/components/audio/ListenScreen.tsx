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
import { usePodcastPlayer, lirePositions } from "@/lib/podcast-player";
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
  const [menu, setMenu] = useState<string | null>(null);
  // Position d'écoute de chaque épisode (reprise), relue pendant la lecture.
  const [positions, setPositions] = useState<Record<string, number>>({});
  useEffect(() => {
    setPositions(lirePositions());
    if (!pod.playing) return;
    const t = setInterval(() => setPositions(lirePositions()), 5000);
    return () => clearInterval(t);
  }, [pod.playing, pod.index]);

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
  const compte = {
    all: nbEpisodes,
    fav: tracks ? tracks.filter((t) => favs.has(t.id)).length : 0,
    offline: tracks ? tracks.filter((t) => offline.has(t.path)).length : 0,
  };

  // Épisode à mettre en avant : celui qu'on a commencé (le plus récent), sinon le dernier sorti.
  const commence = tracks?.find((t) => (positions[t.id] ?? 0) > 5 && pod.current?.id !== t.id) ?? null;
  const vedette = commence ?? (tracks && tracks.length && pod.current?.id !== tracks[0].id ? tracks[0] : null);
  const fraction = (t: AudioTrack) => {
    const p = positions[t.id];
    const d = durations[t.id];
    if (!p || p < 0 || !d) return 0;
    return Math.min(1, p / d);
  };
  const resteMin = (t: AudioTrack) => {
    const p = positions[t.id];
    const d = durations[t.id];
    if (!p || p < 0 || !d) return null;
    return Math.max(1, Math.round((d - p) / 60));
  };
  const lireEpisode = (t: AudioTrack) => {
    const idx = tracks!.findIndex((x) => x.id === t.id);
    if (pod.current?.id === t.id) pod.toggle();
    else playAt(idx);
  };
  const menuTrack = menu ? tracks?.find((t) => t.id === menu) ?? null : null;

  const pochette = (className = "") =>
    coverUrl && !coverBroken ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={coverUrl} alt="" onError={() => setCoverBroken(true)} className={`h-full w-full object-cover ${className}`} />
    ) : (
      <div className={`grid h-full w-full place-items-center bg-gradient-to-br from-spirit-500 to-night-900 ${className}`}>
        <HeadphonesGlyph className="h-1/3 w-1/3 text-dawn-400" />
      </div>
    );

  return (
    <div className="keep-dark relative min-h-[100svh] bg-night-950 pb-32 text-cream">
      {/* En-tête compact : pochette + titre, puis les actions */}
      <section className="relative overflow-hidden pb-6 pt-[calc(env(safe-area-inset-top)+5.25rem)] sm:pt-32">
        {coverUrl && !coverBroken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-35 blur-3xl"
          />
        ) : null}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 25% 30%, rgba(202,240,0,.12), transparent 70%), linear-gradient(to bottom, rgb(var(--n-950) / .5), rgb(var(--n-950) / .3) 40%, rgb(var(--n-950)) 98%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl px-5">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`aspect-square w-[30vw] max-w-[132px] shrink-0 overflow-hidden rounded-[22px] shadow-[0_0_0_1px_rgba(202,240,0,.25),0_24px_50px_-18px_rgba(0,0,0,.85)] ${
                pod.current && pod.playing && tracks?.some((t) => t.id === pod.current!.id) ? "pochette-joue" : ""
              }`}
            >
              {pochette()}
            </motion.div>
            <div className="min-w-0">
              <p className="text-[10.5px] font-black uppercase tracking-[0.24em] text-dawn-400">Podcast</p>
              <h1 className="mt-1.5 font-display text-[25px] font-extrabold leading-[1.08] text-cream">
                Podcast de <span className="text-dawn-400">Pasteur Jack</span>
              </h1>
              <p className="mt-1.5 text-[12.5px] font-semibold text-cream/55">
                {tracks ? (
                  <>
                    {nbEpisodes > 1 ? `${nbEpisodes} épisodes` : `${nbEpisodes} épisode`}
                    {minutesTotales > 0 ? ` · ${minutesTotales} min` : ""}
                  </>
                ) : (
                  "Chargement…"
                )}
              </p>
            </div>
          </div>
          <p className="mt-4 text-[14px] leading-relaxed text-cream/65">
            Mes enseignements en audio, à écouter partout, même sans connexion.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={heroPlay}
              disabled={!nbEpisodes}
              className="inline-flex h-[52px] flex-1 items-center justify-center gap-2.5 rounded-full bg-dawn-400 px-6 font-display text-[17px] font-extrabold text-night-950 shadow-[0_0_30px_-6px_rgba(202,240,0,.55)] transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {pod.playing ? <PauseGlyph className="h-5 w-5" /> : <PlayGlyph className="h-5 w-5" />}
              {pod.playing ? "Pause" : pod.current ? "Reprendre" : "Écouter"}
            </button>
            <button
              type="button"
              onClick={shufflePlay}
              aria-label="Lecture aléatoire"
              className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-cream/85 transition-colors active:bg-white/[0.12]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9} aria-hidden>
                <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <Link
              href="/videos"
              aria-label="Vidéos"
              className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-cream/85 transition-colors active:bg-white/[0.12]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.7} aria-hidden>
                <path d="M4 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM17 10l5-3v10l-5-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
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
              Le nom du fichier devient le titre. Tu peux ensuite modifier titre & description avec le menu « … ».
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

        {/* À la une : reprendre l'écoute, sinon le dernier épisode */}
        {vedette ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 overflow-hidden rounded-[26px] border border-dawn-400/25 bg-gradient-to-br from-dawn-400/[0.12] via-white/[0.04] to-transparent p-4"
          >
            <p className="text-[10.5px] font-black uppercase tracking-[0.22em] text-dawn-400">
              {commence ? "Reprendre l'écoute" : "Dernier épisode"}
            </p>
            <div className="mt-3 flex items-center gap-3.5">
              <div className="h-[64px] w-[64px] shrink-0 overflow-hidden rounded-2xl">
                {pochette()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-display text-[17px] font-bold leading-snug text-cream">{vedette.title}</p>
                <p className="mt-1 text-[12px] font-semibold text-cream/50">
                  {commence && resteMin(vedette)
                    ? `Encore ${resteMin(vedette)} min`
                    : [when(vedette.created_at), formatDuration(durations[vedette.id])].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => lireEpisode(vedette)}
                aria-label="Lire"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950 shadow-[0_0_22px_-4px_rgba(202,240,0,.6)] active:scale-95"
              >
                <PlayGlyph className="h-5 w-5" />
              </button>
            </div>
            {commence ? (
              <div className="mt-3.5 h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-dawn-400" style={{ width: `${fraction(vedette) * 100}%` }} />
              </div>
            ) : vedette.description ? (
              <p className="mt-3 line-clamp-2 text-[13.5px] leading-relaxed text-cream/60">{vedette.description}</p>
            ) : null}
          </motion.div>
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
        <div className="mt-3">
          {shown === null ? (
            <ul aria-label="Chargement">
              {[0, 1, 2, 3, 4].map((i) => (
                <li key={i} className="flex items-center gap-3 border-b border-white/[0.06] py-3">
                  <span className="h-14 w-14 animate-pulse rounded-xl bg-white/[0.06]" />
                  <span className="h-4 flex-1 animate-pulse rounded-full bg-white/[0.06]" />
                </li>
              ))}
            </ul>
          ) : shown.length === 0 && q ? (
            <p className="py-6 text-center text-sm text-cream/55">Aucun épisode ne correspond à « {recherche.trim()} ».</p>
          ) : shown.length === 0 ? (
            <div className="mt-2 rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-8 text-center">
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
                    ? "Ouvre le menu « … » d'un épisode et choisis Télécharger : il sera écoutable sans connexion."
                    : "De nouveaux enseignements sont en préparation."}
              </p>
            </div>
          ) : (
            <ul>
              {shown.map((t, rang) => {
                const idx = tracks!.findIndex((x) => x.id === t.id);
                const isCur = pod.current?.id === t.id;
                const fav = favs.has(t.id);
                const isOff = offline.has(t.path);
                const ecoute = positions[t.id] === -1;
                const part = fraction(t);
                const nouveau =
                  idx === 0 && !!t.created_at && Date.now() - new Date(t.created_at).getTime() < 14 * 864e5;
                return (
                  <motion.li
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(rang, 10) * 0.03, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-3 border-b border-white/[0.07] py-3 last:border-b-0"
                  >
                    {/* Pochette + lecture */}
                    <button
                      type="button"
                      onClick={() => lireEpisode(t)}
                      aria-label={isCur && pod.playing ? "Pause" : "Lire"}
                      className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl active:scale-95"
                    >
                      {pochette(isCur ? "opacity-40" : "opacity-80")}
                      <span
                        className={`absolute inset-0 grid place-items-center ${isCur ? "text-dawn-400" : "bg-night-950/25 text-cream"}`}
                      >
                        {isCur && pod.playing ? (
                          <span className="eq !h-5" aria-hidden>
                            <i />
                            <i />
                            <i />
                            <i />
                          </span>
                        ) : (
                          <PlayGlyph className="h-5 w-5" />
                        )}
                      </span>
                    </button>

                    {/* Titre, date, durée, progression */}
                    <button type="button" onClick={() => lireEpisode(t)} className="min-w-0 flex-1 text-left">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-cream/45">
                        {nouveau ? (
                          <span className="rounded-full bg-dawn-400 px-1.5 py-px text-[9px] font-black uppercase tracking-[0.14em] text-night-950">
                            Nouveau
                          </span>
                        ) : null}
                        <span className="truncate">
                          {[when(t.created_at), formatDuration(durations[t.id])].filter(Boolean).join(" · ")}
                        </span>
                        {isOff ? (
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-none stroke-current text-dawn-400" strokeWidth={2.4} aria-label="Hors ligne">
                            <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : null}
                      </p>
                      <p className={`mt-0.5 line-clamp-2 font-display text-[15.5px] font-bold leading-snug ${isCur ? "text-dawn-400" : "text-cream"}`}>
                        {t.title}
                      </p>
                      {ecoute ? (
                        <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-dawn-400/80">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2.6} aria-hidden>
                            <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Écouté
                        </p>
                      ) : part > 0 ? (
                        <div className="mt-1.5 h-[3px] w-full max-w-[160px] overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-dawn-400" style={{ width: `${part * 100}%` }} />
                        </div>
                      ) : null}
                    </button>

                    {/* Favori + menu */}
                    <button
                      type="button"
                      onClick={() => toggleFav(t.id)}
                      aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${fav ? "text-dawn-400" : "text-cream/45 active:bg-white/10"}`}
                    >
                      <motion.svg
                        key={fav ? "plein" : "vide"}
                        initial={{ scale: fav ? 0.6 : 1 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        viewBox="0 0 24 24"
                        className={`h-[20px] w-[20px] stroke-current ${fav ? "fill-current" : "fill-none"}`}
                        strokeWidth={1.8}
                        aria-hidden
                      >
                        <path d={COEUR} strokeLinejoin="round" />
                      </motion.svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMenu(t.id)}
                      aria-label="Plus d'options"
                      className="-ml-1 grid h-10 w-8 shrink-0 place-items-center rounded-full text-cream/50 active:bg-white/10"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                        <circle cx="12" cy="5" r="1.8" />
                        <circle cx="12" cy="12" r="1.8" />
                        <circle cx="12" cy="19" r="1.8" />
                      </svg>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Menu d'un épisode : télécharger, partager, admin */}
      <AnimatePresence>
        {menuTrack ? (
          <motion.div
            key="menu"
            className="fixed inset-0 z-[120] flex items-end justify-center"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button type="button" aria-label="Fermer" onClick={() => setMenu(null)} className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="dark-ctx relative w-full max-w-md rounded-t-[28px] border border-white/10 bg-night-900 px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3 text-cream"
            >
              <div className="mx-auto h-1 w-10 rounded-full bg-white/20" />
              <div className="mt-4 flex items-center gap-3.5">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                  {pochette()}
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 font-display text-[17px] font-bold leading-snug">{menuTrack.title}</p>
                  <p className="mt-0.5 text-[12px] font-semibold text-cream/50">
                    {[when(menuTrack.created_at), formatDuration(durations[menuTrack.id])].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              {menuTrack.description ? (
                <p className="mt-3 max-h-40 overflow-y-auto text-[14px] leading-relaxed text-cream/65">{menuTrack.description}</p>
              ) : null}
              <div className="mt-4 divide-y divide-white/[0.07] rounded-2xl border border-white/10 bg-white/[0.03]">
                {(() => {
                  const t = menuTrack;
                  const isOff = offline.has(t.path);
                  const prog = dlProgress[t.path];
                  const ligne = "flex w-full items-center gap-3 px-4 py-3.5 text-left text-[15px] font-semibold active:bg-white/[0.05]";
                  return (
                    <>
                      <button type="button" className={ligne} onClick={() => { setMenu(null); lireEpisode(t); }}>
                        <PlayGlyph className="h-5 w-5 text-dawn-400" />
                        {pod.current?.id === t.id && pod.playing ? "Mettre en pause" : (positions[t.id] ?? 0) > 5 ? "Reprendre l'écoute" : "Écouter"}
                      </button>
                      <button type="button" className={ligne} onClick={() => toggleOffline(t)}>
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current text-dawn-400" strokeWidth={1.9} aria-hidden>
                          <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {prog !== undefined
                          ? `Téléchargement… ${Math.round(prog * 100)} %`
                          : isOff
                            ? "Retirer du hors-ligne"
                            : "Télécharger (écoute hors-ligne)"}
                      </button>
                      <button type="button" className={ligne} onClick={() => share(t)}>
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current text-dawn-400" strokeWidth={1.9} aria-hidden>
                          <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v13M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Partager
                      </button>
                      {admin ? (
                        <>
                          <button type="button" className={ligne} onClick={() => { setMenu(null); editTrack(t); }}>
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current text-cream/60" strokeWidth={1.9} aria-hidden>
                              <path d="M16.5 4.5l3 3L8 19l-4 1 1-4L16.5 4.5z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Modifier (admin)
                          </button>
                          <button type="button" className={`${ligne} text-red-400`} onClick={() => { setMenu(null); remove(t); }}>
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9} aria-hidden>
                              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Supprimer (admin)
                          </button>
                        </>
                      ) : null}
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const COEUR =
  "M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.9 4.02 3 6.5 3c1.74 0 3.4 1 4.22 2.44h.56C12.1 4 13.76 3 15.5 3 17.98 3 20 4.9 20 7.5c0 3.66-3.4 6.74-8.55 11.49L12 20.3z";
