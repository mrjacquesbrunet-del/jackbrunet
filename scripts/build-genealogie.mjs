/**
 * Construit le graphe généalogique de la Bible pour les arbres de l'app.
 *
 * Fusionne :
 *   - les liens familiaux des fiches (content/bible-fiches.json : Père, Mère,
 *     Fils, Fille, Épouse, Époux, Femme, Mari) ;
 *   - les maillons et arbres rédigés à la main (content/genealogie.json).
 * Les fiches groupées (« Nadab & Abihu »…) sont scindées en personnes.
 *
 * Contrôles (échec au moindre problème) : références LSG valides, au plus un
 * père et une mère par personne, aucune boucle, arbres connexes depuis leur
 * racine, identifiants connus.
 *
 * Produit public/bible/genealogie.json :
 *   - personnes : { id: { n, s?, f?, p: [parents], e: [enfants], c: [conjoints], r?, o? } }
 *   - fiches    : { idFiche: idPersonne } (bouton « Voir dans l'arbre »)
 *   - arbres    : arbres prédéfinis et lignées
 *
 * Usage : node scripts/build-genealogie.mjs   (depuis la racine du dépôt)
 */
import { readFileSync, writeFileSync } from "node:fs";

const src = JSON.parse(readFileSync("content/genealogie.json", "utf8"));
const dict = JSON.parse(readFileSync("content/bible-fiches.json", "utf8"));
const index = JSON.parse(readFileSync("public/bible/index.json", "utf8"));
const ID_PAR_NOM = new Map(index.map((b) => [b.name, b.id]));

const erreurs = [];
const cache = new Map();
function verifRef(ref, ou) {
  const m = ref.match(/^((?:[1-3] )?[A-Za-zÀ-ÿœ ]+?) (\d+)(?::(\d+)(?:-(\d+))?)?$/);
  const l = m && ID_PAR_NOM.get(m[1]);
  if (!l) return erreurs.push(`${ou} : référence illisible « ${ref} »`);
  if (!cache.has(l)) cache.set(l, JSON.parse(readFileSync(`public/bible/${l}.json`, "utf8")).chapters);
  const ch = cache.get(l)[Number(m[2]) - 1];
  const v1 = Number(m[3] ?? 1);
  const v2 = Number(m[4] ?? v1);
  if (!ch || v1 < 1 || v2 < v1 || v2 > ch.length) erreurs.push(`${ou} : référence hors limite « ${ref} »`);
}

// 1. Les personnes : fiches (personnages) puis personnes rédigées à la main.
const personnes = new Map();
const nomCourt = (n) => n.replace(/\s*\(.*\)$/, "");
for (const f of dict.personnages) personnes.set(f.id, { n: src.noms[f.id] ?? nomCourt(f.nom), f: f.id });
const groupees = new Set(Object.keys(src.scinder));
for (const g of groupees) personnes.delete(g);
for (const [id, [n, s, f]] of Object.entries(src.personnes)) {
  if (personnes.has(id)) erreurs.push(`personne déjà définie par une fiche : ${id}`);
  personnes.set(id, { n, ...(s ? { s } : {}), ...(f ? { f } : {}) });
}

// 2. Les liens des fiches.
const sexe = new Map();
const marque = (id, s) => {
  if (sexe.has(id) && sexe.get(id) !== s) erreurs.push(`sexe contradictoire pour ${id}`);
  sexe.set(id, s);
};
const liens = []; // { p, e, r?, o? }
const couples = []; // [a, b]
const retirerL = new Set(src.retirerLiens.map(([p, e]) => `${p}>${e}`));
const retirerC = new Set(src.retirerCouples.map((c) => [...c].sort().join("&")));
const PARENT = { Père: "h", Mère: "f" };
const ENFANT = { Fils: "h", Fille: "f" };
const CONJOINT = { Épouse: "f", Femme: "f", Époux: "h", Mari: "h" };
const estPersonnage = new Set(dict.personnages.map((f) => f.id));
for (const f of dict.personnages) {
  for (const [lab, autre] of f.relations ?? []) {
    if (!estPersonnage.has(autre)) continue;
    if (PARENT[lab]) {
      marque(autre, PARENT[lab]);
      liens.push({ p: autre, e: f.id });
    } else if (ENFANT[lab]) {
      marque(autre, ENFANT[lab]);
      liens.push({ p: f.id, e: autre });
    } else if (CONJOINT[lab]) {
      marque(autre, CONJOINT[lab]);
      couples.push([f.id, autre]);
    }
  }
}
for (const [id, p] of personnes) if (p.s) marque(id, p.s);

// 3. Fiches groupées : un lien vers « Nadab & Abihu » devient un lien vers chacun.
const scinde = [];
for (const l of liens) {
  if (retirerL.has(`${l.p}>${l.e}`)) continue;
  if (groupees.has(l.p)) {
    // « Père : Guerschon, Kehath et Merari » : accepté si un lien rédigé précise
    // lequel des membres est le parent (Kehath > Jitsehar).
    const precise = src.liens.some(([p, e]) => e === l.e && src.scinder[l.p].includes(p));
    if (!precise) erreurs.push(`fiche groupée en position de parent (${l.p} > ${l.e}) : à préciser dans liens`);
    continue;
  }
  if (groupees.has(l.e)) for (const m of src.scinder[l.e]) scinde.push({ p: l.p, e: m });
  else scinde.push(l);
}
for (const [p, e, r, o] of src.liens) {
  scinde.push({ p, e, r, o });
  verifRef(r, `lien ${p} > ${e}`);
}

// 4. Graphe dédoublonné.
const P = new Map([...personnes].map(([id, x]) => [id, { ...x, p: [], e: [], c: [] }]));
const vu = new Set();
for (const { p, e, r, o } of scinde) {
  if (!P.has(p) || !P.has(e)) {
    erreurs.push(`lien vers une personne inconnue : ${p} > ${e}`);
    continue;
  }
  const k = `${p}>${e}`;
  const enfant = P.get(e);
  if (r && !enfant.r) enfant.r = r;
  if (o) enfant.o = o;
  if (vu.has(k)) continue;
  vu.add(k);
  P.get(p).e.push(e);
  enfant.p.push(p);
}
const vuC = new Set();
for (const [a, b, r] of [...couples, ...src.couples]) {
  if (groupees.has(a) || groupees.has(b)) continue;
  const k = [a, b].sort().join("&");
  if (retirerC.has(k) || vuC.has(k)) continue;
  if (!P.has(a) || !P.has(b)) {
    erreurs.push(`couple inconnu : ${a} & ${b}`);
    continue;
  }
  if (r) verifRef(r, `couple ${a} & ${b}`);
  vuC.add(k);
  P.get(a).c.push(b);
  P.get(b).c.push(a);
}
for (const [id, s] of sexe) if (P.has(id)) P.get(id).s = s;

// 5. Contrôles : un père, une mère ; pas de boucle.
for (const [id, x] of P) {
  const h = x.p.filter((p) => P.get(p).s === "h");
  const f = x.p.filter((p) => P.get(p).s === "f");
  if (h.length > 1 || f.length > 1 || x.p.length > 2) erreurs.push(`${id} a trop de parents : ${x.p.join(", ")}`);
  // Père d'abord, puis mère.
  x.p.sort((a, b) => (P.get(a).s === "h" ? -1 : 1) - (P.get(b).s === "h" ? -1 : 1));
}
const etat = new Map();
function boucle(id) {
  if (etat.get(id) === 1) return true;
  if (etat.get(id) === 2) return false;
  etat.set(id, 1);
  for (const e of P.get(id).e) if (boucle(e)) return erreurs.push(`boucle généalogique passant par ${id}`), true;
  etat.set(id, 2);
  return false;
}
for (const id of P.keys()) boucle(id);

// 6. Ordre de naissance.
for (const [parent, ordre] of Object.entries(src.ordre)) {
  const x = P.get(parent);
  if (!x) {
    erreurs.push(`ordre : parent inconnu ${parent}`);
    continue;
  }
  for (const e of ordre) if (!x.e.includes(e)) erreurs.push(`ordre : ${e} n'est pas enfant de ${parent}`);
  x.e.sort((a, b) => (ordre.indexOf(a) + 1 || 999) - (ordre.indexOf(b) + 1 || 999));
}

// 7. Arbres et lignées.
for (const a of src.arbres) {
  verifRef(a.ref, `arbre ${a.id}`);
  if (a.type === "lignee") {
    for (const s of a.sections) for (const it of s.noms) for (const k of [it.id, it.avecId]) if (k && !P.has(k)) erreurs.push(`lignée ${a.id} : ${k} inconnu`);
    continue;
  }
  const S = new Set(a.noeuds);
  for (const id of S) if (!P.has(id)) erreurs.push(`arbre ${a.id} : ${id} inconnu`);
  // Chaque nœud doit être relié à la racine en descendant.
  const atteint = new Set([a.racine]);
  const pile = [a.racine];
  while (pile.length) for (const e of P.get(pile.pop())?.e ?? []) if (S.has(e) && !atteint.has(e)) atteint.add(e), pile.push(e);
  for (const id of S) if (!atteint.has(id)) erreurs.push(`arbre ${a.id} : ${id} n'est pas relié à ${a.racine}`);
}

if (erreurs.length) {
  console.error(erreurs.join("\n"));
  process.exit(1);
}

// Seules les personnes reliées à quelqu'un sont utiles aux arbres.
const sortie = {};
for (const [id, x] of P) {
  if (!x.p.length && !x.e.length && !x.c.length) continue;
  const o = { n: x.n };
  for (const k of ["s", "f", "r", "o"]) if (x[k]) o[k] = x[k];
  if (x.p.length) o.p = x.p;
  if (x.e.length) o.e = x.e;
  if (x.c.length) o.c = x.c;
  sortie[id] = o;
}
// Fiche → personne à centrer. Pour une fiche groupée, la plus reliée
// (Kehath plutôt que Guerschon, Hérode le Grand plutôt qu'Antipas).
const fiches = {};
const poids = (x) => (x.p?.length ?? 0) + (x.e?.length ?? 0) + (x.c?.length ?? 0);
for (const [id, x] of Object.entries(sortie)) {
  if (x.f && (!fiches[x.f] || poids(x) > poids(sortie[fiches[x.f]]))) fiches[x.f] = id;
}
const adoptifs = src.adoptifs.map(([p, e]) => `${p}>${e}`);

writeFileSync("public/bible/genealogie.json", JSON.stringify({ personnes: sortie, fiches, adoptifs, arbres: src.arbres }));
console.log(`genealogie.json : ${Object.keys(sortie).length} personnes reliées, ${vu.size} liens, ${vuC.size} couples, ${src.arbres.length} arbres`);
