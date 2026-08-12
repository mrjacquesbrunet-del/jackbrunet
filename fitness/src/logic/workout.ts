/**
 * Calculs sportifs — fonctions pures.
 */

interface SetLike {
  actual_reps: number | null;
  actual_weight_kg: number | null;
  completed: boolean;
}

/** Volume total soulevé : somme (charge × répétitions) des séries complétées. */
export function calculateWorkoutVolume(sets: SetLike[]): number {
  return sets
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + (s.actual_weight_kg ?? 0) * (s.actual_reps ?? 0), 0);
}

/** Pourcentage de séries complétées d'une session (0–100). */
export function sessionProgress(sets: SetLike[]): number {
  if (sets.length === 0) return 0;
  return Math.round((sets.filter((s) => s.completed).length / sets.length) * 100);
}

export interface PersonalRecord {
  bestWeight: number; // meilleure charge sur une série
  bestVolume: number; // meilleur (charge × reps) sur une série
}

/** Records personnels sur un historique de séries (exercice donné). */
export function personalRecord(sets: SetLike[]): PersonalRecord {
  const done = sets.filter((s) => s.completed && (s.actual_weight_kg ?? 0) > 0);
  return {
    bestWeight: Math.max(0, ...done.map((s) => s.actual_weight_kg ?? 0)),
    bestVolume: Math.max(0, ...done.map((s) => (s.actual_weight_kg ?? 0) * (s.actual_reps ?? 0))),
  };
}

/**
 * 1RM estimé — formule d'Epley (indicatif uniquement).
 * `weight × (1 + reps / 30)` ; pour 1 rep, renvoie la charge elle-même.
 */
export function estimatedOneRepMax(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}
