/**
 * Audios FRANÇAIS de plans importés depuis Magnific (dossier public/audio/plans-fr) :
 * on les range avec les autres audios français (public/audio/plan-<slug>-<jour>.mp3)
 * et on les déclare dans content/audio.generated.json, comme ceux produits par
 * scripts/generate-audio.mjs (même empreinte de texte : pas de régénération).
 */
import fs from "node:fs";
import crypto from "node:crypto";
import { texteAudioJour, planApprofondi } from "../plans/texte-audio.mjs";

const DOSSIER = "public/audio/plans-fr";
if (!fs.existsSync(DOSSIER)) process.exit(0);
const sha = (t) => crypto.createHash("sha1").update(t).digest("hex").slice(0, 12);
const manifest = JSON.parse(fs.readFileSync("content/audio.generated.json", "utf8"));
const plans = JSON.parse(fs.readFileSync("content/plans.json", "utf8")).items;
let n = 0;
for (const f of fs.readdirSync(DOSSIER).filter((x) => x.endsWith(".mp3"))) {
  const p = plans.find((x) => f.startsWith(`plan-${x.slug}-`) && /^\d+$/.test(f.slice(`plan-${x.slug}-`.length, -4)));
  if (!p) {
    console.log("ignoré :", f);
    continue;
  }
  const day = Number(f.slice(`plan-${p.slug}-`.length, -4));
  const d = p.days.find((x) => x.day === day);
  if (!d) continue;
  const texte = planApprofondi(p) ? texteAudioJour(d, "fr") : `Jour ${d.day}. ${d.title}.\n\n${d.meditation}`;
  fs.renameSync(`${DOSSIER}/${f}`, `public/audio/${f}`);
  (manifest.plans[p.slug] ??= {})[day] = `/audio/${f}`;
  manifest.planHashes[`${p.slug}:${day}`] = sha(texte);
  n++;
}
fs.rmSync(DOSSIER, { recursive: true, force: true });
fs.writeFileSync("content/audio.generated.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`${n} audio(s) français de plans intégrés.`);
