"use client";

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
}: {
  church?: string | null;
  city?: string | null;
  country?: string | null;
  /** Afficher la localisation (selon la confidentialité choisie). */
  show: boolean;
}) {
  const location = [city?.trim(), country?.trim()].filter(Boolean).join(", ");
  const hasChurch = !!church?.trim();
  const hasLocation = show && !!location;
  if (!hasChurch && !hasLocation) return null;

  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-2">
      {hasChurch ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-cream/85">
          {/* Icône église (trait) */}
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-dawn-300" strokeWidth={1.8}>
            <path
              d="M12 3v4M10 5h4M12 7l5 4v9h-4v-4a1 1 0 0 0-2 0v4H7v-9l5-4zM4 20h16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {church}
        </span>
      ) : null}
      {hasLocation ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-cream/85">
          {/* Icône épingle (trait) */}
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-dawn-300" strokeWidth={1.8}>
            <path
              d="M12 21s-6.5-5.2-6.5-10a6.5 6.5 0 0 1 13 0c0 4.8-6.5 10-6.5 10z"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="11" r="2.3" />
          </svg>
          {location}
        </span>
      ) : null}
    </div>
  );
}
