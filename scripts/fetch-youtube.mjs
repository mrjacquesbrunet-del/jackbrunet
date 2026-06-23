/**
 * Importe automatiquement les vidéos de la chaîne YouTube et écrit :
 *   - content/shorts.generated.json  (vidéos <= 3 min)
 *   - content/videos.generated.json  (formats longs > 3 min — prédications)
 *
 * - Ne fait rien (sortie propre) si YOUTUBE_API_KEY est absent.
 * - Ne casse jamais le build : toute erreur est seulement loggée.
 *
 * Activation : ajouter le secret de dépôt YOUTUBE_API_KEY (YouTube Data API v3).
 */

import { readFileSync, writeFileSync } from "node:fs";

const API = "https://www.googleapis.com/youtube/v3";
const KEY = process.env.YOUTUBE_API_KEY;
const SHORTS_OUT = new URL("../content/shorts.generated.json", import.meta.url);
const VIDEOS_OUT = new URL("../content/videos.generated.json", import.meta.url);

// Seuil entre « short » et « format long » (secondes).
const SHORT_MAX_SECONDS = 180;

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
    console.log("[youtube] YOUTUBE_API_KEY absent — import ignoré.");
    return;
  }

  const settings = JSON.parse(
    readFileSync(new URL("../content/settings.json", import.meta.url), "utf8"),
  );
  const handle = (settings?.youtube?.handle || "@Jack_brnt").replace(/^@/, "");

  // 1) Playlist des uploads via le handle.
  const ch = await jget(
    `${API}/channels?part=contentDetails&forHandle=${encodeURIComponent(handle)}&key=${KEY}`,
  );
  const uploads = ch?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) {
    console.log("[youtube] Chaîne introuvable pour le handle:", handle);
    return;
  }

  // 2) Lister les vidéos (pagination, ordre = plus récent d'abord).
  const ids = [];
  let pageToken = "";
  for (let i = 0; i < 12; i++) {
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

  // 3) Durée + titre, puis répartition shorts / longs.
  const shorts = [];
  const longs = [];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const data = await jget(
      `${API}/videos?part=snippet,contentDetails&id=${batch.join(",")}&key=${KEY}`,
    );
    for (const v of data.items || []) {
      const seconds = isoToSeconds(v?.contentDetails?.duration);
      const item = { id: v.id, title: v?.snippet?.title || "Vidéo", category: "" };
      if (seconds <= 0) continue;
      if (seconds <= SHORT_MAX_SECONDS) shorts.push(item);
      else longs.push(item);
    }
  }

  writeFileSync(SHORTS_OUT, JSON.stringify({ items: shorts }, null, 2) + "\n");
  writeFileSync(VIDEOS_OUT, JSON.stringify({ items: longs }, null, 2) + "\n");
  console.log(`[youtube] ${shorts.length} shorts + ${longs.length} formats longs importés.`);
}

main().catch((e) => {
  console.warn("[youtube] Import échoué (ignoré) :", e.message);
});
