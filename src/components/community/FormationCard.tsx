"use client";

import Link from "next/link";

/**
 * Carte « Formations » sur le mur (remplace les tuiles Groupes) : annonce
 * la nouvelle École biblique et mène à la formation.
 */
export function FormationCard() {
  return (
    <Link
      href="/ecole/fondamentaux"
      className="dark-ctx relative mt-4 block overflow-hidden rounded-2xl bg-night-900 p-4 text-cream transition-transform active:scale-[0.98]"
    >
      <div aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-dawn-400/15 blur-2xl" />
      <div className="relative flex items-center gap-3.5">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-dawn-400 text-night-950">
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={1.9}>
            <path
              d="M2 9.5l10-5 10 5-10 5-10-5M5.8 12.4v3.8c0 1.4 2.8 2.8 6.2 2.8s6.2-1.4 6.2-2.8v-3.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="inline-block rounded-full bg-dawn-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-night-950">
            Nouveau
          </span>
          <span className="mt-0.5 block text-sm font-bold leading-tight">Formation biblique</span>
          <span className="block text-[11px] leading-tight text-cream/60">
            Apprends les fondamentaux de la foi, leçon par leçon.
          </span>
        </span>
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-cream/40" strokeWidth={2}>
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}
