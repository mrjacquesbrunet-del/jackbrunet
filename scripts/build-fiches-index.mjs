/**
 * Construit l'index « Personnages & Lieux » de la Bible.
 *
 * Croise le dictionnaire rédigé à la main (content/bible-fiches.json) avec le
 * texte LSG (public/bible/<id>.json) et produit public/bible/fiches.json :
 *   - fiches      : { id: { nom, type, bio, periode?, passages } }
 *   - chapitres   : { "<livre>-<chapitre>": [ids…] } (ordre d'apparition)
 *   - apparitions : { id: ["<livre>-<chapitre>", …] } (ordre biblique)
 *
 * Correspondance par mot entier (lettres françaises), sensible aux accents —
 * ce qui distingue naturellement Saül (roi) de Saul (Paul). Les matchers
 * peuvent restreindre par livres (l: [min, max]) et chapitres (c: [min, max])
 * pour lever les homonymies (les deux Joseph, Marie…).
 *
 * Usage : node scripts/build-fiches-index.mjs   (depuis la racine du dépôt)
 */
import { readFileSync, writeFileSync } from "node:fs";

const dict = JSON.parse(readFileSync("content/bible-fiches.json", "utf8"));

const entries = [
  ...dict.personnages.map((p) => ({ ...p, type: "personnage" })),
  ...dict.lieux.map((p) => ({ ...p, type: "lieu" })),
];

// Un motif « mot entier » par variante (le tiret fait partie du mot pour
// couvrir « Jean-Baptiste » sans que « Jean » n'y morde).
const WORD = "[A-Za-zÀ-ÖØ-öø-ÿ-]";
function patternFor(variant) {
  const esc = variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<!${WORD})${esc}(?!${WORD})`);
}

const matchers = [];
for (const e of entries) {
  for (const m of e.match) {
    matchers.push({
      id: e.id,
      re: patternFor(m.v),
      livres: m.l ?? null,
      chapitres: m.c ?? null,
    });
  }
}

const chapitres = {};
const apparitions = {};
let totalMentions = 0;

for (let livre = 1; livre <= 66; livre++) {
  const book = JSON.parse(readFileSync(`public/bible/${livre}.json`, "utf8"));
  book.chapters.forEach((verses, ci) => {
    const chap = ci + 1;
    const text = verses.join("\n");
    const ids = [];
    for (const m of matchers) {
      if (m.livres && (livre < m.livres[0] || livre > m.livres[1])) continue;
      if (m.chapitres && (chap < m.chapitres[0] || chap > m.chapitres[1])) continue;
      if (ids.includes(m.id)) continue;
      if (m.re.test(text)) ids.push(m.id);
    }
    if (ids.length) {
      // Ordre stable : personnages d'abord, puis lieux, alphabétique dans
      // chaque groupe (comme l'affichage).
      const key = `${livre}-${chap}`;
      chapitres[key] = ids;
      for (const id of ids) (apparitions[id] ??= []).push(key);
      totalMentions += ids.length;
    }
  });
}

const fiches = {};
for (const e of entries) {
  fiches[e.id] = {
    nom: e.nom,
    type: e.type,
    bio: e.bio,
    ...(e.periode ? { periode: e.periode } : {}),
    passages: e.passages,
    // Enrichissements façon encyclopédie : liens familiaux/spirituels entre
    // fiches, et récit long truffé de références bibliques cliquables.
    ...(e.relations?.length ? { relations: e.relations } : {}),
    ...(e.histoire ? { histoire: e.histoire } : {}),
    // Variantes de nom (avec bornes livre/chapitre) : permettent au client de
    // retrouver les figures mentionnées DANS UN VERSET précis.
    m: e.match,
    // Bible d'étude : coordonnées (lieux, carte stylisée), parcours
    // chronologique et chronologie des écrits (grandes figures).
    ...(e.geo ? { geo: e.geo } : {}),
    ...(e.parcours?.length ? { parcours: e.parcours } : {}),
    ...(e.ecrits?.length ? { ecrits: e.ecrits } : {}),
  };
}

const out = { fiches, chapitres, apparitions };
writeFileSync("public/bible/fiches.json", JSON.stringify(out));

const kb = Math.round(JSON.stringify(out).length / 1024);
console.log(
  `fiches.json écrit : ${entries.length} fiches, ${Object.keys(chapitres).length} chapitres couverts, ${totalMentions} mentions, ${kb} Ko`,
);
// Aperçu de contrôle : Actes 15 et Genèse 37.
console.log("Actes 15 :", (chapitres["44-15"] ?? []).join(", "));
console.log("Genèse 37 :", (chapitres["1-37"] ?? []).join(", "));
