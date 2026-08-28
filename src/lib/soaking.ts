"use client";

import { useSyncExternalStore } from "react";
import musicData from "../../content/music.json";
import { mediaUrl } from "./asset";

/**
 * Lecteur « soaking »: musique de fond pour le temps de méditation.
 *
 * - Si des pistes sont fournies (content/music.json), on les joue en boucle.
 * - Sinon, on génère une ambiance douce avec le Web Audio API: aucun fichier,
 * aucun problème de droits, fonctionne hors-ligne.
 * - Volume réglable indépendamment de la voix (persistant). iOS ignore
 *   HTMLAudioElement.volume: on passe par un GainNode quand c'est possible.
 *
 * Singleton (hors React) pour que la musique continue pendant la navigation.
 */

type Track = { title: string; artist?: string; src: string };
const tracks = ((musicData as { items?: Track[] }).items?? []) as Track[];

const VOLUME_KEY = "jb.soaking.vol.v1";
const DEFAULT_VOLUME = 0.6;
export const SOAKING_VOL_MIN = 0.05;
export const SOAKING_VOL_MAX = 1;

let playing = false;
let volume = DEFAULT_VOLUME;
try {
  const v = typeof localStorage !== "undefined" ? localStorage.getItem(VOLUME_KEY) : null;
  if (v !== null && Number.isFinite(Number(v))) volume = Number(v);
} catch {
  /* SSR */
}

let audioEl: HTMLAudioElement | null = null;
// Graphe Web Audio de la piste (volume fiable sur iOS).
let trackCtx: AudioContext | null = null;
let trackGain: GainNode | null = null;
// Ambiance générée (repli sans piste) : gain maître pour doser le volume.
let ctx: AudioContext | null = null;
let ambientMaster: GainNode | null = null;
let stopAmbient: (() => void) | null = null;
const listeners = new Set<() => void>();
let snapshot = { playing, volume };

function emit() {
  snapshot = { playing, volume };
  listeners.forEach((l) => l());
}

/** Niveau du gain de l'ambiance générée pour un volume donné (0.6 ≈ 0.11). */
function ambientLevel(v: number): number {
  return 0.18 * v;
}

function startAmbient() {
  const AC =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  master.gain.linearRampToValueAtTime(ambientLevel(volume), ctx.currentTime + 3); // fondu d'entrée
  ambientMaster = master;

  // Accord apaisant (La majeur), nappes sinusoïdales + lent vibrato.
  const freqs = [110, 164.81, 220, 277.18];
  const voices = freqs.map((f, idx) => {
    const o = ctx!.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const g = ctx!.createGain();
    g.gain.value = 0.22;
    const lfo = ctx!.createOscillator();
    lfo.frequency.value = 0.04 + idx * 0.015;
    const lfoGain = ctx!.createGain();
    lfoGain.gain.value = 0.1;
    lfo.connect(lfoGain).connect(g.gain);
    o.connect(g).connect(master);
    o.start();
    lfo.start();
    return { o, lfo };
  });

  stopAmbient = () => {
    if (!ctx) return;
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.4);
    const c = ctx;
    setTimeout(() => {
      voices.forEach(({ o, lfo }) => {
        try {
          o.stop();
          lfo.stop();
        } catch {
          /* déjà arrêté */
        }
      });
      c.close().catch(() => undefined);
    }, 1500);
    ctx = null;
    ambientMaster = null;
  };
}

function startTrack() {
  // mediaUrl (et non asset): le fichier est servi par le site (jackbrunet.com),
  // car les gros médias audio sont retirés du bundle OTA pour l'alléger.
  audioEl = new Audio();
  // crossOrigin AVANT src : nécessaire pour router le média dans le Web Audio
  // (réglage de volume fiable sur iOS) sans le « teinter ».
  audioEl.crossOrigin = "anonymous";
  audioEl.src = mediaUrl(tracks[0].src);
  audioEl.loop = true;
  audioEl.volume = volume; // repli (ignoré sur iOS, géré par le GainNode)
  try {
    const AC =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AC) {
      trackCtx = new AC();
      const src = trackCtx.createMediaElementSource(audioEl);
      trackGain = trackCtx.createGain();
      trackGain.gain.value = volume;
      src.connect(trackGain).connect(trackCtx.destination);
      if (trackCtx.state === "suspended") trackCtx.resume().catch(() => undefined);
    }
  } catch {
    // Web Audio indisponible: on garde le repli .volume (desktop/Android).
    trackCtx = null;
    trackGain = null;
  }
  void audioEl.play().catch(() => undefined);
}

function play() {
  if (playing) return;
  playing = true;
  if (tracks.length > 0) startTrack();
  else startAmbient();
  emit();
}

function stop() {
  if (!playing) return;
  playing = false;
  if (audioEl) {
    audioEl.pause();
    audioEl = null;
  }
  if (trackCtx) {
    trackCtx.close().catch(() => undefined);
    trackCtx = null;
    trackGain = null;
  }
  if (stopAmbient) {
    stopAmbient();
    stopAmbient = null;
  }
  emit();
}

export function toggleSoaking() {
  if (playing) stop();
  else play();
}

/** Démarre la musique si elle ne joue pas déjà (mode Temps de prière). */
export function startSoaking() {
  play();
}

/** Coupe la musique (fin du Temps de prière). */
export function stopSoaking() {
  stop();
}

/** La musique joue-t-elle en ce moment ? (lecture ponctuelle, hors React) */
export function isSoakingPlaying(): boolean {
  return playing;
}

/** Règle le volume du soaking (persistant, appliqué en direct). */
export function setSoakingVolume(v: number) {
  volume = Math.min(SOAKING_VOL_MAX, Math.max(SOAKING_VOL_MIN, v));
  try {
    localStorage.setItem(VOLUME_KEY, String(volume));
  } catch {
    /* ignore */
  }
  if (trackGain) trackGain.gain.value = volume;
  if (audioEl) audioEl.volume = volume;
  if (ambientMaster && ctx) {
    ambientMaster.gain.linearRampToValueAtTime(ambientLevel(volume), ctx.currentTime + 0.15);
  }
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useSoaking() {
  const snap = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );
  const first = tracks[0];
  return {
    playing: snap.playing,
    volume: snap.volume,
    setVolume: setSoakingVolume,
    toggle: toggleSoaking,
    label: first
? first.artist
? `${first.title} · ${first.artist}`
: first.title
: "Ambiance douce",
  };
}
