"use client";

import Link from "next/link";

/** Icônes en trait (charte — mêmes codes que le menu). */
function GroupsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
      <path
        d="M17 20v-1a4 4 0 0 0-3-3.9M7 20v-1a4 4 0 0 1 3-3.9M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6M3.5 20v-.5a2.5 2.5 0 0 1 2.5-2.5M20.5 20v-.5a2.5 2.5 0 0 0-2.5-2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function CreateCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
      <path
        d="M12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6M6.5 20v-.8a5.5 5.5 0 0 1 11 0v.8M19 4v4M21 6h-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Deux tuiles compactes côte à côte sur le mur : « Mes groupes » et
 * « Créer ton cercle » (prière privée entre proches). Discrètes, pour ne
 * pas retarder l'arrivée sur le mur.
 */
export function PrayerCirclesCard() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      <Link
        href="/groupes"
        className="dark-ctx flex flex-col items-center gap-1.5 rounded-2xl bg-[#1C1C1B] px-3 py-4 text-center text-cream transition-transform active:scale-[0.98]"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-dawn-400/15 text-dawn-300">
          <GroupsIcon className="h-[18px] w-[18px]" />
        </span>
        <span className="text-xs font-bold leading-tight">Mes groupes</span>
        <span className="text-[10px] leading-tight text-cream/55">
          Retrouver et rejoindre des groupes
        </span>
      </Link>
      <Link
        href="/groupes/?nouveau=cercle"
        className="dark-ctx flex flex-col items-center gap-1.5 rounded-2xl bg-[#1C1C1B] px-3 py-4 text-center text-cream transition-transform active:scale-[0.98]"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-dawn-400/15 text-dawn-300">
          <CreateCircleIcon className="h-[18px] w-[18px]" />
        </span>
        <span className="text-xs font-bold leading-tight">Créer ton cercle</span>
        <span className="text-[10px] leading-tight text-cream/55">
          Prière privée entre proches
        </span>
      </Link>
    </div>
  );
}
