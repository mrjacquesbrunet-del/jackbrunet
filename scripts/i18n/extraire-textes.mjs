/**
 * MULTILINGUE — relevé des textes d'interface en français.
 *
 * Parcourt src/ (.tsx, .ts) avec le compilateur TypeScript et relève les
 * textes affichés : contenu JSX, attributs lisibles (placeholder, title,
 * aria-label, alt, label) et chaînes en langage naturel. Les gabarits
 * `Plus que ${n} pts` deviennent « Plus que {0} pts ».
 *
 * Sortie : i18n/source-fr.json  { "texte": ["fichier:ligne", …], … }
 * Usage : node scripts/i18n/extraire-textes.mjs
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const RACINE = "src";
const SORTIE = "i18n/source-fr.json";
const ATTRS = new Set(["placeholder", "title", "aria-label", "alt", "label"]);
// Attributs / appels dont les chaînes ne sont JAMAIS du texte affiché.
const ATTRS_TECH = new Set(["className", "href", "src", "id", "key", "type", "name", "role", "rel", "target", "style",
  "viewBox", "d", "fill", "stroke", "strokeLinecap", "strokeLinejoin", "xmlns", "points", "transform", "method",
  "action", "inputMode", "autoComplete", "accept", "pattern", "lang", "dir", "form", "htmlFor", "as", "prefetch",
  "objectPosition", "loading", "decoding", "sizes", "media", "crossOrigin", "referrerPolicy", "sandbox", "allow",
  "preload", "data-theme", "aria-hidden", "aria-controls", "aria-labelledby", "aria-describedby", "tabIndex"]);
const APPELS_TECH = /^(cn|clsx|cx|twMerge|require|import|getItem|setItem|removeItem|querySelector|querySelectorAll|getElementById|addEventListener|removeEventListener|from|select|eq|neq|in|order|rpc|channel|on|storage|getPublicUrl|upload|remove|list|createElement|setProperty|matchMedia|replace|split|startsWith|endsWith|includes|test|match|padStart|toLocaleDateString|toLocaleTimeString|toLocaleString|Intl|DateTimeFormat|NumberFormat|registerPlugin|fetch|invoke|ilike|like|is|not|gt|gte|lt|lte|or|filter|contains|textSearch|maybeSingle|single|limit|range|upsert|insert|update|delete)$/;

const LETTRE = /[A-Za-zÀ-ÖØ-öø-ÿŒœ]/;
const ACCENT = /[À-ÖØ-öø-ÿŒœ«»’]/;

/** Une chaîne ressemble-t-elle à du texte lisible (et non à du code) ? */
function lisible(s) {
  const t = s.trim();
  if (t.length < 2 || !LETTRE.test(t)) return false;
  if (/^(https?:|mailto:|tel:|\/|#|\.\/|\.\.\/|data:)/.test(t)) return false;
  if (/^@(keyframes|media|font-face)\b/.test(t) || /\.(mp3|mp4|png|jpe?g|webp|pdf)$/i.test(t)) return false; // CSS, fichiers
  if (/^[\w.-]+@[\w.-]+$/.test(t)) return false; // e-mail
  if (/^[a-z0-9_.:\/-]+$/.test(t) && !ACCENT.test(t)) return false; // clé, chemin, classe simple
  if (/^[a-z][a-zA-Z0-9]*$/.test(t)) return false; // identifiant camelCase
  if (/^[A-Z0-9_]+$/.test(t) && t.length > 3) return false; // CONSTANTE
  // Classes Tailwind : beaucoup de tirets / deux-points, sans majuscule de phrase
  const mots = t.split(/\s+/);
  if (mots.length > 1 && mots.filter((m) => /[-:\[\]/]/.test(m)).length >= Math.max(2, mots.length / 2) && !ACCENT.test(t)) return false;
  if (/^[\w-]+\([^)]*\)$/.test(t)) return false; // fonction CSS
  if (/^[MmLlHhVvCcSsQqTtAaZz][\d.,\s+-]/.test(t) && /^[MmLlHhVvCcSsQqTtAaZz\d.,\s+-]+$/.test(t)) return false; // tracé SVG
  if (/^rgba?\(|^#[0-9a-f]{3,8}$|^\d/.test(t) && !/[a-zà-ÿ]{3,}/i.test(t.replace(/^\d+/, ""))) return false;
  // Une phrase (espace) ou un mot avec accent / majuscule initiale
  return /\s/.test(t) || ACCENT.test(t) || /^[A-ZÀ-Ö][a-zà-ÿ]/.test(t);
}

const ENTITES = { apos: "'", quot: '"', amp: "&", nbsp: " ", lt: "<", gt: ">", rsquo: "’", lsquo: "‘", laquo: "«", raquo: "»", hellip: "…", mdash: "—", ndash: "–", eacute: "é", egrave: "è", agrave: "à", ccedil: "ç" };
function norm(s) {
  return s
    .replace(/&(#\d+|[a-z]+);/gi, (m, e) => (e[0] === "#" ? String.fromCharCode(Number(e.slice(1))) : ENTITES[e.toLowerCase()] ?? m))
    .replace(/\s+/g, " ")
    .trim();
}

const resultat = new Map();
function ajoute(texte, ou) {
  const t = norm(texte);
  if (!lisible(t)) return;
  if (!resultat.has(t)) resultat.set(t, []);
  const l = resultat.get(t);
  if (l.length < 3) l.push(ou);
}

function nomAppel(node) {
  const e = node.expression;
  if (ts.isIdentifier(e)) return e.text;
  if (ts.isPropertyAccessExpression(e)) return e.name.text;
  return "";
}

function technique(node) {
  // Remonte les parents : attribut technique, appel technique, clé d'objet, import…
  let n = node;
  for (let i = 0; i < 6 && n; i++) {
    const p = n.parent;
    if (!p) break;
    if (ts.isJsxAttribute(p)) {
      const nom = p.name.getText();
      // Propriétés des composants (eyebrow, badge, sousTitre…) : texte affiché,
      // sauf les propriétés techniques connues.
      return ATTRS_TECH.has(nom) || /^(kind|variant|tone|icon|color|couleur|size|mode|tab|onglet|id|slug|route|path|cle|storageKey|fichier|file|image|img|audio|accent|theme|align|side|position|format|lang|langue|ratio|aspect|from|to|direction|anchor|status|etat|categorie|category|source)$/i.test(nom) || /^(on[A-Z]|data-|aria-(?!label))/.test(nom);
    }
    if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p)) return true;
    if (ts.isCallExpression(p) && APPELS_TECH.test(nomAppel(p))) return true;
    if (ts.isPropertyAssignment(p) && p.name === n) return true; // clé
    if (ts.isElementAccessExpression(p) && p.argumentExpression === n) return true;
    if (ts.isCaseClause(p) || ts.isLiteralTypeNode(p) || ts.isTypeNode(p)) return true;
    if (ts.isBinaryExpression(p) && /===|!==|==|!=/.test(p.operatorToken.getText())) return true;
    if (ts.isPropertyAssignment(p) && /^(className|href|src|id|key|type|icon|color|bg|gradient|accent|iconBg|iconColor|path|slug|route|match|value|img|image|mp3|file|fichier|lien|url|kind|variant|tone|position|code|handle)$/.test(p.name.getText())) return true;
    n = p;
  }
  return false;
}

function parcourt(fichier) {
  const code = fs.readFileSync(fichier, "utf8");
  const sf = ts.createSourceFile(fichier, code, ts.ScriptTarget.Latest, true, fichier.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const ou = (n) => `${fichier.replace(/^src\//, "")}:${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1}`;
  const visite = (node) => {
    if (ts.isJsxText(node)) {
      if (node.text.trim()) ajoute(node.text, ou(node));
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (!technique(node)) ajoute(node.text, ou(node));
    } else if (ts.isTemplateExpression(node)) {
      if (!technique(node)) {
        let s = node.head.text;
        node.templateSpans.forEach((sp, i) => (s += `{${i}}` + sp.literal.text));
        // Utile seulement s'il reste du texte autour des variables
        if (lisible(s.replace(/\{\d+\}/g, " "))) ajoute(s, ou(node));
      }
    }
    ts.forEachChild(node, visite);
  };
  visite(sf);
}

function fichiers(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return fichiers(p);
    return /\.(tsx|ts)$/.test(e.name) && !e.name.endsWith(".d.ts") ? [p] : [];
  });
}

for (const f of fichiers(RACINE)) parcourt(f);

// Valeurs de contenus affichées telles quelles (titres des plans, catégories
// et époques qui servent aussi de filtres) : traduites par le dictionnaire.
const VALEURS_CONTENU = {
  plans: ["title", "subtitle"],
  quiz: ["category"],
  "questions-faq": ["category"],
  chrono: ["era"],
};
for (const [f, cles] of Object.entries(VALEURS_CONTENU)) {
  const j = JSON.parse(fs.readFileSync(`content/${f}.json`, "utf8"));
  const go = (x) => {
    if (Array.isArray(x)) x.forEach(go);
    else if (x && typeof x === "object")
      for (const [k, v] of Object.entries(x)) {
        if (typeof v === "string" && cles.includes(k) && lisible(v)) ajoute(v, `content/${f}.json`);
        else go(v);
      }
  };
  go(j);
}
const obj = Object.fromEntries([...resultat.entries()].sort((a, b) => a[0].localeCompare(b[0], "fr")));
fs.mkdirSync(path.dirname(SORTIE), { recursive: true });
fs.writeFileSync(SORTIE, JSON.stringify(obj, null, 1) + "\n");
const mots = Object.keys(obj).reduce((n, k) => n + k.split(/\s+/).length, 0);
console.log(`${Object.keys(obj).length} textes, ${mots} mots → ${SORTIE}`);
