-- ============================================================
--  ANNEAU DORÉ DES BADGES
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--
--  profiles.badge_tier : meilleur métal de badges du membre
--  ('bronze' / 'argent' / 'or', null = aucun badge). Synchronisé
--  automatiquement par l'app (1×/jour à la première activité).
--  Donne l'anneau doré autour de la photo de profil partout.
-- ============================================================

alter table public.profiles
  add column if not exists badge_tier text
  check (badge_tier in ('bronze','argent','or'));
