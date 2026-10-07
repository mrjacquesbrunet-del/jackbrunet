/**
 * Liste des fichiers audio de la Berean Standard Bible (narration de Bob
 * Souer, domaine public CC0) sur openbible.com, chapitre par chapitre.
 * Sortie : public/bible/bsb/audio.json  { base, livres: { "1": { "1": "BSB_01_Gen_001.mp3", … } } }
 * S'exécute en CI (réseau disponible).
 */
import fs from "node:fs";

const BASE = "https://openbible.com/audio/souer/";
const r = await fetch(BASE, { headers: { "User-Agent": "Mozilla/5.0" } });
if (!r.ok) throw new Error(`${r.status} sur ${BASE}`);
const html = await r.text();
const livres = {};
let n = 0;
for (const m of html.matchAll(/href="(BSB_(\d{2})_([A-Za-z0-9]+)_(\d{3})\.mp3)"/g)) {
  const livre = String(Number(m[2]));
  const ch = String(Number(m[4]));
  (livres[livre] ??= {})[ch] = m[1];
  n++;
}
console.log(`${n} fichiers, ${Object.keys(livres).length} livres`);
const index = JSON.parse(fs.readFileSync("public/bible/bsb/index.json", "utf8"));
const manquants = [];
for (const b of index) for (let c = 1; c <= b.chapters; c++) if (!livres[b.id]?.[c]) manquants.push(`${b.name} ${c}`);
console.log("chapitres sans audio :", manquants.length, manquants.slice(0, 20).join(", "));
const t = await fetch(BASE + livres["43"]["3"], { method: "HEAD", headers: { "User-Agent": "Mozilla/5.0" } });
console.log("Jean 3 :", t.status, t.headers.get("content-type"), t.headers.get("content-length"), "octets");
fs.writeFileSync("public/bible/bsb/audio.json", JSON.stringify({ base: BASE, narrateur: "Bob Souer", livres }));
