/**
 * Génère les fichiers audio (voix clonée) des dévotionnels via ElevenLabs.
 *
 * - Lit content/devotions.json
 * - Pour chaque dévotionnel, lit le texte (verset + méditation) et génère un MP3
 *   dans public/audio/devotion-<i>.mp3 — UNIQUEMENT si le texte a changé
 *   (empreinte) ou si le fichier n'existe pas encore (maîtrise des coûts).
 * - Écrit content/audio.generated.json (carte index -> fichier audio).
 *
 * Variables d'environnement :
 *   ELEVENLABS_API_KEY  (secret GitHub) — obligatoire
 *   ELEVENLABS_VOICE_ID (ou la constante VOICE_ID ci-dessous) — obligatoire
 *
 * Sans clé ni voix, le script s'arrête proprement (aucune génération).
 */

import fs from "node:fs";
import crypto from "node:crypto";

// Voix clonée de Jack (renseignée ici une fois fournie, ou via l'env).
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "";
const API_KEY = process.env.ELEVENLABS_API_KEY || "";

const MODEL_ID = "eleven_multilingual_v2";

if (!API_KEY || !VOICE_ID) {
  console.log(
    "[audio] Clé API ou Voice ID manquant — génération ignorée (rien à payer).",
  );
  process.exit(0);
}

const devotions = JSON.parse(
  fs.readFileSync("content/devotions.json", "utf8"),
).items;

fs.mkdirSync("public/audio", { recursive: true });

const manifestPath = "content/audio.generated.json";
let manifest = { devotions: {}, hashes: {} };
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
} catch {
  /* premier passage */
}
manifest.devotions ??= {};
manifest.hashes ??= {};

let generated = 0;

for (let i = 0; i < devotions.length; i++) {
  const d = devotions[i];
  const text = `${d.verseText} — ${d.verseReference}.\n\n${d.meditation}`;
  const hash = crypto.createHash("sha1").update(text).digest("hex").slice(0, 12);
  const file = `devotion-${i}.mp3`;
  const out = `public/audio/${file}`;

  if (manifest.hashes[i] === hash && fs.existsSync(out)) {
    manifest.devotions[i] = `/audio/${file}`;
    continue;
  }

  console.log(`[audio] Génération du dévotionnel ${i} (${d.theme})…`);
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: { stability: 0.5, similarity_boost: 0.8 },
      }),
    },
  );

  if (!res.ok) {
    console.error(`[audio] Échec dévotionnel ${i}:`, res.status, await res.text());
    continue;
  }

  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(out, buf);
  manifest.devotions[i] = `/audio/${file}`;
  manifest.hashes[i] = hash;
  generated += 1;
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`[audio] Terminé. ${generated} fichier(s) généré(s).`);
