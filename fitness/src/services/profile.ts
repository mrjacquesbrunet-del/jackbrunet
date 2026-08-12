import { supabase } from '@/src/lib/supabase';
import type { NutritionGoal, Profile } from '@/src/types/domain';

export async function getProfile(): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(patch: Partial<Profile>): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Non connecté');
  const { error } = await supabase.from('profiles').update(patch).eq('user_id', auth.user.id);
  if (error) throw error;
}

/** Objectif nutritionnel actif (end_date null), le plus récent. */
export async function getActiveNutritionGoal(): Promise<NutritionGoal | null> {
  const { data, error } = await supabase
    .from('nutrition_goals')
    .select('*')
    .is('end_date', null)
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Définit un nouvel objectif nutritionnel SANS écraser l'historique :
 * clôt l'objectif actif (end_date = aujourd'hui) puis en crée un nouveau.
 */
export async function setNutritionGoal(
  goal: Pick<NutritionGoal, 'calories' | 'protein_g' | 'carbs_g' | 'fat_g'> &
    Partial<Pick<NutritionGoal, 'fiber_g' | 'sugar_g' | 'salt_g'>>,
): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Non connecté');

  const { error: closeError } = await supabase
    .from('nutrition_goals')
    .update({ end_date: new Date().toISOString().slice(0, 10) })
    .eq('user_id', auth.user.id)
    .is('end_date', null);
  if (closeError) throw closeError;

  const { error } = await supabase
    .from('nutrition_goals')
    .insert({ ...goal, user_id: auth.user.id });
  if (error) throw error;
}
