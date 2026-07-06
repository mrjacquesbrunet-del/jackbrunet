/**
 * Musique du motion design vertical — synthèse déterministe, 126 BPM, ~36,5 s.
 * Style « punchy » : kick 4/4, claps, hi-hats en contretemps, basse groovy,
 * stabs de synthé — la rythmique porte les cuts, et chaque section apporte
 * un changement (arrivée des hats, doubles croches, hook aigu, break…).
 * Même grille que jackbrunet-motion-vertical.html : impacts aux temps
 * 5, 10, 20, 27, 36, 43 et 57 (débuts de scène).
 *
 * Usage : node music.mjs [sortie.wav]
 */
import { writeFileSync } from "node:fs";

const SR = 44100, BPM = 126, BEAT = 60 / BPM, DUR = 36.5;
const N = Math.round(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);

let seed = 20260706;
const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296 * 2 - 1;
const noiseBuf = new Float32Array(SR * 2);
for (let i = 0; i < noiseBuf.length; i++) noiseBuf[i] = rnd();
const noise = (i) => noiseBuf[i % noiseBuf.length];

const bt = (n) => n * BEAT;
const add = (t, samples, gain = 1, pan = 0) => {
  const start = Math.round(t * SR);
  const gl = gain * Math.min(1, 1 - pan), gr = gain * Math.min(1, 1 + pan);
  for (let i = 0; i < samples.length; i++) {
    const j = start + i;
    if (j < 0 || j >= N) continue;
    L[j] += samples[i] * gl; R[j] += samples[i] * gr;
  }
};

/* ————— instruments (style v1, punchy) ————— */
function kick() {
  const d = 0.30, n = Math.round(d * SR), out = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 42 + 90 * Math.exp(-t * 38);
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
    bp += (x - bp) * 0.28; bp2 += (bp - bp2) * 0.28;
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
    hp = x - hp * 0.02;
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
    lp += (x - lp) * 0.10;
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
    lp += (x - lp) * (0.12 + 0.3 * Math.exp(-t * 8));
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
    out[i] = boom * 1.1 + (x - lp) * Math.exp(-t * 3.2) * 0.5;
  }
  return out;
}
function riser(durS) {
  const n = Math.round(durS * SR), out = new Float32Array(n);
  let bp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const x = noise(i * 7 + 50000);
    bp += (x - bp) * (0.02 + 0.5 * t * t);
    out[i] = bp * t * t * 1.6;
  }
  return out;
}

/* ————— arrangement : groove permanent, une variation par scène ————— */
const ROOTS = [82.41, 65.41, 98.0, 73.42];                       // E2 C2 G2 D2
const CHORDS = [
  [329.63, 392.0, 493.88],    // Em
  [261.63, 329.63, 392.0],    // C
  [392.0, 493.88, 587.33],    // G
  [293.66, 369.99, 440.0],    // D
];
const SECTIONS = [5, 10, 20, 27, 36, 43, 57];
const LAST = 70;                                                  // dernier temps joué

const kickS = kick(), clapS = clap(), hatC = hat(false), hatO = hat(true);

for (let beat = 0; beat < LAST; beat++) {
  const t = bt(beat);
  const bar = Math.floor(beat / 4) % 4;

  /* kick 4/4 en continu : les slams du cold open tombent dessus */
  add(t, kickS, beat < 5 ? 0.95 : 1.0);

  if (beat >= 5) {
    if (beat % 2 === 1) add(t, clapS, 0.8);                       // clap 2 & 4
    add(t + bt(0.5), hatC, 0.5, 0.25);                            // hats contretemps
    if (beat % 4 === 3) add(t + bt(0.75), hatO, 0.4, -0.3);       // open hat fin de mesure
  }
  /* dès la scène téléphone (b10) : la basse groove entre */
  if (beat >= 10) {
    const root = ROOTS[bar];
    [0, 0.5, 0.75].forEach((off, k) => {
      const oct = k === 2 ? 2 : 1;
      add(t + bt(off), bass(root * oct, bt(k === 0 ? 0.45 : 0.22)), k === 0 ? 0.85 : 0.6);
    });
  }
  /* dès la pensée du jour (b20) : stabs en contretemps */
  if (beat >= 20) {
    const ch = CHORDS[bar];
    const noteIdx = beat % 4;
    add(t + bt(0.5), pluck(ch[noteIdx % 3], bt(0.9)), 0.5, noteIdx % 2 ? 0.35 : -0.35);
  }
  /* dès le verset (b27) : nappe basse de stabs à l'octave inférieure */
  if (beat >= 27 && beat < 57) {
    const ch = CHORDS[bar];
    add(t, pluck(ch[(beat + 1) % 3] * 0.5, bt(0.5)), 0.3);
  }
  /* contenus (b36-43) : hats en doubles croches, ça pousse */
  if (beat >= 36 && beat < 43) {
    add(t + bt(0.25), hatC, 0.28, -0.2);
    add(t + bt(0.75), hatC, 0.28, 0.2);
  }
  /* réseau de prière (b43-57) : hook aigu par-dessus le groove */
  if (beat >= 43 && beat < 57) {
    const ch = CHORDS[bar];
    add(t + bt(0.25), pluck(ch[(beat + 2) % 3] * 2, bt(0.4), 1.007), 0.32, beat % 2 ? -0.4 : 0.4);
    add(t + bt(0.25), hatC, 0.26, -0.2);
    add(t + bt(0.75), hatC, 0.26, 0.2);
  }
  /* outro stores (b57+) : groove complet + hook, plein régime */
  if (beat >= 57) {
    const ch = CHORDS[bar];
    add(t + bt(0.25), hatC, 0.28, -0.2);
    add(t + bt(0.75), hatC, 0.28, 0.2);
    add(t + bt(0.5), pluck(ch[(beat + 2) % 3] * 2, bt(0.4), 1.007), 0.3, beat % 2 ? -0.4 : 0.4);
  }
}

/* impacts + risers aux changements de scène */
SECTIONS.forEach((beatN) => add(bt(beatN), impact(), 0.9));
[[8, 10], [18, 20], [25, 27], [34, 36], [41, 43], [55, 57]].forEach(([a, z]) =>
  add(bt(a), riser(bt(z - a)), 0.5));

/* accord final qui résonne */
CHORDS[0].forEach((f, i) => add(bt(LAST), pluck(f, 3.2, 1.002), 0.4, i % 2 ? 0.3 : -0.3));
add(bt(LAST), bass(ROOTS[0], 2.8), 0.7);
add(bt(LAST), impact(), 0.85);

/* ————— mix : sidechain + soft clip + fades ————— */
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
  if (t < 0.01) fade = t / 0.01;
  if (t > DUR - 1.2) fade = Math.max(0, (DUR - t) / 1.2);
  const d = duck[i];
  const l = Math.tanh(L[i] * d * 0.55) * fade;
  const r = Math.tanh(R[i] * d * 0.55) * fade;
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
console.log(`OK → ${target} (${DUR}s, ${BPM} BPM, punchy)`);
