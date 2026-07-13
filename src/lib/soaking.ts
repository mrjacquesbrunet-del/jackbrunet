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
 *
 * Singleton (hors React) pour que la musique continue pendant la navigation.
 */

type Track = { title: string; artist?: string; src: string };
const tracks = ((musicData as { items?: Track[] }).items?? []) as Track[];

let playing = false;
let audioEl: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let stopAmbient: (() => void) | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
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
  master.gain.linearRampToValueAtTime(0.11, ctx.currentTime + 3); // fondu d'entrée

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
  };
}

function startTrack() {
  // mediaUrl (et non asset): le fichier est servi par le site (jackbrunet.com),
  // car les gros médias audio sont retirés du bundle OTA pour l'alléger.
  audioEl = new Audio(mediaUrl(tracks[0].src));
  audioEl.loop = true;
  audioEl.volume = 0.6;
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

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useSoaking() {
  const isPlaying = useSyncExternalStore(
    subscribe,
    () => playing,
    () => false,
  );
  const first = tracks[0];
  return {
    playing: isPlaying,
    toggle: toggleSoaking,
    label: first
? first.artist
? `${first.title} · ${first.artist}`
: first.title
: "Ambiance douce",
  };
}
