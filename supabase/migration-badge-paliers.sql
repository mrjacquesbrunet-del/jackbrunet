-- =====================================================================
--  Nouveaux paliers de badges : platine, diamant, élixir.
--  profiles.badge_tier n'acceptait que bronze / argent / or : la synchro
--  du meilleur métal échouait en silence dès qu'un membre dépassait l'or.
--  À exécuter dans Supabase → SQL Editor → Run.
-- =====================================================================

alter table public.profiles
  drop constraint if exists profiles_badge_tier_check;

alter table public.profiles
  add constraint profiles_badge_tier_check
  check (badge_tier is null or badge_tier in
    ('bronze','argent','or','platine','diamant','elixir'));
