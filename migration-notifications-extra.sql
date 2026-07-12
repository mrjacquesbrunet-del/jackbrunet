-- ============================================================
--  Notifications — événements supplémentaires (cloche).
--  À exécuter dans Supabase → SQL Editor, APRÈS:
--    migration-notifications.sql, migration-groups.sql,
--    migration-messages.sql, migration-replies.sql.
--  Sûr à relancer (idempotent).
--
--  Ajoute des notifications quand:
--   - tu reçois un message privé;
--   - on répond à ton commentaire (mur de prière);
--   - on commente ta publication de groupe;
--   - on réagit à ta publication de groupe.
-- ============================================================

-- 1) Élargir les types autorisés
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in (
    'pray','heart','comment','follow','mention','admin',
    'message','reply','group_comment','group_reaction'
  ));

-- 2) Message privé reçu → notifie le destinataire
create or replace function public.notif_on_message()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.recipient_id <> new.sender_id then
    insert into public.notifications (user_id, actor_id, type, body, link, read)
    values (new.recipient_id, new.sender_id, 'message',
            left(coalesce(new.body, ''), 120), '/messages', false);
  end if;
  return new;
end; $$;
drop trigger if exists trg_notif_message on public.messages;
create trigger trg_notif_message after insert on public.messages
  for each row execute function public.notif_on_message();

-- 3) Commentaire du mur de prière → auteur du sujet + (si réponse) auteur du
--    commentaire parent. Remplace l'ancienne fonction (même nom, même trigger).
create or replace function public.notif_on_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare prayer_author uuid; parent_author uuid;
begin
  select author_id into prayer_author from public.prayers where id = new.prayer_id;
  -- Auteur du sujet
  if prayer_author is not null and prayer_author <> new.author_id then
    insert into public.notifications (user_id, actor_id, type, prayer_id, read)
    values (prayer_author, new.author_id, 'comment', new.prayer_id, false);
  end if;
  -- Réponse: notifie aussi l'auteur du commentaire parent (sans doublon)
  if new.parent_id is not null then
    select author_id into parent_author from public.prayer_comments where id = new.parent_id;
    if parent_author is not null
       and parent_author <> new.author_id
       and parent_author is distinct from prayer_author then
      insert into public.notifications (user_id, actor_id, type, prayer_id, read)
      values (parent_author, new.author_id, 'reply', new.prayer_id, false);
    end if;
  end if;
  return new;
end; $$;
-- (le trigger trg_notif_comment existe déjà et pointe vers cette fonction)

-- 4) Commentaire sous une publication de groupe → notifie l'auteur du post
create or replace function public.notif_on_group_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare post_author uuid;
begin
  select author_id into post_author from public.group_posts where id = new.post_id;
  if post_author is not null and post_author <> new.author_id then
    insert into public.notifications (user_id, actor_id, type, body, link, read)
    values (post_author, new.author_id, 'group_comment',
            left(coalesce(new.body, ''), 120),
            '/groupe?g=' || new.group_id::text, false);
  end if;
  return new;
end; $$;
drop trigger if exists trg_notif_group_comment on public.group_comments;
create trigger trg_notif_group_comment after insert on public.group_comments
  for each row execute function public.notif_on_group_comment();

-- 5) Réaction sous une publication de groupe → notifie l'auteur du post
create or replace function public.notif_on_group_reaction()
returns trigger language plpgsql security definer set search_path = public as $$
declare post_author uuid;
begin
  select author_id into post_author from public.group_posts where id = new.post_id;
  if post_author is not null and post_author <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, link, read)
    values (post_author, new.user_id, 'group_reaction',
            '/groupe?g=' || new.group_id::text, false);
  end if;
  return new;
end; $$;
drop trigger if exists trg_notif_group_reaction on public.group_reactions;
create trigger trg_notif_group_reaction after insert on public.group_reactions
  for each row execute function public.notif_on_group_reaction();
