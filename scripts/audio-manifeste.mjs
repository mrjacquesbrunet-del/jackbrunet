/**
 * Liste des fichiers audio d'une Bible, chapitre par chapitre, à partir d'un
 * répertoire web (noms du type …_43_…_003.mp3 ou …43…003.mp3).
 *   node scripts/audio-manifeste.mjs <url du répertoire> <dossier>
 * Sortie : public/bible/<dossier>/audio.json  { base, livres: { "43": { "3": "fichier.mp3" } } }
 */
import fs from "node:fs";

const [BASE, dossier] = process.argv.slice(2);
const r = await fetch(BASE, { headers: { "User-Agent": "Mozilla/5.0" } });
if (!r.ok) throw new Error(`${r.status} sur ${BASE}`);
const html = await r.text();
const livres = {};
let n = 0;
for (const m of html.matchAll(/href="([^"?/]*?(\d{2})[_ -]?[A-Za-z0-9]*?[_ -](\d{2,3})\.mp3)"/gi)) {
  const livre = Number(m[2]);
  const ch = Number(m[3]);
  if (livre < 1 || livre > 66 || ch < 1) continue;
  (livres[livre] ??= {})[ch] = decodeURIComponent(m[1]);
  n++;
}
console.log(`${n} fichiers, ${Object.keys(livres).length} livres`, JSON.stringify(livres["43"]?.["3"]));
const index = JSON.parse(fs.readFileSync(`public/bible/${dossier}/index.json`, "utf8"));
const manquants = [];
for (const b of index) for (let c = 1; c <= b.chapters; c++) if (!livres[b.id]?.[c]) manquants.push(`${b.name} ${c}`);
console.log("chapitres sans audio :", manquants.length, manquants.slice(0, 15).join(", "));
if (n < 1000) throw new Error("liste incomplète : format de noms à revoir");
fs.writeFileSync(`public/bible/${dossier}/audio.json`, JSON.stringify({ base: BASE, livres }));
