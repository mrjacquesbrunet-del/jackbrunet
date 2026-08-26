-- « Le Défi Biblique » — classement mondial (cumul à vie).
-- Table des scores + fonctions RPC (SECURITY DEFINER) pour ajouter les gains,
-- lire le classement, et récupérer son propre rang. Idempotent.

create table if not exists public.quiz_scores (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  coins      bigint not null default 0,
  best       bigint not null default 0,
  games      integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.quiz_scores enable row level security;

-- Lecture publique (classement mondial visible par tous).
drop policy if exists quiz_scores_read on public.quiz_scores;
create policy quiz_scores_read on public.quiz_scores for select using (true);
-- Aucune écriture directe : tout passe par la fonction quiz_add (definer).

-- Ajoute les gains d'une partie au cumul de l'utilisateur connecté.
create or replace function public.quiz_add(p_coins bigint, p_best bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;
  insert into public.quiz_scores (user_id, coins, best, games, updated_at)
  values (auth.uid(), greatest(coalesce(p_coins, 0), 0), greatest(coalesce(p_best, 0), 0), 1, now())
  on conflict (user_id) do update
    set coins = public.quiz_scores.coins + greatest(coalesce(p_coins, 0), 0),
        best = greatest(public.quiz_scores.best, greatest(coalesce(p_best, 0), 0)),
        games = public.quiz_scores.games + 1,
        updated_at = now();
end;
$$;

-- Classement mondial (top joueurs, cumul décroissant).
create or replace function public.quiz_leaderboard(p_limit integer default 50)
returns table (
  user_id uuid,
  pseudo text,
  avatar_url text,
  verified boolean,
  coins bigint,
  rank bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select s.user_id,
         p.pseudo,
         p.avatar_url,
         p.verified,
         s.coins,
         rank() over (order by s.coins desc) as rank
  from public.quiz_scores s
  left join public.profiles p on p.id = s.user_id
  where s.coins > 0
  order by s.coins desc
  limit greatest(coalesce(p_limit, 50), 1);
$$;

-- Rang et cumul de l'utilisateur connecté (même hors du top).
create or replace function public.quiz_me()
returns table (coins bigint, best bigint, games integer, rank bigint)
language sql
stable
security definer
set search_path = public
as $$
  select s.coins,
         s.best,
         s.games,
         (select count(*) + 1 from public.quiz_scores x where x.coins > s.coins) as rank
  from public.quiz_scores s
  where s.user_id = auth.uid();
$$;

-- Classement des amis : les membres que je suis (table follows) + moi-même.
create or replace function public.quiz_leaderboard_friends(p_limit integer default 100)
returns table (
  user_id uuid,
  pseudo text,
  avatar_url text,
  verified boolean,
  coins bigint,
  rank bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with friends as (
    select following_id as uid from public.follows where follower_id = auth.uid()
    union
    select auth.uid()
  )
  select s.user_id,
         p.pseudo,
         p.avatar_url,
         p.verified,
         s.coins,
         rank() over (order by s.coins desc) as rank
  from public.quiz_scores s
  join friends f on f.uid = s.user_id
  left join public.profiles p on p.id = s.user_id
  where s.coins > 0
  order by s.coins desc
  limit greatest(coalesce(p_limit, 100), 1);
$$;

grant execute on function public.quiz_add(bigint, bigint) to anon, authenticated;
grant execute on function public.quiz_leaderboard(integer) to anon, authenticated;
grant execute on function public.quiz_leaderboard_friends(integer) to anon, authenticated;
grant execute on function public.quiz_me() to anon, authenticated;
