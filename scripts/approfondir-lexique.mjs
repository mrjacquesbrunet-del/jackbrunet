/**
 * LEXIQUE GREC / HÉBREU — fiches approfondies en français, avec Claude
 * (API Anthropic, Message Batches : moitié prix, traitement asynchrone).
 *
 * Pour chaque mot : vedette, sens, définition complète (traduite de
 * STEPBible, CC BY 4.0), origine du mot, emploi dans la Bible, portée
 * spirituelle, versets clés. Le modèle reçoit les vrais emplois dans la Segond
 * (concordance) pour s'appuyer sur le texte.
 *
 * Sortie : content/lexique/claude/<tranche>.json
 * Reprenable : les lots envoyés sont notés dans content/lexique/claude-lots.json
 * (commité aussitôt) ; un nouveau passage récupère d'abord les lots en cours.
 *
 * Variables : ANTHROPIC_API_KEY (obligatoire), MODELE (défaut claude-haiku-4-5),
 *   TRANCHES (ex. "G54,H74", vide = tout), LIMITE (nombre max de mots, essai),
 *   REFAIRE=1 (refaire les mots des tranches choisies), GIT_COMMIT=0.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import Anthropic from "@anthropic-ai/sdk";

const MODELE = process.env.MODELE || "claude-haiku-4-5";
const TRANCHES = (process.env.TRANCHES || "").split(",").map((s) => s.trim()).filter(Boolean);
const LIMITE = Number(process.env.LIMITE || 0);
const REFAIRE = process.env.REFAIRE === "1";
const DO_GIT = process.env.GIT_COMMIT !== "0";
const BRANCH = process.env.GITHUB_REF_NAME || "claude/great-hamilton-ieokug";
const SRC = "content/lexique/source";
const OUT = "content/lexique/claude";
const ETAT = "content/lexique/claude-lots.json";
const DUREE_MAX = Number(process.env.DUREE_MAX_MIN || 320) * 60000; // reste sous la limite du job
const debut = Date.now();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!process.env.ANTHROPIC_API_KEY && process.env.ESSAI_A_SEC !== "1") {
  console.error("Secret ANTHROPIC_API_KEY absent : l'ajouter dans GitHub (Settings → Secrets and variables → Actions).");
  process.exit(1);
}
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "essai-a-sec" });

/* ————— Données d'appui : texte de la Segond et concordance ————— */
const index = JSON.parse(fs.readFileSync("public/bible/index.json", "utf8"));
const NOM = Object.fromEntries(index.map((b) => [b.id, b.name]));
const livres = new Map();
const livre = (b) => {
  if (!livres.has(b)) livres.set(b, JSON.parse(fs.readFileSync(`public/bible/${b}.json`, "utf8")).chapters);
  return livres.get(b);
};
const conc = new Map();
const emplois = (code) => {
  const t = code.slice(0, 3);
  if (!conc.has(t)) {
    const f = `public/lexique/conc/${t}.json`;
    conc.set(t, fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : {});
  }
  return conc.get(t)[code] ?? [];
};

/** Toutes les références d'emploi (au plus 80), au format « Jean 3:16 ». */
const references = (code) => emplois(code).slice(0, 80).map(([b, c, v]) => `${NOM[b]} ${c}:${v}`);
const ID_LIVRE = Object.fromEntries(index.map((b) => [b.name, b.id]));
/** « Jean 3:16-18 » → « 43:3:16 » (clé de concordance), ou null. */
function cleRef(r) {
  const m = String(r).trim().match(/^(.+?)\s+(\d+):(\d+)/);
  const b = m && ID_LIVRE[m[1]];
  return b ? `${b}:${m[2]}:${m[3]}` : null;
}

/** Quelques emplois répartis dans la Bible, le mot traduit entre « ». */
function exemples(code, n = 6) {
  const e = emplois(code).filter((x) => x.length > 5);
  const pas = Math.max(1, Math.floor(e.length / n));
  const choix = [];
  for (let i = 0; i < e.length && choix.length < n; i += pas) choix.push(e[i]);
  return choix.map(([b, c, v, , ...pl]) => {
    let t = livre(b)[c - 1]?.[v - 1] ?? "";
    for (let i = pl.length - 2; i >= 0; i -= 2) t = `${t.slice(0, pl[i])}«${t.slice(pl[i], pl[i + 1])}»${t.slice(pl[i + 1])}`;
    return `${NOM[b]} ${c}:${v} — ${t}`;
  });
}

/* ————— Consigne (commune à toutes les requêtes : mise en cache) ————— */
const CONSIGNE = `Tu es un bibliste et un pédagogue francophone, spécialiste du grec du Nouveau Testament et de l'hébreu/araméen de l'Ancien. Tu rédiges les fiches d'un lexique biblique pour une application chrétienne évangélique. Tu écris pour un chrétien qui n'a jamais étudié le grec ni l'hébreu : clair, vivant, concret, fidèle au texte biblique, sans spéculation. Tu ne te contentes pas de traduire la définition source : tu l'expliques et tu la développes. Tout est en français.

Pour le mot reçu, remplis :
- "fr" : UNE seule vedette française (pas de liste, pas de point-virgule), 1 à 4 mots, au format dictionnaire (verbe à l'infinitif, nom au singulier), cohérente avec les traductions de la Segond 1910 fournies. Nom propre : son orthographe dans la Segond 1910.
- "sens" : 1 à 6 sens courts et clairs, du plus concret au plus figuré (sans numéro). Nom propre : qui ou quoi (« ville de Macédoine », « fils de Juda »).
- "detail" : LE SENS EXPLIQUÉ. Reprends chaque sens et explique-le en une à trois phrases simples : ce que le mot veut dire concrètement, l'image qu'il évoque, et un exemple tiré des emplois fournis (avec sa référence). Une ligne par sens, numérotée « 1. », « 2. »… Pas de jargon : bannis les termes techniques (accusatif, génitif, aoriste, Qal, Piel, hiphil, LXX, hapax…) ou explique-les en mots simples s'ils sont vraiment utiles. 600 à 1500 caractères. Pour un nom propre, une ou deux phrases suffisent.
- "origine" : d'où vient le mot, expliqué simplement : sa racine et son image de départ, les mots de la même famille, et pour un mot grec le mot hébreu qu'il traduit souvent dans l'Ancien Testament grec quand c'est éclairant. 2 à 4 phrases. Nom propre : la signification du nom si elle est connue.
- "emploi" : comment la Bible emploie ce mot — combien de fois, dans quels livres et quels contextes, et comment son sens se nuance d'un passage à l'autre — en t'appuyant sur les emplois fournis. 3 à 6 phrases. Nom propre : qui est cette personne ou ce qu'est ce lieu, et ce que la Bible en raconte, en 2 à 4 phrases.
- "portee" : ce que ce mot apporte au lecteur pour sa foi et sa vie chrétienne, avec sobriété et sans forcer le texte. 2 à 4 phrases. Chaîne vide pour un mot purement grammatical ou un nom propre sans portée particulière.
- "versets" : 2 à 4 références clés au format « Jean 3:16 » (noms de livres et numérotation de la Segond).

Règles d'exactitude :
- Les emplois fournis désignent tous CE mot précis. Un nom propre porté par plusieurs personnes (Joseph, Marie, Jacques…) a une fiche par personne : ne décris que la personne ou le lieu désigné par ces emplois, jamais les homonymes.
- Ne cite que des références qui figurent dans « references_emplois » ou dans la définition source ; n'invente aucune référence ni aucun fait.
- Ne recopie jamais l'anglais : traduis. Cite les références bibliques avec les noms français des livres.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["fr", "sens", "detail", "origine", "emploi", "portee", "versets"],
  properties: {
    fr: { type: "string" },
    sens: { type: "array", items: { type: "string" } },
    detail: { type: "string" },
    origine: { type: "string" },
    emploi: { type: "string" },
    portee: { type: "string" },
    versets: { type: "array", items: { type: "string" } },
  },
};

function demande(code, e) {
  const params = {
    model: MODELE,
    max_tokens: e.nom ? 3000 : 6000,
    system: [{ type: "text", text: CONSIGNE, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: JSON.stringify({
          numero: code,
          mot: e.lemme,
          translitteration: e.translit,
          nature: e.morph,
          nom_propre: e.nom,
          glose_anglaise: e.gloss,
          definition_source: e.def.slice(0, 4000),
          traductions_segond: e.trad.map(([m, n]) => `${m} (${n})`).join(", "),
          nombre_emplois: e.nb,
          emplois_segond: exemples(code),
          references_emplois: references(code),
        }),
      },
    ],
    output_config: { format: { type: "json_schema", schema: SCHEMA } },
  };
  // Effort bas : réflexion courte, coût réduit (Haiku 4.5 ne prend pas d'effort).
  if (!MODELE.startsWith("claude-haiku")) params.output_config.effort = "low";
  return { custom_id: code, params };
}

/* ————— Lecture / écriture ————— */
const lire = (f, def) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : def);
const valide = (x) => x && typeof x.fr === "string" && x.fr.trim() && Array.isArray(x.sens) && x.sens.length > 0;

function sauver(message) {
  if (!DO_GIT) return;
  try {
    execSync(`git add ${OUT} ${ETAT}`);
    if (!execSync("git diff --staged --name-only", { encoding: "utf8" }).trim()) return;
    execSync(`git commit -m "${message} [skip ci]"`, { stdio: "inherit" });
  } catch (e) {
    console.log(`commit : ${String(e).slice(0, 140)}`);
    return;
  }
  for (let a = 0; a < 10; a++) {
    try {
      execSync(`git pull --rebase origin ${BRANCH}`, { stdio: "inherit" });
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

const connus = (code) => new Set(emplois(code).map(([b, c, v]) => `${b}:${c}:${v}`));

/** Récupère les résultats d'un lot terminé et les range par tranche. */
async function recuperer(id) {
  const parTranche = {};
  let ok = 0;
  let ko = 0;
  let cache = 0;
  for await (const r of await client.messages.batches.results(id)) {
    const code = r.custom_id;
    if (r.result.type !== "succeeded") {
      ko++;
      continue;
    }
    const m = r.result.message;
    cache += m.usage?.cache_read_input_tokens ?? 0;
    const texte = m.content.find((b) => b.type === "text")?.text;
    let x = null;
    try {
      x = m.stop_reason === "end_turn" && texte ? JSON.parse(texte) : null;
    } catch {
      x = null;
    }
    if (!valide(x)) {
      ko++;
      continue;
    }
    (parTranche[code.slice(0, 3)] ??= {})[code] = {
      fr: x.fr.split(/[;,]/)[0].trim(),
      sens: x.sens.map((s) => s.trim()).filter(Boolean).slice(0, 6),
      detail: x.detail.trim(),
      origine: x.origine.trim(),
      emploi: x.emploi.trim(),
      portee: x.portee.trim(),
      // Versets clés : seulement des emplois réels de ce mot (pas d'invention).
      versets: x.versets.map((s) => s.trim()).filter((r) => connus(code).has(cleRef(r))).slice(0, 4),
    };
    ok++;
  }
  for (const [t, d] of Object.entries(parTranche)) {
    const f = path.join(OUT, `${t}.json`);
    const avant = lire(f, {});
    fs.writeFileSync(f, JSON.stringify({ ...avant, ...d }));
  }
  console.log(`lot ${id} : ${ok} fiches, ${ko} à refaire (lecture du cache : ${cache} tokens)`);
}

/** Attend la fin des lots notés dans l'état, puis les récupère. */
async function suivre() {
  let etat = lire(ETAT, { lots: [] });
  while (etat.lots.length) {
    for (const id of [...etat.lots]) {
      const b = await client.messages.batches.retrieve(id);
      if (b.processing_status !== "ended") {
        const c = b.request_counts;
        console.log(`lot ${id} : en cours (${c.succeeded} faits, ${c.processing} en traitement)`);
        continue;
      }
      await recuperer(id);
      etat.lots = etat.lots.filter((x) => x !== id);
      fs.writeFileSync(ETAT, JSON.stringify(etat, null, 1));
      sauver(`chore(lexique): fiches Claude (lot ${id.slice(-6)})`);
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

fs.mkdirSync(OUT, { recursive: true });

// 1) Lots déjà envoyés : on les récupère d'abord.
if (!(await suivre())) process.exit(0);

// 2) Nouveaux lots pour les mots qui n'ont pas encore leur fiche.
const requetes = [];
for (const f of fs.readdirSync(SRC).sort()) {
  const t = f.replace(".json", "");
  if (TRANCHES.length && !TRANCHES.includes(t)) continue;
  const source = JSON.parse(fs.readFileSync(path.join(SRC, f), "utf8"));
  const faits = REFAIRE ? {} : lire(path.join(OUT, `${t}.json`), {});
  for (const [code, e] of Object.entries(source)) {
    if (valide(faits[code])) continue;
    requetes.push(demande(code, e));
    if (LIMITE && requetes.length >= LIMITE) break;
  }
  if (LIMITE && requetes.length >= LIMITE) break;
}
console.log(`${requetes.length} fiches à rédiger avec ${MODELE}`);
if (process.env.ESSAI_A_SEC === "1") {
  console.log(JSON.stringify(requetes.slice(0, 2), null, 1));
  process.exit(0);
}
if (!requetes.length) process.exit(0);

const etat = lire(ETAT, { lots: [] });
for (let i = 0; i < requetes.length; i += 5000) {
  const lot = await client.messages.batches.create({ requests: requetes.slice(i, i + 5000) });
  etat.lots.push(lot.id);
  console.log(`lot envoyé : ${lot.id} (${Math.min(5000, requetes.length - i)} fiches)`);
}
fs.writeFileSync(ETAT, JSON.stringify(etat, null, 1));
sauver("chore(lexique): lots Claude envoyés");
await suivre();
