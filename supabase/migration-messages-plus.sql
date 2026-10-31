-- ============================================================
--  Messages privés façon WhatsApp : répondre à un message précis,
--  photo, modifier (15 min) et supprimer pour tous.
--  Réactions sur les commentaires et la discussion des groupes.
--  Supabase → SQL Editor → Run. Relançable sans risque.
-- ============================================================

-- 1. Nouvelles colonnes des messages privés.
alter table public.messages add column if not exists reply_to  uuid references public.messages(id) on delete set null;
alter table public.messages add column if not exists image_url text;
alter table public.messages add column if not exists edited_at  timestamptz;
alter table public.messages add column if not exists deleted_at timestamptz;

-- 2. Garde-fou : le destinataire ne peut changer QUE « lu / non lu »
--    (avant, la règle de mise à jour l'autorisait à toucher au texte).
--    Les modifications et suppressions passent par les fonctions ci-dessous.
create or replace function public.messages_garde()
returns trigger language plpgsql set search_path = public as $$
begin
  if coalesce(current_setting('rhema.msg_edit', true), '') <> '1'
     and auth.uid() is not null
     and (to_jsonb(new) - 'read') <> (to_jsonb(old) - 'read') then
    raise exception 'modification interdite';
  end if;
  return new;
end $$;
drop trigger if exists trg_messages_garde on public.messages;
create trigger trg_messages_garde before update on public.messages
  for each row execute function public.messages_garde();

-- 3. Modifier son message (texte seulement, dans les 15 minutes).
create or replace function public.modifier_message(p_id uuid, p_body text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if coalesce(trim(p_body), '') = '' then return false; end if;
  perform set_config('rhema.msg_edit', '1', true);
  update public.messages
     set body = trim(p_body), edited_at = now()
   where id = p_id and sender_id = auth.uid() and deleted_at is null
     and created_at > now() - interval '15 minutes';
  return found;
end $$;
grant execute on function public.modifier_message(uuid, text) to authenticated;

-- 4. Supprimer son message pour tout le monde (il reste « Message supprimé »).
create or replace function public.supprimer_message(p_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  perform set_config('rhema.msg_edit', '1', true);
  update public.messages
     set body = '', audio_url = null, image_url = null, story_image = null, deleted_at = now()
   where id = p_id and sender_id = auth.uid() and deleted_at is null;
  if found then
    delete from public.message_reactions where message_id = p_id;
  end if;
  return found;
end $$;
grant execute on function public.supprimer_message(uuid) to authenticated;

-- 5. Liste des conversations : aperçu « Photo », « Message vocal »,
--    « Message supprimé » au lieu d'un aperçu vide.
create or replace function public.my_conversations()
returns table(partner_id uuid, last_body text, last_at timestamptz, unread int)
language sql stable security definer set search_path = public as $$
  with m as (
    select *,
      case when sender_id = auth.uid() then recipient_id else sender_id end as partner
    from messages
    where sender_id = auth.uid() or recipient_id = auth.uid()
  )
  select distinct on (partner)
    partner as partner_id,
    case
      when deleted_at is not null then 'Message supprimé'
      when coalesce(body, '') <> '' then body
      when image_url is not null then 'Photo'
      when audio_url is not null then 'Message vocal'
      else ''
    end as last_body,
    created_at as last_at,
    (select count(*)::int from messages x
       where x.recipient_id = auth.uid() and x.sender_id = m.partner and x.read = false) as unread
  from m
  order by partner, created_at desc;
$$;
grant execute on function public.my_conversations() to authenticated;

-- 6. Temps réel : voir aussi les modifications / suppressions en direct.
alter table public.messages replica identity full;

-- 7. Réactions dans les groupes (commentaires des publications + discussion).
create table if not exists public.group_item_reactions (
  target_type text not null check (target_type in ('comment', 'message')),
  target_id   uuid not null,
  group_id    uuid not null references public.groups(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  emoji       text not null check (char_length(emoji) between 1 and 8),
  created_at  timestamptz not null default now(),
  primary key (target_type, target_id, user_id)
);
create index if not exists group_item_reactions_group_idx on public.group_item_reactions(group_id);
alter table public.group_item_reactions enable row level security;

drop policy if exists gir_select on public.group_item_reactions;
create policy gir_select on public.group_item_reactions for select
  using (public.is_group_member(group_id));
drop policy if exists gir_insert on public.group_item_reactions;
create policy gir_insert on public.group_item_reactions for insert
  with check (user_id = auth.uid() and public.is_group_member(group_id));
drop policy if exists gir_update on public.group_item_reactions;
create policy gir_update on public.group_item_reactions for update
  using (user_id = auth.uid()) with check (user_id = auth.uid() and public.is_group_member(group_id));
drop policy if exists gir_delete on public.group_item_reactions;
create policy gir_delete on public.group_item_reactions for delete
  using (user_id = auth.uid());

-- 8. Temps réel des commentaires du mur et des groupes.
do $$
declare t text;
begin
  foreach t in array array['prayer_comments', 'comment_reactions', 'group_comments', 'group_messages', 'group_item_reactions'] loop
    if not exists (select 1 from pg_publication_tables
                   where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
