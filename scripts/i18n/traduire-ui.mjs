/**
 * MULTILINGUE — traduction des textes d'interface (anglais, portugais du Brésil)
 * avec Claude (API Anthropic, Message Batches : moitié prix, asynchrone).
 *
 * Entrée  : i18n/source-fr.json (relevé par scripts/i18n/extraire-textes.mjs)
 * Sortie  : public/i18n/ui.en.json, public/i18n/ui.pt.json  { "texte fr": "traduction" }
 * Reprenable : les lots envoyés sont notés dans i18n/lots-ui.json (commité
 * aussitôt) ; un nouveau passage récupère d'abord les lots en cours, puis
 * n'envoie que les textes pas encore traduits.
 *
 * Variables : ANTHROPIC_API_KEY (obligatoire), MODELE (défaut claude-haiku-4-5, le moins cher),
 *   LANGUES (défaut "en,pt"), LIMITE (nombre max de textes par langue, essai),
 *   REFAIRE=1 (tout retraduire), GIT_COMMIT=0, ESSAI_A_SEC=1 (affiche sans envoyer).
 */
import fs from "node:fs";
import { execSync } from "node:child_process";
import Anthropic from "@anthropic-ai/sdk";

const MODELE = process.env.MODELE || "claude-haiku-4-5";
const LANGUES = (process.env.LANGUES || "en,pt").split(",").map((s) => s.trim()).filter(Boolean);
const LIMITE = Number(process.env.LIMITE || 0);
const REFAIRE = process.env.REFAIRE === "1";
const DO_GIT = process.env.GIT_COMMIT !== "0";
const BRANCH = process.env.GITHUB_REF_NAME || "claude/great-hamilton-ieokug";
const SOURCE = "i18n/source-fr.json";
const ETAT = "i18n/lots-ui.json";
const sortie = (l) => `public/i18n/ui.${l}.json`;
/** Écran d'origine de chaque texte (contexte pour la traduction). */
const ECRAN = Object.fromEntries(
  Object.entries(fs.existsSync("i18n/source-fr.json") ? JSON.parse(fs.readFileSync("i18n/source-fr.json", "utf8")) : {}).map(([fr, ou]) => [
    fr,
    (ou[0] ?? "").replace(/:\d+$/, "").replace(/\.(tsx|ts)$/, ""),
  ]),
);
const TAILLE_LOT = 120; // textes par requête
const DUREE_MAX = Number(process.env.DUREE_MAX_MIN || 320) * 60000;
const debut = Date.now();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!process.env.ANTHROPIC_API_KEY && process.env.ESSAI_A_SEC !== "1") {
  console.error("Secret ANTHROPIC_API_KEY absent : l'ajouter dans GitHub (Settings → Secrets and variables → Actions).");
  process.exit(1);
}
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "essai-a-sec" });

const NOMS = { en: "anglais (américain neutre)", pt: "portugais du Brésil" };

const CONSIGNE = (l) =>
  `Tu traduis l'interface de RHEMA, une application chrétienne évangélique de méditation biblique quotidienne, ` +
  `de prière et d'étude de la Bible, créée par le Pasteur Jack Brunet (France). Tu traduis du français vers le ${NOMS[l]}.\n\n` +
  `Règles :\n` +
  `- Ton chaleureux, simple et pastoral, comme l'original. L'app tutoie l'utilisateur : ` +
  (l === "pt"
    ? `en portugais du Brésil, utilise « você » (registre familier et naturel du Brésil), jamais « tu » conjugué à la 2e personne.\n`
    : `en anglais, utilise « you », de façon naturelle et chaleureuse.\n`) +
  `- Textes très courts (boutons, onglets, étiquettes) : reste court, idiomatique, avec la même casse (majuscules, MAJUSCULES).\n` +
  `- Garde EXACTEMENT les variables {0}, {1}, {2}… (elles seront remplacées par des nombres ou des noms), la ponctuation finale, les emojis et les symboles (→, ·, ✓, —).\n` +
  `- Guillemets : « … » deviennent “…”.\n` +
  `- Ne traduis pas : RHEMA, Jack Brunet, Josy W. Brunet, Connecte Ta Foi, les noms de marques (App Store, Google Play, Zoom, WhatsApp, Instagram, YouTube, Stripe).\n` +
  `- « Pasteur Jack » → ${l === "pt" ? "« Pastor Jack »" : "« Pastor Jack »"}. « Bâtisseur(s) » (partenaires mensuels) → ${l === "pt" ? "« Construtor(es) »" : "« Builder(s) »"}. ` +
  `« Mon temps avec Jésus » → ${l === "pt" ? "« Meu tempo com Jesus »" : "« My time with Jesus »"}. « Mur de prière » → ${l === "pt" ? "« Mural de oração »" : "« Prayer wall »"}. ` +
  `« Méditation / dévotionnel du jour » → ${l === "pt" ? "« Devocional do dia »" : "« Daily devotional »"}. « Rhéma » reste « rhema ».\n` +
  `- Bible : noms des livres, des personnages et des lieux selon l'usage ${l === "pt" ? "des Bibles brésiliennes (Almeida) : Gênesis, Êxodo, Salmos, Atos, Apocalipse, Moisés, Davi, Tiago…" : "des Bibles anglaises (KJV/NIV) : Genesis, Exodus, Psalms, Acts, Revelation, Moses, David, James…"} ` +
  `Références « Jean 3:16 » / « Jean 3.16 » → ${l === "pt" ? "« João 3:16 »" : "« John 3:16 »"} (garde chapitres et versets). « L'Éternel » → ${l === "pt" ? "« o Senhor »" : "« the Lord »"}.\n` +
  `- Citations bibliques entre guillemets : rends-les avec la formulation ${l === "pt" ? "d'une Bible brésilienne courante (style Almeida)" : "d'une Bible anglaise classique (style KJV/NKJV, en anglais moderne)"}, fidèle au sens.\n` +
  `- Questions de quiz et réponses : traduis-les comme des questions et réponses de quiz, sans rien ajouter.\n` +
  `- Un texte qui n'est pas du français (code, nom propre seul, sigle) : recopie-le tel quel.\n` +
  `- Ne fusionne, ne saute et n'invente aucun élément : une traduction par identifiant reçu.\n\n` +
  `Tu reçois un tableau JSON d'objets { "i": identifiant, "fr": texte, "ecran": fichier de l'app d'où vient le texte (contexte : jeux, profil, communauté…) }. ` +
  `Des textes voisins viennent souvent du même écran : certains sont des morceaux d'une même phrase coupée par une mise en forme ; traduis chaque morceau pour qu'il s'enchaîne naturellement avec ses voisins. Réponds avec { "traductions": [ { "i": identifiant, "t": traduction } ] } pour TOUS les identifiants.`;

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

function demande(id, langue, textes) {
  return {
    custom_id: id,
    params: {
      model: MODELE,
      max_tokens: 16000,
      system: [{ type: "text", text: CONSIGNE(langue), cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: JSON.stringify(textes.map((fr, i) => ({ i, fr, ecran: ECRAN[fr] }))) }],
      // Haiku : pas de réglage d'effort (réflexion désactivée par défaut).
      output_config: { format: { type: "json_schema", schema: SCHEMA }, ...(MODELE.includes("haiku") ? {} : { effort: "low" }) },
    },
  };
}

/* ————— Lecture / écriture ————— */
const lire = (f, def) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : def);
const variables = (s) => (s.match(/\{\d+\}/g) || []).sort().join(",");

function sauver(message) {
  if (!DO_GIT) return;
  try {
    execSync(`git add public/i18n i18n`);
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

/** Récupère un lot terminé et range les traductions par langue. */
async function recuperer(id, etat) {
  const parLangue = {};
  let ok = 0;
  let ko = 0;
  for await (const r of await client.messages.batches.results(id)) {
    const textes = etat.requetes[r.custom_id];
    if (!textes) continue;
    const langue = r.custom_id.split("-")[0];
    if (r.result.type !== "succeeded") {
      ko += textes.length;
      continue;
    }
    const m = r.result.message;
    const brut = m.content.find((b) => b.type === "text")?.text;
    let x = null;
    try {
      x = m.stop_reason === "end_turn" && brut ? JSON.parse(brut) : null;
    } catch {
      x = null;
    }
    const d = (parLangue[langue] ??= {});
    let faits = 0;
    for (const { i, t } of x?.traductions ?? []) {
      const fr = textes[i];
      // Les variables {0}, {1}… doivent toutes être conservées.
      if (fr === undefined || typeof t !== "string" || !t.trim() || variables(fr) !== variables(t)) continue;
      d[fr] = t.trim();
      faits++;
    }
    ok += faits;
    ko += textes.length - faits;
    delete etat.requetes[r.custom_id];
  }
  for (const [l, d] of Object.entries(parLangue)) {
    const avant = lire(sortie(l), {});
    fs.writeFileSync(sortie(l), JSON.stringify(Object.fromEntries(Object.entries({ ...avant, ...d }).sort()), null, 0));
  }
  console.log(`lot ${id} : ${ok} traductions, ${ko} à refaire`);
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
      fs.writeFileSync(ETAT, JSON.stringify(etat, null, 1));
      sauver(`chore(i18n): traductions de l'interface (lot ${id.slice(-6)})`);
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

fs.mkdirSync("public/i18n", { recursive: true });

// 1) Lots déjà envoyés : on les récupère d'abord.
if (!(await suivre())) process.exit(0);

// 2) Nouveaux lots pour les textes pas encore traduits, groupés par écran
//    (fichier d'origine) pour que chaque lot garde son contexte.
const relevé = lire(SOURCE, {});
const source = Object.keys(relevé).sort((a, b) => (relevé[a][0] ?? "").localeCompare(relevé[b][0] ?? "", "fr", { numeric: true }));
const etat = lire(ETAT, { lots: [], requetes: {} });
const requetes = [];
for (const l of LANGUES) {
  const faits = REFAIRE ? {} : lire(sortie(l), {});
  let reste = source.filter((fr) => !faits[fr]);
  if (LIMITE) reste = reste.slice(0, LIMITE);
  console.log(`${l} : ${reste.length} textes à traduire`);
  for (let i = 0; i < reste.length; i += TAILLE_LOT) {
    const textes = reste.slice(i, i + TAILLE_LOT);
    const id = `${l}-${Date.now().toString(36)}-${i / TAILLE_LOT}`;
    etat.requetes[id] = textes;
    requetes.push(demande(id, l, textes));
  }
}
if (process.env.ESSAI_A_SEC === "1") {
  console.log(JSON.stringify(requetes.slice(0, 1), null, 1).slice(0, 4000));
  process.exit(0);
}
if (!requetes.length) process.exit(0);

for (let i = 0; i < requetes.length; i += 5000) {
  const lot = await client.messages.batches.create({ requests: requetes.slice(i, i + 5000) });
  etat.lots.push(lot.id);
  console.log(`lot envoyé : ${lot.id} (${Math.min(5000, requetes.length - i)} requêtes)`);
}
fs.writeFileSync(ETAT, JSON.stringify(etat, null, 1));
sauver("chore(i18n): lots de traduction envoyés");
await suivre();
