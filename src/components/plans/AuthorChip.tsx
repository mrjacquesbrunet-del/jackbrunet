"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

/** Rond photo + « Auteur Pasteur Jack », en haut à droite de chaque plan.
 *  La photo se charge depuis Supabase Storage (bucket public « audiovf »,
 *  fichier « pasteur-jack.jpg » ou « .png »). Tant qu'elle n'est pas là,
 *  un monogramme « J » s'affiche. */
const CANDIDATES = (() => {
  const sb = getSupabase();
  if (!sb) return [] as string[];
  return ["pasteur-jack.jpg", "pasteur-jack.png"].map(
    (n) => sb.storage.from("audiovf").getPublicUrl(n).data.publicUrl,
  );
})();

export function AuthorChip({ dark }: { dark?: boolean }) {
  const [i, setI] = useState(0);
  const src = CANDIDATES[i];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3 ${
        dark ? "bg-white/10" : "bg-night-900/[0.04]"
      }`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="Pasteur Jack Brunet"
          onError={() => setI((n) => n + 1)}
          className="h-7 w-7 rounded-full object-cover"
        />
      ) : (
        <span className="grid h-7 w-7 place-items-center rounded-full bg-spirit-500 font-display text-xs font-extrabold text-cream">
          J
        </span>
      )}
      <span className="leading-tight">
        <span
          className={`block text-[9px] font-bold uppercase tracking-wide ${
            dark ? "text-cream/50" : "text-night-900/40"
          }`}
        >
          Auteur
        </span>
        <span className={`block text-[11px] font-bold ${dark ? "text-cream" : "text-spirit-700"}`}>
          Pasteur Jack
        </span>
      </span>
    </span>
  );
}
