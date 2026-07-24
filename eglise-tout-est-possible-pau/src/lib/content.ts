// Couche contenu : source unique de vérité, lue depuis content/*.json.
// Le jour où le contenu migre vers un CMS headless ou une API,
// seul ce fichier change — jamais les composants.

import settingsJson from "../../content/settings.json";
import homeJson from "../../content/home.json";
import firstVisitJson from "../../content/first-visit.json";
import aboutJson from "../../content/about.json";
import visionJson from "../../content/vision.json";
import teamJson from "../../content/team.json";
import meetingsJson from "../../content/meetings.json";
import testimoniesJson from "../../content/testimonies.json";
import givingJson from "../../content/giving.json";
import contactJson from "../../content/contact.json";
import messagesJson from "../../content/messages.json";
import legalJson from "../../content/legal.json";
import videosJson from "../../content/videos.generated.json";
import manualVideosJson from "../../content/videos.json";
import type { Settings, Video } from "./types";

export const settings = settingsJson as Settings;
export const home = homeJson;
export const firstVisit = firstVisitJson;
export const about = aboutJson;
export const vision = visionJson;
export const team = teamJson;
export const meetings = meetingsJson;
export const testimonies = testimoniesJson;
export const giving = givingJson;
export const contact = contactJson;
export const messagesPage = messagesJson;
export const legal = legalJson;

// Identifiant YouTube depuis n'importe quel format d'URL
// (watch?v=, youtu.be/, shorts/, live/, embed/) — ou l'ID collé tel quel.
function youtubeId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|v=|shorts\/|live\/|embed\/)([\w-]{11})/);
  return match ? match[1] : url.trim();
}

// Vidéos ajoutées à la main dans l'espace admin (un simple lien YouTube
// par semaine) : elles passent devant l'import automatique de la chaîne.
const manualVideos: Video[] = (
  (manualVideosJson.items ?? []) as { url?: string; title?: string; date?: string }[]
)
  .filter((v) => v.url)
  .map((v) => {
    const id = youtubeId(v.url as string);
    return {
      id,
      title: v.title || "Message de la semaine",
      publishedAt: v.date || "",
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  });

const importedVideos = (videosJson.items ?? []) as Video[];

export const videos: Video[] = [
  ...manualVideos,
  ...importedVideos.filter((v) => !manualVideos.some((m) => m.id === v.id)),
];
