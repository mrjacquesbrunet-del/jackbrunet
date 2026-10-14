-- ============================================================
-- Podcasts : fiche de l'intervenant de chaque émission (comme les plans).
-- Toucher son nom ouvre sa fiche : rôle, présentation, Instagram,
-- YouTube, boutique, site. À exécuter dans Supabase → SQL Editor → Run.
-- ============================================================
alter table public.podcast_shows
  add column if not exists author_role      text,
  add column if not exists author_bio       text,
  add column if not exists author_photo     text,
  add column if not exists author_instagram text,
  add column if not exists author_links     jsonb not null default '[]'::jsonb;
