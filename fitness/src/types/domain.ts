/**
 * Types du domaine — reflètent le schéma PostgreSQL
 * (supabase/migrations/001_init_fitness.sql).
 */

export type Sex = 'homme' | 'femme' | 'autre';
export type ActivityLevel = 'sedentaire' | 'leger' | 'modere' | 'actif' | 'tres_actif';
export type MainGoal =
  | 'perte_de_poids'
  | 'prise_de_muscle'
  | 'recomposition'
  | 'condition_physique'
  | 'maintien';

export type MeasurementUnit = 'cm' | 'in';

export interface Profile {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  sex: Sex | null;
  height_cm: number | null;
  starting_weight_kg: number | null;
  target_weight_kg: number | null;
  activity_level: ActivityLevel;
  main_goal: MainGoal | null;
  daily_step_goal: number;
  daily_water_goal_ml: number;
  program_start_date: string | null;
  onboarding_completed: boolean;
  measurement_unit: MeasurementUnit;
  photo_biometric_lock: boolean;
  checkin_snoozed_until: string | null;
}

export interface NutritionGoal {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
  sugar_g: number | null;
  salt_g: number | null;
}

export type ServingUnit =
  | 'g'
  | 'ml'
  | 'unite'
  | 'tranche'
  | 'cuillere'
  | 'portion'
  | 'tasse';

export interface Food {
  id: string;
  user_id: string | null; // null = aliment de la base globale
  name: string;
  brand: string | null;
  serving_size: number;
  serving_unit: ServingUnit;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
  sugar_g: number | null;
  salt_g: number | null;
}

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string | null;
  image_path: string | null;
  prep_time_min: number | null;
  cook_time_min: number | null;
  servings: number;
  instructions: string | null;
  total_calories: number | null;
  total_protein_g: number | null;
  total_carbs_g: number | null;
  total_fat_g: number | null;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  food_id: string;
  quantity: number;
  unit: string;
  position: number;
  food?: Food; // jointure
}

export type MealStatus = 'planned' | 'consumed';
export type MealSlot = 'petit_dejeuner' | 'dejeuner' | 'collation' | 'diner' | string;

export interface MealEntry {
  id: string;
  user_id: string;
  entry_date: string;
  meal_slot: MealSlot;
  meal_order: number;
  food_id: string | null;
  recipe_id: string | null;
  custom_name: string | null;
  quantity: number;
  unit: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  status: MealStatus;
  consumed_at: string | null;
  food?: Food;
  recipe?: Recipe;
}

export interface WaterEntry {
  id: string;
  user_id: string;
  entry_date: string;
  amount_ml: number;
  logged_at: string;
}

export interface StepEntry {
  id: string;
  user_id: string;
  entry_date: string;
  steps: number;
  distance_m: number | null;
  source: 'manuel' | 'healthkit' | 'health_connect' | 'montre';
}

export interface WeightEntry {
  id: string;
  user_id: string;
  entry_date: string;
  weight_kg: number;
  notes: string | null;
}

export type CheckinType = 'initial' | 'monthly' | 'manual';

export interface BodyCheckin {
  id: string;
  user_id: string;
  checkin_date: string;
  checkin_type: CheckinType;
  weight_kg: number | null;
  energy: number | null;
  motivation: number | null;
  notes: string | null;
}

export type MeasurementType =
  | 'neck'
  | 'shoulders'
  | 'chest'
  | 'waist'   // tour de taille (au plus étroit)
  | 'abdomen' // tour de ventre (au nombril) — distinct de la taille
  | 'hips'
  | 'biceps'
  | 'forearm'
  | 'thigh'
  | 'calf'
  | 'custom';

export type MeasurementSide = 'left' | 'right' | 'center';
export type MeasurementState = 'relaxed' | 'flexed' | 'not_applicable';

export interface BodyMeasurement {
  id: string;
  user_id: string;
  checkin_id: string | null; // null = mesure ponctuelle hors bilan
  measured_on: string;
  measurement_type: MeasurementType;
  custom_label: string | null;
  side: MeasurementSide;
  measurement_state: MeasurementState;
  value_cm: number; // toujours stocké en cm (conversion à l'affichage)
}

export type PhotoType = 'face' | 'profil' | 'dos' | 'autre';

export interface ProgressPhoto {
  id: string;
  user_id: string;
  taken_on: string;
  photo_type: PhotoType;
  image_path: string;
  weight_kg: number | null;
  notes: string | null;
  checkin_id: string | null; // photo rattachée à un bilan corporel
}

export type ExerciseType =
  | 'musculation'
  | 'cardio'
  | 'mobilite'
  | 'marche'
  | 'etirement'
  | 'sport'
  | 'autre';

export interface Exercise {
  id: string;
  user_id: string | null; // null = exercice de la base globale
  name: string;
  muscle_group: string | null;
  exercise_type: ExerciseType;
  description: string | null;
  instructions: string | null;
  image_path: string | null;
  video_url: string | null;
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  estimated_duration_min: number | null;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  position: number;
  target_sets: number;
  target_reps: number | null;
  target_weight_kg: number | null;
  target_duration_sec: number | null;
  target_distance_m: number | null;
  rest_sec: number;
  notes: string | null;
  exercise?: Exercise;
}

export interface WorkoutProgram {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  weeks: number | null;
  sessions_per_week: number | null;
  goal: string | null;
  level: 'debutant' | 'intermediaire' | 'avance' | null;
  is_active: boolean;
}

export type ProgramDayType = 'entrainement' | 'cardio' | 'marche' | 'recuperation' | 'repos';

export interface ProgramDay {
  id: string;
  program_id: string;
  day_of_week: number; // 0 = lundi … 6 = dimanche
  day_type: ProgramDayType;
  workout_id: string | null;
  label: string | null;
  workout?: Workout;
}

export type SessionStatus = 'planned' | 'started' | 'completed' | 'skipped';

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_id: string | null;
  program_id: string | null;
  planned_date: string;
  started_at: string | null;
  completed_at: string | null;
  status: SessionStatus;
  duration_min: number | null;
  notes: string | null;
  workout?: Workout;
}

export interface WorkoutSet {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  target_reps: number | null;
  actual_reps: number | null;
  target_weight_kg: number | null;
  actual_weight_kg: number | null;
  duration_sec: number | null;
  distance_m: number | null;
  rest_sec: number | null;
  completed: boolean;
}

export type GoalMetric =
  | 'poids'
  | 'pas'
  | 'eau'
  | 'calories'
  | 'proteines'
  | 'seances'
  | 'mensuration'
  | 'autre';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  metric: GoalMetric;
  start_value: number | null;
  target_value: number | null;
  unit: string | null;
  target_date: string | null;
  achieved_at: string | null;
  position: number;
}

export interface WeeklyCheckin {
  id: string;
  user_id: string;
  week_start: string;
  weight_kg: number | null;
  waist_cm: number | null;
  energy: number | null;
  hunger: number | null;
  sleep: number | null;
  motivation: number | null;
  notes: string | null;
}
