"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMeditations } from "@/lib/meditations-relecture";
import { exhortationsRecentes, idFavoriExhortation, type ExhortationDuJour } from "@/lib/exhortations";
import { useToolkit } from "@/lib/toolkit";
import { localeApp } from "@/lib/i18n";
import { BookmarkFilledGlyph } from "@/components/ui/DevoIcons";
import { LecteurExhortation } from "@/components/devotional/LecteurExhortation";

/**
 * Toutes les exhortations du « Temps avec Jésus » des 90 derniers jours :
 * le titre et le jour, un toucher pour la relire.
 */
export function ArchiveExhortations() {
  const liste = useMeditations();
  const jours = useMemo(() => exhortationsRecentes(liste, 90), [liste]);
  const { saved } = useToolkit();
  const favoris = new Set(saved.map((s) => s.id));
  const [ouverte, setOuverte] = useState<ExhortationDuJour | null>(null);
  // Fond nuit jusqu'aux bords, comme les autres écrans sombres.
  useEffect(() => {
    document.documentElement.classList.add("page-nuit");
    return () => document.documentElement.classList.remove("page-nuit");
  }, []);
  const [filtre, setFiltre] = useState("");
  const f = filtre.trim().toLowerCase();
  const affiches = jours.filter((j) => !f || j.dev.theme.toLowerCase().includes(f) || j.dev.verseReference.toLowerCase().includes(f));

  // Regroupées par mois pour s'y retrouver.
  const parMois: { mois: string; items: ExhortationDuJour[] }[] = [];
  for (const j of affiches) {
    const mois = j.date.toLocaleDateString(localeApp(), { month: "long", year: "numeric" });
    const g = parMois[parMois.length - 1];
    if (g && g.mois === mois) g.items.push(j);
    else parMois.push({ mois, items: [j] });
  }
  const aujourdhui = new Date().toDateString();

  return (
    <section className="keep-dark min-h-[100svh] bg-night-950 px-4 pb-24 pt-[calc(env(safe-area-inset-top)+4.75rem)] text-cream sm:pt-28">
      <div className="mx-auto max-w-2xl">
        <Link href="/devotionnel" className="inline-flex items-center gap-1 text-sm font-semibold text-cream/55">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
            <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Temps avec Jésus
        </Link>
        <h1 className="mt-3 font-display text-[28px] font-extrabold leading-tight">Toutes les exhortations</h1>
        <p className="mt-1 text-sm text-cream/60">Les 90 derniers jours. Touche un titre pour la relire.</p>

        <input
          type="search"
          value={filtre}
          onChange={(e) => setFiltre(e.target.value)}
          placeholder="Chercher un titre ou un verset…"
          className="mt-4 w-full rounded-2xl bg-white/[0.08] px-4 py-3 text-[15px] text-cream outline-none placeholder:text-cream/40"
        />

        {!jours.length ? <p className="mt-8 text-cream/50">Chargement…</p> : null}
        {jours.length && !affiches.length ? <p className="mt-8 text-cream/50">Aucune exhortation pour « {filtre.trim()} ».</p> : null}

        {parMois.map((g) => (
          <div key={g.mois} className="mt-6">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-dawn-300/80">{g.mois}</p>
            <ul className="mt-2 divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              {g.items.map((j) => {
                const estAujourdhui = j.date.toDateString() === aujourdhui;
                return (
                  <li key={j.date.toISOString()}>
                    <button type="button" onClick={() => setOuverte(j)} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-white/[0.05]">
                      <span className="w-12 shrink-0 text-center">
                        <span className="block font-display text-xl font-extrabold leading-none">{j.date.getDate()}</span>
                        <span className="block text-[10px] font-semibold uppercase text-cream/45">
                          {j.date.toLocaleDateString(localeApp(), { weekday: "short" })}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-bold">{j.dev.theme}</span>
                        <span className="block truncate text-xs text-cream/50">
                          {estAujourdhui ? "Aujourd'hui · " : ""}
                          {j.dev.verseReference}
                        </span>
                      </span>
                      {favoris.has(idFavoriExhortation(j.index)) ? <BookmarkFilledGlyph className="h-4 w-4 shrink-0 text-dawn-400" /> : null}
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current text-cream/30" strokeWidth={2.2} aria-hidden>
                        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <LecteurExhortation ouverte={ouverte} fermer={() => setOuverte(null)} />
    </section>
  );
}
