-- =====================================================================
--  Ligue de la semaine : points gagnés CETTE semaine, tous jeux confondus.
--  Repart chaque lundi (semaine ISO). Chaque partie ajoute ses points.
--  À exécuter dans Supabase → SQL Editor → Run.
-- =====================================================================

create table if not exists public.arcade_weekly (
  user_id    uuid not null references auth.users(id) on delete cascade,
  week       text not null,               -- semaine ISO, ex. « 2026-W35 »
  points     integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, week)
);

alter table public.arcade_weekly enable row level security;

-- Lecture publique (le classement est public). Les écritures passent
-- uniquement par la fonction security definer ci-dessous.
drop policy if exists "arcade_weekly lisible" on public.arcade_weekly;
create policy "arcade_weekly lisible"
  on public.arcade_weekly for select using (true);

-- Ajoute des points à la semaine en cours (cumule).
create or replace function public.arcade_week_add(p_points integer)
returns void
language plpgsql security definer set search_path = public as $$
declare
  w text := to_char(now(), 'IYYY"-W"IW');
begin
  if auth.uid() is null then return; end if;
  if coalesce(p_points, 0) <= 0 then return; end if;
  insert into public.arcade_weekly (user_id, week, points, updated_at)
  values (auth.uid(), w, p_points, now())
  on conflict (user_id, week) do update
    set points = public.arcade_weekly.points + excluded.points,
        updated_at = now();
end;
$$;

-- Classement de la semaine en cours (pseudo + photo + points).
create or replace function public.arcade_week_leaderboard(p_limit integer default 50)
returns table (user_id uuid, pseudo text, avatar_url text, points integer, rank integer)
language sql security definer set search_path = public as $$
  select s.user_id, p.pseudo, p.avatar_url, s.points,
         rank() over (order by s.points desc)::int
  from public.arcade_weekly s
  join public.profiles p on p.id = s.user_id
  where s.week = to_char(now(), 'IYYY"-W"IW') and s.points > 0
  order by s.points desc
  limit greatest(1, least(coalesce(p_limit, 50), 100));
$$;

grant execute on function public.arcade_week_add(integer) to authenticated;
grant execute on function public.arcade_week_leaderboard(integer) to anon, authenticated;
