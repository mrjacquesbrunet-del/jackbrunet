/**
 * Importe la Bible Louis Segond (domaine public) via l'API getBible v2,
 * et l'écrit dans public/bible/ (un fichier par livre + index.json).
 * S'exécute en CI (réseau disponible).
 */

import fs from "node:fs";

const NAMES = [
  "Genèse", "Exode", "Lévitique", "Nombres", "Deutéronome",
  "Josué", "Juges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Rois", "2 Rois", "1 Chroniques", "2 Chroniques", "Esdras",
  "Néhémie", "Esther", "Job", "Psaumes", "Proverbes",
  "Ecclésiaste", "Cantique des cantiques", "Ésaïe", "Jérémie", "Lamentations",
  "Ézéchiel", "Daniel", "Osée", "Joël", "Amos",
  "Abdias", "Jonas", "Michée", "Nahum", "Habacuc",
  "Sophonie", "Aggée", "Zacharie", "Malachie", "Matthieu",
  "Marc", "Luc", "Jean", "Actes", "Romains",
  "1 Corinthiens", "2 Corinthiens", "Galates", "Éphésiens", "Philippiens",
  "Colossiens", "1 Thessaloniciens", "2 Thessaloniciens", "1 Timothée", "2 Timothée",
  "Tite", "Philémon", "Hébreux", "Jacques", "1 Pierre",
  "2 Pierre", "1 Jean", "2 Jean", "3 Jean", "Jude",
  "Apocalypse",
];

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} sur ${url}`);
  return r.json();
}

// 1) Découvrir l'abréviation de la Louis Segond (française).
const translations = await getJSON("https://api.getbible.net/v2/translations.json");
let abbrev = null;
let label = null;
for (const [key, t] of Object.entries(translations)) {
  const name = String(t.translation || t.name || "").toLowerCase();
  const lang = String(t.language || t.lang || "").toLowerCase();
  if (lang.includes("french") && name.includes("segond")) {
    abbrev = t.abbreviation || key;
    label = t.translation || key;
    break;
  }
}
if (!abbrev) {
  for (const [key, t] of Object.entries(translations)) {
    const lang = String(t.language || t.lang || "").toLowerCase();
    if (lang.includes("french")) {
      abbrev = t.abbreviation || key;
      label = t.translation || key;
      break;
    }
  }
}
if (!abbrev) throw new Error("Aucune traduction française trouvée.");
console.log(`[bible] Traduction choisie: ${label} (${abbrev})`);

// 2) Récupérer chaque livre (1..66) et écrire les fichiers.
fs.mkdirSync("public/bible", { recursive: true });
const index = [];

for (let n = 1; n <= 66; n++) {
  const b = await getJSON(`https://api.getbible.net/v2/${abbrev}/${n}.json`);
  const name = String(b.book_name || NAMES[n - 1] || `Livre ${n}`).trim();
  const chaptersRaw = b.book || b.chapters || [];
  const chapters = chaptersRaw.map((ch) =>
    (ch.verses || []).map((v) => String(v.text || "").trim()),
  );
  fs.writeFileSync(
    `public/bible/${n}.json`,
    JSON.stringify({ id: n, name, chapters }),
  );
  index.push({ id: n, name, chapters: chapters.length });
}

fs.writeFileSync(
  "public/bible/index.json",
  JSON.stringify(index, null, 2) + "\n",
);

const jean = JSON.parse(fs.readFileSync("public/bible/43.json", "utf8"));
console.log("[bible] Livres:", index.length, "| Jean chap:", jean.chapters.length);
console.log("[bible] Jean 3:16 =>", jean.chapters?.[2]?.[15]);
