/**
 * Importe une Bible française du domaine public et l'écrit dans public/bible/.
 *
 * - Télécharge le jeu de données (66 livres, ordre protestant canonique).
 * - Écrit un fichier par livre : public/bible/<id>.json  ({ id, name, chapters })
 *   où chapters est un tableau de chapitres, chaque chapitre étant un tableau
 *   de versets (chaînes).
 * - Écrit public/bible/index.json : [{ id, name, chapters: <nombre> }, ...]
 *
 * S'exécute en CI (réseau disponible). Lancement manuel via le workflow.
 */

import fs from "node:fs";

// Louis Segond 1910 (domaine public) via l'API getBible v2.
const SOURCE = "https://api.getbible.net/v2/segond.json";

// Noms français canoniques (ordre protestant, 66 livres), appliqués par position.
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

const res = await fetch(SOURCE);
if (!res.ok) {
  console.error("[bible] Téléchargement échoué:", res.status);
  process.exit(1);
}
const data = await res.json();

// getBible v2 : { books: [ { nr, name, chapters: [ { chapter, verses: [ { verse, text } ] } ] } ] }
const books = data.books ?? [];
if (!Array.isArray(books) || books.length < 60) {
  console.error("[bible] Format inattendu (livres:", books?.length, ")");
  process.exit(1);
}

fs.mkdirSync("public/bible", { recursive: true });

const index = [];
books.forEach((book, i) => {
  const id = book.nr ?? i + 1;
  const name = book.name?.trim() || NAMES[i] || `Livre ${id}`;
  const chapters = (book.chapters ?? []).map((ch) =>
    (ch.verses ?? []).map((v) => (v.text ?? "").trim()),
  );
  fs.writeFileSync(
    `public/bible/${id}.json`,
    JSON.stringify({ id, name, chapters }),
  );
  index.push({ id, name, chapters: chapters.length });
});

fs.writeFileSync(
  "public/bible/index.json",
  JSON.stringify(index, null, 2) + "\n",
);

// Vérification rapide : Jean 3:16
const jean = JSON.parse(fs.readFileSync("public/bible/43.json", "utf8"));
console.log("[bible] Livres importés:", index.length);
console.log("[bible] Jean — chapitres:", jean.chapters.length);
console.log("[bible] Jean 3:16 =>", jean.chapters?.[2]?.[15]);
