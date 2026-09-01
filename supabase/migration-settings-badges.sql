-- ============================================================
--  PARAMÈTRES DE NOTIFICATIONS + BADGES D'ACCOMPLISSEMENT
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--
--  1) profiles.notif_prefs : choix des notifications push par type
--     (jeux, messages, prières, encouragements, groupes, abonnés,
--     annonces). null / clé absente = activé. L'edge function
--     notify-push lit ce champ avant d'envoyer.
--  2) profiles.stats : compteurs spirituels synchronisés 1×/jour par
--     l'app (méditations, versets mémorisés, jours de lecture) pour
--     que les badges d'accomplissement s'affichent sur les profils.
-- ============================================================

alter table public.profiles
  add column if not exists notif_prefs jsonb;

alter table public.profiles
  add column if not exists stats jsonb;
