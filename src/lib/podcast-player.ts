"use client";

import { useSyncExternalStore } from "react";
import type { AudioTrack } from "./audio-library";
import { track } from "./analytics";
import { getOfflineObjectUrl } from "./bible-offline";

/**
 * Lecteur de podcasts GLOBAL (singleton hors React): la lecture continue
 * quand on change de page/onglet, écran verrouillé ou app en arrière-plan
 * (avec UIBackgroundModes=audio côté iOS + Media Session pour les contrôles).
 */

type State = {
  queue: AudioTrack[];
  index: number;
  playing: boolean;
  /** Fin du minuteur (timestamp ms) ou null. */
  sleepEndsAt: number | null;
  /** Minuteur « fin de l'épisode »: on s'arrête à la fin du morceau en cours. */
  sleepEpisodeEnd: boolean;
  /** Vitesse de lecture (0.8 → 1.5). */
  rate: number;
  /** Répète le morceau en cours en boucle (au lieu d'enchaîner le suivant). */
  repeat: boolean;
  /** Épisode suivant de la même émission, lancé à la fin du compte à rebours. */
  aSuivre: { track: AudioTrack; finA: number } | null;
  /** File choisie (liste, favoris, « Tout écouter ») : on la suit dans l'ordre. */
  suiteFile: boolean;
};

function loadRate(): number {
  try {
    const r = Number(localStorage.getItem("jb.audio.rate"));
    return r >= 0.5 && r <= 2? r: 1;
  } catch {
    return 1;
  }
}

let state: State = {
  queue: [],
  index: -1,
  playing: false,
  sleepEndsAt: null,
  sleepEpisodeEnd: false,
  rate: typeof window!== "undefined"? loadRate(): 1,
  repeat: false,
  aSuivre: null,
  suiteFile: false,
};
let audio: HTMLAudioElement | null = null;

/* ————— Position d'écoute des épisodes (reprise là où on s'est arrêté) ————— */
const POS_KEY = "jb.podcast.pos.v1";
/** Secondes déjà écoutées par épisode ; -1 = écouté jusqu'au bout. */
export function lirePositions(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(POS_KEY) || "{}") as Record<string, number>;
  } catch {
    return {};
  }
}
function ecrirePosition(id: string, sec: number) {
  try {
    const p = lirePositions();
    p[id] = Math.round(sec);
    localStorage.setItem(POS_KEY, JSON.stringify(p));
  } catch {
    /* stockage indisponible */
  }
}
let dernierEnregistrement = 0;

/* ————— Enchaînement : épisode suivant de la même émission ————— */
const DERNIER_KEY = "jb.podcast.dernier.v1";
const DELAI_SUIVANT = 5000;
/** Tout le catalogue des podcasts (donné par l'écran Écouter). */
let catalogue: AudioTrack[] = [];
let suivantTimeout: ReturnType<typeof setTimeout> | null = null;

export function memoriserCatalogue(episodes: AudioTrack[]) {
  catalogue = episodes;
}

/** Dernier épisode lancé (pour « Reprendre l'écoute » en tête de l'accueil). */
export function dernierEpisodeLance(): string | null {
  try {
    return localStorage.getItem(DERNIER_KEY);
  } catch {
    return null;
  }
}

/** Épisodes d'une émission, du plus ancien au plus récent. */
function episodesDeLEmission(t: AudioTrack): AudioTrack[] {
  const source = catalogue.length ? catalogue : state.queue;
  return source.filter((x) => x.memoriser && x.show_id === t.show_id).sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0));
}

/** Le suivant : l'épisode d'après non écouté, sinon le plus récent non écouté. */
function trouverSuivant(t: AudioTrack): AudioTrack | null {
  if (!t.show_id) return null;
  const eps = episodesDeLEmission(t);
  const pos = lirePositions();
  const pasEcoute = (x: AudioTrack) => x.id !== t.id && pos[x.id] !== -1;
  const apres = eps.filter((x) => (x.numero ?? 0) > (t.numero ?? 0)).find(pasEcoute);
  return apres ?? [...eps].reverse().find(pasEcoute) ?? null;
}

function effacerSuivant() {
  if (suivantTimeout) {
    clearTimeout(suivantTimeout);
    suivantTimeout = null;
  }
  state.aSuivre = null;
}

/** Lance tout de suite l'épisode annoncé. */
export function lancerSuivant() {
  const s = state.aSuivre?.track;
  effacerSuivant();
  if (!s) return;
  if (state.suiteFile && state.queue[state.index + 1]?.id === s.id) {
    playQueue(state.queue, state.index + 1, true);
    return;
  }
  const eps = episodesDeLEmission(s);
  const i = eps.findIndex((x) => x.id === s.id);
  if (i >= 0) playQueue(eps, i);
  else playQueue([s], 0);
}

/** Annule l'enchaînement : la lecture s'arrête sur l'épisode fini. */
export function annulerSuivant() {
  effacerSuivant();
  emit();
}
let sleepTimeout: ReturnType<typeof setTimeout> | null = null;
let errorSkips = 0; // évite de boucler sur des chapitres manquants
const listeners = new Set<() => void>();

function emit() {
  state = {...state };
  listeners.forEach((l) => l());
}

function setMediaSession() {
  const t = state.queue[state.index];
  const ms = (navigator as Navigator & { mediaSession?: MediaSession }).mediaSession;
  if (!ms ||!t) return;
  try {
    ms.metadata = new MediaMetadata({
      title: t.title,
      artist: t.author ?? "Pasteur Jack Brunet",
      album: t.showTitle ?? "RHEMA",
      // Pochette sur l'écran verrouillé et le centre de contrôle.
      artwork: t.cover ? [{ src: t.cover, sizes: "512x512" }] : [],
    });
    ms.setActionHandler("play", () => audio?.play());
    ms.setActionHandler("pause", () => audio?.pause());
    ms.setActionHandler("nexttrack", () => nextTrack());
    ms.setActionHandler("previoustrack", () => prevTrack());
  } catch {
    /* API partielle */
  }
}

function ensureAudio(): HTMLAudioElement | null {
  if (audio || typeof window === "undefined") return audio;
  audio = new Audio();
  audio.preload = "metadata";
  audio.addEventListener("play", () => {
    state.playing = true;
    emit();
  });
  audio.addEventListener("pause", () => {
    state.playing = false;
    emit();
  });
  audio.addEventListener("playing", () => {
    errorSkips = 0; // lecture OK: on réinitialise le garde-fou
  });
  // Mémorise la position des épisodes de podcast (toutes les 4 s environ).
  audio.addEventListener("timeupdate", () => {
    const t = state.queue[state.index];
    if (!t?.memoriser || !audio) return;
    const now = Date.now();
    if (now - dernierEnregistrement < 4000) return;
    dernierEnregistrement = now;
    const d = audio.duration;
    ecrirePosition(t.id, d && audio.currentTime > d - 20 ? -1 : audio.currentTime);
  });
  audio.addEventListener("ended", () => {
    errorSkips = 0;
    const fini = state.queue[state.index];
    if (fini?.memoriser) ecrirePosition(fini.id, -1);
    // Minuteur « fin de l'épisode »: on s'arrête ici au lieu d'enchaîner.
    if (state.sleepEpisodeEnd) {
      cancelSleep();
      stopPlayback();
      return;
    }
    // Mode répétition: on rejoue le même morceau en boucle.
    if (state.repeat && state.index >= 0) {
      playQueue(state.queue, state.index);
      return;
    }
    // Podcast : épisode suivant de la même émission, après 5 s (annulable).
    // Écran verrouillé / app en arrière-plan : tout de suite (sinon iOS
    // suspendrait l'app pendant le compte à rebours).
    if (fini?.memoriser) {
      const suivant = state.suiteFile ? state.queue[state.index + 1] ?? null : trouverSuivant(fini);
      if (!suivant) return;
      state.aSuivre = { track: suivant, finA: Date.now() + DELAI_SUIVANT };
      if (document.hidden) {
        lancerSuivant();
        return;
      }
      suivantTimeout = setTimeout(lancerSuivant, DELAI_SUIVANT);
      emit();
      return;
    }
    nextTrack(); // lecture continue: enchaîne le chapitre/épisode suivant
  });
  // Chapitre manquant (404) → on saute au suivant sans bloquer la lecture.
  audio.addEventListener("error", () => {
    if (state.index < 0) return;
    if (errorSkips >= state.queue.length) {
      stopPlayback();
      return;
    }
    errorSkips++;
    if (state.index + 1 < state.queue.length) nextTrack();
    else stopPlayback();
  });
  return audio;
}

/** Minuteur de veille: arrête la lecture au bout de `minutes` (null = annule). */
export function setSleepTimer(minutes: number | null) {
  if (sleepTimeout) {
    clearTimeout(sleepTimeout);
    sleepTimeout = null;
  }
  state.sleepEpisodeEnd = false;
  if (minutes === null) {
    state.sleepEndsAt = null;
    emit();
    return;
  }
  const ms = minutes * 60_000;
  state.sleepEndsAt = Date.now() + ms;
  sleepTimeout = setTimeout(() => {
    sleepTimeout = null;
    state.sleepEndsAt = null;
    if (audio) audio.pause();
    emit();
  }, ms);
  emit();
}

/** Minuteur « fin de l'épisode »: s'arrête à la fin du morceau en cours. */
export function setSleepEpisodeEnd(on: boolean) {
  if (sleepTimeout) {
    clearTimeout(sleepTimeout);
    sleepTimeout = null;
  }
  state.sleepEndsAt = null;
  state.sleepEpisodeEnd = on;
  emit();
}

/** Annule tout minuteur en cours. */
export function cancelSleep() {
  if (sleepTimeout) {
    clearTimeout(sleepTimeout);
    sleepTimeout = null;
  }
  state.sleepEndsAt = null;
  state.sleepEpisodeEnd = false;
  emit();
}

/** Élément audio partagé (pour lire le temps/la durée depuis la barre). */
export function getPodcastAudio(): HTMLAudioElement | null {
  return ensureAudio();
}

let playSeq = 0; // garde-fou anti-course pour la résolution hors-ligne (async)
let objectUrl: string | null = null; // URL blob courante (à révoquer)

/** `suiteFile` : à la fin d'un épisode, on enchaîne la file dans l'ordre
 * (liste, favoris) au lieu de l'épisode suivant de l'émission. */
export function playQueue(queue: AudioTrack[], index: number, suiteFile = false) {
  const a = ensureAudio();
  if (!a ||!queue[index]) return;
  effacerSuivant();
  state.suiteFile = suiteFile;
  state.queue = queue;
  state.index = index;
  const seq = ++playSeq;
  const t = queue[index];
  track("play", t.id); // statistique d'écoute (anonyme)
  if (t.memoriser) {
    try {
      localStorage.setItem(DERNIER_KEY, t.id);
    } catch {
      /* ignore */
    }
  }
  emit();
  setMediaSession();
  // Copie locale (hors-ligne) en priorité, sinon flux Supabase.
  // (les anciennes versions rangeaient les épisodes sous leur URL)
  void getOfflineObjectUrl(t.path).then((l) => l ?? (t.memoriser ? getOfflineObjectUrl(t.url) : null)).then((local) => {
    if (seq!== playSeq ||!audio) {
      if (local) URL.revokeObjectURL(local);
      return;
    }
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
    objectUrl = local;
    audio.src = local?? t.url;
    audio.playbackRate = state.rate;
    // Épisode commencé : reprise là où on s'était arrêté.
    const deja = t.memoriser ? lirePositions()[t.id] : undefined;
    if (deja && deja > 5) {
      const a2 = audio;
      a2.addEventListener("loadedmetadata", () => {
        a2.currentTime = deja;
      }, { once: true });
    }
    audio.play().catch(() => undefined);
  });
}

/** Active/désactive la répétition en boucle du morceau en cours. */
export function setRepeat(on: boolean) {
  state.repeat = on;
  emit();
}

/** Change la vitesse de lecture (0.8 → 1.5), mémorisée. */
export function setRate(rate: number) {
  state.rate = rate;
  if (audio) audio.playbackRate = rate;
  try {
    localStorage.setItem("jb.audio.rate", String(rate));
  } catch {
    /* ignore */
  }
  emit();
}

export function togglePlay() {
  const a = ensureAudio();
  if (!a || state.index < 0) return;
  if (a.paused) a.play().catch(() => undefined);
  else a.pause();
}

export function nextTrack() {
  if (state.aSuivre) {
    lancerSuivant();
    return;
  }
  if (state.index + 1 < state.queue.length) playQueue(state.queue, state.index + 1);
}
export function prevTrack() {
  if (state.index - 1 >= 0) playQueue(state.queue, state.index - 1);
}
export function seekTo(t: number) {
  if (audio) audio.currentTime = t;
}

/** Arrête la lecture et masque la barre (ferme le lecteur). */
export function stopPlayback() {
  playSeq++;
  effacerSuivant();
  if (audio) {
    audio.pause();
    audio.removeAttribute("src");
  }
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  if (sleepTimeout) {
    clearTimeout(sleepTimeout);
    sleepTimeout = null;
  }
  state.queue = [];
  state.index = -1;
  state.playing = false;
  state.sleepEndsAt = null;
  state.sleepEpisodeEnd = false;
  state.repeat = false;
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Abonnement bas niveau (hors React), utilisé par le fond musical. */
export function subscribePodcast(cb: () => void) {
  return subscribe(cb);
}

/** Instantané de l'état du lecteur (hors React). */
export function podcastSnapshot() {
  return { current: state.index >= 0? state.queue[state.index]: null, playing: state.playing };
}

export function usePodcastPlayer() {
  const snap = useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
  return {
    queue: snap.queue,
    index: snap.index,
    playing: snap.playing,
    current: snap.index >= 0? snap.queue[snap.index]: null,
    sleepEndsAt: snap.sleepEndsAt,
    sleepEpisodeEnd: snap.sleepEpisodeEnd,
    rate: snap.rate,
    repeat: snap.repeat,
    aSuivre: snap.aSuivre,
    lancerSuivant,
    annulerSuivant,
    setRepeat,
    setRate,
    playQueue,
    toggle: togglePlay,
    next: nextTrack,
    prev: prevTrack,
    seek: seekTo,
    stop: stopPlayback,
    setSleepTimer,
    setSleepEpisodeEnd,
    cancelSleep,
  };
}
