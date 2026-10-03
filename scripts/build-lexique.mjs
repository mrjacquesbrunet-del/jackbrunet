/**
 * LEXIQUE GREC / HÉBREU — fichiers servis par le site (public/lexique).
 *
 *   content/lexique/source/<t>.json  (STEPBible CC BY + Segond)  ┐
 *   content/lexique/fr/<t>.json      (définitions françaises)     ├→ public/lexique/index.json
 *   public/lexique/conc/<t>.json     (concordance, déjà construite)┘   public/lexique/mots/<t>.json
 *
 * index.json : [[code, mot, translit, vedette, emplois, langue]] — langue g/h/a
 *   (a = araméen), avec « n » ajouté pour les noms propres (gn, hn, an).
 * Ces fichiers sont servis EN LIGNE (mediaUrl) : retirés du bundle de l'app.
 *
 * Usage : node scripts/build-lexique.mjs
 */
import fs from "node:fs";
import path from "node:path";

const SRC = "content/lexique/source";
const FR = "content/lexique/fr";
const CLAUDE = "content/lexique/claude"; // fiches approfondies (prioritaires)
const OUT = "public/lexique";

const tranches = fs.readdirSync(SRC).map((f) => f.replace(".json", "")).sort();
const index = [];
let traduits = 0;
let total = 0;
fs.mkdirSync(path.join(OUT, "mots"), { recursive: true });

for (const t of tranches) {
  const source = JSON.parse(fs.readFileSync(path.join(SRC, `${t}.json`), "utf8"));
  const lire = (dir) => (fs.existsSync(path.join(dir, `${t}.json`)) ? JSON.parse(fs.readFileSync(path.join(dir, `${t}.json`), "utf8")) : {});
  const fr = { ...lire(FR), ...lire(CLAUDE) };
  const mots = {};
  for (const [code, e] of Object.entries(source)) {
    total++;
    const f = fr[code];
    if (f) traduits++;
    // Repli tant que la définition n'est pas traduite : la traduction la
    // plus fréquente dans la Segond.
    let vedette = f?.fr || e.trad[0]?.[0] || e.gloss;
    if (e.nom && !f) vedette = vedette.charAt(0).toUpperCase() + vedette.slice(1);
    const langue = e.morph.startsWith("A:") ? "a" : code[0] === "G" ? "g" : "h";
    index.push([code, e.lemme, e.translit, vedette, e.nb, langue + (e.nom ? "n" : "")]);
    mots[code] = {
      mot: e.lemme,
      translit: e.translit,
      pron: e.pron || undefined,
      nature: e.morph,
      fr: vedette,
      sens: f?.sens ?? [],
      detail: f?.detail || undefined,
      origine: f?.origine || undefined,
      emploi: f?.emploi || undefined,
      portee: f?.portee || undefined,
      versets: f?.versets?.length ? f.versets : undefined,
      trad: e.trad,
      de: e.de.length ? e.de : undefined,
      derives: e.derives.length ? e.derives : undefined,
      nb: e.nb,
    };
  }
  fs.writeFileSync(path.join(OUT, "mots", `${t}.json`), JSON.stringify(mots));
}

// Par verset : les mots pleins (noms, verbes, adjectifs, adverbes, noms
// propres) avec le mot français qui les traduit → /lexique/versets/<livre>.json
// { "c:v": [[code, début, fin], …] } dans l'ordre du texte français.
const nature = new Map(index.map((e) => [e[0], null]));
for (const t of tranches) {
  const source = JSON.parse(fs.readFileSync(path.join(SRC, `${t}.json`), "utf8"));
  for (const [code, e] of Object.entries(source)) nature.set(code, e.morph);
}
const plein = (m) => m && (m.startsWith("N:") || /^[GHA]:(N|V|A|ADV|Adv)/.test(m));
const parLivre = {};
for (const f of fs.readdirSync(path.join(OUT, "conc"))) {
  const conc = JSON.parse(fs.readFileSync(path.join(OUT, "conc", f), "utf8"));
  for (const [code, emplois] of Object.entries(conc)) {
    if (!plein(nature.get(code))) continue;
    for (const e of emplois) {
      const [b, c, v] = e;
      const k = `${c}:${v}`;
      ((parLivre[b] ??= {})[k] ??= []).push(e.length > 5 ? [code, e[4], e[5]] : [code]);
    }
  }
}
fs.mkdirSync(path.join(OUT, "versets"), { recursive: true });
for (const [b, versets] of Object.entries(parLivre)) {
  for (const l of Object.values(versets)) l.sort((x, y) => (x[1] ?? 1e9) - (y[1] ?? 1e9));
  fs.writeFileSync(path.join(OUT, "versets", `${b}.json`), JSON.stringify(versets));
}

const cle = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/^[^a-z0-9]+/, "");
index.sort((a, b) => cle(a[3]).localeCompare(cle(b[3]), "fr") || a[0].localeCompare(b[0]));
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(index));

// Sélection pour les cartes de l'Étude : mots courants (ni noms propres ni
// mots outils), assez employés pour être parlants.
const vedettes = index
  .filter((e) => !e[5].endsWith("n") && e[4] >= 8 && e[4] <= 600 && /[a-zà-ÿ]{3}/i.test(e[3]))
  .map((e) => [e[0], e[1], e[3]]);
fs.writeFileSync(path.join(OUT, "vedettes.json"), JSON.stringify(vedettes));
console.log(`lexique : ${total} mots, ${traduits} définitions françaises (${Math.round((100 * traduits) / total)} %)`);
