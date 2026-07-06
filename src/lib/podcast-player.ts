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
};
let audio: HTMLAudioElement | null = null;
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
      artist: "Pasteur Jack Brunet",
      album: "Jack Brunet, Écouter",
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
  audio.addEventListener("ended", () => {
    errorSkips = 0;
    // Minuteur « fin de l'épisode »: on s'arrête ici au lieu d'enchaîner.
    if (state.sleepEpisodeEnd) {
      cancelSleep();
      stopPlayback();
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

export function playQueue(queue: AudioTrack[], index: number) {
  const a = ensureAudio();
  if (!a ||!queue[index]) return;
  state.queue = queue;
  state.index = index;
  const seq = ++playSeq;
  const t = queue[index];
  track("play", t.id); // statistique d'écoute (anonyme)
  emit();
  setMediaSession();
  // Copie locale (hors-ligne) en priorité, sinon flux Supabase.
  void getOfflineObjectUrl(t.path).then((local) => {
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
    audio.play().catch(() => undefined);
  });
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
