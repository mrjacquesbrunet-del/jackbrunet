-- ============================================================
--  NOTES VOCALES ÉPHÉMÈRES (7 jours)
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--
--  Chaque nuit à 3h10, supprime automatiquement :
--   - les commentaires du mur et messages de groupe qui sont des notes
--     vocales de plus de 7 jours ;
--   - les fichiers audio correspondants du bucket « voices »
--  → l'espace de stockage ne gonfle jamais.
-- ============================================================

-- 1) Extension de planification (incluse dans Supabase)
create extension if not exists pg_cron;

-- 2) (Ré)installe la tâche de nettoyage quotidienne
do $$
begin
  if exists (select 1 from cron.job where jobname = 'purge-voices') then
    perform cron.unschedule('purge-voices');
  end if;
end $$;

select cron.schedule(
  'purge-voices',
  '10 3 * * *',
  $$
    delete from public.prayer_comments
      where audio_url is not null and created_at < now() - interval '7 days';
    delete from public.group_messages
      where audio_url is not null and created_at < now() - interval '7 days';
    delete from storage.objects
      where bucket_id = 'voices' and created_at < now() - interval '7 days';
  $$
);
