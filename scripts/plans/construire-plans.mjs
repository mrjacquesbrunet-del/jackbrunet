/**
 * PLANS DE LECTURE — construction depuis les sources rédigées.
 *
 * Sources : content/plans-sources/<slug>.json (même forme qu'un plan de
 * content/plans.json, avec en plus, par jour : lecture, pourAllerPlusLoin,
 * question, priere, aRetenir).
 *
 * Dans les textes, « {{Jean 6:35}} » est remplacé par la citation EXACTE de la
 * Segond 1910 de l'app : « Jésus leur dit : … » (Jean 6:35). Ainsi aucune
 * citation n'est approximative.
 *
 * Vérifie aussi que toutes les références existent (livre, chapitre, versets)
 * et qu'elles tiennent dans un seul chapitre (ce que l'app sait afficher).
 *
 * Usage : node scripts/plans/construire-plans.mjs [--verifier]
 *   --verifier : contrôle seulement, sans écrire content/plans.json.
 */
import fs from "node:fs";
import path from "node:path";

const RACINE = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const SOURCES = path.join(RACINE, "content/plans-sources");
const PLANS = path.join(RACINE, "content/plans.json");
const BIBLE = path.join(RACINE, "public/bible");
const seulementVerifier = process.argv.includes("--verifier");

const norm = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
const ALIAS = { psaume: "psaumes", cantique: "cantique des cantiques", "cantique des cantique": "cantique des cantiques" };
const INDEX = JSON.parse(fs.readFileSync(path.join(BIBLE, "index.json"), "utf8"));
const livres = new Map();

function livre(id) {
  if (!livres.has(id)) livres.set(id, JSON.parse(fs.readFileSync(path.join(BIBLE, `${id}.json`), "utf8")));
  return livres.get(id);
}

/** « Jean 6:35-40 » → { id, nom, chap, v1, v2 } ou une erreur. */
function resoudre(ref) {
  const m = ref.match(/^(.*?)\s+(\d+)\s*:\s*(\d+)(?:\s*[-–]\s*(\d+))?\s*$/);
  if (!m) throw new Error(`référence illisible « ${ref} »`);
  let nom = norm(m[1]);
  nom = ALIAS[nom] || nom;
  const b = INDEX.find((x) => norm(x.name) === nom);
  if (!b) throw new Error(`livre inconnu dans « ${ref} »`);
  const chap = Number(m[2]);
  const v1 = Number(m[3]);
  const v2 = m[4] ? Number(m[4]) : v1;
  const c = livre(b.id).chapters[chap - 1];
  if (!c) throw new Error(`chapitre inexistant dans « ${ref} »`);
  if (v1 < 1 || v2 < v1 || v2 > c.length) throw new Error(`versets hors chapitre dans « ${ref} » (${c.length} versets)`);
  return { id: b.id, nom: b.name, chap, v1, v2, versets: c.slice(v1 - 1, v2) };
}

/** Texte exact LSG d'une référence (versets joints). */
function citation(ref) {
  const r = resoudre(ref);
  const t = r.versets.join(" ").replace(/\s+/g, " ").trim();
  return `« ${t} » (${ref})`;
}

const erreurs = [];
function remplir(texte, ou) {
  if (typeof texte !== "string") return texte;
  return texte.replace(/\{\{([^}]+)\}\}/g, (_, ref) => {
    try {
      return citation(ref.trim());
    } catch (e) {
      erreurs.push(`${ou} : ${e.message}`);
      return `{{${ref}}}`;
    }
  });
}
function verifierRefs(liste, ou) {
  for (const ref of liste ?? []) {
    try {
      resoudre(ref);
    } catch (e) {
      erreurs.push(`${ou} : ${e.message}`);
    }
  }
}

const fichiers = fs.existsSync(SOURCES) ? fs.readdirSync(SOURCES).filter((f) => f.endsWith(".json")).sort() : [];
const construits = [];
let mots = 0;
for (const f of fichiers) {
  const plan = JSON.parse(fs.readFileSync(path.join(SOURCES, f), "utf8"));
  plan.summary = remplir(plan.summary, `${f} résumé`);
  plan.days.forEach((j, i) => {
    const ou = `${f} jour ${j.day}`;
    if (j.day !== i + 1) erreurs.push(`${ou} : numéro de jour attendu ${i + 1}`);
    verifierRefs(j.lecture ? [j.lecture] : [], `${ou} lecture`);
    verifierRefs(j.verses, `${ou} versets`);
    verifierRefs(j.pourAllerPlusLoin, `${ou} pour aller plus loin`);
    for (const k of ["meditation", "question", "priere", "aRetenir"]) j[k] = remplir(j[k], `${ou} ${k}`);
    if (j.pratique) j.pratique = j.pratique.map((x) => ({ ...x, texte: remplir(x.texte, `${ou} pratique`) }));
    mots += (j.meditation ?? "").split(/\s+/).length;
  });
  construits.push(plan);
  console.log(`✓ ${plan.slug} : ${plan.days.length} jours`);
}

if (erreurs.length) {
  console.error(`\n${erreurs.length} erreur(s) :\n- ${erreurs.join("\n- ")}`);
  process.exit(1);
}
console.log(`${construits.length} plan(s), ${mots} mots de méditation, toutes les références sont valides.`);

if (!seulementVerifier && construits.length) {
  const data = JSON.parse(fs.readFileSync(PLANS, "utf8"));
  for (const p of construits) {
    const i = data.items.findIndex((x) => x.slug === p.slug);
    if (i >= 0) data.items[i] = p;
    else data.items.push(p);
  }
  fs.writeFileSync(PLANS, JSON.stringify(data, null, 2) + "\n");
  console.log(`→ content/plans.json mis à jour`);
}
