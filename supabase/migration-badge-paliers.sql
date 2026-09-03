-- =====================================================================
--  LE CHEMIN / BADGES — nouveaux paliers : platine, diamant, élixir.
--
--  profiles.badge_tier n'acceptait que bronze / argent / or. Dès qu'un
--  membre dépasse l'or, la synchro du meilleur métal échoue en silence.
--  Ce script élargit la contrainte. Il est SANS RISQUE et rejouable :
--  il ne touche à aucune donnée, seulement à la règle de validation.
--  À exécuter dans Supabase → SQL Editor → Run.
-- =====================================================================

-- 1) On supprime TOUTE contrainte de vérification portant sur badge_tier,
--    quel que soit son nom (la contrainte d'origine avait été créée en
--    ligne dans migration-badge-tier.sql, avec un nom généré).
do $$
declare c record;
begin
  for c in
    select con.conname
    from   pg_constraint con
    join   pg_class     rel on rel.oid = con.conrelid
    join   pg_namespace ns  on ns.oid  = rel.relnamespace
    where  ns.nspname = 'public'
      and  rel.relname = 'profiles'
      and  con.contype = 'c'
      and  pg_get_constraintdef(con.oid) ilike '%badge_tier%'
  loop
    execute format('alter table public.profiles drop constraint %I', c.conname);
    raise notice 'Contrainte supprimée : %', c.conname;
  end loop;
end $$;

-- 2) On la recrée avec les six paliers.
--    Note : « elixir » s'écrit sans accent — c'est l'identifiant utilisé
--    par le code (src/lib/badges.ts), pas le libellé affiché.
alter table public.profiles
  add constraint profiles_badge_tier_check
  check (badge_tier is null or badge_tier in
    ('bronze','argent','or','platine','diamant','elixir'));

-- 3) Vérification : la ligne renvoyée doit contenir les six paliers.
select pg_get_constraintdef(con.oid) as contrainte_finale
from   pg_constraint con
join   pg_class rel on rel.oid = con.conrelid
where  rel.relname = 'profiles'
  and  con.conname = 'profiles_badge_tier_check';
