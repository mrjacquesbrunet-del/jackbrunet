/**
 * MULTILINGUE — traduction des CONTENUS (méditations et punchlines,
 * formation, études) en anglais et en portugais du Brésil, avec Claude
 * (API Anthropic, Message Batches : moitié prix, asynchrone).
 *
 * Entrée  : content/<fichier>.json (français)
 * Sortie  : public/i18n/contenu/<langue>/<fichier>.json — même structure, textes
 *           traduits ; noms de fichiers, images, identifiants inchangés.
 * Reprenable : lots notés dans i18n/lots-contenu.json (commité aussitôt).
 *
 * Variables : ANTHROPIC_API_KEY, MODELE (défaut claude-haiku-4-5, le moins cher),
 *   LANGUES ("en,pt"), FICHIERS ("devotions,formations,etudes,reading-plan"),
 *   LIMITE (nombre max de textes par fichier et langue, essai), REFAIRE=1,
 *   GIT_COMMIT=0, ESSAI_A_SEC=1.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import Anthropic from "@anthropic-ai/sdk";

const MODELE = process.env.MODELE || "claude-haiku-4-5";
const LANGUES = (process.env.LANGUES || "en,pt").split(",").map((s) => s.trim()).filter(Boolean);
const FICHIERS = (process.env.FICHIERS || "devotions,formations,etudes,reading-plan").split(",").map((s) => s.trim()).filter(Boolean);
const LIMITE = Number(process.env.LIMITE || 0);
const REFAIRE = process.env.REFAIRE === "1";
const DO_GIT = process.env.GIT_COMMIT !== "0";
const BRANCH = process.env.GITHUB_REF_NAME || "claude/great-hamilton-ieokug";
const ETAT = "i18n/lots-contenu.json";
const MOTS_PAR_REQUETE = 2500;
const DUREE_MAX = Number(process.env.DUREE_MAX_MIN || 320) * 60000;
const debut = Date.now();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Clés dont la valeur n'est jamais du texte à traduire. */
const TECHNIQUES = new Set([
  "id", "type", "audio", "fichier", "image", "cover", "ebook", "livrePapier", "card", "photo",
  "themes", "auteur", "nom", "slug", "url", "lien", "src", "couleur", "color", "icon", "mp3",
]);

/** Clés techniques propres à un fichier (ailleurs, ce sont des textes). Les
 * catégories et époques servent aussi de filtres : traduites à l'affichage
 * par le dictionnaire de l'interface, pas ici. */
const TECHNIQUES_FICHIER = {
  "chronologie-biblique": ["t", "p", "pers", "lieux"],
  quiz: ["category"],
  "questions-faq": ["category"],
  chrono: ["era"],
  verses: ["version"],
  plans: ["authorInstagram", "authorPhoto"],
  "bible/genealogie": ["s", "f"],
};

if (!process.env.ANTHROPIC_API_KEY && process.env.ESSAI_A_SEC !== "1") {
  console.error("Secret ANTHROPIC_API_KEY absent.");
  process.exit(1);
}
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "essai-a-sec" });
const NOMS = { en: "l'anglais (américain neutre)", pt: "le portugais du Brésil" };

const CONSIGNE = (l) =>
  `Tu traduis les contenus de RHEMA, application chrétienne évangélique de méditation biblique, de prière et d'étude, ` +
  `du Pasteur Jack Brunet et de Josy W. Brunet, du français vers ${NOMS[l]}. ` +
  `Ce sont des méditations quotidiennes (thème, verset, punchline, méditation, déclaration), une formation biblique (leçons, quiz), des études bibliques, un plan de lecture de la Bible en un an, des plans de méditation thématiques, les jeux bibliques (quiz, vrai ou faux, qui suis-je, chronologie), les introductions des 66 livres et les fiches des personnages et lieux bibliques avec leurs liens de parenté. Garde exactement le même nom pour un même personnage, lieu ou événement partout (tradition de la Bible de la langue cible). Le fichier « lexique-vedettes » contient le sens court (vedette) de chaque mot grec ou hébreu de la Bible : traduis-le par un sens court équivalent, sans rien ajouter.\n\n` +
  `Règles :\n` +
  `- Garde la voix pastorale, chaleureuse et directe de l'original. Le lecteur est tutoyé : ` +
  (l === "pt" ? `utilise « você », naturel au Brésil.\n` : `utilise « you », naturel et chaleureux.\n`) +
  `- Les PUNCHLINES (phrases-chocs courtes) doivent rester courtes, percutantes et mémorables dans la langue cible : adapte le jeu de mots plutôt que de traduire mot à mot, sans en changer le message.\n` +
  `- Versets bibliques cités : formulation ${l === "pt" ? "d'une Bible brésilienne courante (style Almeida Revista e Corrigida / Atualizada)" : "d'une Bible anglaise classique en anglais moderne (style NKJV / ESV)"}, fidèle au sens du texte français.\n` +
  `- Références bibliques : noms des livres selon l'usage ${l === "pt" ? "brésilien (Gênesis, Êxodo, Salmos, Provérbios, Mateus, João, Atos, Romanos, Apocalipse…)" : "anglais (Genesis, Exodus, Psalms, Proverbs, Matthew, John, Acts, Romans, Revelation…)"}, chapitres et versets inchangés, avec deux-points (Jean 3.16 → ${l === "pt" ? "João 3:16" : "John 3:16"}). « d'après » → ${l === "pt" ? "« baseado em »" : "« based on »"}. Noms de personnages bibliques selon la même tradition (${l === "pt" ? "Moisés, Davi, Tiago, Pedro…" : "Moses, David, James, Peter…"}). « L'Éternel » → ${l === "pt" ? "« o Senhor »" : "« the Lord »"}.\n` +
  `- Garde les sauts de ligne (\\n), la mise en forme **gras**, les guillemets (« » → “ ”), les références entre parenthèses, les emojis.\n` +
  `- Ne traduis pas : RHEMA, Jack Brunet, Josy W. Brunet, Connecte Ta Foi. « Pasteur Jack » → « Pastor Jack ».\n` +
  `- Quiz : traduis question, choix et explication de façon cohérente (les choix doivent rester distincts).\n` +
  `- Ne résume pas, n'ajoute rien, ne saute rien : une traduction par identifiant reçu.\n\n` +
  `Tu reçois { "contexte": …, "textes": [ { "i": identifiant, "champ": nom du champ, "fr": texte } ] } (textes d'une même méditation, leçon ou étude, dans l'ordre). ` +
  `Réponds avec { "traductions": [ { "i": identifiant, "t": traduction } ] } pour TOUS les identifiants.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["traductions"],
  properties: {
    traductions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["i", "t"],
        properties: { i: { type: "integer" }, t: { type: "string" } },
      },
    },
  },
};

const lire = (f, def) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : def);
const sortie = (l, f) => `public/i18n/contenu/${l}/${f}.json`;
/** Fichier français : content/<f>.json, ou public/bible/<x>.json pour « bible/<x> ». */
const source = (f) => (f.startsWith("bible/") ? `public/${f}.json` : `content/${f}.json`);
/** Identifiant (« joseph-at », « sem ») : jamais traduit dans les fichiers de la Bible. */
const estIdentifiant = (f, s) => f.startsWith("bible/") && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);
const lisible = (s) => /[A-Za-zÀ-ÿ]/.test(s) && !/^(\/|https?:|[\w-]+\.(png|jpe?g|webp|mp3|pdf)$)/.test(s.trim());

/** Liste [chemin, texte] des chaînes à traduire, dans l'ordre du fichier. */
function chaines(x, chemin = [], acc = [], f = "") {
  if (Array.isArray(x)) x.forEach((v, i) => chaines(v, [...chemin, i], acc, f));
  else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) chaines(v, [...chemin, k], acc, f);
  else if (typeof x === "string") {
    const cle = [...chemin].reverse().find((c) => typeof c === "string");
    // Exception : noms des thèmes des études (« Identité & valeur »…).
    // « nom » est un texte pour les thèmes des études et dans les fiches bibliques (Moïse → Moses) ;
    // « auteur » et « themes » sont des textes dans les fichiers de la Bible (introductions des livres).
    const nomTexte =
      (cle === "nom" && (chemin[0] === "themes" || f.startsWith("bible/"))) ||
      ((cle === "auteur" || cle === "themes") && f.startsWith("bible/")) ||
      (cle === "nom" && f === "chronologie-biblique");
    const technique = (TECHNIQUES.has(cle) && !nomTexte) || (TECHNIQUES_FICHIER[f] ?? []).includes(cle);
    if (!technique && lisible(x) && !estIdentifiant(f, x)) acc.push([chemin, x]);
  }
  return acc;
}
const cleChemin = (c) => JSON.stringify(c);
function poser(obj, chemin, v) {
  let o = obj;
  for (let i = 0; i < chemin.length - 1; i++) o = o[chemin[i]];
  o[chemin[chemin.length - 1]] = v;
}
/** Unité de contexte : le 2e niveau (une méditation, une formation, une étude). */
const unite = (c) => cleChemin(c.slice(0, 2));

function demande(id, langue, contexte, lot) {
  return {
    custom_id: id,
    params: {
      model: MODELE,
      max_tokens: 16000,
      system: [{ type: "text", text: CONSIGNE(langue), cache_control: { type: "ephemeral" } }],
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            contexte,
            textes: lot.map(([c, fr], i) => ({ i, champ: [...c].reverse().find((x) => typeof x === "string"), fr })),
          }),
        },
      ],
      // Haiku : pas de réglage d'effort (réflexion désactivée par défaut).
      output_config: { format: { type: "json_schema", schema: SCHEMA }, ...(MODELE.includes("haiku") ? {} : { effort: "low" }) },
    },
  };
}

function sauver(message) {
  if (!DO_GIT) return;
  try {
    execSync("git add public/i18n/contenu i18n");
    if (!execSync("git diff --staged --name-only", { encoding: "utf8" }).trim()) return;
    execSync(`git commit -m "${message} [skip ci]"`, { stdio: "inherit" });
  } catch (e) {
    console.log(`commit : ${String(e).slice(0, 140)}`);
    return;
  }
  for (let a = 0; a < 10; a++) {
    try {
      execSync(`git pull --rebase --autostash origin ${BRANCH}`, { stdio: "inherit" });
      execSync(`git push origin HEAD:${BRANCH}`, { stdio: "inherit" });
      return;
    } catch {
      try {
        execSync("git rebase --abort", { stdio: "ignore" });
      } catch {
        /* pas en rebase */
      }
      execSync(`sleep ${3 + Math.floor(Math.random() * 6)}`);
    }
  }
}

/** Complète une traduction existante avec ce qui a été ajouté depuis en
 * français (nouveaux éléments de liste, nouveaux champs), copiés tels quels
 * en attendant leur traduction. Sans cela, les nouveaux chemins n'existent
 * pas dans le fichier traduit. */
function completer(cible, fr) {
  if (Array.isArray(fr)) {
    if (!Array.isArray(cible)) return JSON.parse(JSON.stringify(fr));
    fr.forEach((v, i) => {
      cible[i] = i < cible.length ? completer(cible[i], v) : JSON.parse(JSON.stringify(v));
    });
    return cible;
  }
  if (fr && typeof fr === "object") {
    if (!cible || typeof cible !== "object" || Array.isArray(cible)) return JSON.parse(JSON.stringify(fr));
    for (const [k, v] of Object.entries(fr)) cible[k] = k in cible ? completer(cible[k], v) : JSON.parse(JSON.stringify(v));
    return cible;
  }
  return cible ?? fr;
}

/** Fichier traduit (copie du français, complétée au fil des lots). */
function traduit(l, f) {
  const fr = lire(source(f), null);
  const deja = REFAIRE ? null : lire(sortie(l, f), null);
  const cible = deja ? completer(deja, fr) : JSON.parse(JSON.stringify(fr));
  return { fr, cible, faits: new Set(deja?.__traduits ?? []) };
}

async function recuperer(id, etat) {
  const ouverts = {};
  let ok = 0;
  let ko = 0;
  for await (const r of await client.messages.batches.results(id)) {
    const req = etat.requetes[r.custom_id];
    if (!req) continue;
    const { l, f, chemins, textes } = req;
    const doc = (ouverts[`${l}/${f}`] ??= { l, f, ...traduit(l, f) });
    let x = null;
    if (r.result.type === "succeeded") {
      const m = r.result.message;
      const brut = m.content.find((b) => b.type === "text")?.text;
      try {
        x = m.stop_reason === "end_turn" && brut ? JSON.parse(brut) : null;
      } catch {
        x = null;
      }
    }
    let faits = 0;
    for (const { i, t } of x?.traductions ?? []) {
      if (!chemins[i] || typeof t !== "string" || !t.trim()) continue;
      poser(doc.cible, chemins[i], t.trim());
      doc.faits.add(cleChemin(chemins[i]));
      faits++;
    }
    ok += faits;
    ko += textes - faits;
    delete etat.requetes[r.custom_id];
  }
  for (const d of Object.values(ouverts)) {
    fs.mkdirSync(path.dirname(sortie(d.l, d.f)), { recursive: true });
    d.cible.__traduits = [...d.faits];
    fs.writeFileSync(sortie(d.l, d.f), JSON.stringify(d.cible));
  }
  console.log(`lot ${id} : ${ok} textes traduits, ${ko} à refaire`);
}

async function suivre() {
  const etat = lire(ETAT, { lots: [], requetes: {} });
  while (etat.lots.length) {
    for (const id of [...etat.lots]) {
      const b = await client.messages.batches.retrieve(id);
      if (b.processing_status !== "ended") {
        const c = b.request_counts;
        console.log(`lot ${id} : en cours (${c.succeeded} faits, ${c.processing} en traitement)`);
        continue;
      }
      await recuperer(id, etat);
      etat.lots = etat.lots.filter((x) => x !== id);
      fs.writeFileSync(ETAT, JSON.stringify(etat));
      sauver(`chore(i18n): contenus traduits (lot ${id.slice(-6)})`);
    }
    if (!etat.lots.length) break;
    if (Date.now() - debut > DUREE_MAX) {
      console.log("Temps écoulé : les lots en cours seront récupérés au prochain passage.");
      return false;
    }
    await sleep(60000);
  }
  return true;
}

fs.mkdirSync("i18n", { recursive: true });
if (!(await suivre())) process.exit(0);

const etat = lire(ETAT, { lots: [], requetes: {} });
const requetes = [];
let n = 0;
for (const f of FICHIERS) {
  const fr = lire(source(f), null);
  if (!fr) continue;
  const toutes = chaines(fr, [], [], f);
  for (const l of LANGUES) {
    const { faits } = traduit(l, f);
    let reste = toutes.filter(([c]) => !faits.has(cleChemin(c)));
    if (LIMITE) reste = reste.slice(0, LIMITE);
    console.log(`${f} → ${l} : ${reste.length} textes à traduire`);
    // Lots : jamais à cheval sur deux unités (méditation, leçon…), ~2500 mots max.
    let lot = [];
    let mots = 0;
    const envoyer = () => {
      if (!lot.length) return;
      const id = `${l}-${f.replace(/[^a-zA-Z0-9_-]/g, "_")}-${Date.now().toString(36)}-${n++}`.slice(0, 64);
      etat.requetes[id] = { l, f, chemins: lot.map(([c]) => c), textes: lot.length };
      requetes.push(demande(id, l, `${f} — ${lot[0][1].slice(0, 80)}`, lot));
      lot = [];
      mots = 0;
    };
    for (const e of reste) {
      const m = e[1].split(/\s+/).length;
      // Longs textes : une méditation / leçon / étude par requête. Petits
      // éléments (plans, questions des jeux…) : regroupés librement.
      const coupe = ["devotions", "formations", "etudes", "plans", "bible/fiches", "bible/introductions"].includes(f) && unite(lot[0]?.[0] ?? []) !== unite(e[0]);
      // Au plus 300 textes par requête (réponse assez courte pour ne pas être coupée).
      if (lot.length && (mots + m > MOTS_PAR_REQUETE || coupe || lot.length >= 300)) envoyer();
      lot.push(e);
      mots += m;
    }
    envoyer();
  }
}
if (process.env.ESSAI_A_SEC === "1") {
  console.log(`${requetes.length} requêtes`);
  console.log(JSON.stringify(requetes[0], null, 1).slice(0, 2500));
  process.exit(0);
}
if (!requetes.length) process.exit(0);
for (let i = 0; i < requetes.length; i += 5000) {
  const lot = await client.messages.batches.create({ requests: requetes.slice(i, i + 5000) });
  etat.lots.push(lot.id);
  console.log(`lot envoyé : ${lot.id} (${Math.min(5000, requetes.length - i)} requêtes)`);
}
fs.writeFileSync(ETAT, JSON.stringify(etat));
sauver("chore(i18n): lots de contenus envoyés");
await suivre();
