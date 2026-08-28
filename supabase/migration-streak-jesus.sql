-- ============================================================
--  BADGE DE SÉRIE + « X ANS AVEC JÉSUS »
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--
--  1) profiles.streak_days : série de jours d'assiduité, mise à
--     jour automatiquement par l'app (avec last_seen_at). À partir
--     de 7 jours, une flamme s'affiche sur l'avatar du membre.
--  2) profiles.converted_at : date de conversion (facultative,
--     choisie par le membre dans son profil) → le profil affiche
--     « Nouveau en Christ », « X mois avec Jésus » ou
--     « X ans avec Jésus ».
-- ============================================================

alter table public.profiles
  add column if not exists streak_days integer not null default 0;

alter table public.profiles
  add column if not exists converted_at date;
