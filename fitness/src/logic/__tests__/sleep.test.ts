import { describe, expect, it } from 'vitest';
import { formatSleepDuration, sleepDurationMin, sleepRatio } from '../sleep';

describe('sleepDurationMin', () => {
  it('gère le passage de minuit', () => {
    expect(sleepDurationMin('23:30', '07:00')).toBe(450); // 7 h 30
    expect(sleepDurationMin('22:00', '06:00')).toBe(480); // 8 h
  });

  it('gère un coucher après minuit', () => {
    expect(sleepDurationMin('01:15', '08:45')).toBe(450);
  });
});

describe('formatSleepDuration', () => {
  it('affiche « 7 h 30 » ou « 8 h »', () => {
    expect(formatSleepDuration(450)).toBe('7 h 30');
    expect(formatSleepDuration(480)).toBe('8 h');
    expect(formatSleepDuration(485)).toBe('8 h 05');
  });
});

describe('sleepRatio', () => {
  it('rapporte la durée à l’objectif (8 h par défaut), borné à 1', () => {
    expect(sleepRatio(480)).toBe(1);
    expect(sleepRatio(240)).toBe(0.5);
    expect(sleepRatio(600)).toBe(1); // pas de bonus au-delà
  });
});
