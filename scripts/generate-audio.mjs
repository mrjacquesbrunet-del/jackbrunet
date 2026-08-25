/**
 * Génère les fichiers audio (voix clonée) via ElevenLabs :
 *   - dévotionnels  → public/audio/devotion-<i>.mp3
 *   - plans de lecture → public/audio/plan-<slug>-<jour>.mp3
 *
 * Génération INCRÉMENTALE : un fichier n'est (re)généré que si son texte a
 * changé (empreinte) ou s'il n'existe pas encore — pour maîtriser les coûts.
 *
 * Écrit content/audio.generated.json :
 *   { devotions: {i: path}, plans: {slug: {jour: path}}, hashes, planHashes }
 *
 * Variables d'environnement :
 *   ELEVENLABS_API_KEY  (secret GitHub) — obligatoire
 *   ELEVENLABS_VOICE_ID (ou la constante VOICE_ID ci-dessous) — obligatoire
 */

import fs from "node:fs";
import crypto from "node:crypto";

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "ecxPjiGTvAfpGEams6ec";
const API_KEY = process.env.ELEVENLABS_API_KEY || "";
const MODEL_ID = "eleven_multilingual_v2";

if (!API_KEY || !VOICE_ID) {
  console.log("[audio] Clé API ou Voice ID manquant — génération ignorée (rien à payer).");
  process.exit(0);
}

const sha = (t) => crypto.createHash("sha1").update(t).digest("hex").slice(0, 12);

/** Appel ElevenLabs → Buffer MP3, ou null en cas d'échec. */
async function tts(text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: { stability: 0.5, similarity_boost: 0.8 },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("[audio] Échec ElevenLabs:", res.status, body);
    // Erreur d'authentification (clé invalide/expirée) : inutile de continuer,
    // toutes les autres requêtes échoueront pareil. On arrête net pour que le
    // workflow soit marqué EN ÉCHEC (sinon « succès » silencieux sans audio).
    if (res.status === 401 || res.status === 403 || /invalid_api_key|authentication_error/i.test(body)) {
      console.error(
        "[audio] Clé ELEVENLABS_API_KEY invalide. Mets à jour le secret GitHub " +
          "avec la vraie clé (elle commence par « sk_ »), puis relance le workflow.",
      );
      process.exit(1);
    }
    return null;
  }
  return Buffer.from(await res.arrayBuffer());
}

fs.mkdirSync("public/audio", { recursive: true });

const manifestPath = "content/audio.generated.json";
let manifest = {};
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
} catch {
  /* premier passage */
}
manifest.devotions ??= {};
manifest.hashes ??= {};
manifest.plans ??= {};
manifest.planHashes ??= {};

let generated = 0;

// ---------- Dévotionnels ----------
const devotions = JSON.parse(fs.readFileSync("content/devotions.json", "utf8")).items;
for (let i = 0; i < devotions.length; i++) {
  const d = devotions[i];
  const text = `${d.verseText} — ${d.verseReference}.\n\n${d.meditation}`;
  const hash = sha(text);
  const file = `devotion-${i}.mp3`;
  const out = `public/audio/${file}`;
  if (manifest.hashes[i] === hash && fs.existsSync(out)) {
    manifest.devotions[i] = `/audio/${file}`;
    continue;
  }
  console.log(`[audio] Dévotionnel ${i} (${d.theme})…`);
  const buf = await tts(text);
  if (!buf) continue;
  fs.writeFileSync(out, buf);
  manifest.devotions[i] = `/audio/${file}`;
  manifest.hashes[i] = hash;
  generated += 1;
}

// ---------- Plans de lecture ----------
const plans = JSON.parse(fs.readFileSync("content/plans.json", "utf8")).items;
for (const p of plans) {
  manifest.plans[p.slug] ??= {};
  for (const d of p.days) {
    // On lit le titre du jour puis la méditation (les versets sont lus dans la Bible).
    const text = `Jour ${d.day}. ${d.title}.\n\n${d.meditation}`;
    const hash = sha(text);
    const key = `${p.slug}:${d.day}`;
    const file = `plan-${p.slug}-${d.day}.mp3`;
    const out = `public/audio/${file}`;
    if (manifest.planHashes[key] === hash && fs.existsSync(out)) {
      manifest.plans[p.slug][d.day] = `/audio/${file}`;
      continue;
    }
    console.log(`[audio] Plan ${p.slug} — jour ${d.day}…`);
    const buf = await tts(text);
    if (!buf) continue;
    fs.writeFileSync(out, buf);
    manifest.plans[p.slug][d.day] = `/audio/${file}`;
    manifest.planHashes[key] = hash;
    generated += 1;
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`[audio] Terminé. ${generated} fichier(s) généré(s).`);
