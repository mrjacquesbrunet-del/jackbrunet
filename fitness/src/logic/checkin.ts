/**
 * Calculs liés aux bilans corporels (check-ins) — fonctions pures.
 * Comparaison départ → aujourd'hui, bilan → bilan, rappel mensuel.
 */

import type { MeasurementSide, MeasurementState, MeasurementType } from '@/src/types/domain';

export interface MeasurementLike {
  measurement_type: MeasurementType;
  custom_label: string | null;
  side: MeasurementSide;
  measurement_state: MeasurementState;
  value_cm: number;
}

/**
 * Clé d'identité d'une mesure : deux mesures ne sont comparables que si
 * type, libellé personnalisé, côté ET état (relâché/contracté) coïncident.
 */
export function measurementKey(m: MeasurementLike): string {
  return [m.measurement_type, m.custom_label ?? '', m.side, m.measurement_state].join('|');
}

export interface MeasurementDelta {
  key: string;
  measurement_type: MeasurementType;
  custom_label: string | null;
  side: MeasurementSide;
  measurement_state: MeasurementState;
  before_cm: number;
  after_cm: number;
  delta_cm: number; // négatif = perdu, positif = pris
}

/**
 * Compare deux séries de mensurations (ex. bilan de départ vs bilan actuel).
 * Seules les mesures présentes des deux côtés produisent une différence.
 */
export function compareMeasurements(
  before: MeasurementLike[],
  after: MeasurementLike[],
): MeasurementDelta[] {
  const byKey = new Map(before.map((m) => [measurementKey(m), m]));
  const deltas: MeasurementDelta[] = [];
  for (const m of after) {
    const key = measurementKey(m);
    const prev = byKey.get(key);
    if (!prev) continue;
    deltas.push({
      key,
      measurement_type: m.measurement_type,
      custom_label: m.custom_label,
      side: m.side,
      measurement_state: m.measurement_state,
      before_cm: prev.value_cm,
      after_cm: m.value_cm,
      delta_cm: Math.round((m.value_cm - prev.value_cm) * 10) / 10,
    });
  }
  return deltas;
}

/** Différence de poids entre deux bilans (négatif = perdu). */
export function weightDelta(
  beforeKg: number | null | undefined,
  afterKg: number | null | undefined,
): number | null {
  if (beforeKg == null || afterKg == null) return null;
  return Math.round((afterKg - beforeKg) * 10) / 10;
}

/**
 * Date du prochain bilan mensuel : un mois après le dernier bilan.
 * Gère les fins de mois (31 janvier → 28/29 février, pas 2/3 mars).
 */
export function nextMonthlyCheckinDate(lastCheckinISO: string): string {
  const [y, m, d] = lastCheckinISO.split('-').map(Number);
  const targetMonth = m === 12 ? 1 : m + 1;
  const targetYear = m === 12 ? y + 1 : y;
  const daysInTarget = new Date(targetYear, targetMonth, 0).getDate();
  const day = Math.min(d, daysInTarget);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${targetYear}-${pad(targetMonth)}-${pad(day)}`;
}

/**
 * Le rappel mensuel doit-il s'afficher ?
 * Vrai si le prochain bilan est dû, sauf si l'utilisateur a reporté
 * le rappel à une date encore à venir.
 */
export function isCheckinDue(
  lastCheckinISO: string | null,
  todayISO: string,
  snoozedUntilISO: string | null = null,
): boolean {
  if (!lastCheckinISO) return false; // pas encore de bilan initial : géré par l'onboarding
  if (snoozedUntilISO && todayISO < snoozedUntilISO) return false;
  return todayISO >= nextMonthlyCheckinDate(lastCheckinISO);
}
