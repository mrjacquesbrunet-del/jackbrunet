-- ============================================================
--  Émission « Starter » (église Momentum, pasteur Patrice
--  Martorano) : contenu autorisé par son auteur. Fiche avec
--  Instagram et chaîne YouTube. Les épisodes s'ajoutent ensuite.
--  Supabase → SQL Editor → Run. Relançable sans risque.
-- ============================================================

insert into public.podcast_shows (id, title, author, description, category, cover_path, position, intervenants, publics)
values (
  '5a7e0000-0000-4000-8000-00000000e001',
  'Starter',
  'Patrice Martorano',
  'Des exhortations courtes pour bien démarrer la journée, par le pasteur Patrice Martorano, de l''église Momentum.',
  'Exhortations',
  '/img/podcast/starter.jpg',
  (select coalesce(max(position), 0) + 1 from public.podcast_shows),
  jsonb_build_array(jsonb_build_object(
    'nom', 'Patrice Martorano',
    'role', 'Pasteur principal de l''église Momentum',
    'instagram', 'https://www.instagram.com/patrice_martorano',
    'liens', jsonb_build_array(
      jsonb_build_object('label', 'YouTube', 'url', 'https://www.youtube.com/@eglisemomentumfr')
    )
  )),
  '{tout-public}'
)
on conflict (id) do update set
  title = excluded.title,
  author = excluded.author,
  description = excluded.description,
  category = excluded.category,
  cover_path = excluded.cover_path,
  intervenants = excluded.intervenants,
  publics = excluded.publics;
