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
 * Invitation aux « cercles de prière » sur le mur : un espace PRIVÉ, sur
 * invitation, pour prier avec ses proches (famille, amis, église) — avec
 * discussion, sujets épinglés et notes vocales.
 */
export function PrayerCirclesCard() {
  return (
    <div className="dark-ctx bg-topo-dark relative mt-8 overflow-hidden rounded-3xl p-5 text-cream sm:p-6">
      <div className="blob -right-10 -top-8 h-32 w-32 bg-dawn-400/20" />
      <div className="relative">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-dawn-300">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-dawn-400/15">
            <CircleIcon className="h-4 w-4" />
          </span>
          Cercles de prière
        </p>
        <h3 className="mt-3 font-display text-xl font-extrabold leading-tight">
          Prie avec tes proches
        </h3>
        <p className="mt-1.5 text-sm text-cream/75">
          Crée un cercle privé avec ta famille, tes amis ou ton église : partagez vos
          sujets de prière, discutez, envoyez des notes vocales — entre vous uniquement,
          sur invitation.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/groupes/?nouveau=cercle" className="btn-primary text-sm">
            Créer mon cercle
          </Link>
          <Link href="/groupes/?rejoindre=1" className="btn-ghost text-sm">
            Rejoindre avec un code
          </Link>
        </div>
      </div>
    </div>
  );
}
