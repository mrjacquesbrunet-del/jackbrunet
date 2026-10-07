/**
 * Importe une Bible libre de droits depuis eBible.org (format VPL : une ligne
 * par verset « GEN 1:1 texte ») et l'écrit dans public/bible/<dossier>/
 * (un fichier par livre + index.json), au même format que la Louis Segond.
 *
 *   node scripts/fetch-bible-version.mjs <id eBible> <dossier> <langue>
 *   ex. engbsb bsb en   ·   porbr2018 blivre pt
 * S'exécute en CI (réseau disponible).
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const [id, dossier, langue] = process.argv.slice(2);
if (!id || !dossier || !langue) throw new Error("usage : <id> <dossier> <en|pt>");

const CODES = ("GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM " +
  "EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH " +
  "1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV").split(" ");
const NOMS = {
  en: ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
    "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
    "Ecclesiastes", "Song of Songs", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
    "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew",
    "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians",
    "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter",
    "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"],
  pt: ["Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel",
    "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias", "Ester", "Jó", "Salmos", "Provérbios",
    "Eclesiastes", "Cânticos", "Isaías", "Jeremias", "Lamentações", "Ezequiel", "Daniel", "Oseias", "Joel", "Amós",
    "Obadias", "Jonas", "Miqueias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias", "Mateus",
    "Marcos", "Lucas", "João", "Atos", "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios", "Filipenses",
    "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro",
    "2 Pedro", "1 João", "2 João", "3 João", "Judas", "Apocalipse"],
}[langue];

const tmp = fs.mkdtempSync("/tmp/bible-");
execSync(`curl -fsSL -A "Mozilla/5.0" -o ${tmp}/b.zip https://ebible.org/Scriptures/${id}_vpl.zip`, { stdio: "inherit" });
execSync(`unzip -o -q ${tmp}/b.zip -d ${tmp}/x`, { stdio: "inherit" });
const txt = execSync(`find ${tmp}/x -type f -name "*.txt"`, { encoding: "utf8" }).trim().split("\n").filter(Boolean);
console.log("fichiers :", txt.map((f) => path.basename(f)).join(", "));

// livre → chapitre → verset
const livres = new Map();
let lignes = 0;
const inconnus = new Map();
const exemples = [];
for (const f of txt) {
  for (const ligne of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = ligne.match(/^([1-4A-Z]{3}) (\d+):(\d+)\s+(.*)$/);
    if (!m) {
      if (ligne.trim() && exemples.length < 8) exemples.push(ligne.slice(0, 100));
      continue;
    }
    const n = CODES.indexOf(m[1]);
    if (n < 0) {
      inconnus.set(m[1], (inconnus.get(m[1]) ?? 0) + 1);
      continue; // livres deutérocanoniques éventuels
    }
    const ch = Number(m[2]);
    const v = Number(m[3]);
    const texte = m[4].replace(/\s+/g, " ").trim();
    if (!livres.has(n)) livres.set(n, []);
    const chapitres = livres.get(n);
    while (chapitres.length < ch) chapitres.push([]);
    const versets = chapitres[ch - 1];
    while (versets.length < v - 1) versets.push("");
    versets[v - 1] = texte;
    lignes++;
  }
}
console.log(`${lignes} versets, ${livres.size} livres`);
console.log("codes inconnus :", [...inconnus].map(([c, n]) => `${c}×${n}`).join(" "));
console.log("lignes non reconnues (exemples) :", exemples);
console.log("livres manquants :", CODES.filter((_, i) => !livres.has(i)).join(" "));
if (livres.size !== 66) throw new Error(`66 livres attendus, ${livres.size} trouvés`);

const sortie = `public/bible/${dossier}`;
fs.mkdirSync(sortie, { recursive: true });
const index = [];
for (let n = 0; n < 66; n++) {
  const chapters = livres.get(n);
  fs.writeFileSync(`${sortie}/${n + 1}.json`, JSON.stringify({ id: n + 1, name: NOMS[n], chapters }));
  index.push({ id: n + 1, name: NOMS[n], chapters: chapters.length });
}
fs.writeFileSync(`${sortie}/index.json`, JSON.stringify(index, null, 2) + "\n");
const jn = livres.get(42);
console.log("Jean 3:16 →", jn[2][15]);
console.log("Psaume 23:1 →", livres.get(18)[22][0]);
