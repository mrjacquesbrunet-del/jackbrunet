-- ============================================================
--  1. Suivre une conversation : quand quelqu'un commente un sujet
--     que j'ai commenté (ou que je suis), je suis prévenu.
--  2. Stories : texte sur fond coloré (sans photo), mentions
--     (@pseudo, prévenu et autorisé à voir la story), stories
--     « à la une » sur le profil.
--  Supabase → SQL Editor → Run. Relançable sans risque.
-- ============================================================

-- Nouveaux types de notification : 'conversation' et 'story_mention'
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in (
    'pray','heart','comment','follow','mention','admin','message','reply',
    'group_comment','group_reaction','group_post','group_message','group_join',
    'comment_reaction','pray_digest','follow_up','challenge','friend_score',
    'duo_invite','duo_accept','duo_read','duo_note','priere_direct','podcast',
    'invitation','avec_jesus','conversation','story_mention'
  ));

-- ===== 1. Suivre une conversation =====
-- actif = true : je suis ce sujet ; false : je ne veux plus être prévenu.
-- Sans ligne : je suis la conversation dès que j'y ai commenté.
create table if not exists public.conversation_suivis (
  user_id   uuid not null references auth.users(id) on delete cascade,
  prayer_id uuid not null references public.prayers(id) on delete cascade,
  actif     boolean not null default true,
  primary key (user_id, prayer_id)
);
alter table public.conversation_suivis enable row level security;
drop policy if exists cs_mine on public.conversation_suivis;
create policy cs_mine on public.conversation_suivis for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.conversation_suivie(p_prayer uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select actif from public.conversation_suivis where user_id = auth.uid() and prayer_id = p_prayer),
    exists (select 1 from public.prayer_comments where prayer_id = p_prayer and author_id = auth.uid())
  );
$$;
grant execute on function public.conversation_suivie(uuid) to authenticated;

create or replace function public.suivre_conversation(p_prayer uuid, p_actif boolean)
returns void language sql security definer set search_path = public as $$
  insert into public.conversation_suivis (user_id, prayer_id, actif)
  values (auth.uid(), p_prayer, p_actif)
  on conflict (user_id, prayer_id) do update set actif = excluded.actif;
$$;
grant execute on function public.suivre_conversation(uuid, boolean) to authenticated;

-- À chaque nouveau commentaire : prévenir ceux qui suivent la conversation
-- (sauf l'auteur du commentaire, l'auteur du sujet — déjà prévenu — et
-- l'auteur du commentaire auquel on répond — déjà prévenu). Une seule
-- notification non lue par sujet et par personne (pas d'avalanche).
create or replace function public.notifier_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  auteur_sujet uuid;
  auteur_parent uuid;
begin
  if new.prayer_id is null then return new; end if;
  select author_id into auteur_sujet from public.prayers where id = new.prayer_id;
  if new.parent_id is not null then
    select author_id into auteur_parent from public.prayer_comments where id = new.parent_id;
  end if;
  insert into public.notifications (user_id, actor_id, type, prayer_id, comment_id, link)
  select d.uid, new.author_id, 'conversation', new.prayer_id, new.id,
         '/communaute/?prayer=' || new.prayer_id || '&c=' || new.id
  from (
    select c.author_id as uid from public.prayer_comments c where c.prayer_id = new.prayer_id
    union
    select s.user_id from public.conversation_suivis s where s.prayer_id = new.prayer_id and s.actif
  ) d
  where d.uid <> new.author_id
    and d.uid is distinct from auteur_sujet
    and d.uid is distinct from auteur_parent
    and not exists (select 1 from public.conversation_suivis s
                    where s.user_id = d.uid and s.prayer_id = new.prayer_id and not s.actif)
    and not exists (select 1 from public.notifications n
                    where n.user_id = d.uid and n.type = 'conversation'
                      and n.prayer_id = new.prayer_id and not n.read)
    and not exists (select 1 from public.blocks b
                    where (b.blocker_id = d.uid and b.blocked_id = new.author_id)
                       or (b.blocker_id = new.author_id and b.blocked_id = d.uid));
  return new;
end $$;
drop trigger if exists trg_notifier_conversation on public.prayer_comments;
create trigger trg_notifier_conversation after insert on public.prayer_comments
  for each row execute function public.notifier_conversation();

-- ===== 2. Stories : texte sur fond coloré + mentions =====
alter table public.stories alter column image_url drop not null;
alter table public.stories add column if not exists fond text;
alter table public.stories add column if not exists mentions uuid[] not null default '{}';

-- Une personne mentionnée peut voir la story, même sans suivre l'auteur.
drop policy if exists stories_mentionne_lit on public.stories;
create policy stories_mentionne_lit on public.stories for select
  using (auth.uid() = any(mentions));

create or replace function public.notifier_mentions_story()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, actor_id, type, link)
  select distinct m, new.author_id, 'story_mention', '/profil/?story=' || new.author_id
  from unnest(new.mentions) m
  where m <> new.author_id
    and not exists (select 1 from public.blocks b
                    where (b.blocker_id = m and b.blocked_id = new.author_id)
                       or (b.blocker_id = new.author_id and b.blocked_id = m));
  return new;
end $$;
drop trigger if exists trg_notifier_mentions_story on public.stories;
create trigger trg_notifier_mentions_story after insert on public.stories
  for each row execute function public.notifier_mentions_story();

-- ===== 3. Stories à la une (restent sur le profil) =====
create table if not exists public.story_alaune (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  titre      text not null check (char_length(titre) between 1 and 30),
  position   int not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.story_alaune_items (
  id         uuid primary key default gen_random_uuid(),
  alaune_id  uuid not null references public.story_alaune(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  image_url  text,
  caption    text,
  fond       text,
  created_at timestamptz not null default now()
);
create index if not exists story_alaune_user_idx on public.story_alaune(user_id, position);
create index if not exists story_alaune_items_idx on public.story_alaune_items(alaune_id, created_at);
alter table public.story_alaune enable row level security;
alter table public.story_alaune_items enable row level security;

-- Visibles par les membres connectés (comme le profil) ; gérées par leur auteur.
drop policy if exists sa_lire on public.story_alaune;
create policy sa_lire on public.story_alaune for select to authenticated using (true);
drop policy if exists sa_gerer on public.story_alaune;
create policy sa_gerer on public.story_alaune for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists sai_lire on public.story_alaune_items;
create policy sai_lire on public.story_alaune_items for select to authenticated using (true);
drop policy if exists sai_gerer on public.story_alaune_items;
create policy sai_gerer on public.story_alaune_items for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid()
              and exists (select 1 from public.story_alaune a where a.id = alaune_id and a.user_id = auth.uid()));
