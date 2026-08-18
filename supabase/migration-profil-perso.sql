-- ============================================================
--  MIGRATION : personnalisation du profil
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--
--  Nouveaux champs (tous facultatifs) : église, ville, pays,
--  confidentialité de la localisation, phrase personnelle.
-- ============================================================

alter table public.profiles
  add column if not exists church text,
  add column if not exists city text,
  add column if not exists country text,
  add column if not exists location_privacy text not null default 'public'
    check (location_privacy in ('public','prive')),
  add column if not exists life_phrase text;
