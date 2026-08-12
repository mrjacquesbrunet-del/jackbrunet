import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { todayISO } from '@/src/lib/dates';
import { calculateDailyMacros } from '@/src/logic/nutrition';
import { dayCompletion, progressRatio } from '@/src/logic/progress';
import { listMealEntries } from '@/src/services/nutrition';
import { getActiveNutritionGoal, getProfile } from '@/src/services/profile';
import { getSessionForDate } from '@/src/services/sport';
import { addWater, getSteps, listWater, listWeights, undoLastWater } from '@/src/services/tracking';

/**
 * Agrège toutes les données de la journée pour l'écran « Aujourd'hui ».
 */
export function useToday() {
  const date = todayISO();

  const profile = useQuery({ queryKey: ['profile'], queryFn: getProfile });
  const goal = useQuery({ queryKey: ['nutrition-goal'], queryFn: getActiveNutritionGoal });
  const meals = useQuery({ queryKey: ['meals', date], queryFn: () => listMealEntries(date) });
  const water = useQuery({ queryKey: ['water', date], queryFn: () => listWater(date) });
  const steps = useQuery({ queryKey: ['steps', date], queryFn: () => getSteps(date) });
  const weights = useQuery({ queryKey: ['weights'], queryFn: () => listWeights(30) });
  const session = useQuery({ queryKey: ['session', date], queryFn: () => getSessionForDate(date) });

  const consumed = calculateDailyMacros(meals.data ?? [], 'consumed');
  const waterMl = (water.data ?? []).reduce((sum, e) => sum + e.amount_ml, 0);
  const stepCount = steps.data?.steps ?? 0;

  const stepGoal = profile.data?.daily_step_goal ?? 10000;
  const waterGoal = profile.data?.daily_water_goal_ml ?? 3000;
  const calorieGoal = goal.data?.calories ?? 0;

  const trainingRatio =
    session.data == null
      ? null // pas de séance prévue : jour de repos, ne pénalise pas le score
      : session.data.status === 'completed'
        ? 1
        : 0;

  const completion = dayCompletion(
    [
      calorieGoal > 0 ? progressRatio(consumed.calories, calorieGoal) : null,
      progressRatio(stepCount, stepGoal),
      progressRatio(waterMl, waterGoal),
      trainingRatio,
    ].filter((r): r is number => r !== null),
  );

  return {
    date,
    profile: profile.data ?? null,
    goal: goal.data ?? null,
    meals: meals.data ?? [],
    consumed,
    waterMl,
    waterGoal,
    stepCount,
    stepGoal,
    latestWeight: weights.data?.[0] ?? null,
    session: session.data ?? null,
    completion,
    isLoading: profile.isLoading || goal.isLoading || meals.isLoading,
  };
}

/** Mutations rapides du tracker d'eau (+250 ml, +500 ml, annuler). */
export function useWaterActions() {
  const date = todayISO();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['water', date] });

  const add = useMutation({
    mutationFn: (amountMl: number) => addWater(date, amountMl),
    onSuccess: invalidate,
  });
  const undo = useMutation({
    mutationFn: () => undoLastWater(date),
    onSuccess: invalidate,
  });

  return { add, undo };
}
