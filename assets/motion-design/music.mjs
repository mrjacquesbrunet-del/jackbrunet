/**
 * Musique du motion design vertical v2 — synthèse déterministe, CINÉMATIQUE.
 * 126 BPM (même grille que jackbrunet-motion-vertical.html), ~36,5 s.
 * Booms profonds + nappes de cordes + piano avec écho + caisse claire
 * en half-time : ambiance bande-annonce, pas jeu vidéo.
 * Impacts calés sur les débuts de scène : temps 0, 5, 10, 20, 27, 36, 43, 57.
 *
 * Usage : node music.mjs [sortie.wav]
 */
import { writeFileSync } from "node:fs";

const SR = 44100, BPM = 126, BEAT = 60 / BPM, DUR = 36.5;
const N = Math.round(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);
const WL = new Float32Array(N), WR = new Float32Array(N);   // bus « réverb »

let seed = 20260706;
const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296 * 2 - 1;
const noiseBuf = new Float32Array(SR * 2);
for (let i = 0; i < noiseBuf.length; i++) noiseBuf[i] = rnd();
const noise = (i) => noiseBuf[i % noiseBuf.length];

const bt = (n) => n * BEAT;
function add(t, samples, gain = 1, pan = 0, wet = 0) {
  const start = Math.round(t * SR);
  const gl = gain * Math.min(1, 1 - pan), gr = gain * Math.min(1, 1 + pan);
  for (let i = 0; i < samples.length; i++) {
    const j = start + i;
    if (j < 0 || j >= N) continue;
    L[j] += samples[i] * gl; R[j] += samples[i] * gr;
    if (wet) { WL[j] += samples[i] * gl * wet; WR[j] += samples[i] * gr * wet; }
  }
}

/* ————— instruments ————— */
function boom() {                                  // impact cinéma : chute grave + souffle
  const d = 1.8, n = Math.round(d * SR), out = new Float32Array(n);
  let ph = 0, lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 30 + 70 * Math.exp(-t * 9);
    ph += 2 * Math.PI * f / SR;
    const body = Math.tanh(Math.sin(ph) * 2.6) * Math.exp(-t * 2.6);
    const x = noise(i * 2 + 90000);
    lp += (x - lp) * 0.05;
    out[i] = body * 1.1 + lp * Math.exp(-t * 2.2) * 0.8;
  }
  return out;
}
function kick() {                                  // pulsation sourde, sans click EDM
  const d = 0.35, n = Math.round(d * SR), out = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 46 + 60 * Math.exp(-t * 30);
    ph += 2 * Math.PI * f / SR;
    out[i] = Math.tanh(Math.sin(ph) * 2) * Math.exp(-t * 11);
  }
  return out;
}
function snare() {                                 // caisse claire feutrée
  const d = 0.4, n = Math.round(d * SR), out = new Float32Array(n);
  let ph = 0, bp = 0, bp2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += 2 * Math.PI * 185 / SR;
    const body = Math.sin(ph) * Math.exp(-t * 22) * 0.7;
    const x = noise(i * 3 + 7000);
    bp += (x - bp) * 0.22; bp2 += (bp - bp2) * 0.22;
    out[i] = body + (bp - bp2) * 2.6 * Math.exp(-t * 13);
  }
  return out;
}
function shaker() {
  const d = 0.06, n = Math.round(d * SR), out = new Float32Array(n);
  let hp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const x = noise(i * 5 + 31000);
    hp = x - hp * 0.04;
    out[i] = (x - hp * 0.55) * Math.exp(-t * 70) * 0.55;
  }
  return out;
}
function sub(freq, dur) {                          // basse ronde
  const n = Math.round(dur * SR), out = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += 2 * Math.PI * freq / SR;
    const env = Math.min(1, t * 30) * Math.min(1, Math.max(0, (dur - t) * 4));
    out[i] = Math.tanh(Math.sin(ph) * 1.6) * env;
  }
  return out;
}
function pad(freqs, dur) {                         // nappe « cordes » : saws désaccordées filtrées
  const n = Math.round(dur * SR), out = new Float32Array(n);
  const voices = [];
  freqs.forEach((f) => [0.9965, 1, 1.0035].forEach((d2) => voices.push(f * d2)));
  const phases = voices.map((_, k) => (k * 0.37) % 1);
  let lp = 0, lp2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let x = 0;
    for (let k = 0; k < voices.length; k++) {
      phases[k] += voices[k] / SR;
      x += 2 * (phases[k] % 1) - 1;
    }
    x /= voices.length;
    lp += (x - lp) * 0.055; lp2 += (lp - lp2) * 0.055;   // filtre doux
    const env = Math.min(1, t / 0.5) * Math.min(1, Math.max(0, (dur - t) / 1.2));
    out[i] = lp2 * env * 1.6;
  }
  return out;
}
function piano(freq, dur = 1.6) {                  // touches feutrées (partiels de sinus)
  const n = Math.round(dur * SR), out = new Float32Array(n);
  let p1 = 0, p2 = 0, p3 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    p1 += 2 * Math.PI * freq / SR;
    p2 += 2 * Math.PI * freq * 2.001 / SR;
    p3 += 2 * Math.PI * freq * 2.997 / SR;
    const env = Math.min(1, t * 220) * Math.exp(-t * 3.4);
    out[i] = (Math.sin(p1) + Math.sin(p2) * 0.34 + Math.sin(p3) * 0.12) * env * 0.6;
  }
  return out;
}
function riser(durS) {
  const n = Math.round(durS * SR), out = new Float32Array(n);
  let bp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const x = noise(i * 7 + 50000);
    bp += (x - bp) * (0.015 + 0.4 * t * t);
    out[i] = bp * t * t * 1.3;
  }
  return out;
}

/* ————— arrangement ————— */
const ROOTS = [82.41, 65.41, 98.0, 73.42];                        // E2 C2 G2 D2
const PADS = [
  [164.81, 196.0, 246.94, 329.63],   // Em : E3 G3 B3 E4
  [130.81, 164.81, 196.0, 261.63],   // C
  [196.0, 246.94, 293.66, 392.0],    // G
  [146.83, 185.0, 220.0, 293.66],    // D
];
const MELODY = [                                                   // [temps dans la mesure, note]
  [[0.5, 659.26], [2, 493.88], [3.25, 392.0]],                     // Em
  [[0.5, 659.26], [2, 523.25], [3.25, 392.0]],                     // C
  [[0.5, 587.33], [2, 493.88], [3.25, 392.0]],                     // G
  [[0.5, 587.33], [2, 440.0], [3.25, 369.99]],                     // D
];
const SECTIONS = [0, 5, 10, 20, 27, 36, 43, 57];
const LAST = 66;                                                   // dernière mesure jouée

const kickS = kick(), snareS = snare(), shakerS = shaker();

/* nappes + basse par mesure */
for (let beat = 5; beat < LAST; beat += 4) {
  const bar = Math.floor((beat - 5) / 4) % 4;
  add(bt(beat), pad(PADS[bar], bt(4) + 0.9), beat < 20 ? 0.34 : 0.42, 0, 0.5);
  if (beat >= 10) add(bt(beat), sub(ROOTS[bar], bt(4)), 0.6);
}
/* batterie half-time */
for (let beat = 20; beat < LAST - 4; beat++) {
  const inBar = beat % 4;
  if (inBar === 0) add(bt(beat), kickS, 0.85);
  if (beat >= 27 && inBar === 2) { add(bt(beat), snareS, 0.7, 0.05, 0.35); }
  if (beat >= 36) {
    add(bt(beat) + bt(0.5), shakerS, 0.4, 0.3);
    if (beat >= 43 && inBar === 3) add(bt(beat) + bt(0.5), kickS, 0.4);
  }
}
/* piano : motif par mesure, plus présent sur le pic */
for (let beat = 10; beat < LAST - 4; beat += 4) {
  const bar = Math.floor((beat - 10) / 4) % 4;
  MELODY[bar].forEach(([off, f]) => {
    add(bt(beat + off), piano(f), 0.42, off > 2 ? 0.3 : -0.3, 0.65);
    if (beat >= 43) add(bt(beat + off), piano(f * 2, 1.1), 0.18, 0.2, 0.7);
  });
}
/* impacts + risers aux changements de scène */
SECTIONS.forEach((beatN, k) => add(bt(beatN), boom(), k === 0 ? 0.55 : 0.85));
SECTIONS.slice(2).forEach((z) => add(bt(z - 2), riser(bt(2)), 0.45, 0, 0.4));

/* final : accord résolu qui résonne + arpège de piano */
add(bt(57), pad(PADS[0], 8.5), 0.5, 0, 0.6);
add(bt(57), sub(ROOTS[0], 7), 0.55);
[[62, 329.63], [62.5, 392.0], [63, 493.88], [63.5, 659.26]].forEach(([beatN, f]) =>
  add(bt(beatN), piano(f, 2.6), 0.4, 0, 0.7));
add(bt(64), piano(659.26 * 2, 3.2), 0.2, 0, 0.8);

/* ————— bus réverb (2 délais croisés) ————— */
const D1 = Math.round(0.117 * SR), D2 = Math.round(0.089 * SR);
for (let i = 0; i < N; i++) {
  if (i >= D1) { WL[i] += WR[i - D1] * 0.34; }
  if (i >= D2) { WR[i] += WL[i - D2] * 0.32; }
}

/* ————— mix : sidechain léger + soft clip + fades ————— */
const duck = new Float32Array(N).fill(1);
for (let beat = 20; beat < LAST; beat += 4) {
  const start = Math.round(bt(beat) * SR), len = Math.round(bt(0.5) * SR);
  for (let i = 0; i < len; i++) {
    const j = start + i; if (j >= N) break;
    const g = 0.6 + 0.4 * (i / len);
    if (g < duck[j]) duck[j] = g;
  }
}
const out = Buffer.alloc(44 + N * 4);
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let fade = 1;
  if (t < 0.01) fade = t / 0.01;
  if (t > DUR - 1.6) fade = Math.max(0, (DUR - t) / 1.6);
  const d = duck[i];
  const l = Math.tanh((L[i] * d + WL[i] * 0.5) * 0.6) * fade;
  const r = Math.tanh((R[i] * d + WR[i] * 0.5) * 0.6) * fade;
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, l)) * 32767), 44 + i * 4);
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, r)) * 32767), 46 + i * 4);
}
out.write("RIFF", 0); out.writeUInt32LE(36 + N * 4, 4); out.write("WAVE", 8);
out.write("fmt ", 12); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20);
out.writeUInt16LE(2, 22); out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28);
out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34);
out.write("data", 36); out.writeUInt32LE(N * 4, 40);

const target = process.argv[2] || "music.wav";
writeFileSync(target, out);
console.log(`OK → ${target} (${DUR}s, ${BPM} BPM, cinématique)`);
