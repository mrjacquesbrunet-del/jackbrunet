-- =====================================================================
--  Classements des jeux (Le jeu des connaissances, Vrai ou Faux,
--  Mémoriser) + classement général = cumul des points des trois jeux.
--  Les points sont l'XP cumulée de chaque jeu (comparable entre jeux).
--  Table nommée « arcade_scores » pour ne pas entrer en conflit avec la
--  table « game_scores » déjà utilisée par les Champions de la semaine.
--  À exécuter dans Supabase → SQL Editor → Run.
-- =====================================================================

create table if not exists public.arcade_scores (
  user_id    uuid not null references auth.users(id) on delete cascade,
  game       text not null check (game in ('quiz','vraifaux','memoriser')),
  points     integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, game)
);

alter table public.arcade_scores enable row level security;

-- Le classement est public en lecture.
drop policy if exists "arcade_scores lisibles par tous" on public.arcade_scores;
create policy "arcade_scores lisibles par tous"
  on public.arcade_scores for select using (true);

-- Chacun ne gère que sa propre ligne.
drop policy if exists "arcade_scores insert soi" on public.arcade_scores;
create policy "arcade_scores insert soi"
  on public.arcade_scores for insert with check (auth.uid() = user_id);

drop policy if exists "arcade_scores update soi" on public.arcade_scores;
create policy "arcade_scores update soi"
  on public.arcade_scores for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Envoi d'un score : on garde toujours le meilleur (points cumulatifs).
create or replace function public.game_submit(p_game text, p_points integer)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  if p_game not in ('quiz','vraifaux','memoriser') then return; end if;
  insert into public.arcade_scores (user_id, game, points, updated_at)
  values (auth.uid(), p_game, greatest(0, coalesce(p_points, 0)), now())
  on conflict (user_id, game) do update
    set points = greatest(public.arcade_scores.points, excluded.points),
        updated_at = now();
end;
$$;

-- Classement d'un jeu (pseudo + photo + score).
create or replace function public.game_leaderboard(p_game text, p_limit integer default 50)
returns table (user_id uuid, pseudo text, avatar_url text, points integer, rank integer)
language sql security definer set search_path = public as $$
  select s.user_id, p.pseudo, p.avatar_url, s.points,
         rank() over (order by s.points desc)::int
  from public.arcade_scores s
  join public.profiles p on p.id = s.user_id
  where s.game = p_game and s.points > 0
  order by s.points desc
  limit greatest(1, least(coalesce(p_limit, 50), 100));
$$;

-- Classement général : cumul des points des trois jeux.
create or replace function public.game_leaderboard_total(p_limit integer default 50)
returns table (user_id uuid, pseudo text, avatar_url text, points integer, rank integer)
language sql security definer set search_path = public as $$
  with tot as (
    select user_id, sum(points)::int as points
    from public.arcade_scores
    group by user_id
  )
  select t.user_id, p.pseudo, p.avatar_url, t.points,
         rank() over (order by t.points desc)::int
  from tot t
  join public.profiles p on p.id = t.user_id
  where t.points > 0
  order by t.points desc
  limit greatest(1, least(coalesce(p_limit, 50), 100));
$$;

grant execute on function public.game_submit(text, integer) to authenticated;
grant execute on function public.game_leaderboard(text, integer) to anon, authenticated;
grant execute on function public.game_leaderboard_total(integer) to anon, authenticated;
