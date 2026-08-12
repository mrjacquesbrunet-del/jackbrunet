import { describe, expect, it } from 'vitest';
import { expectedWaterMl, isBehindOnWater } from '../hydration';

describe('expectedWaterMl', () => {
  it('répartit l’objectif linéairement entre lever et coucher', () => {
    // 3 L entre 7 h et 22 h : à 14 h 30 (mi-journée), on attend 1,5 L
    expect(expectedWaterMl(3000, 14.5)).toBe(1500);
  });

  it('rien avant le lever, tout après le coucher', () => {
    expect(expectedWaterMl(3000, 6)).toBe(0);
    expect(expectedWaterMl(3000, 23)).toBe(3000);
  });

  it('robuste aux entrées invalides', () => {
    expect(expectedWaterMl(0, 12)).toBe(0);
    expect(expectedWaterMl(3000, 12, 22, 7)).toBe(0);
  });
});

describe('isBehindOnWater', () => {
  it('rappelle quand on est nettement en retard', () => {
    // À 14 h 30, attendu 1 500 ml ; 800 ml bus → retard de 700 ml
    expect(isBehindOnWater(800, 3000, 14.5)).toBe(true);
  });

  it('ne rappelle pas quand on est dans les clous (pas de spam)', () => {
    expect(isBehindOnWater(1400, 3000, 14.5)).toBe(false); // > 75 % de l'attendu
    expect(isBehindOnWater(0, 3000, 7.5)).toBe(false); // retard < 250 ml en début de journée
    expect(isBehindOnWater(0, 3000, 6)).toBe(false); // avant le lever
  });
});
