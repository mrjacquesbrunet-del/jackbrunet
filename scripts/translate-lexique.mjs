/**
 * LEXIQUE GREC / HÉBREU — traduction française des définitions (OpenAI).
 *
 * Entrée : content/lexique/source/<tranche>.json (STEPBible, CC BY 4.0 :
 *   lemme, gloses et définitions anglaises nettoyées, traductions relevées
 *   dans la Segond 1910).
 * Sortie : content/lexique/fr/<tranche>.json
 *   { "G5465": { "fr": "abaisser", "sens": ["…"], "detail": "…" }, … }
 *
 * Reprenable : les entrées déjà traduites sont sautées ; chaque tranche est
 * sauvegardée (commit + push) dès qu'elle est finie.
 *
 * Variables : OPENAI_API_KEY (obligatoire), OPENAI_MODEL (défaut gpt-4o-mini),
 *   TRANCHES (ex. "G54,H74", vide = tout), CONCURRENCY (défaut 6),
 *   REFAIRE=1 pour retraduire les tranches choisies, GIT_COMMIT=0 pour ne pas committer.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const TRANCHES = (process.env.TRANCHES || "").split(",").map((s) => s.trim()).filter(Boolean);
const CONCURRENCY = Number(process.env.CONCURRENCY || 6);
const BRANCH = process.env.GITHUB_REF_NAME || "claude/great-hamilton-ieokug";
const DO_GIT = process.env.GIT_COMMIT !== "0";
const REFAIRE = process.env.REFAIRE === "1";
const SRC = "content/lexique/source";
const OUT = "content/lexique/fr";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!KEY) {
  console.error("OPENAI_API_KEY manquant.");
  process.exit(1);
}

const SYSTEM =
  "Tu es un lexicographe biblique francophone, spécialiste du grec du Nouveau Testament et de l'hébreu/araméen de l'Ancien. " +
  "Tu traduis et adaptes en français un lexique de type Strong : exact, sobre, clair pour un lecteur non spécialiste, sans parti pris confessionnel. " +
  "Tu réponds STRICTEMENT en JSON valide, uniquement en français.";

function consigne(lot) {
  const entrees = Object.fromEntries(
    lot.map(([code, e]) => [
      code,
      {
        mot: e.lemme,
        translit: e.translit,
        nature: e.morph,
        nom_propre: e.nom,
        glose: e.gloss,
        definition: e.def.slice(0, 3500),
        segond: e.trad.map(([m, n]) => `${m} (${n})`).join(", "),
      },
    ]),
  );
  return (
    `Pour CHAQUE entrée ci-dessous (clé = numéro Strong), produis :\n` +
    `- "fr" : la vedette française, 1 à 4 mots, au format dictionnaire (verbe à l'infinitif, nom au singulier). ` +
    `Choisis-la en t'appuyant sur les traductions de la Segond 1910 (« segond », avec leur nombre d'emplois) quand elles sont pertinentes. ` +
    `Pour un nom propre : son orthographe dans la Segond 1910.\n` +
    `- "sens" : 1 à 5 sens courts en français (sans numéro), du plus littéral au plus figuré. ` +
    `Pour un nom propre : 1 ou 2 éléments (qui ou quoi : « ville de Macédoine », « fils de Juda »… et la signification du nom si la définition la donne).\n` +
    `- "detail" : la définition complète, traduite fidèlement en français et structurée en lignes ` +
    `(garde la numérotation 1), 1a), (a)… ; garde les mots grecs/hébreux et les références bibliques tels quels ; ` +
    `rends les abréviations savantes en clair : LXX → Septante, cf. → voir, pass. → au passif, fig. → au figuré, subst → substantif, ` +
    `Qal/Piel/Hiphil… restent tels quels ; supprime les renvois bibliographiques (Deiss., MM, VGT, Cremer…) et les signes †). ` +
    `Chaîne vide s'il n'y a rien d'utile à ajouter aux sens. Au plus 1200 caractères : condense une définition source très longue (garde les sens et les principales références). ` +
    `IMPORTANT : tout doit être EN FRANÇAIS — ne recopie jamais l'anglais, traduis intégralement (y compris les notes de grammaire : « with accusative » → « avec l'accusatif »).\n\n` +
    `Entrées :\n${JSON.stringify(entrees)}\n\n` +
    `Réponds par un objet JSON : { "<numéro>": { "fr": "…", "sens": ["…"], "detail": "…" }, … } avec TOUTES les clés demandées.`
  );
}

/** Exemple rédigé à la main : le ton, la précision et la forme attendus. */
const EXEMPLE_Q = consigne([
  ["G5465", { lemme: "χαλάω", translit: "chalaō", morph: "G:V", nom: false, gloss: "to lower", trad: [["descendre", 2], ["jeter", 2], ["mettre", 1]],
    def: "χαλάω, -ῶ \n[in LXX: (Jérémie 38:6) (שָׁלַח pi.), etc. ;] \n__(a) to slacken, loosen; \n__(b) to let loose, let go; \n__(with) to lower, let down: with accusative of thing(s), Marc 2:4, Luc 5:4-5, Actes 9:25 27:17, 30; with accusative of person(s) (cf. Je, l.with), pass., 2 Corinthiens 11:33.†" }],
  ["H7462B", { lemme: "רָעָה", translit: "ra.ah", morph: "H:V", nom: false, gloss: "to pasture", trad: [["paître", 62], ["berger", 44], ["pasteur", 33]],
    def: "1) to pasture, tend, graze, feed\n1a) (Qal)\n1a1) to tend, pasture\n1a1a) to shepherd\n1a1b) of ruler, teacher (fig)\n1a1c) of people as flock (fig)\n1a1d) shepherd, herdsman (subst)\n1a2) to feed, graze\n1a2a) of cows, sheep etc (literal)\n1a2b) of idolater, Israel as flock (fig)\n1b) (Hiphil) shepherd, shepherdess\nAlso means: ro.i (רֹעִי \"to shepherd\" H7473)" }],
  ["G0961", { lemme: "Βεροιαῖος", translit: "Beroiaios", morph: "N:A-M-LG", nom: true, gloss: "Berean", trad: [["Bérée", 1]],
    def: "Βεροιαῖος, -α, -ον, \nof Berœa: Actes 20:4.†" }],
]);
const EXEMPLE_R = JSON.stringify({
  G5465: {
    fr: "descendre",
    sens: ["relâcher, desserrer", "laisser aller, lâcher", "faire descendre, abaisser (d'un lieu élevé vers un lieu plus bas)"],
    detail: "(a) relâcher, desserrer ;\n(b) laisser aller, lâcher ;\n(c) faire descendre, abaisser : avec un complément de chose, Marc 2:4, Luc 5:4-5, Actes 9:25 ; 27:17, 30 ; avec un complément de personne, au passif, 2 Corinthiens 11:33.\nDans la Septante : Jérémie 38:6.",
  },
  H7462B: {
    fr: "paître",
    sens: ["faire paître, garder un troupeau", "être berger ; au figuré : conduire, gouverner un peuple", "paître, brouter"],
    detail: "1) faire paître, garder, nourrir\n1a) (Qal)\n1a1) garder, faire paître\n1a1a) être berger\n1a1b) d'un chef, d'un maître (au figuré)\n1a1c) du peuple comme d'un troupeau (au figuré)\n1a1d) berger, pâtre (substantif)\n1a2) paître, brouter\n1a2a) des vaches, des brebis… (au sens propre)\n1a2b) de l'idolâtre, d'Israël comme troupeau (au figuré)\n1b) (Hiphil) berger, bergère\nAutre forme : ro.i (רֹעִי « être berger », H7473)",
  },
  G0961: { fr: "de Bérée", sens: ["originaire de Bérée, ville de Macédoine"], detail: "" },
});

/** « 1.5s », « 6m0s », « 250ms » → millisecondes. */
function duree(t) {
  if (!t) return 0;
  let ms = 0;
  for (const [, n, u] of String(t).matchAll(/([\d.]+)(ms|s|m|h)/g)) ms += Number(n) * { ms: 1, s: 1000, m: 60000, h: 3600000 }[u];
  return ms;
}
let limiteAnnoncee = false;

async function appel(messages) {
  // Peu d'essais : une réponse interrompue est facturée quand même. Les refus
  // pour limite de débit (429) ne sont pas facturés : on attend et on réessaie.
  let essai = 0;
  for (let attente = 0; essai < 4 && attente < 40; ) {
    const ctrl = new AbortController();
    const minuteur = setTimeout(() => ctrl.abort(), 300000);
    try {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({ model: MODEL, messages, temperature: 0.2, response_format: { type: "json_object" } }),
        signal: ctrl.signal,
      });
      if (r.status === 429) {
        attente++;
        if (!limiteAnnoncee) {
          limiteAnnoncee = true;
          console.log(`  limite du compte : ${r.headers.get("x-ratelimit-limit-tokens")} tokens/min, ${r.headers.get("x-ratelimit-limit-requests")} requêtes/min`);
        }
        const ms = Number(r.headers.get("retry-after-ms")) || Number(r.headers.get("retry-after")) * 1000 || duree(r.headers.get("x-ratelimit-reset-tokens")) || 5000;
        await sleep(Math.min(60000, ms + 500 + Math.random() * 1500));
        continue;
      }
      if (r.status >= 500) {
        essai++;
        await sleep(3000 * essai);
        continue;
      }
      const j = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(j).slice(0, 300));
      return JSON.parse(j.choices[0].message.content);
    } catch (e) {
      essai++;
      console.log(`  essai ${essai} : ${String(e).slice(0, 160)}`);
      await sleep(Math.min(20000, 1500 * essai));
    } finally {
      clearTimeout(minuteur);
    }
  }
  return null;
}

/** Un texte resté en anglais (le modèle recopie parfois la source). */
function anglais(t) {
  t = String(t);
  if (/\bLXX\b|\bsee\b/.test(t)) return true;
  const m = ` ${t.toLowerCase()} `.match(/ (?=(the|of|to|with|and|in|is|as|be|by|which|from|for|or|an|that) )/g);
  return (m?.length ?? 0) > 1 + t.length / 200;
}
const valide = (x) =>
  x &&
  typeof x.fr === "string" &&
  x.fr.trim() &&
  Array.isArray(x.sens) &&
  x.sens.length > 0 &&
  x.sens.every((s) => typeof s === "string" && !anglais(s)) &&
  !anglais(x.detail ?? "");

/** Lots d'au plus `max` entrées / ~5000 caractères de définitions. */
function lots(entrees, max) {
  const out = [];
  let lot = [];
  let taille = 0;
  for (const it of entrees) {
    const t = Math.min(3500, it[1].def.length) + 200;
    if (lot.length && (lot.length >= max || taille + t > 5000)) {
      out.push(lot);
      lot = [];
      taille = 0;
    }
    lot.push(it);
    taille += t;
  }
  if (lot.length) out.push(lot);
  return out;
}

function sauver(tranche) {
  if (!DO_GIT) return;
  try {
    execSync(`git add ${OUT}`);
    if (!execSync("git diff --staged --name-only", { encoding: "utf8" }).trim()) return;
    execSync(
      `git -c user.name="github-actions[bot]" -c user.email="github-actions[bot]@users.noreply.github.com" ` +
        `commit -m "chore(lexique): définitions ${tranche} [skip ci]"`,
      { stdio: "inherit" },
    );
  } catch (e) {
    console.log(`  commit ${tranche} : ${String(e).slice(0, 140)}`);
    return;
  }
  for (let a = 0; a < 12; a++) {
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
      execSync(`sleep ${2 + Math.floor(Math.random() * 6)}`);
    }
  }
}

fs.mkdirSync(OUT, { recursive: true });
const tranches = fs
  .readdirSync(SRC)
  .map((f) => f.replace(".json", ""))
  .filter((t) => !TRANCHES.length || TRANCHES.includes(t))
  .sort();

let total = 0;
let manquants = 0;
// Passe 1 : lots normaux ; passes 2 et 3 : rattrapage en petits lots.
for (const [passe, maxCommuns, maxNoms] of [[1, 6, 20], [2, 3, 8], [3, 1, 4]]) {
  manquants = 0;
  for (const tranche of tranches) {
    const source = JSON.parse(fs.readFileSync(path.join(SRC, `${tranche}.json`), "utf8"));
    const fichier = path.join(OUT, `${tranche}.json`);
    const fait = fs.existsSync(fichier) ? JSON.parse(fs.readFileSync(fichier, "utf8")) : {};
    if (REFAIRE && passe === 1) for (const k of Object.keys(fait)) delete fait[k];
    // Les mots de l'exemple modèle : le modèle les saute, on reprend l'exemple.
    for (const [k, v] of Object.entries(JSON.parse(EXEMPLE_R))) if (source[k] && !valide(fait[k])) fait[k] = v;
    const todo = Object.entries(source).filter(([code]) => !valide(fait[code]));
    if (!todo.length) continue;
    console.log(`passe ${passe} — ${tranche} : ${todo.length} entrées à traduire`);
    const paquets = [
      ...lots(todo.filter(([, e]) => !e.nom), maxCommuns),
      ...lots(todo.filter(([, e]) => e.nom), maxNoms),
    ];
    for (let i = 0; i < paquets.length; i += CONCURRENCY) {
      const res = await Promise.all(
        paquets.slice(i, i + CONCURRENCY).map((lot) =>
          appel([
            { role: "system", content: SYSTEM },
            { role: "user", content: EXEMPLE_Q },
            { role: "assistant", content: EXEMPLE_R },
            { role: "user", content: consigne(lot) },
          ]).then((r) => [lot, r]),
        ),
      );
      for (const [lot, r] of res) {
        // Le modèle abrège parfois les codes (« G100 » pour « G0100 ») : on
        // retrouve chaque réponse par son code normalisé.
        const norm = (c) => String(c).toUpperCase().replace(/^([GH])0+(?=\d)/, "$1");
        const parCode = new Map(Object.entries(r ?? {}).map(([k, v]) => [norm(k), v]));
        const raisons = [];
        for (const [code] of lot) {
          const x = r?.[code] ?? parCode.get(norm(code));
          if (!x) raisons.push(`${code}:absent`);
          else if (!valide(x)) raisons.push(`${code}:${anglais(x.detail ?? "") ? "anglais" : "forme"}`);
          if (valide(x)) {
            fait[code] = {
              fr: x.fr.trim(),
              sens: x.sens.map((v) => v.trim()).filter(Boolean).slice(0, 6),
              detail: typeof x.detail === "string" ? x.detail.trim() : "",
            };
            total++;
          } else {
            manquants++;
          }
        }
        if (raisons.length) console.log(`  rejets : ${r ? raisons.join(" ") : "pas de réponse"}`);
      }
      const trie = Object.fromEntries(Object.keys(source).filter((c) => fait[c]).map((c) => [c, fait[c]]));
      fs.writeFileSync(fichier, JSON.stringify(trie));
    }
    sauver(tranche);
  }
  if (!manquants) break;
}
console.log(`Traduit : ${total} — manquants (repris au prochain passage) : ${manquants}`);
