/**
 * Calculs nutritionnels — fonctions pures, sans dépendance UI ni Supabase.
 * Toute formule nutritionnelle de l'app vit ici (jamais dupliquée ailleurs).
 */

export interface MacroSet {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const EMPTY_MACROS: MacroSet = { calories: 0, protein: 0, carbs: 0, fat: 0 };

/** Kcal théoriques d'une répartition macro (4 / 4 / 9 kcal par gramme). */
export function macroCalories(protein: number, carbs: number, fat: number): number {
  return protein * 4 + carbs * 4 + fat * 9;
}

/** Arrondit chaque valeur d'un MacroSet à une décimale. */
export function roundMacros(m: MacroSet): MacroSet {
  const r = (n: number) => Math.round(n * 10) / 10;
  return { calories: r(m.calories), protein: r(m.protein), carbs: r(m.carbs), fat: r(m.fat) };
}

export function addMacros(a: MacroSet, b: MacroSet): MacroSet {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
  };
}

export function sumMacros(list: MacroSet[]): MacroSet {
  return roundMacros(list.reduce(addMacros, EMPTY_MACROS));
}

interface FoodLike {
  serving_size: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

/**
 * Règle de trois sur la portion de référence d'un aliment.
 * Ex. : 165 kcal / 100 g → pour 175 g : 288,8 kcal.
 */
export function calculateFoodMacros(food: FoodLike, quantity: number): MacroSet {
  if (food.serving_size <= 0 || quantity < 0) return EMPTY_MACROS;
  const ratio = quantity / food.serving_size;
  return roundMacros({
    calories: food.calories * ratio,
    protein: food.protein_g * ratio,
    carbs: food.carbs_g * ratio,
    fat: food.fat_g * ratio,
  });
}

interface IngredientLike {
  quantity: number;
  food: FoodLike;
}

/** Totaux d'une recette + valeurs par portion. */
export function calculateRecipeMacros(
  ingredients: IngredientLike[],
  servings: number,
): { total: MacroSet; perServing: MacroSet } {
  const total = sumMacros(ingredients.map((i) => calculateFoodMacros(i.food, i.quantity)));
  const s = Math.max(1, servings);
  const perServing = roundMacros({
    calories: total.calories / s,
    protein: total.protein / s,
    carbs: total.carbs / s,
    fat: total.fat / s,
  });
  return { total, perServing };
}

interface MealEntryLike {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  status: 'planned' | 'consumed';
}

/**
 * Totaux d'une journée alimentaire.
 * `status: 'consumed'` → uniquement ce qui a réellement été mangé ;
 * `status: 'planned'` → tout ce qui est prévu (consommé inclus).
 */
export function calculateDailyMacros(
  entries: MealEntryLike[],
  status: 'planned' | 'consumed' = 'consumed',
): MacroSet {
  const kept = status === 'consumed' ? entries.filter((e) => e.status === 'consumed') : entries;
  return sumMacros(
    kept.map((e) => ({ calories: e.calories, protein: e.protein_g, carbs: e.carbs_g, fat: e.fat_g })),
  );
}

interface GoalLike {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

/** Ce qu'il reste à consommer par rapport à l'objectif (jamais négatif). */
export function remainingMacros(goal: GoalLike, consumed: MacroSet): MacroSet {
  const r = (n: number) => Math.max(0, Math.round(n * 10) / 10);
  return {
    calories: r(goal.calories - consumed.calories),
    protein: r(goal.protein_g - consumed.protein),
    carbs: r(goal.carbs_g - consumed.carbs),
    fat: r(goal.fat_g - consumed.fat),
  };
}
