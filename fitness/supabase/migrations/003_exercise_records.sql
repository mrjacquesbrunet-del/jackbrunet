-- ============================================================================
-- APPLICATION FITNESS — MIGRATION 003 : RECORDS PERSONNELS PAR EXERCICE
--
-- À exécuter APRÈS les migrations 001 et 002, sur le projet Supabase dédié.
-- Démarche : Supabase → SQL Editor → New query → coller tout → Run.
--
-- Un record par exercice et par utilisateur, saisi manuellement :
-- il reste enregistré tel quel jusqu'à ce que l'utilisateur le modifie.
-- (Les records calculés depuis l'historique des séries existent en plus,
-- côté application — ce registre-ci est la référence affichée.)
-- ============================================================================

create table public.exercise_records (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  exercise_id      uuid not null references public.exercises(id) on delete cascade,
  record_weight_kg numeric(6,2) not null check (record_weight_kg > 0),
  record_reps      integer check (record_reps > 0), -- facultatif : « 90 kg × 5 »
  achieved_on      date not null default current_date,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, exercise_id) -- un seul record courant par exercice
);

create index idx_exercise_records_user on public.exercise_records (user_id);

create trigger trg_exercise_records_updated_at
  before update on public.exercise_records
  for each row execute function public.set_updated_at();

alter table public.exercise_records enable row level security;

create policy "exercise_records_select_own" on public.exercise_records
  for select using (auth.uid() = user_id);
create policy "exercise_records_insert_own" on public.exercise_records
  for insert with check (auth.uid() = user_id);
create policy "exercise_records_update_own" on public.exercise_records
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "exercise_records_delete_own" on public.exercise_records
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- FIN DE LA MIGRATION 003
-- ============================================================================
