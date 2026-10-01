"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { getEtudes } from "@/lib/etudes";

/**
 * ÉCOLE BIBLIQUE — le hub d'étude et de formation :
 *  1. Formations (la première : « Les fondamentaux de la foi » — en préparation)
 *  2. Pose ta question (l'assistant)
 *  3. Études bibliques (bibliothèque embarquée)
 *  4. Explorer : chronologie, personnages & lieux dans la Bible
 */

function Carte({
  href,
  eyebrow,
  titre,
  texte,
  icone,
  accent = false,
  soon = false,
}: {
  href?: string;
  eyebrow: string;
  titre: string;
  texte: string;
  icone: ReactNode;
  accent?: boolean;
  soon?: boolean;
}) {
  const inner = (
    <>
      <span
        className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${
          accent ? "bg-dawn-400 text-night-950" : "bg-dawn-400/15 text-dawn-300"
        }`}
      >
        {icone}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[10px] font-black uppercase tracking-[0.2em] ${soon ? "text-cream/40" : "text-dawn-300"}`}>
          {eyebrow}
        </span>
        <span className="block font-display text-lg font-extrabold leading-tight text-cream">{titre}</span>
        <span className="mt-0.5 block text-sm leading-snug text-cream/60">{texte}</span>
      </span>
      {!soon ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-cream/40" strokeWidth={2}>
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </>
  );
  const cls = `flex w-full items-center gap-4 rounded-3xl border p-5 text-left transition-transform ${
    soon
      ? "border-white/10 bg-white/[0.03] opacity-80"
      : accent
        ? "border-dawn-400/40 bg-gradient-to-br from-night-900 to-night-950 shadow-card active:scale-[0.99]"
        : "border-white/10 bg-white/[0.04] active:scale-[0.99] hover:bg-white/[0.06]"
  }`;
  return href && !soon ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function EcoleView() {
  const nEtudes = getEtudes().length;

  return (
    <div className="dark-ctx min-h-screen bg-night-950 pb-32 text-cream">
      {/* En-tête */}
      <header className="container-x pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <div className="mx-auto max-w-2xl">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-dawn-300">RHEMA</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight">École biblique</h1>
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-cream/65">
            Apprendre, comprendre, grandir : des formations, des études et des outils pour
            t&apos;enraciner dans la Parole.
          </p>
        </div>
      </header>

      <main className="container-x mx-auto mt-7 max-w-2xl space-y-3">
        {/* 1. Formation (en préparation) */}
        <Carte
          eyebrow="Formation · bientôt disponible"
          titre="Les fondamentaux de la foi chrétienne"
          texte="Un parcours en leçons, avec quiz de validation — et l'e-book offert à la fin."
          soon
          icone={
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={1.9}>
              <path d="M2 9.5l10-5 10 5-10 5-10-5M5.8 12.4v3.8c0 1.4 2.8 2.8 6.2 2.8s6.2-1.4 6.2-2.8v-3.8M22 9.5v5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />

        {/* 2. L'assistant */}
        <Carte
          href="/assistant"
          accent
          eyebrow="Assistant biblique"
          titre="Pose ta question"
          texte="Une réponse claire, ancrée dans la Parole, versets cliquables à l'appui."
          icone={
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={1.9}>
              <path d="M12 6c-1.8-1.4-4.2-2-7-2v14c2.8 0 5.2.6 7 2 1.8-1.4 4.2-2 7-2V4c-2.8 0-5.2.6-7 2zM12 6v14" strokeLinejoin="round" />
            </svg>
          }
        />

        {/* 3. Les études */}
        <Carte
          href="/assistant?tab=etudes"
          eyebrow={`${nEtudes} études`}
          titre="Études bibliques"
          texte="La grâce, la foi, le Saint-Esprit, la prière… les grands thèmes expliqués simplement."
          icone={
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={1.9}>
              <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4zM5 16.5A2.5 2.5 0 0 1 7.5 14H19M9 8h6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />

        {/* 4. Explorer */}
        <p className="pt-4 text-[11px] font-black uppercase tracking-[0.22em] text-cream/40">Explorer</p>
        <Carte
          href="/chronologie"
          eyebrow="Frise interactive"
          titre="Chronologie biblique"
          texte="De la création à l'Apocalypse : situe chaque livre et chaque époque."
          icone={
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={1.9}>
              <path d="M3 12h18M7 12V7m5 5v-3m5 3V5M7 7h.01M12 9h.01M17 5h.01" strokeLinecap="round" />
            </svg>
          }
        />
        <Carte
          href="/bible"
          eyebrow="275 fiches dans ta Bible"
          titre="Personnages, lieux & cartes"
          texte="Dans chaque chapitre : les figures, leurs histoires, leurs parcours sur la carte — et le contexte culturel verset par verset."
          icone={
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={1.9}>
              <circle cx="12" cy="10" r="3.2" />
              <path d="M12 2.5c-4 0-7 3-7 7 0 4.8 7 12 7 12s7-7.2 7-12c0-4-3-7-7-7z" strokeLinejoin="round" />
            </svg>
          }
        />
      </main>
    </div>
  );
}
