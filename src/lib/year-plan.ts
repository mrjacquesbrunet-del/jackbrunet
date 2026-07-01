/**
 * Plan « La Bible en 1 an »: répartit les 1189 chapitres de la Bible en
 * 365 jours, de façon déterministe (≈ 3-4 chapitres/jour, dans l'ordre
 * canonique). Les chapitres se déduisent de l'index — aucune donnée à stocker.
 */

export type PlanIndexBook = { id: number; name: string; chapters: number };
export type DayChapter = { livre: number; nom: string; chap: number };
export type PlanDay = { day: number; chapters: DayChapter[]; label: string };

export const YEAR_PLAN_SLUG = "bible-1-an";
export const YEAR_PLAN_DAYS = 365;

/** Construit les 365 jours à partir de l'index des livres. */
export function buildYearPlan(index: PlanIndexBook[]): PlanDay[] {
  // Séquence à plat de tous les chapitres, dans l'ordre canonique.
  const seq: DayChapter[] = [];
  for (const b of index) {
    for (let c = 1; c <= b.chapters; c++) seq.push({ livre: b.id, nom: b.name, chap: c });
  }
  const total = seq.length || 1189;
  const base = Math.floor(total / YEAR_PLAN_DAYS); // 3
  const extra = total - base * YEAR_PLAN_DAYS; // les `extra` premiers jours ont +1

  const days: PlanDay[] = [];
  let i = 0;
  for (let d = 0; d < YEAR_PLAN_DAYS; d++) {
    const count = base + (d < extra? 1: 0);
    const chapters = seq.slice(i, i + count);
    i += count;
    days.push({ day: d + 1, chapters, label: rangeLabel(chapters) });
  }
  return days;
}

/** Étiquette lisible d'une journée (ex. « Genèse 1–3 » ou « Ps 119 · Mt 1 »). */
function rangeLabel(chapters: DayChapter[]): string {
  if (chapters.length === 0) return "";
  // Regroupe les chapitres consécutifs d'un même livre.
  const parts: string[] = [];
  let start = chapters[0];
  let prev = chapters[0];
  for (let k = 1; k <= chapters.length; k++) {
    const cur = chapters[k];
    const sameRun = cur && cur.livre === prev.livre && cur.chap === prev.chap + 1;
    if (!sameRun) {
      parts.push(
        start.chap === prev.chap
? `${start.nom} ${start.chap}`
: `${start.nom} ${start.chap}–${prev.chap}`,
      );
      if (cur) start = cur;
    }
    if (cur) prev = cur;
  }
  return parts.join(" · ");
}
