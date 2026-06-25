/**
 * Génère, via l'API OpenAI, un commentaire d'étude FRANÇAIS pour chaque verset :
 * mots grec/hébreu, contexte de l'époque, contexte du passage, éclairage
 * culturel, interprétation et commentaire biblique.
 *
 * - Lit le texte depuis public/bible/<id>.json (déjà présent).
 * - Écrit public/commentary/<id>/<chapitre>.json (clé = numéro de verset).
 * - REPRISE : saute les versets déjà générés → relançable sans tout refaire.
 *
 * Variables d'env :
 *   OPENAI_API_KEY  (secret, obligatoire)
 *   OPENAI_MODEL    (défaut: gpt-4o-mini)
 *   BOOKS           (ex: "43" ou "40,41,42,43" ; vide = toute la Bible)
 *   CONCURRENCY     (défaut: 8)
 *   LIMIT           (défaut: 0 = illimité ; utile pour un test)
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const BOOKS = (process.env.BOOKS || "")
  .split(",").map((s) => s.trim()).filter(Boolean).map(Number);
const CONCURRENCY = Number(process.env.CONCURRENCY || 8);
const LIMIT = Number(process.env.LIMIT || 0);
const BRANCH = process.env.GITHUB_REF_NAME || "claude/great-hamilton-ieokug";
const DO_GIT = process.env.GIT_COMMIT !== "0";

if (!KEY) {
  console.error("❌ OPENAI_API_KEY manquant.");
  process.exit(1);
}

const BIBLE_DIR = "public/bible";
const OUT_DIR = "public/commentary";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const index = JSON.parse(fs.readFileSync(path.join(BIBLE_DIR, "index.json"), "utf8"));
const origLang = (id) => (id <= 39 ? "hébreu" : "grec");

const SYSTEM =
  "Tu es un pasteur évangélique francophone, fidèle à la Bible et christocentrique. " +
  "Tu rédiges un commentaire d'étude clair, sobre, édifiant et applicable. " +
  "Tu réponds STRICTEMENT en JSON valide, uniquement en français, sans aucun texte hors du JSON.";

function userPrompt(book, chapter, verse, text) {
  const orig = origLang(book.id);
  return (
    `Référence : ${book.name} ${chapter}:${verse}\n` +
    `Texte (Louis Segond 1910) : « ${text} »\n\n` +
    `Rédige un commentaire d'étude en JSON avec EXACTEMENT ces clés :\n` +
    `{\n` +
    `  "mots": [ { "mot": "<mot ${orig} d'origine, en caractères ${orig}>", "translit": "<translittération>", "sens": "<explication DÉVELOPPÉE du mot, façon dictionnaire Strong : sens premier, nuances, racine ou champ sémantique, et portée théologique/spirituelle dans ce verset, en 3 à 4 phrases>" } ],\n` +
    `  "epoque": "<contexte historique et de l'époque (1-2 phrases)>",\n` +
    `  "passage": "<contexte du passage et du chapitre (1-2 phrases)>",\n` +
    `  "culture": "<éclairage culturel utile (1-2 phrases)>",\n` +
    `  "interpretation": "<interprétation et sens spirituel (2-3 phrases)>",\n` +
    `  "commentaire": "<commentaire biblique édifiant et applicable (2-4 phrases)>"\n` +
    `}\n` +
    `Donne 2 à 4 mots-clés importants du verset dans "mots", chacun avec une explication riche et fidèle (comme un mot Strong développé). Reste fidèle au texte.`
  );
}

async function callOpenAI(messages) {
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({
          model: MODEL,
          messages,
          temperature: 0.4,
          response_format: { type: "json_object" },
        }),
      });
      if (r.status === 429 || r.status >= 500) {
        await sleep(2000 * (attempt + 1));
        continue;
      }
      const j = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(j).slice(0, 300));
      return JSON.parse(j.choices[0].message.content);
    } catch (e) {
      if (attempt === 5) throw e;
      await sleep(1500 * (attempt + 1));
    }
  }
}

function out(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

/** Sauvegarde (commit + push) les commentaires d'un livre, robuste aux collisions. */
function commitBook(id, name) {
  if (!DO_GIT) return;
  try {
    execSync(`git add public/commentary`); // tout ce qui est en attente (y compris livres non poussés)
    if (!out("git diff --staged --name-only")) return; // rien de neuf
    execSync(
      `git -c user.name="github-actions[bot]" -c user.email="github-actions[bot]@users.noreply.github.com" ` +
        `commit -m "chore(commentary): ${name} [skip ci]"`,
      { stdio: "inherit" },
    );
  } catch (e) {
    console.log(`  ⚠️ commit ${name}: ${String(e).slice(0, 140)}`);
    return;
  }
  for (let a = 0; a < 12; a++) {
    try {
      execSync(`git pull --rebase origin ${BRANCH}`, { stdio: "inherit" });
      execSync(`git push origin HEAD:${BRANCH}`, { stdio: "inherit" });
      console.log(`  ↳ ${name} sauvegardé (git push)`);
      return;
    } catch {
      try { execSync("git rebase --abort", { stdio: "ignore" }); } catch { /* pas en rebase */ }
      execSync(`sleep ${2 + Math.floor(Math.random() * 6)}`); // anti-collision (jitter)
    }
  }
  console.log(`  ⚠️ push impossible pour ${name} (gardé local, sera repris).`);
}

(async () => {
  const books = index.filter((b) => BOOKS.length === 0 || BOOKS.includes(b.id));
  let generated = 0;
  let skipped = 0;
  console.log(`Modèle: ${MODEL} | livres: ${books.map((b) => b.id).join(",") || "tous"}`);

  outer: for (const meta of books) {
    const book = JSON.parse(fs.readFileSync(path.join(BIBLE_DIR, meta.id + ".json"), "utf8"));
    const bookDir = path.join(OUT_DIR, String(meta.id));
    fs.mkdirSync(bookDir, { recursive: true });

    for (let c = 0; c < book.chapters.length; c++) {
      const chapter = c + 1;
      const file = path.join(bookDir, chapter + ".json");
      const data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
      const verses = book.chapters[c];

      const todo = [];
      for (let v = 0; v < verses.length; v++) {
        const vn = v + 1;
        if (data[vn]) { skipped++; continue; }
        todo.push({ vn, text: verses[v] });
      }
      if (todo.length === 0) continue;

      for (let i = 0; i < todo.length; i += CONCURRENCY) {
        const batch = todo.slice(i, i + CONCURRENCY);
        const results = await Promise.all(
          batch.map(async ({ vn, text }) => {
            const obj = await callOpenAI([
              { role: "system", content: SYSTEM },
              { role: "user", content: userPrompt(meta, chapter, vn, text) },
            ]);
            return { vn, obj };
          }),
        );
        for (const { vn, obj } of results) {
          data[vn] = obj;
          generated++;
        }
        fs.writeFileSync(file, JSON.stringify(data));
        console.log(`  ${meta.name} ${chapter} : +${results.length} (total ${generated})`);
        if (LIMIT && generated >= LIMIT) break outer;
      }
    }
    // Sauvegarde après chaque livre (résilience + reprise)
    commitBook(meta.id, meta.name);
  }
  console.log(`\n✅ Terminé. Générés: ${generated}, déjà présents: ${skipped}`);
})();
