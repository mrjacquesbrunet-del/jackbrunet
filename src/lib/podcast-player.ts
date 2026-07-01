"use client";

import { useSyncExternalStore } from "react";
import type { AudioTrack } from "./audio-library";
import { track } from "./analytics";

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
};
let state: State = {
  queue: [],
  index: -1,
  playing: false,
  sleepEndsAt: null,
  sleepEpisodeEnd: false,
};
let audio: HTMLAudioElement | null = null;
let sleepTimeout: ReturnType<typeof setTimeout> | null = null;
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
      album: "Jack Brunet — Écouter",
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
  audio.addEventListener("ended", () => {
    // Minuteur « fin de l'épisode »: on s'arrête ici au lieu d'enchaîner.
    if (state.sleepEpisodeEnd) {
      cancelSleep();
      stopPlayback();
      return;
    }
    nextTrack();
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

export function playQueue(queue: AudioTrack[], index: number) {
  const a = ensureAudio();
  if (!a ||!queue[index]) return;
  state.queue = queue;
  state.index = index;
  a.src = queue[index].url;
  a.play().catch(() => undefined);
  track("play", queue[index].id); // statistique d'écoute (anonyme)
  emit();
  setMediaSession();
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
  if (audio) {
    audio.pause();
    audio.removeAttribute("src");
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

/** Abonnement bas niveau (hors React) — utilisé par le fond musical. */
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
