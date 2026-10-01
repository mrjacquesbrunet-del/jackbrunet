-- ============================================================
-- FORMATION BIBLIQUE — notation par les membres + stats admin.
-- À exécuter dans Supabase → SQL Editor → Run. Idempotent.
--
-- 1) formation_ratings : une note (1 à 5 étoiles) et un avis
--    facultatif par membre et par formation, modifiables.
-- 2) formation_rating_summary : moyenne + nombre d'avis (public).
-- 3) formation_admin_stats : inscrits, terminés, détail par leçon
--    (réservé à l'admin via public.is_admin()).
-- ============================================================

create table if not exists public.formation_ratings (
  user_id uuid not null references public.profiles(id) on delete cascade,
  formation_id text not null,
  note int not null check (note between 1 and 5),
  avis text,
  created_at timestamptz not null default now(),
  primary key (user_id, formation_id)
);

alter table public.formation_ratings enable row level security;
drop policy if exists "frating_select_own" on public.formation_ratings;
create policy "frating_select_own" on public.formation_ratings
  for select using (auth.uid() = user_id);
drop policy if exists "frating_insert_own" on public.formation_ratings;
create policy "frating_insert_own" on public.formation_ratings
  for insert with check (auth.uid() = user_id);
drop policy if exists "frating_update_own" on public.formation_ratings;
create policy "frating_update_own" on public.formation_ratings
  for update using (auth.uid() = user_id);

-- Moyenne et nombre d'avis, affichés sur la fiche de la formation.
create or replace function public.formation_rating_summary(p_formation text)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'moyenne', coalesce(round(avg(note)::numeric, 1), 0),
    'avis', count(*)
  )
  from public.formation_ratings
  where formation_id = p_formation;
$$;
grant execute on function public.formation_rating_summary(text) to anon, authenticated;

-- Statistiques réservées à l'admin : qui suit / a fini la formation.
create or replace function public.formation_admin_stats(p_formation text, p_total int)
returns json language sql stable security definer set search_path = public as $$
  select case
    when not public.is_admin() then null
    else json_build_object(
      'inscrits', (
        select count(distinct user_id)
        from public.formation_progress
        where formation_id = p_formation
      ),
      'termines', (
        select count(*)
        from (
          select user_id
          from public.formation_progress
          where formation_id = p_formation
          group by user_id
          having count(distinct lesson) >= p_total
        ) t
      ),
      'par_lecon', (
        select coalesce(json_object_agg(lesson, n), '{}'::json)
        from (
          select lesson, count(*) as n
          from public.formation_progress
          where formation_id = p_formation
          group by lesson
        ) l
      ),
      'note_moyenne', (
        select coalesce(round(avg(note)::numeric, 1), 0)
        from public.formation_ratings
        where formation_id = p_formation
      ),
      'nb_avis', (
        select count(*)
        from public.formation_ratings
        where formation_id = p_formation
      )
    )
  end;
$$;
grant execute on function public.formation_admin_stats(text, int) to authenticated;
