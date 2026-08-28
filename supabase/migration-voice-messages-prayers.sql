-- ============================================================
--  NOTES VOCALES : conversations privées + sujets de prière
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--
--  1. Colonne audio_url sur les messages privés et les sujets de prière.
--  2. Étend la purge nocturne (3h10) : les vocaux de plus de 7 jours
--     sont supprimés partout (commentaires, groupes, messages privés,
--     sujets de prière, fichiers du bucket « voices »).
--     - message privé vocal → supprimé (il n'a pas de texte) ;
--     - sujet de prière : l'audio expiré est détaché (le texte reste) ;
--       un sujet 100 % vocal (sans texte) est supprimé.
-- ============================================================

alter table public.messages add column if not exists audio_url text;
alter table public.prayers  add column if not exists audio_url text;

-- (Ré)installe la tâche de nettoyage quotidienne, version étendue.
create extension if not exists pg_cron;

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
    delete from public.messages
      where audio_url is not null and created_at < now() - interval '7 days';
    delete from public.prayers
      where audio_url is not null and coalesce(body, '') = ''
        and created_at < now() - interval '7 days';
    update public.prayers set audio_url = null
      where audio_url is not null and created_at < now() - interval '7 days';
    delete from storage.objects
      where bucket_id = 'voices' and created_at < now() - interval '7 days';
  $$
);
