import { describe, expect, it } from 'vitest';
import {
  calculateWorkoutVolume,
  estimatedOneRepMax,
  personalRecord,
  sessionProgress,
} from '../workout';

const sets = [
  { actual_reps: 10, actual_weight_kg: 80, completed: true },
  { actual_reps: 10, actual_weight_kg: 80, completed: true },
  { actual_reps: 8, actual_weight_kg: 85, completed: true },
  { actual_reps: null, actual_weight_kg: null, completed: false },
];

describe('calculateWorkoutVolume', () => {
  it('somme charge × reps des séries complétées uniquement', () => {
    expect(calculateWorkoutVolume(sets)).toBe(80 * 10 + 80 * 10 + 85 * 8);
  });

  it('renvoie 0 sans série', () => {
    expect(calculateWorkoutVolume([])).toBe(0);
  });
});

describe('sessionProgress', () => {
  it('calcule le pourcentage de séries complétées', () => {
    expect(sessionProgress(sets)).toBe(75);
    expect(sessionProgress([])).toBe(0);
  });
});

describe('personalRecord', () => {
  it('trouve la meilleure charge et le meilleur volume', () => {
    const pr = personalRecord(sets);
    expect(pr.bestWeight).toBe(85);
    expect(pr.bestVolume).toBe(800);
  });

  it('ignore les séries non complétées', () => {
    const pr = personalRecord([{ actual_reps: 5, actual_weight_kg: 200, completed: false }]);
    expect(pr.bestWeight).toBe(0);
  });
});

describe('estimatedOneRepMax', () => {
  it('applique la formule d’Epley', () => {
    expect(estimatedOneRepMax(80, 10)).toBeCloseTo(106.7, 1);
    expect(estimatedOneRepMax(100, 1)).toBe(100);
    expect(estimatedOneRepMax(0, 10)).toBe(0);
  });
});
