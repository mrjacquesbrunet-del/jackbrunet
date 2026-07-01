"use client";

import { useSyncExternalStore } from "react";
import type { AudioTrack } from "./audio-library";
import { track } from "./analytics";

/**
 * Lecteur de podcasts GLOBAL (singleton hors React): la lecture continue
 * quand on change de page/onglet, écran verrouillé ou app en arrière-plan
 * (avec UIBackgroundModes=audio côté iOS + Media Session pour les contrôles).
 */

type State = { queue: AudioTrack[]; index: number; playing: boolean };
let state: State = { queue: [], index: -1, playing: false };
let audio: HTMLAudioElement | null = null;
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
  audio.addEventListener("ended", () => nextTrack());
  return audio;
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
  state.queue = [];
  state.index = -1;
  state.playing = false;
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
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
    playQueue,
    toggle: togglePlay,
    next: nextTrack,
    prev: prevTrack,
    seek: seekTo,
    stop: stopPlayback,
  };
}
