"use client";

import { useState } from "react";
import { MembresDuLieu } from "@/components/community/MembresDuLieu";
import type { TypeLieu } from "@/lib/lieux";

/**
 * Pastilles d'infos du profil : église et localisation (icônes en trait,
 * charte). `show=false` masque la localisation (confidentialité « privé »
 * vue par les autres membres) — l'église reste visible si renseignée.
 */
export function ProfileInfoPills({
  church,
  city,
  country,
  show,
  centered = false,
  light = false,
}: {
  church?: string | null;
  city?: string | null;
  country?: string | null;
  /** Afficher la localisation (selon la confidentialité choisie). */
  show: boolean;
  /** Centre les pastilles (héros du profil). */
  centered?: boolean;
  /** Version claire (mode jour du profil). */
  light?: boolean;
}) {
  const location = [city?.trim(), country?.trim()].filter(Boolean).join(", ");
  const hasChurch = !!church?.trim();
  const hasLocation = show && !!location;
  // Toucher l'église ou la ville → tous les membres qui y sont rattachés.
  const [lieu, setLieu] = useState<{ type: TypeLieu; valeur: string } | null>(null);
  if (!hasChurch && !hasLocation) return null;
  const pastille = `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${light? "border-night-900/15 bg-night-900/5 text-night-900/85": "border-white/15 bg-white/[0.06] text-cream/85"}`;
  const chevron = (
    <svg viewBox="0 0 24 24" className="-mr-1 h-3 w-3 fill-none stroke-current opacity-50" strokeWidth={2.4} aria-hidden>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className={`mt-2.5 flex flex-wrap items-center gap-2 ${centered? "justify-center": ""}`}>
      {hasChurch ? (
        <button
          type="button"
          onClick={() => setLieu({ type: "eglise", valeur: church!.trim() })}
          aria-label={`Voir les membres de ${church!.trim()}`}
          className={`${pastille} transition-transform active:scale-95`}
        >
          {/* Icône église (trait) */}
          <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 fill-none ${light? "stroke-dawn-600": "stroke-dawn-300"}`} strokeWidth={1.8}>
            <path
              d="M12 3v4M10 5h4M12 7l5 4v9h-4v-4a1 1 0 0 0-2 0v4H7v-9l5-4zM4 20h16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {church}
          {chevron}
        </button>
      ) : null}
      {hasLocation && city?.trim() ? (
        <button
          type="button"
          onClick={() => setLieu({ type: "ville", valeur: city!.trim() })}
          aria-label={`Voir les membres de ${city!.trim()}`}
          className={`${pastille} transition-transform active:scale-95`}
        >
          {/* Icône épingle (trait) */}
          <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 fill-none ${light? "stroke-dawn-600": "stroke-dawn-300"}`} strokeWidth={1.8}>
            <path
              d="M12 21s-6.5-5.2-6.5-10a6.5 6.5 0 0 1 13 0c0 4.8-6.5 10-6.5 10z"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="11" r="2.3" />
          </svg>
          {location}
          {chevron}
        </button>
      ) : hasLocation ? (
        <span className={pastille}>
          <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 fill-none ${light? "stroke-dawn-600": "stroke-dawn-300"}`} strokeWidth={1.8}>
            <path d="M12 21s-6.5-5.2-6.5-10a6.5 6.5 0 0 1 13 0c0 4.8-6.5 10-6.5 10z" strokeLinejoin="round" />
            <circle cx="12" cy="11" r="2.3" />
          </svg>
          {location}
        </span>
      ) : null}
      <MembresDuLieu lieu={lieu} fermer={() => setLieu(null)} />
    </div>
  );
}
