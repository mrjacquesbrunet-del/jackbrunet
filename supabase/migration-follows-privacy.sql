-- =====================================================================
--  Confidentialité des abonnés / abonnements sur le profil.
--  Par défaut tout est PUBLIC : sur le profil d'un membre, chacun peut
--  voir ses abonnés et ses abonnements. Le membre peut passer ses listes
--  en privé depuis son profil (réglage « Qui peut voir tes abonnés /
--  abonnements ? » → « Seulement moi »).
--  À exécuter dans Supabase → SQL Editor → Run.
-- =====================================================================

alter table public.profiles
  add column if not exists follows_privacy text not null default 'public'
    check (follows_privacy in ('public','prive'));
