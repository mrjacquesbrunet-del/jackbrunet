-- ============================================================
-- Podcasts : « Les plus écoutés », notification « Nouvel épisode »,
-- langue de l'app sur le profil (annonces de podcasts en français
-- seulement). À exécuter dans Supabase → SQL Editor → Run.
-- ============================================================

-- 1) Langue de l'app sur le profil (l'app la renseigne toute seule)
alter table public.profiles add column if not exists langue text;

-- 2) Nouveau type de notification : 'podcast'
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in (
    'pray','heart','comment','follow','mention','admin','message','reply',
    'group_comment','group_reaction','group_post','group_message','group_join',
    'comment_reaction','pray_digest','follow_up','challenge','friend_score',
    'duo_invite','duo_accept','duo_read','duo_note','priere_direct','podcast'
  ));

-- 3) Les plus écoutés : nombre d'auditeurs (appareils différents) par
--    épisode sur les N derniers jours. Lisible par tous, sans rien révéler
--    des statistiques détaillées.
create or replace function public.podcasts_populaires(jours int default 90)
returns table (podcast_id text, ecoutes bigint)
language sql
stable
security definer
set search_path = public
as $$
  select e.page as podcast_id,
         count(distinct coalesce(e.device_id, e.id::text)) as ecoutes
  from public.analytics_events e
  join public.podcasts p on p.id::text = e.page
  where e.type = 'play'
    and e.created_at > now() - make_interval(days => greatest(1, least(coalesce(jours, 90), 365)))
  group by e.page
  order by ecoutes desc
  limit 20;
$$;
grant execute on function public.podcasts_populaires(int) to anon, authenticated;

-- 4) Annonce d'un nouvel épisode (admin) : une notification « podcast »
--    pour chaque membre qui utilise l'app en français. Le push respecte le
--    réglage « Nouveaux épisodes » (profiles.notif_prefs->'podcasts').
create or replace function public.notifier_nouvel_episode(message text, lien text default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  if not public.is_admin() then
    raise exception 'Réservé à l''administrateur';
  end if;
  insert into public.notifications (user_id, actor_id, type, body, link, read)
  select p.id, auth.uid(), 'podcast', message, lien, false
  from public.profiles p
  where coalesce(p.langue, 'fr') = 'fr'
    and p.id <> auth.uid();
  get diagnostics n = row_count;
  return n;
end;
$$;
grant execute on function public.notifier_nouvel_episode(text, text) to authenticated;
