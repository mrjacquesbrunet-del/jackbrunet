/**
 * Musique du motion design vertical — synthèse déterministe, 126 BPM, 24 s.
 * Génère un WAV 44,1 kHz stéréo 16 bits calé sur la même grille de temps
 * que jackbrunet-motion-vertical.html (impacts aux beats 4, 8, 16, 24, 32, 40, 44).
 *
 * Usage : node music.mjs [sortie.wav]
 */
import { writeFileSync } from "node:fs";

const SR = 44100, BPM = 126, BEAT = 60 / BPM, DUR = 24;
const N = SR * DUR;
const L = new Float32Array(N), R = new Float32Array(N);

/* PRNG déterministe (bruit reproductible) */
let seed = 20260706;
const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296 * 2 - 1;
const noiseBuf = new Float32Array(SR * 2);
for (let i = 0; i < noiseBuf.length; i++) noiseBuf[i] = rnd();
const noise = (i) => noiseBuf[i % noiseBuf.length];

const bt = (n) => n * BEAT;                    // beat → secondes
const add = (t, samples, gain = 1, pan = 0) => {
  const start = Math.round(t * SR);
  const gl = gain * Math.min(1, 1 - pan), gr = gain * Math.min(1, 1 + pan);
  for (let i = 0; i < samples.length; i++) {
    const j = start + i;
    if (j < 0 || j >= N) continue;
    L[j] += samples[i] * gl; R[j] += samples[i] * gr;
  }
};

/* ————— instruments ————— */
function kick() {
  const d = 0.30, n = Math.round(d * SR), out = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 42 + 90 * Math.exp(-t * 38);            // chute de pitch
    ph += 2 * Math.PI * f / SR;
    const env = Math.exp(-t * 13);
    const click = i < 90 ? (1 - i / 90) * noise(i) * 0.5 : 0;
    out[i] = Math.tanh(Math.sin(ph) * 2.4) * env + click;
  }
  return out;
}
function clap() {
  const d = 0.22, n = Math.round(d * SR), out = new Float32Array(n);
  let bp = 0, bp2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const bursts = (t < 0.012 ? 1 : 0) + (t > 0.014 && t < 0.026 ? 1 : 0) + (t > 0.03 ? 1 : 0);
    const env = (t < 0.03 ? bursts * 0.8 : Math.exp(-(t - 0.03) * 34));
    const x = noise(i * 3 + 7000) * env;
    bp += (x - bp) * 0.28; bp2 += (bp - bp2) * 0.28;   // passe-bande grossier
    out[i] = (bp - bp2) * 3.4;
  }
  return out;
}
function hat(open = false) {
  const d = open ? 0.32 : 0.07, n = Math.round(d * SR), out = new Float32Array(n);
  let hp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const x = noise(i * 5 + 31000);
    hp = x - hp * 0.02;                                 // passe-haut simpliste
    out[i] = (x - hp * 0.5) * Math.exp(-t * (open ? 11 : 60)) * 0.8;
  }
  return out;
}
function bass(freq, dur) {
  const n = Math.round(dur * SR), out = new Float32Array(n);
  let ph = 0, lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += 2 * Math.PI * freq / SR;
    const saw = 2 * ((ph / (2 * Math.PI)) % 1) - 1;
    const sub = Math.sin(ph);
    const env = Math.min(1, t * 200) * Math.exp(-t * 7);
    const x = (saw * 0.45 + sub * 0.8) * env;
    lp += (x - lp) * 0.10;                              // passe-bas
    out[i] = Math.tanh(lp * 2.2);
  }
  return out;
}
function pluck(freq, dur, detune = 1.004) {
  const n = Math.round(dur * SR), out = new Float32Array(n);
  let p1 = 0, p2 = 0, lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    p1 += 2 * Math.PI * freq / SR;
    p2 += 2 * Math.PI * freq * detune / SR;
    const saw1 = 2 * ((p1 / (2 * Math.PI)) % 1) - 1;
    const saw2 = 2 * ((p2 / (2 * Math.PI)) % 1) - 1;
    const env = Math.min(1, t * 400) * Math.exp(-t * 9);
    const x = (saw1 + saw2) * 0.5 * env;
    lp += (x - lp) * (0.12 + 0.3 * Math.exp(-t * 8));   // filtre qui se referme
    out[i] = lp;
  }
  return out;
}
function impact() {
  const d = 1.1, n = Math.round(d * SR), out = new Float32Array(n);
  let ph = 0, lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 36 + 60 * Math.exp(-t * 18);
    ph += 2 * Math.PI * f / SR;
    const boom = Math.tanh(Math.sin(ph) * 3) * Math.exp(-t * 4.5);
    const x = noise(i * 2 + 90000);
    lp += (x - lp) * 0.06;
    const crashN = (x - lp) * Math.exp(-t * 3.2) * 0.5;
    out[i] = boom * 1.1 + crashN;
  }
  return out;
}
function riser(durS) {
  const n = Math.round(durS * SR), out = new Float32Array(n);
  let bp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const x = noise(i * 7 + 50000);
    bp += (x - bp) * (0.02 + 0.5 * t * t);              // s'ouvre en montant
    out[i] = bp * t * t * 1.6;
  }
  return out;
}

/* ————— arrangement ————— */
/* progression par mesure (4 temps) : Em, C, G, D */
const ROOTS = [82.41, 65.41, 98.0, 73.42];                       // E2 C2 G2 D2
const CHORDS = [
  [329.63, 392.0, 493.88],    // Em : E4 G4 B4
  [261.63, 329.63, 392.0],    // C  : C4 E4 G4
  [392.0, 493.88, 587.33],    // G  : G4 B4 D5
  [293.66, 369.99, 440.0],    // D  : D4 F#4 A4
];
const LAST = 48;                                                  // dernier temps joué

const kickS = kick(), clapS = clap(), hatC = hat(false), hatO = hat(true);

for (let beat = 0; beat < LAST; beat++) {
  const t = bt(beat);
  const bar = Math.floor(beat / 4) % 4;
  const inGroove = beat >= 4;

  add(t, kickS, beat < 4 ? 0.95 : 1.0);                           // kick chaque temps
  if (inGroove && beat % 2 === 1) add(t, clapS, 0.8);             // clap 2 & 4
  if (inGroove) {
    add(t + bt(0.5), hatC, 0.5, 0.25);                            // hats en contretemps
    if (beat % 4 === 3) add(t + bt(0.75), hatO, 0.4, -0.3);       // open hat fin de mesure
    if (beat >= 32 && beat < 40) {                                // 16ths en double sur le pic
      add(t + bt(0.25), hatC, 0.28, -0.2);
      add(t + bt(0.75), hatC, 0.28, 0.2);
    }
  }
  if (inGroove) {
    const root = ROOTS[bar];
    [0, 0.5, 0.75].forEach((off, k) => {                          // groove de basse
      const oct = k === 2 ? 2 : 1;
      add(t + bt(off), bass(root * oct, bt(k === 0 ? 0.45 : 0.22)), k === 0 ? 0.85 : 0.6);
    });
  }
  if (inGroove) {
    const ch = CHORDS[bar];
    const noteIdx = beat % 4;                                     // arpège de stabs
    add(t + bt(0.5), pluck(ch[noteIdx % 3], bt(0.9)), 0.5, noteIdx % 2 ? 0.35 : -0.35);
    if (beat >= 16) add(t, pluck(ch[(noteIdx + 1) % 3] * 0.5, bt(0.5)), 0.3);
    if (beat >= 32 && beat < 44)                                  // hook aigu sur le pic
      add(t + bt(0.25), pluck(ch[(noteIdx + 2) % 3] * 2, bt(0.4), 1.007), 0.3, noteIdx % 2 ? -0.4 : 0.4);
  }
}

/* impacts + risers aux changements de scène */
[4, 8, 16, 24, 32, 40, 44].forEach((beatN) => add(bt(beatN), impact(), 0.9));
[[6, 8], [14, 16], [22, 24], [30, 32], [38, 40], [42, 44]].forEach(([a, z]) =>
  add(bt(a), riser(bt(z - a)), 0.5));

/* accord final qui résonne */
CHORDS[0].forEach((f, i) => add(bt(44), pluck(f, 3.4, 1.002), 0.4, i % 2 ? 0.3 : -0.3));
add(bt(44), bass(ROOTS[0], 3.0), 0.7);

/* ————— mix : sidechain léger + soft clip + fade out ————— */
const duck = new Float32Array(N).fill(1);
for (let beat = 0; beat < LAST; beat++) {
  const start = Math.round(bt(beat) * SR), len = Math.round(bt(0.42) * SR);
  for (let i = 0; i < len; i++) {
    const j = start + i; if (j >= N) break;
    const g = 0.45 + 0.55 * (i / len);
    if (g < duck[j]) duck[j] = g;
  }
}
const out = Buffer.alloc(44 + N * 4);
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let fade = 1;
  if (t > DUR - 0.8) fade = Math.max(0, (DUR - t) / 0.8);         // fade out final
  if (t < 0.01) fade *= t / 0.01;
  const d = duck[i];
  let l = Math.tanh(L[i] * d * 0.55) * fade;
  let r = Math.tanh(R[i] * d * 0.55) * fade;
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, l)) * 32767), 44 + i * 4);
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, r)) * 32767), 46 + i * 4);
}

/* en-tête WAV */
out.write("RIFF", 0); out.writeUInt32LE(36 + N * 4, 4); out.write("WAVE", 8);
out.write("fmt ", 12); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20);
out.writeUInt16LE(2, 22); out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28);
out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34);
out.write("data", 36); out.writeUInt32LE(N * 4, 40);

const target = process.argv[2] || "music.wav";
writeFileSync(target, out);
console.log(`OK → ${target} (${DUR}s, ${BPM} BPM)`);
