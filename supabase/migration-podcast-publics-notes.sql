-- ============================================================
--  Podcasts : public visé (Tout public, Enfance, Jeunesse, Famille)
--  et notes en étoiles des émissions (1 à 5, une par membre).
--  À exécuter dans Supabase → SQL Editor. Sûr à relancer.
-- ============================================================

-- 1) Public visé (plusieurs possibles).
alter table public.podcast_shows add column if not exists publics text[] not null default '{}';

-- 2) Notes des émissions.
create table if not exists public.podcast_ratings (
  user_id    uuid not null references auth.users(id) on delete cascade,
  show_id    uuid not null references public.podcast_shows(id) on delete cascade,
  stars      smallint not null check (stars between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (user_id, show_id)
);
alter table public.podcast_ratings enable row level security;

drop policy if exists podcast_ratings_own_select on public.podcast_ratings;
create policy podcast_ratings_own_select on public.podcast_ratings
  for select using (auth.uid() = user_id);
drop policy if exists podcast_ratings_own_insert on public.podcast_ratings;
create policy podcast_ratings_own_insert on public.podcast_ratings
  for insert with check (auth.uid() = user_id);
drop policy if exists podcast_ratings_own_update on public.podcast_ratings;
create policy podcast_ratings_own_update on public.podcast_ratings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists podcast_ratings_own_delete on public.podcast_ratings;
create policy podcast_ratings_own_delete on public.podcast_ratings
  for delete using (auth.uid() = user_id);

-- Moyenne et nombre de notes par émission (lisible par tous, sans les notes individuelles).
create or replace function public.podcast_ratings_summary()
returns table (show_id uuid, avg numeric, cnt bigint)
language sql
stable
security definer
set search_path = public
as $$
  select show_id, round(avg(stars)::numeric, 1) as avg, count(*)::bigint as cnt
  from public.podcast_ratings
  group by show_id;
$$;
grant execute on function public.podcast_ratings_summary() to anon, authenticated;
