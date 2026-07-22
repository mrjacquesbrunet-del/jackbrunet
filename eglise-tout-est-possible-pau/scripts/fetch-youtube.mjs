// Import automatique des dernières prédications YouTube.
//
// Usage : YOUTUBE_API_KEY=xxx npm run youtube
// - Lit la chaîne configurée dans content/settings.json (channelId, ou handle).
// - Écrit content/videos.generated.json, consommé par le site au build.
// - À lancer en CI (cron quotidien) ou à la main. Sans clé, le script
//   n'écrase rien : le site affiche alors un lien vers la chaîne.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const settings = JSON.parse(readFileSync(join(root, "content/settings.json"), "utf8"));

const API_KEY = process.env.YOUTUBE_API_KEY;
const MAX_RESULTS = 24;

if (!API_KEY) {
  console.log("YOUTUBE_API_KEY absente — import ignoré, le site garde son état actuel.");
  process.exit(0);
}

async function api(path, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [key, value] of Object.entries({ ...params, key: API_KEY })) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`YouTube API ${path} : ${response.status} ${await response.text()}`);
  }
  return response.json();
}

async function resolveChannelId() {
  if (settings.youtube.channelId) return settings.youtube.channelId;
  const handle = (settings.youtube.handle || "").replace(/^@/, "");
  if (!handle) {
    throw new Error("Configure youtube.channelId ou youtube.handle dans content/settings.json.");
  }
  const data = await api("channels", { part: "id", forHandle: `@${handle}` });
  const id = data.items?.[0]?.id;
  if (!id) throw new Error(`Chaîne introuvable pour le handle @${handle}.`);
  return id;
}

const channelId = await resolveChannelId();

// La playlist "uploads" contient toutes les vidéos publiées de la chaîne.
const channel = await api("channels", { part: "contentDetails", id: channelId });
const uploads = channel.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
if (!uploads) throw new Error("Playlist des uploads introuvable.");

const playlist = await api("playlistItems", {
  part: "snippet,contentDetails",
  playlistId: uploads,
  maxResults: String(MAX_RESULTS),
});

const items = (playlist.items ?? [])
  .map((item) => ({
    id: item.contentDetails?.videoId,
    title: item.snippet?.title ?? "",
    publishedAt: item.contentDetails?.videoPublishedAt ?? item.snippet?.publishedAt ?? "",
    thumbnail: item.snippet?.thumbnails?.high?.url ?? "",
  }))
  .filter((video) => video.id && !/private|deleted/i.test(video.title));

writeFileSync(
  join(root, "content/videos.generated.json"),
  JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 2) + "\n",
);

console.log(`${items.length} vidéos importées dans content/videos.generated.json.`);
