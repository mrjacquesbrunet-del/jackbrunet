-- ============================================================
--  Podcasts : plusieurs intervenants par émission, chacun avec sa fiche
--  (nom, rôle, présentation, photo, Instagram, liens).
--  À exécuter dans Supabase → SQL Editor. Sûr à relancer.
-- ============================================================

-- Fiche de l'intervenant unique (si migration-podcast-auteurs.sql n'est pas passée).
alter table public.podcast_shows
  add column if not exists author_role      text,
  add column if not exists author_bio       text,
  add column if not exists author_photo     text,
  add column if not exists author_instagram text,
  add column if not exists author_links     jsonb not null default '[]'::jsonb;

-- La liste des intervenants.
alter table public.podcast_shows add column if not exists intervenants jsonb;

-- Reprise : l'intervenant actuel de chaque émission devient le premier de la liste.
update public.podcast_shows
set intervenants = jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
  'nom', author,
  'role', author_role,
  'bio', author_bio,
  'photo', author_photo,
  'instagram', author_instagram,
  'liens', coalesce(author_links, '[]'::jsonb)
)))
where intervenants is null and coalesce(btrim(author), '') <> '';
