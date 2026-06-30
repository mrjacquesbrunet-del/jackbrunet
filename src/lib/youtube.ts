"use client";

import { isNativeApp } from "@/lib/notifications";

/** URL de visionnage YouTube standard. */
export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/**
 * Ouvre une vidéo YouTube dans le navigateur (app native uniquement).
 * Les embeds iframe YouTube échouent dans la WebView Capacitor
 * (origine `capacitor://localhost` non autorisée → « Erreur 153 »).
 * On ouvre donc la vidéo dans le navigateur intégré / l'app YouTube.
 * Renvoie true si l'ouverture native a été déclenchée (sinon, laisser l'embed web).
 */
export async function openYouTube(id?: string): Promise<boolean> {
  if (!id || !isNativeApp()) return false;
  const url = youtubeWatchUrl(id);
  try {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url, presentationStyle: "popover" });
    return true;
  } catch {
    try {
      window.open(url, "_blank");
      return true;
    } catch {
      return false;
    }
  }
}
