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
const OUT = "public/lexique";

const tranches = fs.readdirSync(SRC).map((f) => f.replace(".json", "")).sort();
const index = [];
let traduits = 0;
let total = 0;
fs.mkdirSync(path.join(OUT, "mots"), { recursive: true });

for (const t of tranches) {
  const source = JSON.parse(fs.readFileSync(path.join(SRC, `${t}.json`), "utf8"));
  const fr = fs.existsSync(path.join(FR, `${t}.json`)) ? JSON.parse(fs.readFileSync(path.join(FR, `${t}.json`), "utf8")) : {};
  const mots = {};
  for (const [code, e] of Object.entries(source)) {
    total++;
    const f = fr[code];
    if (f) traduits++;
    // Repli tant que la définition n'est pas traduite : la traduction la
    // plus fréquente dans la Segond.
    const vedette = f?.fr || e.trad[0]?.[0] || e.gloss;
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
      trad: e.trad,
      de: e.de.length ? e.de : undefined,
      derives: e.derives.length ? e.derives : undefined,
      nb: e.nb,
    };
  }
  fs.writeFileSync(path.join(OUT, "mots", `${t}.json`), JSON.stringify(mots));
}

const cle = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/^[^a-z0-9]+/, "");
index.sort((a, b) => cle(a[3]).localeCompare(cle(b[3]), "fr") || a[0].localeCompare(b[0]));
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(index));
console.log(`lexique : ${total} mots, ${traduits} définitions françaises (${Math.round((100 * traduits) / total)} %)`);
