"use client";

/**
 * Musique du jeu de mémorisation — générée en direct avec le Web Audio API
 * (aucun fichier, aucun droit, fonctionne hors-ligne). Boucle douce et
 * entraînante en Do majeur (arpèges + basse), volume bas. L'activation part
 * d'un geste utilisateur (bouton), requis par iOS. Préférence mémorisée.
 */

const PREF_KEY = "jb.memorize.music.v1";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let step = 0;
let nextTime = 0;
let running = false;

export function isMusicOn(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) === "1";
  } catch {
    return false;
  }
}

function savePref(on: boolean) {
  try {
    localStorage.setItem(PREF_KEY, on ? "1" : "0");
  } catch {
    /* stockage indisponible */
  }
}

// Progression I–V–vi–IV (Do), un accord par mesure, arpégé en croches.
const CHORDS: number[][] = [
  [261.63, 329.63, 392.0], // C
  [246.94, 392.0, 493.88], // G/B
  [220.0, 261.63, 329.63], // Am
  [174.61, 261.63, 349.23], // F
];
const BASS = [130.81, 98.0, 110.0, 87.31]; // C3, G2, A2, F2
const STEP_DUR = 0.25; // croche (~120 BPM)
const STEPS_PER_BAR = 8;

function voice(freq: number, at: number, dur: number, gain: number, type: OscillatorType) {
  if (!ctx || !master) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.connect(g).connect(master);
  // Petite enveloppe douce (attaque/déclin) pour un rendu « pluck ».
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gain, at + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.start(at);
  o.stop(at + dur + 0.05);
}

function scheduleStep(s: number, at: number) {
  const bar = Math.floor(s / STEPS_PER_BAR) % CHORDS.length;
  const inBar = s % STEPS_PER_BAR;
  const chord = CHORDS[bar];
  // Arpège montant puis descendant sur la mesure.
  const seq = [0, 1, 2, 1, 0, 1, 2, 1];
  voice(chord[seq[inBar]] * 2, at, 0.28, 0.13, "triangle");
  if (inBar === 0) voice(BASS[bar], at, 0.9, 0.16, "sine"); // basse sur le temps fort
  if (inBar === 4) voice(chord[0] * 2, at, 0.24, 0.06, "sine"); // rappel léger
}

function tick() {
  if (!ctx) return;
  // Programme les pas à venir dans une petite fenêtre d'anticipation.
  while (nextTime < ctx.currentTime + 0.15) {
    scheduleStep(step, nextTime);
    nextTime += STEP_DUR;
    step += 1;
  }
}

function ensureContext() {
  if (ctx) return;
  const AC =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.5; // volume global bas (les voix sont déjà douces)
  master.connect(ctx.destination);
}

/** Démarre la musique (depuis un geste utilisateur). Mémorise la préférence. */
export function startGameMusic() {
  ensureContext();
  if (!ctx || running) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => undefined);
  running = true;
  step = 0;
  nextTime = ctx.currentTime + 0.1;
  timer = setInterval(tick, 25);
  savePref(true);
}

/** Arrête la musique. `remember=false` pour une pause qui garde la préférence. */
export function stopGameMusic(remember = true) {
  running = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  if (ctx) {
    ctx.close().catch(() => undefined);
    ctx = null;
    master = null;
  }
  if (remember) savePref(false);
}

export function toggleGameMusic(): boolean {
  if (running) {
    stopGameMusic(true);
    return false;
  }
  startGameMusic();
  return true;
}
