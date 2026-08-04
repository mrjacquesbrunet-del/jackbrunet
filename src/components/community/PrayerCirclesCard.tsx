"use client";

import Link from "next/link";

/** Icône groupe (charte, trait fin — même code que le menu). */
function CircleIcon({ className }: { className?: string }) {
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

/**
 * Accès DISCRET aux « cercles de prière » depuis le mur : une fine rangée
 * (créer un cercle privé / rejoindre avec un code), pour ne pas retarder
 * l'arrivée sur le mur lui-même.
 */
export function PrayerCirclesCard() {
  return (
    <div className="dark-ctx mt-4 flex items-center gap-3 rounded-2xl bg-[#1F2216] px-3.5 py-2.5 text-cream">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-dawn-400/15 text-dawn-300">
        <CircleIcon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-bold">Cercles de prière</p>
        <p className="truncate text-[11px] text-cream/55">Prie en privé avec tes proches</p>
      </div>
      <Link
        href="/groupes/?nouveau=cercle"
        className="shrink-0 rounded-full bg-dawn-400 px-3 py-1.5 text-xs font-bold text-night-950"
      >
        Créer
      </Link>
      <Link
        href="/groupes/?rejoindre=1"
        className="shrink-0 rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-cream/85"
      >
        Code
      </Link>
    </div>
  );
}
