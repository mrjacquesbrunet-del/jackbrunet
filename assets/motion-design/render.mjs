/**
 * Rendu d'un motion design HTML en MP4.
 *
 * Ouvre la page dans Chromium (Playwright), fige la timeline frame par frame
 * (window.SEEK), capture chaque image puis encode en H.264 (+ piste audio
 * optionnelle mixée en AAC).
 *
 * Usage :
 *   node render.mjs                                  # vidéo 16:9 par défaut
 *   node render.mjs --page jackbrunet-motion-vertical.html \
 *                   --width 1080 --height 1920 --audio music.wav --out v.mp4
 * Options : --fps 30, --workdir /tmp (dossier des frames), --ffmpeg /chemin
 * Dépendances : playwright-core, ffmpeg avec libx264 (ex. @ffmpeg-installer/ffmpeg),
 * Chromium (variable CHROMIUM_PATH ou installation Playwright).
 */
import { chromium } from "playwright-core";
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const argv = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : dflt;
};

const here = path.dirname(fileURLToPath(import.meta.url));
const PAGE = path.resolve(here, opt("page", "jackbrunet-motion.html"));
const W = Number(opt("width", "1920"));
const H = Number(opt("height", "1080"));
const FPS = Number(opt("fps", "30"));
const AUDIO = opt("audio", null);
const OUT = path.resolve(opt("out", path.basename(PAGE, ".html") + `-${H}p.mp4`));
const FFMPEG = opt("ffmpeg", process.env.FFMPEG_PATH || "ffmpeg");
const EXECUTABLE = process.env.CHROMIUM_PATH || undefined;
const framesDir = path.join(path.resolve(opt("workdir", here)), "frames");

rmSync(framesDir, { recursive: true, force: true });
mkdirSync(framesDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: EXECUTABLE,
  args: ["--force-device-scale-factor=1", "--hide-scrollbars"],
});
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto("file://" + PAGE);
await page.evaluate(() => window.READY);           // polices chargées
const totalMs = await page.evaluate(() => window.TOTAL_MS);
const frames = Math.round((totalMs / 1000) * FPS);
console.log(`Rendu de ${frames} frames ${W}x${H} à ${FPS} fps (${totalMs / 1000}s)…`);

for (let f = 0; f < frames; f++) {
  await page.evaluate((ms) => window.SEEK(ms), (f * 1000) / FPS);
  await page.screenshot({
    path: path.join(framesDir, `f${String(f).padStart(4, "0")}.png`),
    clip: { x: 0, y: 0, width: W, height: H },
  });
  if (f % 100 === 0) console.log(`  frame ${f}/${frames}`);
}
await browser.close();

console.log("Encodage H.264…");
const args = ["-y", "-framerate", String(FPS), "-i", path.join(framesDir, "f%04d.png")];
if (AUDIO) args.push("-i", path.resolve(AUDIO));
args.push("-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p");
if (AUDIO) args.push("-c:a", "aac", "-b:a", "192k", "-shortest");
args.push("-movflags", "+faststart", OUT);
const enc = spawnSync(FFMPEG, args, { stdio: "inherit" });
if (enc.status !== 0) process.exit(enc.status ?? 1);
rmSync(framesDir, { recursive: true, force: true });
console.log(`OK → ${OUT}`);
