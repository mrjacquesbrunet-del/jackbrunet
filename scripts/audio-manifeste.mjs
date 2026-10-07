/**
 * Liste des fichiers audio d'une Bible, chapitre par chapitre, à partir d'un
 * répertoire web (noms du type …_43_…_003.mp3 ou …43…003.mp3).
 *   node scripts/audio-manifeste.mjs <url du répertoire> <dossier>
 * Sortie : public/bible/<dossier>/audio.json  { base, livres: { "43": { "3": "fichier.mp3" } } }
 */
import fs from "node:fs";

const [BASE, dossier] = process.argv.slice(2);
const lire = async (u) => {
  const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error(`${r.status} sur ${u}`);
  return r.text();
};
const livres = {};
let n = 0;
const relever = (html, prefixe, livreDossier) => {
  for (const m of html.matchAll(/href="([^"?/]+\.mp3)"/gi)) {
    const nom = decodeURIComponent(m[1]);
    // « KJV_43_Jhn_003.mp3 » ; ou, dans un dossier de livre, le dernier nombre = chapitre.
    let livre = livreDossier;
    let ch;
    const a = nom.match(/(\d{2})[_ -]?[A-Za-z0-9]*?[_ -](\d{2,3})\.mp3$/i);
    if (!livre && a) {
      livre = Number(a[1]);
      ch = Number(a[2]);
    } else {
      const nums = nom.match(/\d+/g);
      ch = nums ? Number(nums[nums.length - 1]) : 0;
      // Livre à un seul chapitre (« Jude.mp3 », « 65_Jude.mp3 ») : chapitre 1.
      if (!nums || (nums.length === 1 && /^\d{2}_/.test(nom))) ch = 1;
    }
    if (!livre || livre < 1 || livre > 66 || !ch) continue;
    (livres[livre] ??= {})[ch] = prefixe + m[1];
    n++;
  }
};
const racine = await lire(BASE);
const dossiers = [...racine.matchAll(/href="((\d{2})_[^"/]+\/)"/g)];
if (dossiers.length) {
  // Un dossier par livre (« 01_Genesis/ ») : on les parcourt tous.
  for (const d of dossiers) relever(await lire(BASE + d[1]), d[1], Number(d[2]));
} else relever(racine, "", 0);
console.log("exemples :", JSON.stringify(livres["1"]?.["1"]), JSON.stringify(livres["65"]), JSON.stringify(livres["19"]?.["23"]));
console.log(`${n} fichiers, ${Object.keys(livres).length} livres`, JSON.stringify(livres["43"]?.["3"]));
const index = JSON.parse(fs.readFileSync(`public/bible/${dossier}/index.json`, "utf8"));
const manquants = [];
for (const b of index) for (let c = 1; c <= b.chapters; c++) if (!livres[b.id]?.[c]) manquants.push(`${b.name} ${c}`);
console.log("chapitres sans audio :", manquants.length, manquants.slice(0, 15).join(", "));
if (n < 1000) throw new Error("liste incomplète : format de noms à revoir");
fs.writeFileSync(`public/bible/${dossier}/audio.json`, JSON.stringify({ base: BASE, livres }));
