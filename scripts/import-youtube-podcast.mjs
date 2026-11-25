/**
 * Prépare l'import d'exhortations YouTube en podcasts (contenu autorisé).
 *
 * Lit la demande « .youtube-import » (JSON) :
 *   {
 *     "dossier": "momentum",              // public/audio/<dossier>/ et content/import/<dossier>-liste.json
 *     "chaine": "@handle" | null,         // si connue
 *     "recherche": "Momentum Patrice Martorano", // sinon : recherche de la chaîne
 *     "filtre": "starter",                // mot présent dans le titre (vide = tout)
 *     "maxSecondes": 420,                 // durée maximale
 *     "telecharger": [] | ["videoId", …] | "tous"
 *   }
 *
 * Écrit la liste des vidéos retenues (titre, date, durée, miniature) dans
 * content/import/<dossier>-liste.json, et la liste des identifiants à
 * télécharger dans .youtube-a-telecharger (le workflow s'en charge avec
 * yt-dlp). Nécessite YOUTUBE_API_KEY (YouTube Data API v3).
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const API = "https://www.googleapis.com/youtube/v3";
const KEY = process.env.YOUTUBE_API_KEY;

function isoToSeconds(iso) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || "");
  if (!m) return 0;
  return (+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + (+(m[3] || 0));
}

async function jget(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url.replace(KEY, "***")}`);
  return res.json();
}

const sansAccents = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

async function main() {
  if (!KEY) throw new Error("YOUTUBE_API_KEY absent");
  const demande = JSON.parse(readFileSync(".youtube-import", "utf8"));
  const dossier = String(demande.dossier || "").trim();
  if (!/^[a-z0-9-]+$/.test(dossier)) throw new Error(`Dossier invalide : ${dossier}`);

  // 1) La chaîne : par son handle, sinon par recherche.
  let chaine = null;
  if (demande.chaine) {
    const handle = String(demande.chaine).replace(/^.*@/, "").replace(/\/.*$/, "");
    const r = await jget(`${API}/channels?part=snippet,contentDetails&forHandle=${encodeURIComponent(handle)}&key=${KEY}`);
    chaine = r.items?.[0] ?? null;
  }
  const candidatesChaines = [];
  if (!chaine && demande.recherche) {
    const r = await jget(`${API}/search?part=snippet&type=channel&maxResults=5&q=${encodeURIComponent(demande.recherche)}&key=${KEY}`);
    for (const it of r.items ?? []) candidatesChaines.push({ id: it.snippet.channelId, titre: it.snippet.title, description: it.snippet.description });
    if (candidatesChaines[0]) {
      const c = await jget(`${API}/channels?part=snippet,contentDetails&id=${candidatesChaines[0].id}&key=${KEY}`);
      chaine = c.items?.[0] ?? null;
    }
  }
  if (!chaine) throw new Error("Chaîne introuvable");
  const uploads = chaine.contentDetails?.relatedPlaylists?.uploads;

  // 2) Toutes les vidéos de la chaîne (jusqu'à 1 000).
  const ids = [];
  let pageToken = "";
  for (let i = 0; i < 20; i++) {
    const d = await jget(`${API}/playlistItems?part=contentDetails&maxResults=50&playlistId=${uploads}${pageToken ? `&pageToken=${pageToken}` : ""}&key=${KEY}`);
    for (const it of d.items ?? []) ids.push(it.contentDetails.videoId);
    pageToken = d.nextPageToken;
    if (!pageToken) break;
  }
  const videos = [];
  for (let i = 0; i < ids.length; i += 50) {
    const d = await jget(`${API}/videos?part=snippet,contentDetails&id=${ids.slice(i, i + 50).join(",")}&key=${KEY}`);
    for (const v of d.items ?? []) {
      videos.push({
        id: v.id,
        titre: v.snippet.title,
        date: v.snippet.publishedAt,
        secondes: isoToSeconds(v.contentDetails.duration),
        description: (v.snippet.description || "").slice(0, 500),
        miniature: v.snippet.thumbnails?.maxres?.url || v.snippet.thumbnails?.high?.url || null,
      });
    }
  }

  // 3) Filtre : mot du titre et durée maximale.
  const filtre = sansAccents(String(demande.filtre || ""));
  const max = Number(demande.maxSecondes) || 0;
  const retenues = videos
    .filter((v) => !filtre || sansAccents(v.titre).includes(filtre))
    .filter((v) => !max || (v.secondes > 0 && v.secondes <= max))
    .sort((a, b) => a.date.localeCompare(b.date));

  mkdirSync("content/import", { recursive: true });
  writeFileSync(
    `content/import/${dossier}-liste.json`,
    JSON.stringify(
      {
        chaine: {
          id: chaine.id,
          titre: chaine.snippet.title,
          handle: chaine.snippet.customUrl ?? null,
          description: chaine.snippet.description?.slice(0, 600) ?? "",
          avatar: chaine.snippet.thumbnails?.high?.url ?? null,
        },
        autresChainesTrouvees: candidatesChaines.slice(1),
        totalVideosChaine: videos.length,
        filtre: demande.filtre ?? "",
        maxSecondes: max,
        videos: retenues,
      },
      null,
      2,
    ) + "\n",
  );

  // 4) À télécharger.
  const voulues = demande.telecharger === "tous" ? retenues.map((v) => v.id) : Array.isArray(demande.telecharger) ? demande.telecharger : [];
  const valides = voulues.filter((id) => /^[\w-]{11}$/.test(id));
  writeFileSync(".youtube-a-telecharger", valides.join("\n") + (valides.length ? "\n" : ""));
  console.log(`[import] ${chaine.snippet.title} : ${videos.length} vidéos, ${retenues.length} retenues, ${valides.length} à télécharger.`);
}

main().catch((e) => {
  console.error("[import] Échec :", e.message);
  process.exit(1);
});
