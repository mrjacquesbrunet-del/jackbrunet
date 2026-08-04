-- ============================================================
-- NOTIFICATIONS DE GROUPE
-- À exécuter dans Supabase → SQL Editor → Run. Idempotent (ré-exécutable).
--
-- Ce que ça active :
--  1. Nouvelle PUBLICATION dans un groupe  → notifie tous les membres.
--  2. Nouveau MESSAGE (discussion du groupe) → notifie les membres
--     (anti-spam : une seule notification non lue par groupe).
--  3. Nouvelle ADHÉSION → notifie le propriétaire du groupe ; et quand une
--     demande est acceptée → notifie le nouveau membre.
-- Les pushs partent ensuite automatiquement via le webhook « notifications »
-- déjà branché sur la fonction notify-push.
-- ============================================================

-- 0) Colonnes utilisées (au cas où elles manqueraient)
alter table public.notifications add column if not exists body text;
alter table public.notifications add column if not exists link text;

-- 1) Liste complète des types autorisés
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in (
    'pray','heart','comment','follow','mention','admin','message','reply',
    'group_comment','group_reaction','group_post','group_message','group_join'
  ));

-- 2) Publication dans un groupe → tous les membres approuvés (sauf l'auteur)
create or replace function public.notify_group_post()
returns trigger language plpgsql security definer set search_path = public as $$
declare gname text;
begin
  select name into gname from public.groups where id = new.group_id;
  insert into public.notifications (user_id, actor_id, type, body, link)
  select gm.user_id, new.author_id, 'group_post', coalesce(gname, ''),
         '/groupe/?g=' || new.group_id
  from public.group_members gm
  where gm.group_id = new.group_id
    and gm.user_id <> new.author_id
    and gm.status = 'approved';
  return new;
end; $$;

drop trigger if exists on_group_post_notify on public.group_posts;
create trigger on_group_post_notify
  after insert on public.group_posts
  for each row execute function public.notify_group_post();

-- 3) Message dans la discussion → membres approuvés, avec anti-spam :
--    pas de nouvelle notification tant qu'une non-lue du même groupe existe.
create or replace function public.notify_group_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare gname text;
begin
  select name into gname from public.groups where id = new.group_id;
  insert into public.notifications (user_id, actor_id, type, body, link)
  select gm.user_id, new.author_id, 'group_message', coalesce(gname, ''),
         '/groupe/?g=' || new.group_id
  from public.group_members gm
  where gm.group_id = new.group_id
    and gm.user_id <> new.author_id
    and gm.status = 'approved'
    and not exists (
      select 1 from public.notifications n
      where n.user_id = gm.user_id
        and n.type = 'group_message'
        and n.link = '/groupe/?g=' || new.group_id
        and n.read = false
    );
  return new;
end; $$;

drop trigger if exists on_group_message_notify on public.group_messages;
create trigger on_group_message_notify
  after insert on public.group_messages
  for each row execute function public.notify_group_message();

-- 4) Adhésions : le propriétaire est prévenu d'une arrivée ; le membre est
--    prévenu quand sa demande est acceptée.
create or replace function public.notify_group_join()
returns trigger language plpgsql security definer set search_path = public as $$
declare gname text; gowner uuid;
begin
  select name, owner_id into gname, gowner from public.groups where id = new.group_id;

  -- Arrivée directe (groupe ouvert) → prévient le propriétaire.
  if (tg_op = 'INSERT' and new.status = 'approved' and new.user_id <> gowner) then
    insert into public.notifications (user_id, actor_id, type, body, link)
    values (gowner, new.user_id, 'group_join', coalesce(gname, ''), '/groupe/?g=' || new.group_id);
  end if;

  -- Demande acceptée → prévient le nouveau membre.
  if (tg_op = 'UPDATE' and old.status = 'pending' and new.status = 'approved') then
    insert into public.notifications (user_id, actor_id, type, body, link)
    values (new.user_id, gowner, 'group_join', coalesce(gname, ''), '/groupe/?g=' || new.group_id);
  end if;

  return new;
end; $$;

drop trigger if exists on_group_join_notify on public.group_members;
create trigger on_group_join_notify
  after insert or update on public.group_members
  for each row execute function public.notify_group_join();
