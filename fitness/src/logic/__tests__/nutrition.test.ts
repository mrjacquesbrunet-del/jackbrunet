import { describe, expect, it } from 'vitest';
import {
  calculateDailyMacros,
  calculateFoodMacros,
  calculateRecipeMacros,
  macroCalories,
  remainingMacros,
  sumMacros,
} from '../nutrition';

const poulet = { serving_size: 100, calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6 };
const riz = { serving_size: 100, calories: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3 };

describe('macroCalories', () => {
  it('applique 4/4/9 kcal par gramme', () => {
    expect(macroCalories(180, 180, 70)).toBe(180 * 4 + 180 * 4 + 70 * 9);
  });
});

describe('calculateFoodMacros', () => {
  it('recalcule pour une quantité différente de la portion (exemple du cahier des charges)', () => {
    const m = calculateFoodMacros(poulet, 175);
    expect(m.calories).toBeCloseTo(288.8, 1);
    expect(m.protein).toBeCloseTo(54.3, 1);
    expect(m.fat).toBeCloseTo(6.3, 1);
  });

  it('renvoie la portion de référence à quantité égale', () => {
    expect(calculateFoodMacros(poulet, 100)).toEqual({
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
    });
  });

  it('est robuste aux valeurs invalides', () => {
    expect(calculateFoodMacros({ ...poulet, serving_size: 0 }, 100).calories).toBe(0);
    expect(calculateFoodMacros(poulet, -5).calories).toBe(0);
  });
});

describe('calculateRecipeMacros', () => {
  it('somme les ingrédients puis divise par portion', () => {
    const { total, perServing } = calculateRecipeMacros(
      [
        { quantity: 200, food: poulet },
        { quantity: 100, food: riz },
      ],
      2,
    );
    expect(total.calories).toBeCloseTo(165 * 2 + 130, 1);
    expect(total.protein).toBeCloseTo(31 * 2 + 2.7, 1);
    expect(perServing.calories).toBeCloseTo(total.calories / 2, 1);
  });

  it('ne divise jamais par zéro', () => {
    const { perServing } = calculateRecipeMacros([{ quantity: 100, food: riz }], 0);
    expect(perServing.calories).toBe(130);
  });
});

describe('calculateDailyMacros', () => {
  const entries = [
    { calories: 500, protein_g: 40, carbs_g: 50, fat_g: 15, status: 'consumed' as const },
    { calories: 700, protein_g: 50, carbs_g: 60, fat_g: 20, status: 'planned' as const },
  ];

  it('sépare le consommé du prévu', () => {
    expect(calculateDailyMacros(entries, 'consumed').calories).toBe(500);
    expect(calculateDailyMacros(entries, 'planned').calories).toBe(1200);
  });
});

describe('remainingMacros', () => {
  const goal = { calories: 2100, protein_g: 180, carbs_g: 180, fat_g: 70 };

  it('calcule le restant', () => {
    const remaining = remainingMacros(goal, { calories: 1650, protein: 145, carbs: 120, fat: 52 });
    expect(remaining).toEqual({ calories: 450, protein: 35, carbs: 60, fat: 18 });
  });

  it('ne descend jamais sous zéro en cas de dépassement', () => {
    const remaining = remainingMacros(goal, { calories: 2500, protein: 200, carbs: 200, fat: 90 });
    expect(remaining).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });
});

describe('sumMacros', () => {
  it('additionne une liste de macros', () => {
    const s = sumMacros([
      { calories: 100, protein: 10, carbs: 5, fat: 2 },
      { calories: 200, protein: 20, carbs: 15, fat: 8 },
    ]);
    expect(s).toEqual({ calories: 300, protein: 30, carbs: 20, fat: 10 });
  });
});
