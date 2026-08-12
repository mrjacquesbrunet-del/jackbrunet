import { describe, expect, it } from 'vitest';
import {
  average,
  calculateWeightChange,
  dayCompletion,
  goalState,
  movingAverage,
  progressRatio,
} from '../progress';

describe('progressRatio', () => {
  it('borne le ratio entre 0 et 1', () => {
    expect(progressRatio(5000, 10000)).toBe(0.5);
    expect(progressRatio(12000, 10000)).toBe(1);
    expect(progressRatio(-5, 10000)).toBe(0);
    expect(progressRatio(5, 0)).toBe(0);
  });
});

describe('goalState', () => {
  it('renvoie les trois états visuels', () => {
    expect(goalState(0, 10000)).toBe('not_started');
    expect(goalState(2000, 10000)).toBe('in_progress');
    expect(goalState(10000, 10000)).toBe('done');
  });
});

describe('dayCompletion', () => {
  it('fait la moyenne des ratios en pourcentage', () => {
    expect(dayCompletion([1, 0.5, 0.75, 0.75])).toBe(75);
    expect(dayCompletion([])).toBe(0);
  });

  it('borne les ratios avant la moyenne', () => {
    expect(dayCompletion([2, 0])).toBe(50);
  });
});

describe('calculateWeightChange', () => {
  it("exemple du cahier des charges (départ 137, aujourd'hui 128.4, objectif 100)", () => {
    const s = calculateWeightChange(137, 128.4, 100);
    expect(s.lost).toBeCloseTo(8.6, 1);
    expect(s.remaining).toBeCloseTo(28.4, 1);
  });

  it('fonctionne aussi en prise de masse', () => {
    const s = calculateWeightChange(70, 73, 80);
    expect(s.lost).toBe(3); // pris 3 kg
    expect(s.remaining).toBe(7);
  });

  it('ne renvoie pas de restant négatif quand l’objectif est dépassé', () => {
    expect(calculateWeightChange(137, 98, 100).remaining).toBe(0);
  });
});

describe('movingAverage', () => {
  it('lisse la série avec une fenêtre glissante', () => {
    expect(movingAverage([1, 2, 3, 4], 2)).toEqual([1, 1.5, 2.5, 3.5]);
  });
});

describe('average', () => {
  it('moyenne arrondie à une décimale', () => {
    expect(average([1, 2])).toBe(1.5);
    expect(average([])).toBe(0);
  });
});
