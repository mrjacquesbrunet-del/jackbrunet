-- ============================================================
-- Notes (étoiles) + enregistrements des plans de lecture
-- À exécuter dans Supabase → SQL Editor.
-- ============================================================

-- 1) NOTES : une note (1 à 5 étoiles) par personne et par plan
create table if not exists public.plan_ratings (
  user_id   uuid not null references auth.users(id) on delete cascade,
  plan_slug text not null,
  stars     smallint not null check (stars between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (user_id, plan_slug)
);
alter table public.plan_ratings enable row level security;

drop policy if exists plan_ratings_own_select on public.plan_ratings;
create policy plan_ratings_own_select on public.plan_ratings
  for select using (auth.uid() = user_id);

drop policy if exists plan_ratings_own_insert on public.plan_ratings;
create policy plan_ratings_own_insert on public.plan_ratings
  for insert with check (auth.uid() = user_id);

drop policy if exists plan_ratings_own_update on public.plan_ratings;
create policy plan_ratings_own_update on public.plan_ratings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Moyenne + nombre d'avis par plan (public, sans exposer qui a noté)
create or replace function public.plan_ratings_summary()
returns table(plan_slug text, avg numeric, cnt bigint)
language sql security definer set search_path = public as $$
  select plan_slug, round(avg(stars)::numeric, 1) as avg, count(*)::bigint as cnt
    from public.plan_ratings
   group by plan_slug;
$$;
grant execute on function public.plan_ratings_summary() to anon, authenticated;

-- 2) ENREGISTREMENTS : plans mis de côté par la personne
create table if not exists public.plan_saves (
  user_id    uuid not null references auth.users(id) on delete cascade,
  plan_slug  text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, plan_slug)
);
alter table public.plan_saves enable row level security;

drop policy if exists plan_saves_own on public.plan_saves;
create policy plan_saves_own on public.plan_saves
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
