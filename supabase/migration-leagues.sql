-- =====================================================================
--  LIGUES HEBDOMADAIRES À DIVISIONS (Élite · Or · Argent · Bronze)
--  À exécuter dans Supabase → SQL Editor → Run. Sûr à relancer.
--
--  - Chaque joueur a une division (profiles.league_division) :
--      1 = Élite, 2 = Or, 3 = Argent, 4 = Bronze (départ).
--  - Les points de la semaine (table arcade_weekly, déjà en place)
--    classent les joueurs À L'INTÉRIEUR de leur division.
--  - Chaque dimanche 23 h 40 (UTC) : PHASE DE REMPLISSAGE tant que la
--    division du dessus compte moins de 6 joueurs (la moitié haute
--    monte), puis RÉGIME NORMAL : 3 montent, 3 descendent (descentes
--    seulement si la division compte au moins 6 joueurs).
-- =====================================================================

-- 1) La division du joueur (4 = Bronze par défaut).
alter table public.profiles
  add column if not exists league_division smallint not null default 4;

alter table public.profiles
  drop constraint if exists profiles_league_division_check;
alter table public.profiles
  add constraint profiles_league_division_check
  check (league_division between 1 and 4);

-- 2) Classement de MA division (ou d'une division donnée) pour la semaine
--    en cours. Membres = joueurs ayant déjà marqué des points en ligue
--    (au moins une semaine jouée), classés par points de CETTE semaine.
create or replace function public.league_standings(p_division integer default null)
returns table (
  user_id uuid,
  pseudo text,
  avatar_url text,
  points integer,
  rank integer,
  division integer
)
language plpgsql security definer set search_path = public as $$
declare
  d integer;
begin
  if p_division is not null then
    d := p_division;
  elsif auth.uid() is not null then
    select p.league_division into d from public.profiles p where p.id = auth.uid();
  end if;
  if d is null then d := 4; end if;
  d := greatest(1, least(4, d));

  return query
  select p.id,
         p.pseudo,
         p.avatar_url,
         coalesce(w.points, 0)::int,
         rank() over (order by coalesce(w.points, 0) desc, p.pseudo asc)::int,
         d
  from public.profiles p
  left join public.arcade_weekly w
    on w.user_id = p.id and w.week = to_char(now(), 'IYYY"-W"IW')
  where p.league_division = d
    and exists (select 1 from public.arcade_weekly aw where aw.user_id = p.id)
  order by coalesce(w.points, 0) desc, p.pseudo asc
  limit 60;
end;
$$;

grant execute on function public.league_standings(integer) to anon, authenticated;

-- 3) Brassage hebdomadaire : remplissage (moitié haute) puis 3 montent / 3 descendent.
create or replace function public.league_weekly_shuffle()
returns void
language plpgsql security definer set search_path = public as $$
declare
  wk text := to_char(now(), 'IYYY"-W"IW');
begin
  -- Photo de la semaine : chaque membre, sa division, ses points, son rang.
  create temp table _league_snap on commit drop as
  select p.id,
         p.league_division as d,
         coalesce(w.points, 0) as pts,
         rank() over (
           partition by p.league_division
           order by coalesce(w.points, 0) desc, p.id
         ) as rk,
         count(*) over (partition by p.league_division) as div_size
  from public.profiles p
  left join public.arcade_weekly w
    on w.user_id = p.id and w.week = wk
  where exists (select 1 from public.arcade_weekly aw where aw.user_id = p.id);

  -- Effectif de chaque division (parmi les joueurs classés).
  create temp table _div_counts on commit drop as
  select d, count(*) as n from _league_snap group by d;

  -- Montées (points > 0, pas déjà en Élite) :
  --  * division du dessus encore clairsemée (< 6 joueurs) → la moitié
  --    haute du tableau monte, pour remplir Argent, Or puis Élite ;
  --  * sinon, régime normal : les 3 premiers montent.
  update public.profiles p
  set league_division = p.league_division - 1
  from _league_snap s
  left join _div_counts up on up.d = s.d - 1
  where s.id = p.id
    and s.pts > 0
    and s.d > 1
    and (
      (coalesce(up.n, 0) < 6 and s.rk <= ceil(s.div_size / 2.0))
      or s.rk <= 3
    );

  -- Descentes : les 3 derniers, si la division compte au moins
  -- 6 joueurs, pas déjà en Bronze.
  update public.profiles p
  set league_division = p.league_division + 1
  from _league_snap s
  where s.id = p.id
    and s.rk > s.div_size - 3
    and s.div_size >= 6
    and s.d < 4;
end;
$$;

-- 4) Rendez-vous automatique : dimanche 23 h 40 UTC, juste avant les titres
--    (award-weekly-honors tourne à 23 h 50 sur la même semaine).
select cron.unschedule('league-weekly-shuffle')
  where exists (select 1 from cron.job where jobname = 'league-weekly-shuffle');
select cron.schedule('league-weekly-shuffle', '40 23 * * 0', 'select public.league_weekly_shuffle()');
