"use client";

import { siteConfig } from "@/config/site";
import { isNativeApp } from "@/lib/notifications";

/** URL de visionnage YouTube standard (lien de secours « voir sur YouTube »). */
export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

type EmbedOpts = { autoplay?: boolean; mute?: boolean; loop?: boolean };

/**
 * Source d'iframe pour lire une vidéo YouTube, lecture INLINE, dans l'app.
 *
 * Les embeds YouTube refusent l'origine `capacitor://localhost` de la WebView
 * (→ « Erreur 153 »). En app native, on passe donc par une page lecteur
 * hébergée sur le site (`https://jackbrunet.com/embed`), origine acceptée par
 * YouTube: la vidéo se lit alors normalement, sans quitter l'application.
 * Sur le web, on garde l'embed direct.
 */
export function videoEmbedSrc(id: string, opts: EmbedOpts = {}): string {
  if (isNativeApp()) {
    const q = new URLSearchParams({
      v: id,
      a: opts.autoplay? "1": "0",
      m: opts.mute? "1": "0",
      l: opts.loop? "1": "0",
    });
    return `${siteConfig.url}/embed/?${q.toString()}`;
  }
  let s = `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
  if (opts.autoplay) s += "&autoplay=1";
  if (opts.mute) s += "&mute=1";
  if (opts.loop) s += `&loop=1&playlist=${id}`;
  return s;
}
