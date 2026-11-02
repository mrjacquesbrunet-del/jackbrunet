-- ============================================================
--  1. Inviter ses amis : un nouveau membre arrivé par le lien
--     d'invitation suit automatiquement celui qui l'a invité (et
--     inversement), et le parrain est prévenu.
--  2. Années avec Jésus : chaque jour à 9 h (Paris), une
--     notification pour l'anniversaire de conversion (le membre +
--     ses abonnés), et chaque mois pendant la première année.
--  Supabase → SQL Editor → Run. Relançable sans risque.
-- ============================================================

-- Nouveaux types de notification : 'invitation' et 'avec_jesus'
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in (
    'pray','heart','comment','follow','mention','admin','message','reply',
    'group_comment','group_reaction','group_post','group_message','group_join',
    'comment_reaction','pray_digest','follow_up','challenge','friend_score',
    'duo_invite','duo_accept','duo_read','duo_note','priere_direct','podcast',
    'invitation','avec_jesus'
  ));

-- Qui m'a invité (une seule fois par compte)
alter table public.profiles add column if not exists invite_par uuid references auth.users(id) on delete set null;

-- 1. Accepter une invitation (appelé par l'app juste après l'inscription).
--    Seulement pour un compte créé il y a moins de 14 jours, une fois.
create or replace function public.accepter_invitation(p_parrain uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  moi uuid := auth.uid();
  mon_pseudo text;
begin
  if moi is null or p_parrain is null or p_parrain = moi then return false; end if;
  if not exists (select 1 from auth.users u where u.id = moi and u.created_at > now() - interval '14 days') then
    return false;
  end if;
  if not exists (select 1 from public.profiles where id = p_parrain) then return false; end if;
  update public.profiles set invite_par = p_parrain where id = moi and invite_par is null;
  if not found then return false; end if;

  insert into public.follows (follower_id, following_id) values (moi, p_parrain) on conflict do nothing;
  insert into public.follows (follower_id, following_id) values (p_parrain, moi) on conflict do nothing;

  select pseudo into mon_pseudo from public.profiles where id = moi;
  insert into public.notifications (user_id, actor_id, type, body, link)
  values (p_parrain, moi, 'invitation',
          coalesce(mon_pseudo, 'Un ami') || ' a rejoint RHEMA grâce à ton invitation. Vous êtes maintenant amis !',
          '/membre/?u=' || moi);
  return true;
end $$;
grant execute on function public.accepter_invitation(uuid) to authenticated;

-- 2. Années avec Jésus (et les premiers mois).
create or replace function public.notifier_avec_jesus()
returns void language plpgsql security definer set search_path = public as $$
declare
  auj date := (now() at time zone 'Europe/Paris')::date;
  fin_mois int := extract(day from (date_trunc('month', auj) + interval '1 month - 1 day'))::int;
begin
  with c as (
    select p.id, p.pseudo, p.converted_at,
           (extract(year from age(auj, p.converted_at)) * 12 + extract(month from age(auj, p.converted_at)))::int as mois
    from public.profiles p
    where p.converted_at is not null
      and p.converted_at < auj
      -- même jour du mois (ou dernier jour du mois pour un 29, 30 ou 31)
      and (extract(day from p.converted_at)::int = extract(day from auj)::int
           or (extract(day from p.converted_at)::int > fin_mois and extract(day from auj)::int = fin_mois))
      -- jamais deux fois le même jour
      and not exists (
        select 1 from public.notifications n
        where n.user_id = p.id and n.type = 'avec_jesus'
          and (n.created_at at time zone 'Europe/Paris')::date = auj and n.actor_id is null
      )
  )
  -- Le membre lui-même : chaque mois la 1re année, puis chaque année.
  insert into public.notifications (user_id, type, body, link)
  select c.id, 'avec_jesus',
         case
           when c.mois % 12 = 0 then
             'Joyeux anniversaire spirituel ! Cela fait ' || (c.mois / 12) || ' an' ||
             case when c.mois / 12 > 1 then 's' else '' end || ' que tu marches avec Jésus. Une année de plus avec Lui !'
           else
             'Déjà ' || c.mois || ' mois avec Jésus ! Continue, Il marche avec toi chaque jour.'
         end,
         '/profil/'
  from c
  where c.mois >= 1 and (c.mois < 12 or c.mois % 12 = 0);

  -- Ses abonnés : seulement le jour de l'anniversaire (chaque année).
  insert into public.notifications (user_id, actor_id, type, body, link)
  select f.follower_id, p.id, 'avec_jesus',
         coalesce(p.pseudo, 'Un ami') || ' fête ' ||
           extract(year from age(auj, p.converted_at))::int || ' an' ||
           case when extract(year from age(auj, p.converted_at))::int > 1 then 's' else '' end ||
           ' avec Jésus aujourd''hui. Envoie-lui un mot d''encouragement !',
         '/membre/?u=' || p.id
  from public.profiles p
  join public.follows f on f.following_id = p.id
  where p.converted_at is not null
    and extract(month from p.converted_at) = extract(month from auj)
    and (extract(day from p.converted_at)::int = extract(day from auj)::int
         or (extract(day from p.converted_at)::int > fin_mois and extract(day from auj)::int = fin_mois))
    and extract(year from age(auj, p.converted_at))::int >= 1
    and not exists (
      select 1 from public.notifications n
      where n.user_id = f.follower_id and n.actor_id = p.id and n.type = 'avec_jesus'
        and (n.created_at at time zone 'Europe/Paris')::date = auj
    );
end $$;

-- Chaque jour à 7 h 05 UTC (9 h 05 à Paris l'été, 8 h 05 l'hiver).
do $$ begin perform cron.unschedule('avec-jesus'); exception when others then null; end $$;
select cron.schedule('avec-jesus', '5 7 * * *', $$select public.notifier_avec_jesus()$$);
