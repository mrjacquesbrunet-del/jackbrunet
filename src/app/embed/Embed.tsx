"use client";

import { useEffect, useState } from "react";

/**
 * Lecteur YouTube plein écran, hébergé sur le site (origine valide pour
 * YouTube). Chargé dans une iframe par l'application native pour une lecture
 * INLINE (sans quitter l'app). Paramètres : v (id), a (autoplay), m (mute),
 * l (loop).
 */
export function Embed() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const id = p.get("v");
    if (!id) return;
    let s = `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
    if (p.get("a") === "1") s += "&autoplay=1";
    if (p.get("m") === "1") s += "&mute=1";
    if (p.get("l") === "1") s += `&loop=1&playlist=${id}`;
    setSrc(s);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        background: "#000",
      }}
    >
      {src ? (
        <iframe
          src={src}
          title="Lecteur vidéo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      ) : null}
    </div>
  );
}
