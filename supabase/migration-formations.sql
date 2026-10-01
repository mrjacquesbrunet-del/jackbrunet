-- ============================================================
-- ÉCOLE BIBLIQUE — progression des formations.
-- À exécuter dans Supabase → SQL Editor → Run. Idempotent.
--
-- Chaque ligne = une leçon validée (quiz réussi) par un membre.
-- La progression est en base : retrouvée sur tous les appareils,
-- et visible côté admin (inscrits, taux de complétion).
-- ============================================================
create table if not exists public.formation_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  formation_id text not null,
  lesson int not null check (lesson between 1 and 60),
  score int not null default 0,
  created_at timestamptz not null default now(),
  primary key (user_id, formation_id, lesson)
);

alter table public.formation_progress enable row level security;
drop policy if exists "formation_select_own" on public.formation_progress;
create policy "formation_select_own" on public.formation_progress
  for select using (auth.uid() = user_id);
drop policy if exists "formation_insert_own" on public.formation_progress;
create policy "formation_insert_own" on public.formation_progress
  for insert with check (auth.uid() = user_id);
drop policy if exists "formation_update_own" on public.formation_progress;
create policy "formation_update_own" on public.formation_progress
  for update using (auth.uid() = user_id);
