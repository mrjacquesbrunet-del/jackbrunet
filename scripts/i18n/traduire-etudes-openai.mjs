/**
 * MULTILINGUE — commentaires mot à mot et lexique hébreu/grec traduits
 * D'AVANCE en anglais et en portugais du Brésil, avec l'API Batch d'OpenAI
 * (gpt-4o-mini, moitié prix, résultat en quelques heures).
 *
 * Entrées  : public/commentary/<livre>/<chap>.json, public/lexique/mots/<tranche>.json
 * Sorties  : i18n/etude/<langue>/commentary/<livre>/<chap>.json
 *            i18n/etude/<langue>/lexique/<tranche>.json
 *            (mêmes structures que le français ; mots grecs/hébreux,
 *            translittérations et codes inchangés)
 * Reprenable : les lots en cours sont notés dans i18n/etude/etat.json ; ce qui
 * est déjà traduit (présent dans les sorties) n'est jamais renvoyé.
 *
 * Variables : OPENAI_API_KEY, MODELE (gpt-4o-mini), LANGUES ("en,pt"),
 *   TYPES ("commentaire,lexique"), LIMITE_TOKENS (jetons envoyés en même temps,
 *   1 800 000 par défaut : limite du niveau 1 d'OpenAI), LIMITE_REQUETES (essai),
 *   DUREE_MAX_MIN (320), GIT_COMMIT=0, ESSAI_A_SEC=1.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const KEY = process.env.OPENAI_API_KEY;
const MODELE = process.env.MODELE || "gpt-4o-mini";
const LANGUES = (process.env.LANGUES || "en,pt").split(",").map((s) => s.trim()).filter(Boolean);
const TYPES = (process.env.TYPES || "commentaire,lexique").split(",").map((s) => s.trim()).filter(Boolean);
const LIMITE_TOKENS = Number(process.env.LIMITE_TOKENS || 1_800_000);
const LIMITE_REQUETES = Number(process.env.LIMITE_REQUETES || 0);
const DUREE_MAX = Number(process.env.DUREE_MAX_MIN || 320) * 60000;
const DO_GIT = process.env.GIT_COMMIT !== "0";
const SEC = process.env.ESSAI_A_SEC === "1";
const BRANCH = process.env.GITHUB_REF_NAME || "claude/great-hamilton-ieokug";
const RACINE = "i18n/etude";
const ETAT = `${RACINE}/etat.json`;
const CAR_PAR_REQUETE = Number(process.env.CAR_PAR_REQUETE || 9000); // ~2 500 jetons : réponse largement sous la limite du modèle
const debut = Date.now();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!KEY && !SEC) {
  console.error("Secret OPENAI_API_KEY absent.");
  process.exit(1);
}

const NOMS = { en: "American English", pt: "Brazilian Portuguese" };
const EXEMPLE = { en: "Jean 3:16 → John 3:16", pt: "Jean 3:16 → João 3:16" };
/** Champs jamais traduits (mots grecs/hébreux, translittérations, codes, données). */
const INTACTS = new Set(["mot", "translit", "pron", "nature", "strong", "trad", "de", "derives", "nb"]);
/** Champs du lexique envoyés à la traduction (le reste est recopié tel quel). */
const CHAMPS_LEXIQUE = ["fr", "sens", "detail", "origine", "emploi", "portee", "versets"];

const consigne = (l) =>
  `You translate French Bible-study content (word studies of Greek and Hebrew words, lexicon entries, ` +
  `historical and cultural commentary) for RHEMA, an evangelical Christian Bible app, into ${NOMS[l]}. ` +
  `You receive a JSON object; return the SAME JSON object: same keys, same structure, same number of items ` +
  `in every list. Translate every French text value faithfully and naturally, with an accurate theological ` +
  `vocabulary. Never translate or change Greek or Hebrew words, transliterations, Strong codes, or the values ` +
  `of the keys mot, translit, pron, nature, strong. Bible references: book names as usual in ${NOMS[l]} Bibles, ` +
  `chapter and verse numbers unchanged (${EXEMPLE[l]}). Do not add, explain or omit anything.`;

const lire = (f, def) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : def);
const ecrire = (f, v) => {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(v));
};
const jetons = (s) => Math.ceil(s.length / 3.2);

/* ---------- Unités à traduire ---------- */

/** Fichiers source : [type, clé fichier, chemin FR, chemin sortie(l)] */
function fichiersSource() {
  const out = [];
  if (TYPES.includes("commentaire"))
    for (const livre of fs.readdirSync("public/commentary").filter((d) => /^\d+$/.test(d)).sort((a, b) => a - b))
      for (const f of fs.readdirSync(`public/commentary/${livre}`).filter((f) => f.endsWith(".json")).sort((a, b) => parseInt(a) - parseInt(b))) {
        const chap = f.replace(".json", "");
        out.push(["commentaire", `${livre}/${chap}`, `public/commentary/${livre}/${f}`, (l) => `${RACINE}/${l}/commentary/${livre}/${chap}.json`]);
      }
  if (TYPES.includes("lexique"))
    for (const f of fs.readdirSync("public/lexique/mots").filter((f) => f.endsWith(".json")).sort()) {
      const t = f.replace(".json", "");
      out.push(["lexique", t, `public/lexique/mots/${f}`, (l) => `${RACINE}/${l}/lexique/${t}.json`]);
    }
  return out;
}

/** Partie envoyée à la traduction pour une entrée. */
function aTraduire(type, entree) {
  if (type === "commentaire") return entree;
  const o = {};
  for (const k of CHAMPS_LEXIQUE) if (entree[k] !== undefined) o[k] = entree[k];
  return o;
}

function memeForme(a, b) {
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((x, i) => memeForme(x, b[i]));
  if (a && typeof a === "object") return !!b && typeof b === "object" && !Array.isArray(b) && Object.keys(a).every((k) => k in b && memeForme(a[k], b[k]));
  return typeof a === typeof b;
}
/** Une fiche revenue avec encore du français (ex. la liste des sens recopiée telle
 * quelle) est refusée : elle sera renvoyée au lot suivant. */
const MOTS_FR = /\b(les|des|du|une|est|et|dans|avec|sur|cette|aux|être|qui|nous|vous|le|la|il|elle)\b/g;
const MOTS_FR_PT = /\b(les|des|du|une|est|et|dans|pour|avec|sur|cette|aux|être|qui|nous|vous|le|la|il|elle)\b/g;
function resteFrancais(valeur, l) {
  const txt = JSON.stringify(valeur);
  return (txt.match(l === "pt" ? MOTS_FR_PT : MOTS_FR) ?? []).length > 3;
}
function restaurer(fr, tr) {
  if (Array.isArray(fr)) return fr.map((x, i) => restaurer(x, tr?.[i]));
  if (fr && typeof fr === "object") {
    const o = {};
    for (const [k, v] of Object.entries(fr)) o[k] = INTACTS.has(k) ? v : restaurer(v, tr?.[k]);
    return o;
  }
  return typeof tr === typeof fr ? tr : fr;
}

/* ---------- API OpenAI ---------- */

async function api(chemin, init = {}) {
  for (let essai = 0; essai < 5; essai++) {
    const r = await fetch(`https://api.openai.com/v1${chemin}`, {
      ...init,
      headers: { Authorization: `Bearer ${KEY}`, ...(init.headers ?? {}) },
    });
    if (r.ok) return r;
    const corps = await r.text();
    if (r.status >= 500 || r.status === 429) {
      console.log(`OpenAI ${r.status}, nouvel essai… ${corps.slice(0, 160)}`);
      await sleep(15000 * (essai + 1));
      continue;
    }
    throw new Error(`OpenAI ${r.status} sur ${chemin} : ${corps.slice(0, 400)}`);
  }
  throw new Error(`OpenAI indisponible (${chemin})`);
}

async function envoyerLot(lignes) {
  const fd = new FormData();
  fd.append("purpose", "batch");
  fd.append("file", new Blob([lignes.join("\n")], { type: "application/jsonl" }), "lot.jsonl");
  const f = await (await api("/files", { method: "POST", body: fd })).json();
  const b = await (
    await api("/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input_file_id: f.id, endpoint: "/v1/chat/completions", completion_window: "24h" }),
    })
  ).json();
  return b.id;
}

/* ---------- Sauvegarde git ---------- */

function sauver(message) {
  if (!DO_GIT) return;
  try {
    execSync(`git add ${RACINE}`);
    if (!execSync("git diff --staged --name-only", { encoding: "utf8" }).trim()) return;
    execSync(`git commit -q -m "${message} [skip ci]"`, { stdio: "inherit" });
  } catch (e) {
    console.log(`commit : ${String(e).slice(0, 140)}`);
    return;
  }
  for (let a = 0; a < 10; a++) {
    try {
      execSync(`git pull -q --rebase --autostash origin ${BRANCH}`, { stdio: "inherit" });
      execSync(`git push -q origin HEAD:${BRANCH}`, { stdio: "inherit" });
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

/* ---------- Récupération des lots terminés ---------- */

const SOURCES = new Map(fichiersSource().map((s) => [`${s[0]}:${s[1]}`, s]));

async function recuperer(lot) {
  const b = await (await api(`/batches/${lot.id}`)).json();
  if (["validating", "in_progress", "finalizing", "cancelling"].includes(b.status)) {
    const c = b.request_counts ?? {};
    console.log(`lot ${lot.id} : ${b.status} (${c.completed ?? 0}/${c.total ?? "?"})`);
    return false;
  }
  let ok = 0;
  let ko = 0;
  if (b.output_file_id) {
    const texte = await (await api(`/files/${b.output_file_id}/content`)).text();
    const parFichier = new Map();
    for (const ligne of texte.split("\n")) {
      if (!ligne.trim()) continue;
      const r = JSON.parse(ligne);
      const [l, type, cleFichier] = r.custom_id.split("|");
      const src = SOURCES.get(`${type}:${cleFichier}`);
      const contenu = r.response?.body?.choices?.[0]?.message?.content;
      const fini = r.response?.body?.choices?.[0]?.finish_reason;
      if (!src || r.response?.status_code !== 200 || fini !== "stop" || !contenu) {
        ko++;
        continue;
      }
      let tr;
      try {
        tr = JSON.parse(contenu);
      } catch {
        ko++;
        continue;
      }
      const fr = lire(src[2], {});
      const k = `${l}|${src[3](l)}`;
      if (!parFichier.has(k)) parFichier.set(k, { sortie: src[3](l), donnees: lire(src[3](l), {}) });
      const cible = parFichier.get(k).donnees;
      for (const [cle, valeur] of Object.entries(tr)) {
        const orig = fr[cle];
        if (!orig) continue;
        const partie = aTraduire(type, orig);
        if (!memeForme(partie, valeur) || (type === "lexique" && resteFrancais(valeur, l))) {
          ko++;
          continue;
        }
        cible[cle] = type === "commentaire" ? restaurer(orig, valeur) : { ...orig, ...restaurer(partie, valeur) };
        ok++;
      }
    }
    for (const { sortie, donnees } of parFichier.values()) ecrire(sortie, donnees);
  }
  console.log(`lot ${lot.id} : ${b.status}, ${ok} entrées traduites, ${ko} à refaire`);
  return true;
}

/* ---------- Préparation des nouvelles requêtes ---------- */

function requetesEnAttente(enCours) {
  const lignes = [];
  for (const l of LANGUES)
    for (const [type, cleFichier, cheminFr, sortie] of SOURCES.values()) {
      const fr = lire(cheminFr, {});
      const deja = lire(sortie(l), {});
      const restantes = Object.keys(fr).filter((k) => !deja[k] && !enCours.has(`${l}|${type}|${cleFichier}|${k}`));
      // Regroupe les entrées d'un même fichier, ~9 000 caractères par requête.
      let groupe = {};
      let taille = 0;
      const pousser = () => {
        const cles = Object.keys(groupe);
        if (!cles.length) return;
        const contenu = JSON.stringify(groupe);
        lignes.push({
          id: `${l}|${type}|${cleFichier}|${cles.join(",")}`.slice(0, 500),
          cles: cles.map((c) => `${l}|${type}|${cleFichier}|${c}`),
          jetons: jetons(contenu) * 2 + 300,
          ligne: JSON.stringify({
            custom_id: `${l}|${type}|${cleFichier}|${lignes.length}`,
            method: "POST",
            url: "/v1/chat/completions",
            body: {
              model: MODELE,
              temperature: 0.2,
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: consigne(l) },
                { role: "user", content: contenu },
              ],
            },
          }),
        });
        groupe = {};
        taille = 0;
      };
      for (const k of restantes) {
        const partie = aTraduire(type, fr[k]);
        const t = JSON.stringify(partie).length;
        if (taille && taille + t > CAR_PAR_REQUETE) pousser();
        groupe[k] = partie;
        taille += t;
      }
      pousser();
    }
  return lignes;
}

/* ---------- Boucle principale ---------- */

const etat = lire(ETAT, { lots: [] });
let total = 0;
for (;;) {
  // 1) Lots terminés → fichiers traduits
  for (const lot of [...etat.lots]) {
    if (SEC) break;
    if (await recuperer(lot)) {
      etat.lots = etat.lots.filter((x) => x.id !== lot.id);
      ecrire(ETAT, etat);
      sauver(`chore(i18n): commentaires et lexique traduits (lot ${lot.id.slice(-6)})`);
    }
  }
  // 2) Nouveaux lots, dans la limite des jetons en file d'attente
  const enCours = new Set(etat.lots.flatMap((x) => x.cles ?? []));
  const enFile = etat.lots.reduce((n, x) => n + (x.jetons ?? 0), 0);
  let attente = requetesEnAttente(enCours);
  if (LIMITE_REQUETES) attente = attente.slice(0, Math.max(0, LIMITE_REQUETES - total));
  if (SEC) {
    const j = attente.reduce((n, x) => n + x.jetons, 0);
    console.log(`${attente.length} requêtes à envoyer, ~${Math.round(j / 1e6)} M jetons (entrée + sortie)`);
    console.log(attente[0]?.ligne.slice(0, 1500));
    process.exit(0);
  }
  const lot = [];
  let j = enFile;
  for (const r of attente) {
    if (lot.length >= 40000 || (lot.length && j + r.jetons / 2 > LIMITE_TOKENS)) break;
    lot.push(r);
    j += r.jetons / 2; // la file d'attente compte les jetons d'entrée
  }
  if (lot.length && (enFile === 0 || j <= LIMITE_TOKENS)) {
    const id = await envoyerLot(lot.map((r) => r.ligne));
    total += lot.length;
    etat.lots.push({ id, jetons: Math.round(j - enFile), cles: lot.flatMap((r) => r.cles) });
    ecrire(ETAT, etat);
    console.log(`lot envoyé : ${id} (${lot.length} requêtes, ~${Math.round((j - enFile) / 1000)} k jetons)`);
    sauver("chore(i18n): lot de traduction des commentaires envoyé");
  }
  if (!etat.lots.length && !attente.length) {
    console.log("Tout est traduit.");
    break;
  }
  if (LIMITE_REQUETES && total >= LIMITE_REQUETES && !etat.lots.length) break;
  if (Date.now() - debut > DUREE_MAX) {
    console.log("Temps écoulé : la suite au prochain passage.");
    fs.writeFileSync(".suite-etudes", "1");
    break;
  }
  await sleep(120000);
}
