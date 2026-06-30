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

-- ---------- 5) Pseudos réservés à Pasteur Jack ----------
-- Toutes variantes (jack_brnt, jack brunet, jack-brunet…) → normalisées
-- en supprimant tout sauf lettres/chiffres : 'jackbrnt' / 'jackbrunet'.
-- Seul un compte admin peut les utiliser.
create or replace function public.enforce_reserved_pseudo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if regexp_replace(lower(coalesce(new.pseudo,'')), '[^a-z0-9]', '', 'g')
       in ('jackbrnt','jackbrunet','pasteurjack','pasteurjackbrunet',
           'pasteurjackbrnt','jackbrunetofficiel','pasteurbrunet')
     and not public.is_admin() then
    raise exception 'Ce pseudo est réservé à Pasteur Jack Brunet.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_reserved_pseudo on public.profiles;
create trigger trg_reserved_pseudo
  before insert or update on public.profiles
  for each row execute function public.enforce_reserved_pseudo();

-- ---------- 5b) Retirer un abonné ----------
-- Permet à un membre de supprimer un abonné (ligne où il est le suivi).
-- (Le désabonnement classique, où l'on est le suiveur, reste géré par la
--  policy existante.)
drop policy if exists "follows_delete_followed" on public.follows;
create policy "follows_delete_followed" on public.follows
  for delete using (auth.uid() = following_id);

-- ---------- 6) Encoche "certifié" (réservée aux admins) ----------
alter table public.profiles add column if not exists verified boolean not null default false;

-- À chaque écriture, on (re)calcule la certification : true seulement si
-- l'auteur du profil est admin. Impossible à falsifier par un membre.
create or replace function public.set_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.verified := public.is_admin();
  return new;
end;
$$;

drop trigger if exists trg_set_verified on public.profiles;
create trigger trg_set_verified
  before insert or update on public.profiles
  for each row execute function public.set_verified();

-- Backfill : certifier les comptes admin déjà existants.
update public.profiles p set verified = true
from auth.users u
where u.id = p.id
  and lower(u.email) in ('contact@jackbrunet.com','mr.jacquesbrunet@gmail.com');
