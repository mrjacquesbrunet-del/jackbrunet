-- ============================================================
--  Admin : modération + notifications à tous les membres
--  + unicité du pseudo.
--  À exécuter une fois dans Supabase → SQL Editor.
--  Emails admin : adapte la liste ci-dessous si besoin.
-- ============================================================

-- ---------- 0) Helper : email courant est-il admin ? ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email','')) in
    ('contact@jackbrunet.com','mr.jacquesbrunet@gmail.com');
$$;

-- ---------- 1) Notifications : colonnes message + lien ----------
alter table public.notifications add column if not exists body text;
alter table public.notifications add column if not exists link text;

-- Autoriser les types 'mention' et 'admin' (remplace la contrainte CHECK).
do $$
declare cname text;
begin
  select conname into cname
  from pg_constraint
  where conrelid = 'public.notifications'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%type%';
  if cname is not null then
    execute format('alter table public.notifications drop constraint %I', cname);
  end if;
exception when others then null;
end $$;

do $$
begin
  alter table public.notifications
    add constraint notifications_type_check
    check (type in ('pray','heart','comment','follow','mention','admin'));
exception when others then null;
end $$;

-- ---------- 2) Diffusion : notifier TOUS les membres ----------
create or replace function public.broadcast_notification(message text, link text default null)
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
  select p.id, auth.uid(), 'admin', message, link, false
  from public.profiles p;
  get diagnostics n = row_count;
  return n;
end;
$$;

grant execute on function public.broadcast_notification(text, text) to authenticated;

-- ---------- 3) Modération : l'admin peut supprimer ----------
-- Sujets de prière
drop policy if exists "prayers_delete_admin" on public.prayers;
create policy "prayers_delete_admin" on public.prayers
  for delete using (public.is_admin());

-- Commentaires
drop policy if exists "comments_delete_admin" on public.prayer_comments;
create policy "comments_delete_admin" on public.prayer_comments
  for delete using (public.is_admin());

-- ---------- 4) Unicité du pseudo (insensible à la casse) ----------
-- (si des doublons existent déjà, les dédoublonner avant de créer l'index)
create unique index if not exists profiles_pseudo_unique
  on public.profiles (lower(pseudo));
