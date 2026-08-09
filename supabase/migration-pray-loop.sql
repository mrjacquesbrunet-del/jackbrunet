-- ============================================================
-- La « boucle de prière » du mur
--  1. Récap quotidien : « N personnes ont prié pour toi aujourd'hui »
--  2. Relance à J+3 : « Comment évolue ton sujet ? »
-- (Le push instantané « prie pour toi en ce moment » est côté edge.)
-- À exécuter dans Supabase → SQL Editor.
-- ============================================================

-- 1) Nouveaux types de notification autorisés
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in (
    'pray','heart','comment','follow','mention','admin','message','reply',
    'group_comment','group_reaction','group_post','group_message','group_join',
    'comment_reaction','pray_digest','follow_up'
  ));

-- 2) Récap quotidien des prières reçues (appelé chaque soir par pg_cron).
--    Une notification par auteur ayant reçu au moins 2 « Je prie » (d'autres
--    personnes) sur ses sujets dans les dernières 24 h. body = le nombre.
create or replace function public.notify_pray_digest()
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, type, body, link)
  select p.author_id, 'pray_digest', count(distinct r.user_id)::text, '/communaute/'
    from public.prayer_reactions r
    join public.prayers p on p.id = r.prayer_id
   where r.type = 'pray'
     and r.created_at >= now() - interval '24 hours'
     and r.user_id <> p.author_id
   group by p.author_id
  having count(distinct r.user_id) >= 2;
end; $$;

-- 3) Relance J+3 : sujets non exaucés créés il y a 3 à 4 jours, une seule
--    relance par sujet (jamais si déjà relancé).
create or replace function public.notify_follow_up()
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, type, prayer_id, link)
  select p.author_id, 'follow_up', p.id, '/communaute/?prayer=' || p.id
    from public.prayers p
   where p.answered = false
     and p.created_at between now() - interval '4 days' and now() - interval '3 days'
     and not exists (
       select 1 from public.notifications n
        where n.type = 'follow_up' and n.prayer_id = p.id
     );
end; $$;

-- 4) Planification quotidienne (pg_cron) : récap à 19h00, relance à 19h10.
--    (On déprogramme d'abord au cas où les jobs existent déjà.)
do $$ begin perform cron.unschedule('pray-digest'); exception when others then null; end $$;
do $$ begin perform cron.unschedule('prayer-follow-up'); exception when others then null; end $$;
select cron.schedule('pray-digest', '0 19 * * *', $$select public.notify_pray_digest()$$);
select cron.schedule('prayer-follow-up', '10 19 * * *', $$select public.notify_follow_up()$$);
