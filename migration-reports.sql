-- ============================================================
--  Signalements + blocages (conformité « apps sociales / UGC »).
--  À exécuter dans Supabase → SQL Editor, APRÈS migration-moderators.sql
--  (utilise public.is_moderator()). Sûr à relancer.
-- ============================================================

-- 1) Signalements de contenu
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null,          -- group_post | group_comment | group_message | prayer | prayer_comment | message | profile
  target_id   text not null,
  reason      text not null default 'autre',
  note        text,
  status      text not null default 'open',  -- open | resolved | dismissed
  created_at  timestamptz not null default now()
);
create index if not exists reports_status_idx on public.reports(status, created_at desc);
alter table public.reports enable row level security;

-- Tout membre connecté peut signaler (pour soi).
drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports for insert
  with check (reporter_id = auth.uid());
-- Seuls les modérateurs / l'admin voient et traitent les signalements.
drop policy if exists reports_select on public.reports;
create policy reports_select on public.reports for select using (public.is_moderator());
drop policy if exists reports_update on public.reports;
create policy reports_update on public.reports for update using (public.is_moderator());

-- 2) Blocages entre membres
create table if not exists public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);
alter table public.blocks enable row level security;

-- Chacun gère uniquement SES propres blocages.
drop policy if exists blocks_select on public.blocks;
create policy blocks_select on public.blocks for select using (blocker_id = auth.uid());
drop policy if exists blocks_insert on public.blocks;
create policy blocks_insert on public.blocks for insert with check (blocker_id = auth.uid());
drop policy if exists blocks_delete on public.blocks;
create policy blocks_delete on public.blocks for delete using (blocker_id = auth.uid());
