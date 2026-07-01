"use client";

import { useEffect, useRef } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * Lecteur YouTube plein écran, hébergé sur le site (origine valide pour
 * YouTube → pas d'« Erreur 153 »). Chargé en iframe par l'app pour une lecture
 * INLINE. Utilise l'API IFrame de YouTube et écoute des commandes envoyées par
 * l'app (postMessage) : play / pause / mute / unmute. Cela permet au fil Reels
 * de lancer la lecture + le son au swipe, sans recharger la vidéo.
 *
 * Paramètres d'URL : v (id), a (autoplay), m (mute), l (loop).
 */
export function Embed() {
  const holderRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const pending = useRef<Array<{ jb: string }>>([]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const id = p.get("v");
    if (!id) return;
    const autoplay = p.get("a") === "1";
    const mute = p.get("m") === "1";
    const loop = p.get("l") === "1";

    function run(cmd: { jb: string }) {
      const pl = playerRef.current;
      if (!pl || !pl.playVideo) {
        pending.current.push(cmd);
        return;
      }
      try {
        if (cmd.jb === "play") pl.playVideo();
        else if (cmd.jb === "pause") pl.pauseVideo();
        else if (cmd.jb === "mute") pl.mute();
        else if (cmd.jb === "unmute") {
          pl.unMute();
          if (pl.setVolume) pl.setVolume(100);
          pl.playVideo();
        }
      } catch {
        /* lecteur pas prêt */
      }
    }

    function onMsg(e: MessageEvent) {
      const d = e.data;
      if (d && typeof d === "object" && typeof d.jb === "string") run(d);
    }
    window.addEventListener("message", onMsg);

    function create() {
      playerRef.current = new window.YT.Player(holderRef.current, {
        videoId: id,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          mute: mute ? 1 : 0,
          loop: loop ? 1 : 0,
          playlist: loop ? id : undefined,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          fs: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: () => {
            const pl = playerRef.current;
            if (mute) pl.mute();
            if (autoplay) pl.playVideo();
            const q = pending.current;
            pending.current = [];
            q.forEach(run);
          },
        },
      });
    }

    if (window.YT && window.YT.Player) {
      create();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        create();
      };
      if (!document.getElementById("yt-iframe-api")) {
        const s = document.createElement("script");
        s.id = "yt-iframe-api";
        s.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(s);
      }
    }

    return () => window.removeEventListener("message", onMsg);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2147483647, background: "#000" }}>
      <div
        ref={holderRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
