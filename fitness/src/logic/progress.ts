/**
 * Calculs de progression (objectifs, poids, journée) — fonctions pures.
 */

export type GoalState = 'not_started' | 'in_progress' | 'done';

/** Ratio de progression borné entre 0 et 1. */
export function progressRatio(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(1, Math.max(0, current / target));
}

/** Les trois états visuels d'un objectif quotidien. */
export function goalState(current: number, target: number): GoalState {
  if (target <= 0 || current <= 0) return 'not_started';
  return current >= target ? 'done' : 'in_progress';
}

/**
 * Score global de la journée : moyenne des ratios fournis
 * (nutrition, entraînement, pas, eau…), en pourcentage entier.
 */
export function dayCompletion(ratios: number[]): number {
  if (ratios.length === 0) return 0;
  const clamped = ratios.map((r) => Math.min(1, Math.max(0, r)));
  return Math.round((clamped.reduce((a, b) => a + b, 0) / ratios.length) * 100);
}

export interface WeightSummary {
  current: number;
  lost: number;      // positif = perdu, négatif = pris
  remaining: number; // restant jusqu'à l'objectif (0 si atteint)
}

/**
 * Synthèse du poids : perdu depuis le départ, restant jusqu'à l'objectif.
 * Fonctionne dans les deux sens (perte ou prise de poids).
 */
export function calculateWeightChange(
  startingWeight: number,
  currentWeight: number,
  targetWeight: number,
): WeightSummary {
  const r = (n: number) => Math.round(n * 10) / 10;
  const losing = targetWeight <= startingWeight;
  const lost = losing ? startingWeight - currentWeight : currentWeight - startingWeight;
  const remaining = losing ? currentWeight - targetWeight : targetWeight - currentWeight;
  return { current: currentWeight, lost: r(lost), remaining: r(Math.max(0, remaining)) };
}

/**
 * Moyenne mobile (fenêtre glissante) — pour lisser la courbe de poids
 * et mettre en avant la tendance plutôt que la variation quotidienne.
 */
export function movingAverage(values: number[], window = 7): number[] {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    return Math.round(avg * 100) / 100;
  });
}

/** Moyenne simple arrondie à une décimale (check-in hebdo, stats). */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}
