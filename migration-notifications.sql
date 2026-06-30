-- ============================================================
--  Système de notifications (cloche) — table + déclencheurs.
--  Crée la table manquante et la remplit automatiquement quand
--  quelqu'un prie, aime, commente ou s'abonne.
--  À exécuter dans Supabase → SQL Editor (AVANT migration-admin.sql).
-- ============================================================

-- 1) Table des notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete cascade,
  type text not null check (type in ('pray','heart','comment','follow','mention','admin')),
  prayer_id uuid references public.prayers(id) on delete cascade,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

-- 2) Sécurité : chacun ne voit/màj que ses propres notifications.
alter table public.notifications enable row level security;

drop policy if exists "notif_select_own" on public.notifications;
create policy "notif_select_own" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "notif_update_own" on public.notifications;
create policy "notif_update_own" on public.notifications
  for update using (auth.uid() = user_id);

drop policy if exists "notif_delete_own" on public.notifications;
create policy "notif_delete_own" on public.notifications
  for delete using (auth.uid() = user_id);

-- 3) Déclencheurs : créent la notification pour la bonne personne.
--    (security definer → contournent la RLS pour notifier autrui)

-- Réaction (je prie / j'aime) → notifie l'auteur du sujet
create or replace function public.notif_on_reaction()
returns trigger language plpgsql security definer set search_path = public as $$
declare author uuid;
begin
  select author_id into author from public.prayers where id = new.prayer_id;
  if author is not null and author <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, prayer_id, read)
    values (author, new.user_id, new.type, new.prayer_id, false);
  end if;
  return new;
end; $$;
drop trigger if exists trg_notif_reaction on public.prayer_reactions;
create trigger trg_notif_reaction after insert on public.prayer_reactions
  for each row execute function public.notif_on_reaction();

-- Commentaire → notifie l'auteur du sujet
create or replace function public.notif_on_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare author uuid;
begin
  select author_id into author from public.prayers where id = new.prayer_id;
  if author is not null and author <> new.author_id then
    insert into public.notifications (user_id, actor_id, type, prayer_id, read)
    values (author, new.author_id, 'comment', new.prayer_id, false);
  end if;
  return new;
end; $$;
drop trigger if exists trg_notif_comment on public.prayer_comments;
create trigger trg_notif_comment after insert on public.prayer_comments
  for each row execute function public.notif_on_comment();

-- Nouvel abonné → notifie la personne suivie
create or replace function public.notif_on_follow()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, actor_id, type, read)
  values (new.following_id, new.follower_id, 'follow', false);
  return new;
end; $$;
drop trigger if exists trg_notif_follow on public.follows;
create trigger trg_notif_follow after insert on public.follows
  for each row execute function public.notif_on_follow();
