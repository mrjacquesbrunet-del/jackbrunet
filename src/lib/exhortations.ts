"use client";

import { localDayOfYear } from "@/lib/today";
import type { Devotion } from "@/lib/types";

/** Une exhortation du « Temps avec Jésus » à une date donnée. */
export type ExhortationDuJour = { date: Date; index: number; dev: Devotion };

/**
 * Les exhortations des `jours` derniers jours (aujourd'hui d'abord), avec la
 * même règle que l'écran du jour : index = jour de l'année % nombre
 * d'exhortations.
 */
export function exhortationsRecentes(liste: Devotion[], jours = 90): ExhortationDuJour[] {
  if (!liste.length) return [];
  const out: ExhortationDuJour[] = [];
  for (let k = 0; k < jours; k++) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - k);
    const index = localDayOfYear(date) % liste.length;
    const dev = liste[index];
    if (dev) out.push({ date, index, dev });
  }
  return out;
}

/** Identifiant de l'enregistrement « favori » d'une exhortation (carnet synchronisé). */
export const idFavoriExhortation = (index: number) => `dev:${index}:fav`;

/** Jour où l'exhortation n° `index` était celle du jour, le plus récent
 * avant `avant` (date de mise en favori), sur un an. */
export function dateExhortation(index: number, total: number, avant: Date): Date {
  for (let k = 0; k < 366 && total > 0; k++) {
    const d = new Date(avant);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - k);
    if (localDayOfYear(d) % total === index) return d;
  }
  return avant;
}
