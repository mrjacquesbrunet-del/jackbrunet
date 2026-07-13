"use client";

import { useSyncExternalStore } from "react";
import { getSupabase } from "./supabase";
import { subscribePodcast, podcastSnapshot } from "./podcast-player";
import { compressToMonoMp3 } from "./audio-compress";

/**
 * Fond musical doux (instrumental méditatif) joué EN BOUCLE et à faible
 * volume SOUS la Bible audio (narration hébergée ou voix de l'appareil).
 * Se cale automatiquement sur la lecture: quand la voix joue, le fond joue ;
 * quand ça se met en pause / s'arrête, le fond baisse aussi.
 *
 * Fichier attendu dans le bucket public « audiovf »: ambient/bed.mp3
 */
const AUDIO_BUCKET = "audiovf";
const STORAGE_KEY = "jb.bible.ambient.v1";
const VOLUME_KEY = "jb.bible.ambient.vol.v1";
const DEFAULT_VOLUME = 0.16; // volume du fond, bien en dessous de la voix
export const AMBIENT_VOL_MIN = 0.04;
export const AMBIENT_VOL_MAX = 0.5;

export function ambientUrl(): string | null {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = sb.storage.from(AUDIO_BUCKET).getPublicUrl("ambient/bed.mp3");
  return data.publicUrl?? null;
}

let enabled = false;
let volume = DEFAULT_VOLUME;
try {
  enabled = typeof localStorage!== "undefined" && localStorage.getItem(STORAGE_KEY) === "1";
  const v = typeof localStorage!== "undefined"? localStorage.getItem(VOLUME_KEY): null;
  if (v!== null && Number.isFinite(Number(v))) volume = Number(v);
} catch {
  /* SSR */
}

let voiceActive = false; // vrai quand la voix de l'appareil (TTS) lit
let audio: HTMLAudioElement | null = null;
// iOS ignore HTMLAudioElement.volume: le seul moyen fiable de régler le volume
// est de passer par le Web Audio API (AudioContext + GainNode).
let actx: AudioContext | null = null;
let gain: GainNode | null = null;
const listeners = new Set<() => void>();
let snapshot = { enabled, volume };

function emit() {
  snapshot = { enabled, volume };
  listeners.forEach((l) => l());
}

function ensure(): HTMLAudioElement | null {
  if (audio || typeof window === "undefined") return audio;
  const url = ambientUrl();
  if (!url) return null;
  const a = new Audio();
  // crossOrigin AVANT src: nécessaire pour router un média distant (bucket
  // Supabase, CORS ouvert) dans le Web Audio sans le « teinter ».
  a.crossOrigin = "anonymous";
  a.src = url;
  a.loop = true; // se répète à l'infini
  a.preload = "auto";
  a.volume = volume; // repli (ignoré sur iOS, géré par le GainNode)
  audio = a;
  return audio;
}

/** Branche le fond musical sur un GainNode (volume réglable, iOS compris). */
function ensureGain() {
  if (gain || !audio || typeof window === "undefined") return;
  const AC =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  try {
    actx = new AC();
    const src = actx.createMediaElementSource(audio);
    gain = actx.createGain();
    gain.gain.value = volume;
    src.connect(gain).connect(actx.destination);
  } catch {
    // Web Audio indisponible: on garde le repli .volume (desktop/Android).
    actx = null;
    gain = null;
  }
}

/** Règle le volume du fond musical (persistant, appliqué en direct). */
export function setAmbientVolume(v: number) {
  volume = Math.min(AMBIENT_VOL_MAX, Math.max(AMBIENT_VOL_MIN, v));
  try {
    localStorage.setItem(VOLUME_KEY, String(volume));
  } catch {
    /* ignore */
  }
  if (gain) gain.gain.value = volume;
  else if (audio) audio.volume = volume;
  emit();
}

/** Faut-il jouer le fond en ce moment? (activé ET une voix est en cours) */
function shouldPlay(): boolean {
  if (!enabled) return false;
  if (voiceActive) return true;
  const snap = podcastSnapshot();
  return Boolean(snap.playing && snap.current?.id?.startsWith("bible:"));
}

function update() {
  const a = ensure();
  if (!a) return;
  if (shouldPlay()) {
    ensureGain();
    if (actx && actx.state === "suspended") actx.resume().catch(() => undefined);
    if (a.paused) a.play().catch(() => undefined);
  } else if (!a.paused) {
    a.pause();
  }
}

// Suit la lecture du lecteur global (narration Bible en arrière-plan).
if (typeof window!== "undefined") {
  subscribePodcast(() => update());
}

/** Admin: envoie l'instrumental de fond (remplace l'existant). */
export async function uploadAmbientBed(file: File): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const out = await compressToMonoMp3(file, 64); // un peu plus de qualité pour la musique
  const { error } = await sb.storage
.from(AUDIO_BUCKET)
.upload("ambient/bed.mp3", out, { contentType: "audio/mpeg", upsert: true });
  // Force le rechargement du nouvel instrumental à la prochaine lecture.
  if (audio) {
    audio.pause();
    audio = null;
  }
  // Un nouveau média nécessite un nouveau graphe Web Audio.
  if (actx) {
    actx.close().catch(() => undefined);
    actx = null;
    gain = null;
  }
  return!error;
}

/** Indique que la voix de l'appareil (TTS) lit ou non. */
export function setVoiceActive(on: boolean) {
  voiceActive = on;
  update();
}

/** Active/désactive le fond musical (persistant). */
export function setAmbientEnabled(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(STORAGE_KEY, on? "1": "0");
  } catch {
    /* ignore */
  }
  emit();
  update();
}

/**
 * À appeler depuis un geste utilisateur (bouton lecture) pour amorcer le fond:
 * iOS n'autorise la lecture audio qu'après une interaction.
 */
export function ambientKick() {
  if (!enabled) return;
  const a = ensure();
  if (!a) return;
  ensureGain();
  if (actx && actx.state === "suspended") actx.resume().catch(() => undefined);
  if (a.paused && shouldPlay()) a.play().catch(() => undefined);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useAmbient() {
  const snap = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );
  return {
    enabled: snap.enabled,
    setEnabled: setAmbientEnabled,
    volume: snap.volume,
    setVolume: setAmbientVolume,
  };
}
