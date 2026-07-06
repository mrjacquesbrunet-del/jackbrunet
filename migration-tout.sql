-- ============================================================
--  MIGRATION COMPLETE — Jack BRUNET : Foi & Priere
--  A coller UNE SEULE FOIS dans Supabase -> SQL Editor -> Run.
--  Debloque : admin/certifie, activite & points, reponses aux
--  commentaires, messagerie privee, suppression de compte,
--  et le bouton Epingler (admin).
--  100% idempotent : sans risque si deja partiellement execute.
-- ============================================================

-- ========== 1) ADMIN / CERTIFICATION / MODERATION ==========
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
  -- Ne s'applique qu'aux vrais utilisateurs connectés (pas aux opérations
  -- serveur/admin où auth.uid() est nul).
  if auth.uid() is not null
     and regexp_replace(lower(coalesce(new.pseudo,'')), '[^a-z0-9]', '', 'g')
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
  -- Pour un vrai utilisateur connecté : la certification = est-il admin ?
  -- (impossible à falsifier). Les opérations serveur/admin (auth.uid() nul)
  -- conservent la valeur fournie (utile pour le backfill).
  if auth.uid() is not null then
    new.verified := public.is_admin();
  end if;
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

-- ========== 2) ACTIVITE & POINTS ==========
-- Activité & gamification: compte l'activité réelle d'un membre.
-- Corrige « Mon activité » (0 partout) et les points de grade.
-- À exécuter dans Supabase → SQL Editor.
--
--   prayers  = sujets de prière publiés (prayers.author_id)
--   comments = encouragements écrits (prayer_comments.author_id)
--   prays    = « Je prie » posés pour les autres (prayer_reactions type='pray')

create or replace function public.user_activity(uid uuid)
returns table(prayers int, comments int, prays int)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*)::int from prayers          where author_id = uid),
    (select count(*)::int from prayer_comments   where author_id = uid),
    (select count(*)::int from prayer_reactions  where user_id = uid and type = 'pray');
$$;

grant execute on function public.user_activity(uuid) to anon, authenticated;

-- ========== 3) REPONSES AUX COMMENTAIRES ==========
-- Réponses aux commentaires du mur de prière (fil à un niveau).
-- À exécuter dans Supabase → SQL Editor.
--
-- Ajoute une colonne parent_id: une réponse pointe vers le commentaire parent.
-- Si le commentaire parent est supprimé, ses réponses le sont aussi (cascade).

alter table public.prayer_comments
  add column if not exists parent_id uuid
  references public.prayer_comments(id) on delete cascade;

create index if not exists prayer_comments_parent_idx
  on public.prayer_comments(parent_id);

-- ========== 4) MESSAGERIE PRIVEE ==========
-- Messagerie privée entre membres (1 à 1). À exécuter dans Supabase → SQL Editor.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

create index if not exists messages_pair_idx on public.messages(sender_id, recipient_id, created_at);
create index if not exists messages_recipient_idx on public.messages(recipient_id, read);

alter table public.messages enable row level security;

drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert with check (auth.uid() = sender_id);

drop policy if exists messages_update_read on public.messages;
create policy messages_update_read on public.messages
  for update using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

-- Liste des conversations: dernier message + non-lus par interlocuteur.
create or replace function public.my_conversations()
returns table(partner_id uuid, last_body text, last_at timestamptz, unread int)
language sql
stable
security definer
set search_path = public
as $$
  with m as (
    select *,
      case when sender_id = auth.uid() then recipient_id else sender_id end as partner
    from messages
    where sender_id = auth.uid() or recipient_id = auth.uid()
  )
  select distinct on (partner)
    partner as partner_id,
    body as last_body,
    created_at as last_at,
    (select count(*)::int from messages x
       where x.recipient_id = auth.uid() and x.sender_id = m.partner and x.read = false) as unread
  from m
  order by partner, created_at desc;
$$;
grant execute on function public.my_conversations() to authenticated;

-- Nombre total de messages non lus.
create or replace function public.unread_messages()
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from messages where recipient_id = auth.uid() and read = false;
$$;
grant execute on function public.unread_messages() to authenticated;

-- ========== 5) SUPPRESSION DE COMPTE ==========
-- Suppression de compte (exigence App Store, règle 5.1.1 / 4.0).
-- À exécuter une fois dans Supabase → SQL Editor → Run.
--
-- Permet à un utilisateur connecté de supprimer définitivement son propre
-- compte (et, par cascade des clés étrangères, ses données associées).

create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  -- Supprime le compte d'authentification ; les données liées partent en
  -- cascade si les clés étrangères sont configurées « on delete cascade ».
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_user() to authenticated;

-- ========== 6) EPINGLER UN SUJET (ADMIN) ==========
-- ============================================================
--  Épingler un sujet de prière (réservé à l'admin).
--  À exécuter dans Supabase → SQL Editor.
--  (Nécessite public.is_admin(), créée par migration-admin.sql.)
-- ============================================================

alter table public.prayers add column if not exists pinned boolean not null default false;

-- Fonction sécurisée : seul un admin peut épingler/désépingler.
create or replace function public.set_prayer_pinned(pid uuid, val boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Réservé à l''administrateur';
  end if;
  update public.prayers set pinned = val where id = pid;
end;
$$;

grant execute on function public.set_prayer_pinned(uuid, boolean) to authenticated;
