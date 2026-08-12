-- ============================================================================
-- APPLICATION FITNESS — MIGRATION 001 : SCHÉMA INITIAL (V1 / MVP)
--
-- IMPORTANT : à exécuter dans un NOUVEAU projet Supabase dédié à l'app
-- fitness (ne pas exécuter sur le projet du site ministériel).
--
-- Démarche : Supabase → SQL Editor → New query → coller tout → Run.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Utilitaire : mise à jour automatique de updated_at
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 1. PROFIL UTILISATEUR
-- ============================================================================
create table public.profiles (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  first_name           text,
  last_name            text,
  date_of_birth        date,
  sex                  text check (sex in ('homme', 'femme', 'autre')),
  height_cm            numeric(5,1),
  starting_weight_kg   numeric(5,2),
  target_weight_kg     numeric(5,2),
  activity_level       text not null default 'modere'
                       check (activity_level in ('sedentaire', 'leger', 'modere', 'actif', 'tres_actif')),
  main_goal            text check (main_goal in ('perte_de_poids', 'prise_de_muscle',
                       'recomposition', 'condition_physique', 'maintien')),
  daily_step_goal      integer not null default 10000,
  daily_water_goal_ml  integer not null default 3000,
  program_start_date   date,
  onboarding_completed boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, first_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'first_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 2. OBJECTIFS NUTRITIONNELS (avec historique : on ne remplace jamais, on clôt)
-- ============================================================================
create table public.nutrition_goals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  start_date date not null default current_date,
  end_date   date,           -- null = objectif actif
  calories   integer not null,
  protein_g  numeric(6,1) not null,
  carbs_g    numeric(6,1) not null,
  fat_g      numeric(6,1) not null,
  fiber_g    numeric(6,1),
  sugar_g    numeric(6,1),
  salt_g     numeric(6,2),
  created_at timestamptz not null default now()
);

create index idx_nutrition_goals_user_date on public.nutrition_goals (user_id, start_date desc);

-- ============================================================================
-- 3. ALIMENTS (bibliothèque : user_id null = aliment de base fourni par l'app)
-- ============================================================================
create table public.foods (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade, -- null = global
  name         text not null,
  brand        text,
  serving_size numeric(7,1) not null default 100,
  serving_unit text not null default 'g'
               check (serving_unit in ('g', 'ml', 'unite', 'tranche', 'cuillere', 'portion', 'tasse')),
  calories     numeric(7,1) not null,
  protein_g    numeric(6,1) not null default 0,
  carbs_g      numeric(6,1) not null default 0,
  fat_g        numeric(6,1) not null default 0,
  fiber_g      numeric(6,1),
  sugar_g      numeric(6,1),
  salt_g       numeric(6,2),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_foods_user on public.foods (user_id);
create index idx_foods_name on public.foods using gin (to_tsvector('french', name));

create trigger trg_foods_updated_at
  before update on public.foods
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. RECETTES + INGRÉDIENTS
-- ============================================================================
create table public.recipes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  description    text,
  category       text,
  image_path     text,          -- chemin dans le bucket privé "media"
  prep_time_min  integer,
  cook_time_min  integer,
  servings       integer not null default 1 check (servings > 0),
  instructions   text,
  -- Totaux dénormalisés (recalculés par l'app à chaque modification d'ingrédient)
  total_calories numeric(8,1),
  total_protein_g numeric(7,1),
  total_carbs_g  numeric(7,1),
  total_fat_g    numeric(7,1),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_recipes_user on public.recipes (user_id);

create trigger trg_recipes_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

create table public.recipe_ingredients (
  id        uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  food_id   uuid not null references public.foods(id) on delete restrict,
  quantity  numeric(7,1) not null check (quantity > 0),
  unit      text not null default 'g',
  position  integer not null default 0
);

create index idx_recipe_ingredients_recipe on public.recipe_ingredients (recipe_id);
create index idx_recipe_ingredients_food on public.recipe_ingredients (food_id);

-- ============================================================================
-- 5. JOURNAL ALIMENTAIRE (repas planifiés / consommés)
-- ============================================================================
create table public.meal_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  entry_date  date not null default current_date,
  meal_slot   text not null default 'dejeuner',  -- petit_dejeuner, dejeuner, collation, diner, ou libre
  meal_order  integer not null default 0,
  food_id     uuid references public.foods(id) on delete set null,
  recipe_id   uuid references public.recipes(id) on delete set null,
  custom_name text,
  quantity    numeric(7,1) not null default 1 check (quantity > 0),
  unit        text,
  -- Instantané nutritionnel (fige les valeurs même si l'aliment est modifié ensuite)
  calories    numeric(7,1) not null default 0,
  protein_g   numeric(6,1) not null default 0,
  carbs_g     numeric(6,1) not null default 0,
  fat_g       numeric(6,1) not null default 0,
  status      text not null default 'planned' check (status in ('planned', 'consumed')),
  consumed_at timestamptz,
  created_at  timestamptz not null default now(),
  constraint meal_entry_has_source
    check (food_id is not null or recipe_id is not null or custom_name is not null)
);

create index idx_meal_entries_user_date on public.meal_entries (user_id, entry_date desc);

-- ============================================================================
-- 6. EAU / PAS / POIDS / MENSURATIONS / PHOTOS
-- ============================================================================
create table public.water_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  amount_ml  integer not null check (amount_ml <> 0), -- négatif autorisé pour corriger
  logged_at  timestamptz not null default now()
);

create index idx_water_entries_user_date on public.water_entries (user_id, entry_date desc);

create table public.step_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  steps      integer not null check (steps >= 0),
  distance_m integer,
  source     text not null default 'manuel' check (source in ('manuel', 'healthkit', 'health_connect', 'montre')),
  created_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index idx_step_entries_user_date on public.step_entries (user_id, entry_date desc);

create table public.weight_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  weight_kg  numeric(5,2) not null check (weight_kg > 0),
  notes      text,
  created_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index idx_weight_entries_user_date on public.weight_entries (user_id, entry_date desc);

create table public.measurement_entries (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  entry_date     date not null default current_date,
  waist_cm       numeric(5,1),
  chest_cm       numeric(5,1),
  hips_cm        numeric(5,1),
  left_arm_cm    numeric(5,1),
  right_arm_cm   numeric(5,1),
  left_thigh_cm  numeric(5,1),
  right_thigh_cm numeric(5,1),
  left_calf_cm   numeric(5,1),
  right_calf_cm  numeric(5,1),
  neck_cm        numeric(5,1),
  custom         jsonb not null default '{}'::jsonb, -- mesures personnalisées { "nom": valeur_cm }
  notes          text,
  created_at     timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index idx_measurement_entries_user_date on public.measurement_entries (user_id, entry_date desc);

create table public.progress_photos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  taken_on   date not null default current_date,
  photo_type text not null default 'face' check (photo_type in ('face', 'profil', 'dos', 'autre')),
  image_path text not null,      -- chemin dans le bucket privé "progress-photos"
  weight_kg  numeric(5,2),
  notes      text,
  created_at timestamptz not null default now()
);

create index idx_progress_photos_user_date on public.progress_photos (user_id, taken_on desc);

-- ============================================================================
-- 7. SPORT : EXERCICES / SÉANCES / PROGRAMMES / SESSIONS / SÉRIES
-- ============================================================================
create table public.exercises (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade, -- null = global
  name          text not null,
  muscle_group  text,
  exercise_type text not null default 'musculation'
                check (exercise_type in ('musculation', 'cardio', 'mobilite', 'marche',
                'etirement', 'sport', 'autre')),
  description   text,
  instructions  text,
  image_path    text,
  video_url     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_exercises_user on public.exercises (user_id);

create trigger trg_exercises_updated_at
  before update on public.exercises
  for each row execute function public.set_updated_at();

create table public.workouts (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  name                   text not null,
  description            text,
  estimated_duration_min integer,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index idx_workouts_user on public.workouts (user_id);

create trigger trg_workouts_updated_at
  before update on public.workouts
  for each row execute function public.set_updated_at();

create table public.workout_exercises (
  id                  uuid primary key default gen_random_uuid(),
  workout_id          uuid not null references public.workouts(id) on delete cascade,
  exercise_id         uuid not null references public.exercises(id) on delete cascade,
  position            integer not null default 0,
  target_sets         integer not null default 3,
  target_reps         integer,
  target_weight_kg    numeric(6,2),
  target_duration_sec integer,
  target_distance_m   integer,
  rest_sec            integer not null default 90,
  notes               text
);

create index idx_workout_exercises_workout on public.workout_exercises (workout_id);

create table public.workout_programs (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  name              text not null,
  description       text,
  start_date        date,
  weeks             integer,
  sessions_per_week integer,
  goal              text,
  level             text check (level in ('debutant', 'intermediaire', 'avance')),
  is_active         boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_workout_programs_user on public.workout_programs (user_id);

create trigger trg_workout_programs_updated_at
  before update on public.workout_programs
  for each row execute function public.set_updated_at();

create table public.program_days (
  id          uuid primary key default gen_random_uuid(),
  program_id  uuid not null references public.workout_programs(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0 = lundi … 6 = dimanche
  day_type    text not null default 'entrainement'
              check (day_type in ('entrainement', 'cardio', 'marche', 'recuperation', 'repos')),
  workout_id  uuid references public.workouts(id) on delete set null,
  label       text
);

create index idx_program_days_program on public.program_days (program_id);

create table public.workout_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  workout_id   uuid references public.workouts(id) on delete set null,
  program_id   uuid references public.workout_programs(id) on delete set null,
  planned_date date not null default current_date,
  started_at   timestamptz,
  completed_at timestamptz,
  status       text not null default 'planned'
               check (status in ('planned', 'started', 'completed', 'skipped')),
  duration_min integer,
  notes        text,
  created_at   timestamptz not null default now()
);

create index idx_workout_sessions_user_date on public.workout_sessions (user_id, planned_date desc);

create table public.workout_sets (
  id                 uuid primary key default gen_random_uuid(),
  session_id         uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id        uuid not null references public.exercises(id) on delete cascade,
  set_number         integer not null default 1,
  target_reps        integer,
  actual_reps        integer,
  target_weight_kg   numeric(6,2),
  actual_weight_kg   numeric(6,2),
  duration_sec       integer,
  distance_m         integer,
  rest_sec           integer,
  completed          boolean not null default false,
  completed_at       timestamptz
);

create index idx_workout_sets_session on public.workout_sets (session_id);
create index idx_workout_sets_exercise on public.workout_sets (exercise_id);

-- ============================================================================
-- 8. OBJECTIFS / CHECK-IN HEBDO / JOURNÉE / FAVORIS / NOTIFICATIONS
-- ============================================================================
create table public.goals (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  metric       text not null default 'autre'
               check (metric in ('poids', 'pas', 'eau', 'calories', 'proteines',
               'seances', 'mensuration', 'autre')),
  start_value  numeric(8,2),
  target_value numeric(8,2),
  unit         text,
  target_date  date,
  achieved_at  timestamptz,
  position     integer not null default 0,
  created_at   timestamptz not null default now()
);

create index idx_goals_user on public.goals (user_id);

create table public.weekly_checkins (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  week_start date not null, -- lundi de la semaine
  weight_kg  numeric(5,2),
  waist_cm   numeric(5,1),
  energy     smallint check (energy between 1 and 5),
  hunger     smallint check (hunger between 1 and 5),
  sleep      smallint check (sleep between 1 and 5),
  motivation smallint check (motivation between 1 and 5),
  notes      text,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index idx_weekly_checkins_user on public.weekly_checkins (user_id, week_start desc);

create table public.daily_logs (
  user_id          uuid not null references auth.users(id) on delete cascade,
  log_date         date not null,
  day_completed_at timestamptz,
  notes            text,
  primary key (user_id, log_date)
);

create table public.favorites (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('food', 'recipe', 'workout', 'exercise')),
  item_id   uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

create index idx_favorites_user on public.favorites (user_id);

create table public.notification_prefs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null,   -- ex : rappel_petit_dejeuner, rappel_pas, rappel_seance, rappel_proteines
  label       text,
  time_of_day time not null,
  enabled     boolean not null default true,
  unique (user_id, kind)
);

-- ============================================================================
-- 9. ROW LEVEL SECURITY — chaque utilisateur ne voit que SES données
-- ============================================================================
alter table public.profiles            enable row level security;
alter table public.nutrition_goals     enable row level security;
alter table public.foods               enable row level security;
alter table public.recipes             enable row level security;
alter table public.recipe_ingredients  enable row level security;
alter table public.meal_entries        enable row level security;
alter table public.water_entries       enable row level security;
alter table public.step_entries        enable row level security;
alter table public.weight_entries      enable row level security;
alter table public.measurement_entries enable row level security;
alter table public.progress_photos     enable row level security;
alter table public.exercises           enable row level security;
alter table public.workouts            enable row level security;
alter table public.workout_exercises   enable row level security;
alter table public.workout_programs    enable row level security;
alter table public.program_days        enable row level security;
alter table public.workout_sessions    enable row level security;
alter table public.workout_sets        enable row level security;
alter table public.goals               enable row level security;
alter table public.weekly_checkins     enable row level security;
alter table public.daily_logs          enable row level security;
alter table public.favorites           enable row level security;
alter table public.notification_prefs  enable row level security;

-- Profil
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id);

-- Tables simples appartenant à l'utilisateur (modèle identique)
do $$
declare
  t text;
begin
  foreach t in array array[
    'nutrition_goals', 'recipes', 'meal_entries', 'water_entries', 'step_entries',
    'weight_entries', 'measurement_entries', 'progress_photos', 'workouts',
    'workout_programs', 'workout_sessions', 'goals', 'weekly_checkins',
    'daily_logs', 'favorites', 'notification_prefs'
  ]
  loop
    execute format(
      'create policy "%1$s_select_own" on public.%1$s for select using (auth.uid() = user_id);', t);
    execute format(
      'create policy "%1$s_insert_own" on public.%1$s for insert with check (auth.uid() = user_id);', t);
    execute format(
      'create policy "%1$s_update_own" on public.%1$s for update using (auth.uid() = user_id) with check (auth.uid() = user_id);', t);
    execute format(
      'create policy "%1$s_delete_own" on public.%1$s for delete using (auth.uid() = user_id);', t);
  end loop;
end;
$$;

-- Aliments et exercices : les siens + la base globale (user_id null) en lecture
create policy "foods_select_own_or_global" on public.foods
  for select using (user_id is null or auth.uid() = user_id);
create policy "foods_insert_own" on public.foods
  for insert with check (auth.uid() = user_id);
create policy "foods_update_own" on public.foods
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "foods_delete_own" on public.foods
  for delete using (auth.uid() = user_id);

create policy "exercises_select_own_or_global" on public.exercises
  for select using (user_id is null or auth.uid() = user_id);
create policy "exercises_insert_own" on public.exercises
  for insert with check (auth.uid() = user_id);
create policy "exercises_update_own" on public.exercises
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "exercises_delete_own" on public.exercises
  for delete using (auth.uid() = user_id);

-- Tables enfants : accès via le parent
create policy "recipe_ingredients_all_own" on public.recipe_ingredients
  for all using (
    exists (select 1 from public.recipes r
            where r.id = recipe_id and r.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.recipes r
            where r.id = recipe_id and r.user_id = auth.uid())
  );

create policy "workout_exercises_all_own" on public.workout_exercises
  for all using (
    exists (select 1 from public.workouts w
            where w.id = workout_id and w.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.workouts w
            where w.id = workout_id and w.user_id = auth.uid())
  );

create policy "program_days_all_own" on public.program_days
  for all using (
    exists (select 1 from public.workout_programs p
            where p.id = program_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.workout_programs p
            where p.id = program_id and p.user_id = auth.uid())
  );

create policy "workout_sets_all_own" on public.workout_sets
  for all using (
    exists (select 1 from public.workout_sessions s
            where s.id = session_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.workout_sessions s
            where s.id = session_id and s.user_id = auth.uid())
  );

-- ============================================================================
-- 10. STOCKAGE — buckets PRIVÉS (jamais publics), accès par dossier user_id
--     Chemin attendu : <user_id>/<fichier>
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

create policy "storage_select_own" on storage.objects
  for select using (
    bucket_id in ('progress-photos', 'media')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "storage_insert_own" on storage.objects
  for insert with check (
    bucket_id in ('progress-photos', 'media')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "storage_update_own" on storage.objects
  for update using (
    bucket_id in ('progress-photos', 'media')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "storage_delete_own" on storage.objects
  for delete using (
    bucket_id in ('progress-photos', 'media')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- 11. DONNÉES DE BASE — quelques aliments et exercices globaux pour démarrer
-- ============================================================================
insert into public.foods (name, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g) values
  ('Blanc de poulet',        100, 'g',      165, 31.0, 0.0,  3.6, 0.0),
  ('Riz blanc cuit',         100, 'g',      130, 2.7,  28.0, 0.3, 0.4),
  ('Riz basmati cru',        100, 'g',      350, 7.5,  77.0, 0.9, 1.3),
  ('Saumon',                 100, 'g',      208, 20.0, 0.0,  13.0, 0.0),
  ('Oeuf entier',            1,   'unite',  72,  6.3,  0.4,  4.8, 0.0),
  ('Blanc d''oeuf',          1,   'unite',  17,  3.6,  0.2,  0.1, 0.0),
  ('Yaourt grec 0%',         100, 'g',      57,  10.0, 4.0,  0.2, 0.0),
  ('Fromage blanc 0%',       100, 'g',      47,  8.0,  4.0,  0.2, 0.0),
  ('Flocons d''avoine',      100, 'g',      370, 13.5, 60.0, 7.0, 10.0),
  ('Pomme de terre cuite',   100, 'g',      87,  1.9,  20.0, 0.1, 1.8),
  ('Patate douce cuite',     100, 'g',      90,  2.0,  21.0, 0.2, 3.3),
  ('Brocoli',                100, 'g',      34,  2.8,  7.0,  0.4, 2.6),
  ('Courgette',              100, 'g',      17,  1.2,  3.1,  0.3, 1.0),
  ('Banane',                 1,   'unite',  105, 1.3,  27.0, 0.4, 3.1),
  ('Pomme',                  1,   'unite',  95,  0.5,  25.0, 0.3, 4.4),
  ('Amandes',                100, 'g',      579, 21.0, 22.0, 50.0, 12.5),
  ('Huile d''olive',         1,   'cuillere', 119, 0.0, 0.0, 13.5, 0.0),
  ('Whey protéine (dose)',   1,   'portion', 120, 24.0, 3.0, 1.5, 0.0),
  ('Boeuf 5% MG',            100, 'g',      137, 21.0, 0.0,  5.0, 0.0),
  ('Thon au naturel',        100, 'g',      116, 26.0, 0.0,  1.0, 0.0);

insert into public.exercises (name, muscle_group, exercise_type, description) values
  ('Développé couché',        'Pectoraux',    'musculation', 'Barre ou haltères, sur banc plat.'),
  ('Développé incliné',       'Pectoraux',    'musculation', 'Banc incliné 30-45°.'),
  ('Écarté haltères',         'Pectoraux',    'musculation', 'Sur banc plat, mouvement en arc de cercle.'),
  ('Tractions',               'Dos',          'musculation', 'Prise pronation, largeur épaules ou plus.'),
  ('Rowing barre',            'Dos',          'musculation', 'Buste penché, tirage vers le nombril.'),
  ('Tirage vertical',         'Dos',          'musculation', 'Poulie haute, prise large.'),
  ('Squat',                   'Jambes',       'musculation', 'Barre sur les trapèzes, descente contrôlée.'),
  ('Presse à cuisses',        'Jambes',       'musculation', 'Pieds largeur épaules sur le plateau.'),
  ('Fentes marchées',         'Jambes',       'musculation', 'Avec ou sans haltères.'),
  ('Soulevé de terre roumain','Ischio-jambiers', 'musculation', 'Jambes semi-tendues, dos droit.'),
  ('Développé militaire',     'Épaules',      'musculation', 'Debout ou assis, barre ou haltères.'),
  ('Élévations latérales',    'Épaules',      'musculation', 'Haltères légers, coudes souples.'),
  ('Curl biceps',             'Biceps',       'musculation', 'Barre ou haltères, coudes fixes.'),
  ('Extension triceps poulie','Triceps',      'musculation', 'Poulie haute, coudes collés au corps.'),
  ('Dips',                    'Triceps',      'musculation', 'Aux barres parallèles ou sur banc.'),
  ('Gainage planche',         'Abdominaux',   'musculation', 'Maintien en position de planche.'),
  ('Crunch',                  'Abdominaux',   'musculation', 'Enroulement du buste, lombaires au sol.'),
  ('Marche rapide',           'Cardio',       'marche',      'Marche soutenue en extérieur ou tapis.'),
  ('Vélo',                    'Cardio',       'cardio',      'Vélo d''appartement ou extérieur.'),
  ('Rameur',                  'Cardio',       'cardio',      'Cardio complet, faible impact.');

-- ============================================================================
-- FIN DE LA MIGRATION 001
-- ============================================================================
