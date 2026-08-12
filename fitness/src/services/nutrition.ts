import { calculateFoodMacros, calculateRecipeMacros } from '@/src/logic/nutrition';
import { supabase } from '@/src/lib/supabase';
import type { Food, MealEntry, Recipe, RecipeIngredient } from '@/src/types/domain';

async function userId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Non connecté');
  return data.user.id;
}

// --- Aliments ----------------------------------------------------------------

/** Recherche dans la base globale + les aliments personnels. */
export async function searchFoods(query: string, limit = 30): Promise<Food[]> {
  let request = supabase.from('foods').select('*').order('name').limit(limit);
  if (query.trim().length > 0) request = request.ilike('name', `%${query.trim()}%`);
  const { data, error } = await request;
  if (error) throw error;
  return data ?? [];
}

export async function createFood(food: Omit<Food, 'id' | 'user_id'>): Promise<Food> {
  const { data, error } = await supabase
    .from('foods')
    .insert({ ...food, user_id: await userId() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Recettes ----------------------------------------------------------------

export async function listRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase.from('recipes').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getRecipeIngredients(recipeId: string): Promise<RecipeIngredient[]> {
  const { data, error } = await supabase
    .from('recipe_ingredients')
    .select('*, food:foods(*)')
    .eq('recipe_id', recipeId)
    .order('position');
  if (error) throw error;
  return (data ?? []) as RecipeIngredient[];
}

/** Recalcule et enregistre les totaux dénormalisés d'une recette. */
export async function refreshRecipeTotals(recipeId: string): Promise<void> {
  const [ingredients, { data: recipe, error: recipeError }] = await Promise.all([
    getRecipeIngredients(recipeId),
    supabase.from('recipes').select('servings').eq('id', recipeId).single(),
  ]);
  if (recipeError) throw recipeError;

  const withFood = ingredients.filter((i): i is RecipeIngredient & { food: Food } => !!i.food);
  const { total } = calculateRecipeMacros(
    withFood.map((i) => ({ quantity: i.quantity, food: i.food })),
    recipe.servings,
  );

  const { error } = await supabase
    .from('recipes')
    .update({
      total_calories: total.calories,
      total_protein_g: total.protein,
      total_carbs_g: total.carbs,
      total_fat_g: total.fat,
    })
    .eq('id', recipeId);
  if (error) throw error;
}

/** Duplique une recette (et ses ingrédients) sans toucher à l'originale. */
export async function duplicateRecipe(recipeId: string, newName: string): Promise<Recipe> {
  const { data: original, error: readError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .single();
  if (readError) throw readError;

  const { id: _id, ...fields } = original as Recipe & { id: string };
  const { data: copy, error: insertError } = await supabase
    .from('recipes')
    .insert({ ...fields, name: newName, user_id: await userId() })
    .select()
    .single();
  if (insertError) throw insertError;

  const ingredients = await getRecipeIngredients(recipeId);
  if (ingredients.length > 0) {
    const { error } = await supabase.from('recipe_ingredients').insert(
      ingredients.map(({ food_id, quantity, unit, position }) => ({
        recipe_id: copy.id,
        food_id,
        quantity,
        unit,
        position,
      })),
    );
    if (error) throw error;
  }
  return copy;
}

// --- Journal des repas ---------------------------------------------------------

export async function listMealEntries(date: string): Promise<MealEntry[]> {
  const { data, error } = await supabase
    .from('meal_entries')
    .select('*, food:foods(*), recipe:recipes(*)')
    .eq('entry_date', date)
    .order('meal_order')
    .order('created_at');
  if (error) throw error;
  return (data ?? []) as MealEntry[];
}

interface AddMealInput {
  date: string;
  mealSlot: string;
  status?: 'planned' | 'consumed';
  food?: Food;
  recipe?: Recipe;
  customName?: string;
  quantity: number; // en unité de portion de l'aliment, ou nombre de portions de recette
  unit?: string;
}

/**
 * Ajoute une entrée au journal en figeant un instantané nutritionnel
 * (les macros de l'entrée ne changeront pas si l'aliment est modifié plus tard).
 */
export async function addMealEntry(input: AddMealInput): Promise<void> {
  let macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  if (input.food) {
    macros = calculateFoodMacros(input.food, input.quantity);
  } else if (input.recipe && input.recipe.total_calories != null) {
    const perServing = input.recipe.servings > 0 ? input.recipe.servings : 1;
    macros = {
      calories: ((input.recipe.total_calories ?? 0) / perServing) * input.quantity,
      protein: ((input.recipe.total_protein_g ?? 0) / perServing) * input.quantity,
      carbs: ((input.recipe.total_carbs_g ?? 0) / perServing) * input.quantity,
      fat: ((input.recipe.total_fat_g ?? 0) / perServing) * input.quantity,
    };
  }

  const { error } = await supabase.from('meal_entries').insert({
    user_id: await userId(),
    entry_date: input.date,
    meal_slot: input.mealSlot,
    food_id: input.food?.id ?? null,
    recipe_id: input.recipe?.id ?? null,
    custom_name: input.customName ?? null,
    quantity: input.quantity,
    unit: input.unit ?? input.food?.serving_unit ?? null,
    calories: Math.round(macros.calories * 10) / 10,
    protein_g: Math.round(macros.protein * 10) / 10,
    carbs_g: Math.round(macros.carbs * 10) / 10,
    fat_g: Math.round(macros.fat * 10) / 10,
    status: input.status ?? 'planned',
    consumed_at: input.status === 'consumed' ? new Date().toISOString() : null,
  });
  if (error) throw error;
}

/** « Marquer comme consommé » — un repas planifié ne compte jamais tout seul. */
export async function markMealConsumed(entryId: string): Promise<void> {
  const { error } = await supabase
    .from('meal_entries')
    .update({ status: 'consumed', consumed_at: new Date().toISOString() })
    .eq('id', entryId);
  if (error) throw error;
}

export async function deleteMealEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('meal_entries').delete().eq('id', entryId);
  if (error) throw error;
}

/** Copie tous les repas d'une journée vers une autre (en statut « prévu »). */
export async function duplicateDay(fromDate: string, toDate: string): Promise<void> {
  const entries = await listMealEntries(fromDate);
  if (entries.length === 0) return;
  const uid = await userId();
  const { error } = await supabase.from('meal_entries').insert(
    entries.map((e) => ({
      user_id: uid,
      entry_date: toDate,
      meal_slot: e.meal_slot,
      meal_order: e.meal_order,
      food_id: e.food_id,
      recipe_id: e.recipe_id,
      custom_name: e.custom_name,
      quantity: e.quantity,
      unit: e.unit,
      calories: e.calories,
      protein_g: e.protein_g,
      carbs_g: e.carbs_g,
      fat_g: e.fat_g,
      status: 'planned' as const,
    })),
  );
  if (error) throw error;
}
