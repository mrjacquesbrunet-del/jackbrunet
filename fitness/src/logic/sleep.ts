/**
 * Calculs de sommeil — fonctions pures.
 * Suivi volontairement simple : coucher, lever, durée calculée.
 */

/** « 23:30 » → minutes depuis minuit. */
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

/**
 * Durée de sommeil en minutes entre le coucher et le lever,
 * en gérant le passage de minuit (23:30 → 07:00 = 7 h 30).
 */
export function sleepDurationMin(bedTime: string, wakeTime: string): number {
  const bed = toMinutes(bedTime);
  const wake = toMinutes(wakeTime);
  return wake >= bed ? wake - bed : 24 * 60 - bed + wake;
}

/** « 7 h 30 » — format d'affichage d'une durée de sommeil. */
export function formatSleepDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

/**
 * Ratio de sommeil pour le score de la journée (objectif par défaut 8 h),
 * borné à 1 — dormir plus que l'objectif ne donne pas de bonus.
 */
export function sleepRatio(durationMin: number, goalMin = 480): number {
  if (goalMin <= 0) return 0;
  return Math.min(1, Math.max(0, durationMin / goalMin));
}
