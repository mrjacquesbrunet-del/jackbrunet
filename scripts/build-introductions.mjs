/**
 * Construit les introductions aux 66 livres pour l'app.
 *
 * Lit le texte rédigé à la main (content/introductions-livres.json), vérifie
 * chaque référence contre le texte LSG (public/bible/<id>.json), ajoute le
 * texte exact des versets clés et produit public/bible/introductions.json :
 *   - groupes : [{ id, nom, desc, de, a }]
 *   - livres  : { "<id>": { …intro, versets: [{ ref, l, c, t }] } }
 *
 * Le script échoue (code 1) au moindre problème : référence hors limite,
 * plan qui ne couvre pas le livre, fiche ou événement de frise inconnu.
 *
 * Usage : node scripts/build-introductions.mjs   (depuis la racine du dépôt)
 */
import { readFileSync, writeFileSync } from "node:fs";

const src = JSON.parse(readFileSync("content/introductions-livres.json", "utf8"));
const index = JSON.parse(readFileSync("public/bible/index.json", "utf8"));
const fiches = JSON.parse(readFileSync("content/bible-fiches.json", "utf8"));
const frise = JSON.parse(readFileSync("content/chronologie-biblique.json", "utf8"));

const ID_PAR_NOM = new Map(index.map((b) => [b.name, b.id]));
const IDS_FICHES = new Set([...fiches.personnages, ...fiches.lieux].map((f) => f.id));
const IDS_FRISE = new Set(frise.evenements.map((e) => e.id));

const cache = new Map();
function livre(id) {
  if (!cache.has(id)) cache.set(id, JSON.parse(readFileSync(`public/bible/${id}.json`, "utf8")).chapters);
  return cache.get(id);
}

const erreurs = [];
const RE_REF = /^((?:[1-3] )?[A-Za-zÀ-ÿœ ]+?) (\d+)(?:[.:](\d+)(?:-(\d+))?)?$/;

/** « Jean 3:16 » → { l, c, v1, v2 } vérifié contre le texte LSG. */
function lireRef(ref, ou) {
  const m = ref.trim().match(RE_REF);
  const l = m ? ID_PAR_NOM.get(m[1]) : undefined;
  if (!m || !l) {
    erreurs.push(`${ou} : référence illisible « ${ref} »`);
    return null;
  }
  const c = Number(m[2]);
  const chapitres = livre(l);
  if (c < 1 || c > chapitres.length) {
    erreurs.push(`${ou} : chapitre hors limite « ${ref} »`);
    return null;
  }
  const v1 = m[3] ? Number(m[3]) : null;
  const v2 = m[4] ? Number(m[4]) : v1;
  if (v1 !== null && (v1 < 1 || v2 < v1 || v2 > chapitres[c - 1].length)) {
    erreurs.push(`${ou} : verset hors limite « ${ref} » (${chapitres[c - 1].length} versets)`);
    return null;
  }
  return { l, c, v1, v2 };
}

const RE_DANS_TEXTE =
  /\(((?:[1-3]\s?)?[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s-]*?\s\d+(?:[.:]\d+(?:-\d+)?)?)\)/g;

const livres = {};
for (let n = 1; n <= 66; n++) {
  const b = src.livres[String(n)];
  const nom = index.find((x) => x.id === n)?.name;
  if (!b) {
    erreurs.push(`${nom} : introduction manquante`);
    continue;
  }
  const nbChap = livre(n).length;

  // Plan : couvre le livre du chapitre 1 au dernier, sans trou ni recul.
  b.plan.forEach(([titre, de, a], i) => {
    if (de > a || a > nbChap) erreurs.push(`${nom} : plan « ${titre} » ${de}-${a}`);
    if (i && de < b.plan[i - 1][1]) erreurs.push(`${nom} : plan en désordre à « ${titre} »`);
    if (i && de > b.plan[i - 1][2] + 1) erreurs.push(`${nom} : trou dans le plan avant « ${titre} »`);
  });
  if (b.plan[0][1] !== 1 || b.plan.at(-1)[2] !== nbChap) erreurs.push(`${nom} : le plan ne couvre pas 1-${nbChap}`);

  for (const p of b.pers) if (!IDS_FICHES.has(p)) erreurs.push(`${nom} : fiche inconnue « ${p} »`);
  if (b.frise && !IDS_FRISE.has(b.frise)) erreurs.push(`${nom} : événement de frise inconnu « ${b.frise} »`);

  // Références citées dans les textes : toutes doivent exister.
  const textes = [b.resume, b.auteur, b.date, b.destinataires, b.contexte, b.christ, ...b.themes.map((t) => t[1])];
  for (const t of textes) for (const m of t.matchAll(RE_DANS_TEXTE)) lireRef(m[1].replace(/\s+/g, " "), nom);

  // Versets clés : texte LSG exact. Une fin de phrase coupée (virgule,
  // point-virgule, deux-points) devient « … ».
  const versets = [];
  for (const ref of b.versets) {
    const r = lireRef(ref, nom);
    if (!r || r.v1 === null) continue;
    let t = livre(r.l)[r.c - 1].slice(r.v1 - 1, r.v2).join(" ").replace(/\s+/g, " ").trim();
    t = t.replace(/\s*[,;:  -]+\s*$/u, "…");
    versets.push({ ref, l: r.l, c: r.c, t });
  }

  livres[n] = { ...b, versets };
}

if (erreurs.length) {
  console.error(erreurs.join("\n"));
  process.exit(1);
}

writeFileSync("public/bible/introductions.json", JSON.stringify({ groupes: src.groupes, livres }));
console.log(`introductions.json : 66 livres, ${Object.values(livres).reduce((s, b) => s + b.versets.length, 0)} versets clés`);
