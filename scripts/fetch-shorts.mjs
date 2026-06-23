/**
 * Importe automatiquement les Shorts de la chaîne YouTube et écrit
 * content/shorts.generated.json (id, title, category).
 *
 * - Ne fait rien (sortie propre) si la variable d'env YOUTUBE_API_KEY est absente.
 * - Ne casse jamais le build : toute erreur est seulement loggée.
 *
 * Lancé en CI avant le build. Pour l'activer : ajouter le secret de dépôt
 * YOUTUBE_API_KEY (clé YouTube Data API v3).
 */

import { readFileSync, writeFileSync } from "node:fs";

const API = "https://www.googleapis.com/youtube/v3";
const KEY = process.env.YOUTUBE_API_KEY;
const OUT = new URL("../content/shorts.generated.json", import.meta.url);

// Durée maxi d'un « short » côté site (secondes).
const MAX_SHORT_SECONDS = 180;

function isoToSeconds(iso) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || "");
  if (!m) return 0;
  return (+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + (+(m[3] || 0));
}

async function jget(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
}

async function main() {
  if (!KEY) {
    console.log("[shorts] YOUTUBE_API_KEY absent — import ignoré.");
    return;
  }

  const settings = JSON.parse(
    readFileSync(new URL("../content/settings.json", import.meta.url), "utf8"),
  );
  const handle = (settings?.youtube?.handle || "@Jack_brnt").replace(/^@/, "");

  // 1) Résoudre la playlist des uploads via le handle.
  const ch = await jget(
    `${API}/channels?part=contentDetails&forHandle=${encodeURIComponent(handle)}&key=${KEY}`,
  );
  const uploads = ch?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) {
    console.log("[shorts] Chaîne introuvable pour le handle:", handle);
    return;
  }

  // 2) Lister les vidéos de la playlist uploads (pagination).
  const ids = [];
  let pageToken = "";
  for (let i = 0; i < 8; i++) {
    const data = await jget(
      `${API}/playlistItems?part=contentDetails&maxResults=50&playlistId=${uploads}${
        pageToken ? `&pageToken=${pageToken}` : ""
      }&key=${KEY}`,
    );
    for (const it of data.items || []) {
      const id = it?.contentDetails?.videoId;
      if (id) ids.push(id);
    }
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  // 3) Récupérer durée + titre, filtrer les shorts.
  const shorts = [];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const data = await jget(
      `${API}/videos?part=snippet,contentDetails&id=${batch.join(",")}&key=${KEY}`,
    );
    for (const v of data.items || []) {
      const seconds = isoToSeconds(v?.contentDetails?.duration);
      if (seconds > 0 && seconds <= MAX_SHORT_SECONDS) {
        shorts.push({
          id: v.id,
          title: v?.snippet?.title || "Short",
          category: "",
        });
      }
    }
  }

  writeFileSync(OUT, JSON.stringify({ items: shorts }, null, 2) + "\n");
  console.log(`[shorts] ${shorts.length} shorts importés.`);
}

main().catch((e) => {
  console.warn("[shorts] Import échoué (ignoré) :", e.message);
});
