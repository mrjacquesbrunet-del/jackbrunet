/**
 * Transforme une référence texte (« Jean 8.31-47 », « 1 Corinthiens 13 »,
 * « Psaumes 23 ») en lien profond vers le lecteur biblique
 * (`/bible?livre=ID&chap=N`). Le lecteur mappe l'id 1–66 (ordre protestant)
 * vers le bon livre.
 */

/** Nom de livre (sans accents, minuscule) → id 1–66. */
const BOOKS: [string, number][] = [
  ["genese", 1], ["exode", 2], ["levitique", 3], ["nombres", 4], ["deuteronome", 5],
  ["josue", 6], ["juges", 7], ["ruth", 8],
  ["1 samuel", 9], ["2 samuel", 10], ["1 rois", 11], ["2 rois", 12],
  ["1 chroniques", 13], ["2 chroniques", 14], ["esdras", 15], ["nehemie", 16],
  ["esther", 17], ["job", 18], ["psaumes", 19], ["psaume", 19], ["proverbes", 20],
  ["ecclesiaste", 21], ["cantique des cantiques", 22], ["cantiques", 22], ["cantique", 22],
  ["esaie", 23], ["isaie", 23], ["jeremie", 24], ["lamentations", 25], ["ezechiel", 26],
  ["daniel", 27], ["osee", 28], ["joel", 29], ["amos", 30], ["abdias", 31], ["jonas", 32],
  ["michee", 33], ["nahum", 34], ["habacuc", 35], ["sophonie", 36], ["aggee", 37],
  ["zacharie", 38], ["malachie", 39],
  ["matthieu", 40], ["marc", 41], ["luc", 42], ["jean", 43], ["actes", 44],
  ["romains", 45], ["1 corinthiens", 46], ["2 corinthiens", 47], ["galates", 48],
  ["ephesiens", 49], ["philippiens", 50], ["colossiens", 51],
  ["1 thessaloniciens", 52], ["2 thessaloniciens", 53], ["1 timothee", 54], ["2 timothee", 55],
  ["tite", 56], ["philemon", 57], ["hebreux", 58], ["jacques", 59],
  ["1 pierre", 60], ["2 pierre", 61], ["1 jean", 62], ["2 jean", 63], ["3 jean", 64],
  ["jude", 65], ["apocalypse", 66],
];
const BOOK_ID = new Map(BOOKS);

function normalize(s: string): string {
  return s
.toLowerCase()
.normalize("NFD")
.replace(/[̀-ͯ]/g, "") // retire les accents
.replace(/\s+/g, " ")
.trim();
}

/**
 * Renvoie `/bible?livre=ID&chap=N` pour une référence, ou null si non reconnue.
 */
export function bibleHref(reference?: string): string | null {
  if (!reference) return null;
  // Prend la première référence si plusieurs (« Jean 8 · Jean 9 »).
  const first = reference.split(/[·,;]/)[0]?? reference;
  // Capture le nom (lettres + éventuel préfixe numérique) puis le chapitre.
  const m = normalize(first).match(/^([1-3]?\s?[a-z][a-z\s]*?)\s+(\d+)/);
  if (!m) return null;
  const name = m[1].trim();
  const chap = Number(m[2]);
  const id = BOOK_ID.get(name);
  if (!id ||!chap) return null;
  return `/bible?livre=${id}&chap=${chap}`;
}
