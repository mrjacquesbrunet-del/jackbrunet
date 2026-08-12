import { describe, expect, it } from 'vitest';
import { cmToDisplay, displayToCm, unitLabel } from '../units';

describe('cmToDisplay', () => {
  it('affiche les cm tels quels', () => {
    expect(cmToDisplay(128.4, 'cm')).toBe(128.4);
  });

  it('convertit en pouces arrondis à une décimale', () => {
    expect(cmToDisplay(2.54, 'in')).toBe(1);
    expect(cmToDisplay(100, 'in')).toBe(39.4);
  });
});

describe('displayToCm', () => {
  it('stocke les cm tels quels', () => {
    expect(displayToCm(42, 'cm')).toBe(42);
  });

  it('convertit les pouces en cm', () => {
    expect(displayToCm(1, 'in')).toBe(2.54);
    expect(displayToCm(16.5, 'in')).toBeCloseTo(41.91, 2);
  });

  it('est cohérent en aller-retour', () => {
    const cm = displayToCm(cmToDisplay(106.68, 'in'), 'in');
    expect(cm).toBeCloseTo(106.68, 0);
  });
});

describe('unitLabel', () => {
  it('libellés français', () => {
    expect(unitLabel('cm')).toBe('cm');
    expect(unitLabel('in')).toBe('po');
  });
});
