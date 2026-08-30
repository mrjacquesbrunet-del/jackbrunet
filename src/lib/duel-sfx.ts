"use client";

/**
 * Bruitages du DUEL (Web Audio, aucun fichier, hors-ligne) :
 * bips de chrono, jingles de point gagné/perdu, erreur, impact « VS ».
 * `primeSfx()` doit être appelé depuis un geste utilisateur (iOS).
 */

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => undefined);
  return ctx;
}

/** À appeler sur un geste utilisateur pour débloquer le son (iOS). */
export function primeSfx() {
  ac();
}

function tone(freq: number, delay: number, dur: number, gain = 0.12, type: OscillatorType = "square") {
  const c = ac();
  if (!c) return;
  const at = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.connect(g).connect(c.destination);
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gain, at + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.start(at);
  o.stop(at + dur + 0.05);
}

/** Bip du chrono ; `urgent` = 3 dernières secondes (plus aigu, plus fort). */
export function sfxTick(urgent: boolean) {
  tone(urgent ? 1320 : 880, 0, 0.07, urgent ? 0.16 : 0.08, "square");
}

/** Point gagné : petit arpège montant victorieux. */
export function sfxWin() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.085, 0.16, 0.12, "triangle"));
}

/** Point perdu / manche perdue : descente. */
export function sfxLose() {
  [392, 311.13, 233.08].forEach((f, i) => tone(f, i * 0.11, 0.18, 0.1, "sawtooth"));
}

/** Mauvaise réponse : buzz sourd. */
export function sfxWrong() {
  tone(130, 0, 0.22, 0.14, "sawtooth");
  tone(98, 0.02, 0.22, 0.1, "square");
}

/** Impact « VS » au lancement. */
export function sfxVs() {
  tone(98, 0, 0.35, 0.16, "sawtooth");
  tone(196, 0.12, 0.3, 0.14, "square");
  tone(392, 0.26, 0.4, 0.12, "triangle");
}

/** Victoire finale : fanfare courte. */
export function sfxVictory() {
  [523.25, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.12, 0.22, 0.13, "triangle"));
}
