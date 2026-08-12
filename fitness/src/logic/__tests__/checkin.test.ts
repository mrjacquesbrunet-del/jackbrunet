import { describe, expect, it } from 'vitest';
import {
  compareMeasurements,
  isCheckinDue,
  measurementKey,
  nextMonthlyCheckinDate,
  weightDelta,
  type MeasurementLike,
} from '../checkin';

const abdomenStart: MeasurementLike = {
  measurement_type: 'abdomen',
  custom_label: null,
  side: 'center',
  measurement_state: 'not_applicable',
  value_cm: 128,
};

const abdomenNow: MeasurementLike = { ...abdomenStart, value_cm: 116 };

const bicepsFlexedRight: MeasurementLike = {
  measurement_type: 'biceps',
  custom_label: null,
  side: 'right',
  measurement_state: 'flexed',
  value_cm: 42,
};

describe('measurementKey', () => {
  it('distingue côté et état (relâché vs contracté)', () => {
    const relaxed = { ...bicepsFlexedRight, measurement_state: 'relaxed' as const };
    const left = { ...bicepsFlexedRight, side: 'left' as const };
    expect(measurementKey(bicepsFlexedRight)).not.toBe(measurementKey(relaxed));
    expect(measurementKey(bicepsFlexedRight)).not.toBe(measurementKey(left));
  });

  it('distingue taille et ventre', () => {
    const waist = { ...abdomenStart, measurement_type: 'waist' as const };
    expect(measurementKey(abdomenStart)).not.toBe(measurementKey(waist));
  });
});

describe('compareMeasurements', () => {
  it('calcule la différence (exemple du cahier des charges : ventre 128 → 116)', () => {
    const deltas = compareMeasurements([abdomenStart], [abdomenNow]);
    expect(deltas).toHaveLength(1);
    expect(deltas[0].delta_cm).toBe(-12);
  });

  it('détecte une prise de muscle (bras +0,5 cm)', () => {
    const after = { ...bicepsFlexedRight, value_cm: 42.5 };
    const deltas = compareMeasurements([bicepsFlexedRight], [after]);
    expect(deltas[0].delta_cm).toBe(0.5);
  });

  it('ignore les mesures sans équivalent comparable', () => {
    const deltas = compareMeasurements([abdomenStart], [bicepsFlexedRight]);
    expect(deltas).toHaveLength(0);
  });
});

describe('weightDelta', () => {
  it('négatif quand on perd du poids', () => {
    expect(weightDelta(137, 133.8)).toBe(-3.2);
  });

  it('null quand une valeur manque', () => {
    expect(weightDelta(null, 130)).toBeNull();
    expect(weightDelta(130, undefined)).toBeNull();
  });
});

describe('nextMonthlyCheckinDate', () => {
  it('ajoute un mois', () => {
    expect(nextMonthlyCheckinDate('2026-08-12')).toBe('2026-09-12');
  });

  it('gère les fins de mois et le passage d’année', () => {
    expect(nextMonthlyCheckinDate('2026-01-31')).toBe('2026-02-28');
    expect(nextMonthlyCheckinDate('2026-12-15')).toBe('2027-01-15');
  });
});

describe('isCheckinDue', () => {
  it('dû un mois après le dernier bilan', () => {
    expect(isCheckinDue('2026-07-12', '2026-08-12')).toBe(true);
    expect(isCheckinDue('2026-07-12', '2026-08-11')).toBe(false);
  });

  it('respecte le report du rappel', () => {
    expect(isCheckinDue('2026-07-01', '2026-08-12', '2026-08-20')).toBe(false);
    expect(isCheckinDue('2026-07-01', '2026-08-20', '2026-08-20')).toBe(true);
  });

  it('jamais dû sans bilan initial (géré par l’onboarding)', () => {
    expect(isCheckinDue(null, '2026-08-12')).toBe(false);
  });
});
