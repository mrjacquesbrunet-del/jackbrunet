-- ============================================================
-- PLAN DE LECTURE À DEUX
-- À exécuter dans Supabase → SQL Editor → Run. Idempotent (ré-exécutable).
--
-- Ce que ça active :
--  1. plan_duos        : l'invitation « faisons ce plan ensemble » et son état.
--  2. plan_duo_checks  : les jours terminés par chacun (progression croisée).
--  3. plan_duo_notes   : les notes/commentaires PRIVÉS du binôme, par jour —
--     seules les deux personnes du duo peuvent les lire (RLS).
--  4. Notifications (et push automatique via le webhook notify-push déjà
--     branché) : invitation reçue, invitation acceptée, « X a lu le jour N »,
--     nouvelle note laissée.
-- ============================================================

-- 1) Le duo (invitation puis binôme actif)
create table if not exists public.plan_duos (
  id uuid primary key default gen_random_uuid(),
  plan_slug text not null,
  plan_title text not null default '',
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  invitee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'declined', 'ended')),
  created_at timestamptz not null default now(),
  check (inviter_id <> invitee_id)
);
-- Un seul duo en cours (invitation ou actif) par plan et par paire.
create unique index if not exists plan_duos_one_live
  on public.plan_duos (plan_slug, inviter_id, invitee_id)
  where status in ('pending', 'active');

alter table public.plan_duos enable row level security;
drop policy if exists "duos_select" on public.plan_duos;
create policy "duos_select" on public.plan_duos
  for select using (auth.uid() in (inviter_id, invitee_id));
drop policy if exists "duos_insert" on public.plan_duos;
create policy "duos_insert" on public.plan_duos
  for insert with check (auth.uid() = inviter_id);
drop policy if exists "duos_update" on public.plan_duos;
create policy "duos_update" on public.plan_duos
  for update using (auth.uid() in (inviter_id, invitee_id));
drop policy if exists "duos_delete" on public.plan_duos;
create policy "duos_delete" on public.plan_duos
  for delete using (auth.uid() in (inviter_id, invitee_id));

-- 2) Les jours terminés par chacun
create table if not exists public.plan_duo_checks (
  duo_id uuid not null references public.plan_duos(id) on delete cascade,
  user_id uuid not null,
  day int not null check (day between 1 and 400),
  created_at timestamptz not null default now(),
  primary key (duo_id, user_id, day)
);
alter table public.plan_duo_checks enable row level security;
drop policy if exists "duochecks_select" on public.plan_duo_checks;
create policy "duochecks_select" on public.plan_duo_checks
  for select using (
    exists (select 1 from public.plan_duos d
            where d.id = duo_id and auth.uid() in (d.inviter_id, d.invitee_id))
  );
drop policy if exists "duochecks_insert" on public.plan_duo_checks;
create policy "duochecks_insert" on public.plan_duo_checks
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.plan_duos d
                where d.id = duo_id and d.status = 'active'
                  and auth.uid() in (d.inviter_id, d.invitee_id))
  );
drop policy if exists "duochecks_delete" on public.plan_duo_checks;
create policy "duochecks_delete" on public.plan_duo_checks
  for delete using (user_id = auth.uid());

-- 3) Les notes privées du binôme (par jour)
create table if not exists public.plan_duo_notes (
  id uuid primary key default gen_random_uuid(),
  duo_id uuid not null references public.plan_duos(id) on delete cascade,
  author_id uuid not null,
  day int not null check (day between 1 and 400),
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
alter table public.plan_duo_notes enable row level security;
drop policy if exists "duonotes_select" on public.plan_duo_notes;
create policy "duonotes_select" on public.plan_duo_notes
  for select using (
    exists (select 1 from public.plan_duos d
            where d.id = duo_id and auth.uid() in (d.inviter_id, d.invitee_id))
  );
drop policy if exists "duonotes_insert" on public.plan_duo_notes;
create policy "duonotes_insert" on public.plan_duo_notes
  for insert with check (
    author_id = auth.uid()
    and exists (select 1 from public.plan_duos d
                where d.id = duo_id and d.status = 'active'
                  and auth.uid() in (d.inviter_id, d.invitee_id))
  );
drop policy if exists "duonotes_delete" on public.plan_duo_notes;
create policy "duonotes_delete" on public.plan_duo_notes
  for delete using (author_id = auth.uid());

-- 4) Types de notifications
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in (
    'pray','heart','comment','follow','mention','admin','message','reply',
    'group_comment','group_reaction','group_post','group_message','group_join',
    'comment_reaction','pray_digest','follow_up','challenge','friend_score',
    'duo_invite','duo_accept','duo_read','duo_note'
  ));

-- 5) Invitation envoyée → notifier l'invité
create or replace function public.notify_duo_invite()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'pending' then
    insert into public.notifications (user_id, actor_id, type, body, link)
    values (new.invitee_id, new.inviter_id, 'duo_invite',
            't''invite à faire « ' || new.plan_title || ' » à deux',
            '/plans/' || new.plan_slug || '/');
  end if;
  return new;
end $$;
drop trigger if exists trg_notify_duo_invite on public.plan_duos;
create trigger trg_notify_duo_invite
  after insert on public.plan_duos
  for each row execute function public.notify_duo_invite();

-- 6) Invitation acceptée → notifier l'inviteur
create or replace function public.notify_duo_accept()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'active' and old.status = 'pending' then
    insert into public.notifications (user_id, actor_id, type, body, link)
    values (new.inviter_id, new.invitee_id, 'duo_accept',
            'a accepté : vous faites « ' || new.plan_title || ' » ensemble',
            '/plans/' || new.plan_slug || '/');
  end if;
  return new;
end $$;
drop trigger if exists trg_notify_duo_accept on public.plan_duos;
create trigger trg_notify_duo_accept
  after update on public.plan_duos
  for each row execute function public.notify_duo_accept();

-- 7) Jour lu → notifier le binôme (anti-spam : une seule non-lue à la fois
--    par duo et par lecteur, pour éviter la rafale au rattrapage)
create or replace function public.notify_duo_read()
returns trigger language plpgsql security definer set search_path = public as $$
declare d record; other uuid;
begin
  select * into d from public.plan_duos where id = new.duo_id;
  if d.id is null then return new; end if;
  other := case when new.user_id = d.inviter_id then d.invitee_id else d.inviter_id end;
  if not exists (
    select 1 from public.notifications
    where user_id = other and actor_id = new.user_id
      and type = 'duo_read' and read = false
      and link = '/plans/' || d.plan_slug || '/'
  ) then
    insert into public.notifications (user_id, actor_id, type, body, link)
    values (other, new.user_id, 'duo_read',
            'a lu le jour ' || new.day || ' de « ' || d.plan_title || ' »',
            '/plans/' || d.plan_slug || '/');
  end if;
  return new;
end $$;
drop trigger if exists trg_notify_duo_read on public.plan_duo_checks;
create trigger trg_notify_duo_read
  after insert on public.plan_duo_checks
  for each row execute function public.notify_duo_read();

-- 8) Note laissée → notifier le binôme (même anti-spam)
create or replace function public.notify_duo_note()
returns trigger language plpgsql security definer set search_path = public as $$
declare d record; other uuid;
begin
  select * into d from public.plan_duos where id = new.duo_id;
  if d.id is null then return new; end if;
  other := case when new.author_id = d.inviter_id then d.invitee_id else d.inviter_id end;
  if not exists (
    select 1 from public.notifications
    where user_id = other and actor_id = new.author_id
      and type = 'duo_note' and read = false
      and link = '/plans/' || d.plan_slug || '/'
  ) then
    insert into public.notifications (user_id, actor_id, type, body, link)
    values (other, new.author_id, 'duo_note',
            't''a laissé une note sur « ' || d.plan_title || ' » (jour ' || new.day || ')',
            '/plans/' || d.plan_slug || '/');
  end if;
  return new;
end $$;
drop trigger if exists trg_notify_duo_note on public.plan_duo_notes;
create trigger trg_notify_duo_note
  after insert on public.plan_duo_notes
  for each row execute function public.notify_duo_note();
