"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";

/** Rond photo + « Auteur Pasteur Jack », en haut à droite de chaque plan.
 *  Tant que la photo n'est pas fournie, un monogramme « J » s'affiche. */
export function AuthorChip({ dark }: { dark?: boolean }) {
  const [broken, setBroken] = useState(false);
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3 ${
        dark ? "bg-white/10" : "bg-night-900/[0.04]"
      }`}
    >
      {broken ? (
        <span className="grid h-7 w-7 place-items-center rounded-full bg-spirit-500 font-display text-xs font-extrabold text-cream">
          J
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset("/img/pasteur-jack.jpg")}
          alt="Pasteur Jack Brunet"
          onError={() => setBroken(true)}
          className="h-7 w-7 rounded-full object-cover"
        />
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
