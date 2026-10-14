"use client";

import { downloadFileOffline, deleteFileOffline, offlineFilePaths } from "./bible-offline";
import { listPodcasts, type AudioTrack } from "./audio-library";
import { lirePositions } from "./podcast-player";

/**
 * Écoute HORS LIGNE des épisodes de podcast :
 *  - téléchargement / retrait d'un épisode (rangé sous son chemin) ;
 *  - téléchargement AUTOMATIQUE des nouveaux épisodes, seulement en Wi-Fi
 *    (réglage dans Favoris → Téléchargés).
 * Les anciennes versions rangeaient le fichier sous son URL : on lit les deux.
 */

const AUTO_KEY = "jb.podcast.autodl.v1";

/** Chemins des épisodes présents sur l'appareil. */
export async function episodesHorsLigne(tracks: AudioTrack[]): Promise<Set<string>> {
  const s = await offlineFilePaths([...tracks.map((t) => t.path), ...tracks.map((t) => t.url)]);
  return new Set(tracks.filter((t) => s.has(t.path) || s.has(t.url)).map((t) => t.path));
}

export function telechargerEpisode(t: AudioTrack, onProgress?: (recu: number, total: number) => void): Promise<boolean> {
  return downloadFileOffline(t.path, t.url, onProgress);
}

export async function retirerEpisode(t: AudioTrack): Promise<void> {
  await deleteFileOffline(t.path);
  await deleteFileOffline(t.url);
}

export function autoTelechargementActif(): boolean {
  try {
    return localStorage.getItem(AUTO_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAutoTelechargement(on: boolean) {
  try {
    if (on) localStorage.setItem(AUTO_KEY, "1");
    else localStorage.removeItem(AUTO_KEY);
  } catch {
    /* ignore */
  }
}

/** Connecté en Wi-Fi ? (plugin Network dans l'app, sinon l'API du navigateur ;
 * dans le doute : non, pour ne jamais consommer de données mobiles). */
export async function enWifi(): Promise<boolean> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("Network")) {
      const { Network } = await import("@capacitor/network");
      const st = await Network.getStatus();
      return st.connected && st.connectionType === "wifi";
    }
  } catch {
    /* plugin absent : on passe à l'API du navigateur */
  }
  const c = (navigator as Navigator & { connection?: { type?: string } }).connection;
  return c?.type === "wifi" || c?.type === "ethernet";
}

let enCours = false;

/** Télécharge les derniers épisodes pas encore écoutés (3 au plus), en Wi-Fi. */
export async function telechargerNouveautes(max = 3): Promise<number> {
  if (enCours || !autoTelechargementActif()) return 0;
  enCours = true;
  try {
    if (!(await enWifi())) return 0;
    const limite = Date.now() - 30 * 86_400_000;
    const recents = (await listPodcasts()).filter((t) => t.created_at && new Date(t.created_at).getTime() > limite).slice(0, 6);
    const deja = await episodesHorsLigne(recents);
    const pos = lirePositions();
    let n = 0;
    for (const t of recents) {
      if (n >= max) break;
      if (deja.has(t.path) || pos[t.id] === -1) continue;
      if (!(await enWifi())) break;
      if (await telechargerEpisode(t)) n++;
    }
    return n;
  } catch {
    return 0;
  } finally {
    enCours = false;
  }
}
