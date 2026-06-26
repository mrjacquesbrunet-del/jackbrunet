-- ============================================================
--  MIGRATION : notifications + grades de prière
--  À coller dans Supabase → SQL Editor → Run.
--  Sûr à relancer.
-- ============================================================

-- 1) ACTIVITÉ (pour les grades de prière) --------------------
-- Compte (en contournant la RLS, donc fiable et identique pour tous)
-- le nombre de prières publiées, de commentaires écrits et de « je prie ».
create or replace function public.user_activity(uid uuid)
returns table(prayers int, comments int, prays int)
language sql stable security definer set search_path = public as $$
  select
    (select count(*) from public.prayers where author_id = uid)::int,
    (select count(*) from public.prayer_comments where author_id = uid)::int,
    (select count(*) from public.prayer_reactions where user_id = uid and type = 'pray')::int;
$$;

-- 2) NOTIFICATIONS -------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,   -- destinataire
  actor_id uuid references auth.users(id) on delete cascade,           -- qui a agi
  type text not null check (type in ('pray','heart','comment','follow')),
  prayer_id uuid references public.prayers(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_read_own" on public.notifications;
create policy "notifications_read_own" on public.notifications
  for select using (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid());

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own" on public.notifications
  for delete using (user_id = auth.uid());

-- Notif quand quelqu'un réagit (🙏 / ❤️) à ta prière
create or replace function public.notify_on_reaction()
returns trigger language plpgsql security definer set search_path = public as $$
declare aid uuid;
begin
  select author_id into aid from public.prayers where id = new.prayer_id;
  if aid is not null and aid <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, prayer_id)
    values (aid, new.user_id, new.type, new.prayer_id);
  end if;
  return new;
end; $$;

drop trigger if exists on_reaction_notify on public.prayer_reactions;
create trigger on_reaction_notify
  after insert on public.prayer_reactions
  for each row execute function public.notify_on_reaction();

-- Notif quand quelqu'un commente ta prière
create or replace function public.notify_on_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare aid uuid;
begin
  select author_id into aid from public.prayers where id = new.prayer_id;
  if aid is not null and aid <> new.author_id then
    insert into public.notifications (user_id, actor_id, type, prayer_id)
    values (aid, new.author_id, 'comment', new.prayer_id);
  end if;
  return new;
end; $$;

drop trigger if exists on_comment_notify on public.prayer_comments;
create trigger on_comment_notify
  after insert on public.prayer_comments
  for each row execute function public.notify_on_comment();

-- Notif quand quelqu'un s'abonne à toi
create or replace function public.notify_on_follow()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, actor_id, type)
  values (new.following_id, new.follower_id, 'follow');
  return new;
end; $$;

drop trigger if exists on_follow_notify on public.follows;
create trigger on_follow_notify
  after insert on public.follows
  for each row execute function public.notify_on_follow();
