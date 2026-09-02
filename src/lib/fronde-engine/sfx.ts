"use client";

/**
 * AudioManager de La Fronde — sons 100 % Web Audio (aucun fichier) :
 * tension de l'élastique (grincement qui monte avec la traction), lancer,
 * impacts (bois, métal, créature), casse, victoire, défaite.
 */

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => undefined);
    return ctx;
  } catch {
    return null;
  }
}

/** À appeler sur un geste utilisateur (débloque l'audio iOS). */
export function primeFrondeSfx() {
  ac();
}

function env(a: AudioContext, t0: number, dur: number, peak = 0.2): GainNode {
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  g.connect(a.destination);
  return g;
}

function noiseBuf(a: AudioContext, dur: number): AudioBuffer {
  const b = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

/* ---------- Tension de l'élastique (continu pendant le drag) ---------- */
let stretchOsc: OscillatorNode | null = null;
let stretchGain: GainNode | null = null;

export function sfxStretch(ratio: number) {
  const a = ac();
  if (!a) return;
  if (!stretchOsc) {
    stretchOsc = a.createOscillator();
    stretchOsc.type = "sawtooth";
    stretchGain = a.createGain();
    stretchGain.gain.value = 0;
    const f = a.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 300;
    stretchOsc.connect(f);
    f.connect(stretchGain);
    stretchGain.connect(a.destination);
    stretchOsc.start();
  }
  stretchOsc.frequency.setTargetAtTime(55 + ratio * 90, a.currentTime, 0.03);
  stretchGain!.gain.setTargetAtTime(ratio > 0.02 ? 0.015 + ratio * 0.03 : 0, a.currentTime, 0.05);
}

export function sfxStretchStop() {
  const a = ac();
  if (!a || !stretchGain) return;
  stretchGain.gain.setTargetAtTime(0, a.currentTime, 0.02);
}

/* ---------- Ponctuels ---------- */

export function sfxLaunch() {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  const src = a.createBufferSource();
  src.buffer = noiseBuf(a, 0.25);
  const f = a.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.setValueAtTime(900, t);
  f.frequency.exponentialRampToValueAtTime(2600, t + 0.18);
  src.connect(f);
  f.connect(env(a, t, 0.24, 0.22));
  src.start(t);
}

export function sfxImpactGround() {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  const src = a.createBufferSource();
  src.buffer = noiseBuf(a, 0.12);
  const f = a.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 420;
  src.connect(f);
  f.connect(env(a, t, 0.12, 0.16));
  src.start(t);
}

export function sfxImpactMetal() {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  for (const [freq, det] of [[1180, 0], [1730, 6]] as const) {
    const o = a.createOscillator();
    o.type = "triangle";
    o.frequency.value = freq;
    o.detune.value = det;
    o.connect(env(a, t, 0.28, 0.14));
    o.start(t);
    o.stop(t + 0.3);
  }
}

export function sfxHit(big = false) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  const o = a.createOscillator();
  o.type = "square";
  o.frequency.setValueAtTime(big ? 190 : 320, t);
  o.frequency.exponentialRampToValueAtTime(big ? 90 : 170, t + 0.14);
  o.connect(env(a, t, 0.16, big ? 0.3 : 0.2));
  o.start(t);
  o.stop(t + 0.18);
  const src = a.createBufferSource();
  src.buffer = noiseBuf(a, 0.1);
  const f = a.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = 1500;
  src.connect(f);
  f.connect(env(a, t, 0.1, 0.1));
  src.start(t);
}

export function sfxBreak() {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  [660, 880, 1320].forEach((fq, i) => {
    const o = a.createOscillator();
    o.type = "sine";
    o.frequency.value = fq;
    o.connect(env(a, t + i * 0.05, 0.16, 0.16));
    o.start(t + i * 0.05);
    o.stop(t + i * 0.05 + 0.18);
  });
}

export function sfxVictory() {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  [523, 659, 784, 1047].forEach((fq, i) => {
    const o = a.createOscillator();
    o.type = "triangle";
    o.frequency.value = fq;
    o.connect(env(a, t + i * 0.11, 0.3, 0.2));
    o.start(t + i * 0.11);
    o.stop(t + i * 0.11 + 0.32);
  });
}

export function sfxFail() {
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  [392, 330, 262].forEach((fq, i) => {
    const o = a.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = fq;
    const g = env(a, t + i * 0.14, 0.22, 0.1);
    o.connect(g);
    o.start(t + i * 0.14);
    o.stop(t + i * 0.14 + 0.24);
  });
}
