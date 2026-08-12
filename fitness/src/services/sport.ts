import { supabase } from '@/src/lib/supabase';
import type {
  Exercise,
  ExerciseRecord,
  ProgramDay,
  Workout,
  WorkoutExercise,
  WorkoutProgram,
  WorkoutSession,
  WorkoutSet,
} from '@/src/types/domain';

async function userId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Non connecté');
  return data.user.id;
}

// --- Exercices ---------------------------------------------------------------

export async function listExercises(query = ''): Promise<Exercise[]> {
  let request = supabase.from('exercises').select('*').order('name');
  if (query.trim().length > 0) request = request.ilike('name', `%${query.trim()}%`);
  const { data, error } = await request;
  if (error) throw error;
  return data ?? [];
}

export async function createExercise(
  exercise: Omit<Exercise, 'id' | 'user_id'>,
): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .insert({ ...exercise, user_id: await userId() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Séances (modèles) ---------------------------------------------------------

export async function listWorkouts(): Promise<Workout[]> {
  const { data, error } = await supabase.from('workouts').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]> {
  const { data, error } = await supabase
    .from('workout_exercises')
    .select('*, exercise:exercises(*)')
    .eq('workout_id', workoutId)
    .order('position');
  if (error) throw error;
  return (data ?? []) as WorkoutExercise[];
}

// --- Programme actif et planning -----------------------------------------------

export async function getActiveProgram(): Promise<WorkoutProgram | null> {
  const { data, error } = await supabase
    .from('workout_programs')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProgramDays(programId: string): Promise<ProgramDay[]> {
  const { data, error } = await supabase
    .from('program_days')
    .select('*, workout:workouts(*)')
    .eq('program_id', programId)
    .order('day_of_week');
  if (error) throw error;
  return (data ?? []) as ProgramDay[];
}

// --- Sessions (séances réalisées) ------------------------------------------------

export async function getSessionForDate(date: string): Promise<WorkoutSession | null> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*, workout:workouts(*)')
    .eq('planned_date', date)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as WorkoutSession | null;
}

/**
 * Démarre une séance : crée la session et pré-remplit les séries
 * à partir des objectifs de la séance modèle.
 */
export async function startSession(workoutId: string, date: string): Promise<WorkoutSession> {
  const uid = await userId();
  const { data: session, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: uid,
      workout_id: workoutId,
      planned_date: date,
      status: 'started',
      started_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;

  const template = await getWorkoutExercises(workoutId);
  const sets = template.flatMap((we) =>
    Array.from({ length: we.target_sets }, (_, i) => ({
      session_id: session.id,
      exercise_id: we.exercise_id,
      set_number: i + 1,
      target_reps: we.target_reps,
      target_weight_kg: we.target_weight_kg,
      rest_sec: we.rest_sec,
    })),
  );
  if (sets.length > 0) {
    const { error: setsError } = await supabase.from('workout_sets').insert(sets);
    if (setsError) throw setsError;
  }
  return session;
}

export async function getSessionSets(sessionId: string): Promise<WorkoutSet[]> {
  const { data, error } = await supabase
    .from('workout_sets')
    .select('*')
    .eq('session_id', sessionId)
    .order('set_number');
  if (error) throw error;
  return data ?? [];
}

/** « Série terminée » : enregistre la performance réelle. */
export async function completeSet(
  setId: string,
  actualReps: number,
  actualWeightKg: number | null,
): Promise<void> {
  const { error } = await supabase
    .from('workout_sets')
    .update({
      actual_reps: actualReps,
      actual_weight_kg: actualWeightKg,
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('id', setId);
  if (error) throw error;
}

export async function completeSession(sessionId: string, durationMin: number): Promise<void> {
  const { error } = await supabase
    .from('workout_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      duration_min: durationMin,
    })
    .eq('id', sessionId);
  if (error) throw error;
}

// --- Records personnels (saisis manuellement, conservés jusqu'à modification) ---

export async function listExerciseRecords(): Promise<ExerciseRecord[]> {
  const { data, error } = await supabase
    .from('exercise_records')
    .select('*, exercise:exercises(*)')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ExerciseRecord[];
}

/**
 * Enregistre ou met à jour LE record d'un exercice (un seul record courant
 * par exercice : il reste tel quel jusqu'à la prochaine modification).
 */
export async function upsertExerciseRecord(
  exerciseId: string,
  recordWeightKg: number,
  recordReps?: number | null,
  achievedOn?: string,
): Promise<void> {
  const { error } = await supabase.from('exercise_records').upsert(
    {
      user_id: await userId(),
      exercise_id: exerciseId,
      record_weight_kg: recordWeightKg,
      record_reps: recordReps ?? null,
      achieved_on: achievedOn ?? new Date().toISOString().slice(0, 10),
    },
    { onConflict: 'user_id,exercise_id' },
  );
  if (error) throw error;
}

export async function deleteExerciseRecord(exerciseId: string): Promise<void> {
  const { error } = await supabase
    .from('exercise_records')
    .delete()
    .eq('exercise_id', exerciseId)
    .eq('user_id', await userId());
  if (error) throw error;
}

/** Historique des séries complétées d'un exercice (records, graphiques). */
export async function getExerciseHistory(exerciseId: string, limit = 200): Promise<WorkoutSet[]> {
  const { data, error } = await supabase
    .from('workout_sets')
    .select('*')
    .eq('exercise_id', exerciseId)
    .eq('completed', true)
    .order('completed_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
