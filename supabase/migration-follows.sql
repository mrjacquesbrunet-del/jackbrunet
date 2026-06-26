-- ============================================================
--  MIGRATION : abonnements (follow) + profils personnalisables
--  À coller dans Supabase → SQL Editor → Run.
--  Sûr à relancer (IF NOT EXISTS / OR REPLACE).
--
--  Remplace le modèle « amitié mutuelle » par un modèle
--  « abonnement » façon Instagram : on s'abonne à quelqu'un,
--  et la visibilité « amis » d'une prière = visible par ses abonnés.
-- ============================================================

-- 1) Profils : bio + versets préférés ------------------------
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists favorite_verses jsonb not null default '[]'::jsonb;

-- 2) Abonnements (follower -> following) ---------------------
create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
create index if not exists follows_following_idx on public.follows (following_id);
create index if not exists follows_follower_idx on public.follows (follower_id);

alter table public.follows enable row level security;

-- Le graphe d'abonnement est public (comme Instagram)
drop policy if exists "follows_read_all" on public.follows;
create policy "follows_read_all" on public.follows
  for select using (true);

drop policy if exists "follows_insert_own" on public.follows;
create policy "follows_insert_own" on public.follows
  for insert with check (follower_id = auth.uid());

drop policy if exists "follows_delete_own" on public.follows;
create policy "follows_delete_own" on public.follows
  for delete using (follower_id = auth.uid());

-- « viewer » est-il abonné à « author » ?
create or replace function public.is_following(viewer uuid, author uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.follows f
    where f.follower_id = viewer and f.following_id = author
  );
$$;

-- 3) Visibilité des prières : « friends » = abonnés ----------
drop policy if exists "prayers_read_visible" on public.prayers;
create policy "prayers_read_visible" on public.prayers
  for select using (
    visibility = 'public'
    or author_id = auth.uid()
    or (visibility = 'friends' and public.is_following(auth.uid(), author_id))
  );

-- 4) (Optionnel) Nettoyage de l'ancien modèle ----------------
-- drop function if exists public.are_friends(uuid, uuid);
-- drop table if exists public.friendships;
