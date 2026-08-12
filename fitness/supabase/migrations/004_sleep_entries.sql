-- ============================================================================
-- APPLICATION FITNESS — MIGRATION 004 : SUIVI SOMMEIL SIMPLE
--
-- À exécuter APRÈS les migrations 001 à 003, sur le projet Supabase dédié.
-- Démarche : Supabase → SQL Editor → New query → coller tout → Run.
--
-- Suivi volontairement simple : heure de coucher, heure de lever,
-- qualité ressentie (1-5). La durée est calculée par l'application.
-- entry_date = la date du RÉVEIL (la nuit du 11 au 12 = entrée du 12).
-- ============================================================================

create table public.sleep_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date, -- date du réveil
  bed_time   time not null, -- heure de coucher (le passage de minuit est géré par l'app)
  wake_time  time not null, -- heure de lever
  quality    smallint check (quality between 1 and 5),
  notes      text,
  created_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index idx_sleep_entries_user_date on public.sleep_entries (user_id, entry_date desc);

alter table public.sleep_entries enable row level security;

create policy "sleep_entries_select_own" on public.sleep_entries
  for select using (auth.uid() = user_id);
create policy "sleep_entries_insert_own" on public.sleep_entries
  for insert with check (auth.uid() = user_id);
create policy "sleep_entries_update_own" on public.sleep_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sleep_entries_delete_own" on public.sleep_entries
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- FIN DE LA MIGRATION 004
-- ============================================================================
