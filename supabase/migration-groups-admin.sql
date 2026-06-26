-- ============================================================
--  MIGRATION : groupes de prière + modération admin + emails
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
-- ============================================================

-- 0) ADMIN ---------------------------------------------------
-- L'administrateur (Jack) est identifié par son email.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((auth.jwt() ->> 'email') = 'mr.jacquesbrunet@gmail.com', false);
$$;

-- Modération : l'admin peut supprimer n'importe quel commentaire / prière.
drop policy if exists "comments_delete_admin" on public.prayer_comments;
create policy "comments_delete_admin" on public.prayer_comments
  for delete using (public.is_admin());

drop policy if exists "prayers_delete_admin" on public.prayers;
create policy "prayers_delete_admin" on public.prayers
  for delete using (public.is_admin());

-- Liste des emails des inscrits (réservée à l'admin) — pour la newsletter.
create or replace function public.admin_emails()
returns table(email text, pseudo text, inscrit_le timestamptz)
language sql stable security definer set search_path = public as $$
  select u.email, p.pseudo, u.created_at
  from auth.users u
  left join public.profiles p on p.id = u.id
  where public.is_admin()
  order by u.created_at desc;
$$;

-- 1) GROUPES -------------------------------------------------
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index if not exists group_members_user_idx on public.group_members (user_id);

-- Est-ce que `uid` est membre du groupe `gid` ? (contourne la RLS)
create or replace function public.is_group_member(gid uuid, uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.group_members m where m.group_id = gid and m.user_id = uid
  );
$$;

create or replace function public.is_group_owner(gid uuid, uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.groups g where g.id = gid and g.owner_id = uid
  );
$$;

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

-- Groupes : visibles par leurs membres ; créés/gérés par le propriétaire.
drop policy if exists "groups_read" on public.groups;
create policy "groups_read" on public.groups
  for select using (owner_id = auth.uid() or public.is_group_member(id, auth.uid()));

drop policy if exists "groups_insert" on public.groups;
create policy "groups_insert" on public.groups
  for insert with check (owner_id = auth.uid());

drop policy if exists "groups_update_owner" on public.groups;
create policy "groups_update_owner" on public.groups
  for update using (owner_id = auth.uid());

drop policy if exists "groups_delete_owner" on public.groups;
create policy "groups_delete_owner" on public.groups
  for delete using (owner_id = auth.uid());

-- Membres : lisibles par les membres du groupe ; gérés par le propriétaire.
drop policy if exists "gm_read" on public.group_members;
create policy "gm_read" on public.group_members
  for select using (
    public.is_group_member(group_id, auth.uid()) or public.is_group_owner(group_id, auth.uid())
  );

drop policy if exists "gm_insert_owner" on public.group_members;
create policy "gm_insert_owner" on public.group_members
  for insert with check (public.is_group_owner(group_id, auth.uid()));

drop policy if exists "gm_delete_owner_or_self" on public.group_members;
create policy "gm_delete_owner_or_self" on public.group_members
  for delete using (public.is_group_owner(group_id, auth.uid()) or user_id = auth.uid());

-- À la création d'un groupe, le propriétaire en devient membre (owner).
create or replace function public.handle_new_group()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.group_members (group_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict do nothing;
  return new;
end; $$;

drop trigger if exists on_group_created on public.groups;
create trigger on_group_created
  after insert on public.groups
  for each row execute function public.handle_new_group();

-- 2) PRIÈRES DE GROUPE --------------------------------------
alter table public.prayers add column if not exists group_id uuid references public.groups(id) on delete cascade;
create index if not exists prayers_group_idx on public.prayers (group_id, created_at desc);

-- Recalcule la visibilité : une prière de groupe n'est visible que par ses membres.
drop policy if exists "prayers_read_visible" on public.prayers;
create policy "prayers_read_visible" on public.prayers
  for select using (
    author_id = auth.uid()
    or (group_id is not null and public.is_group_member(group_id, auth.uid()))
    or (group_id is null and visibility = 'public')
    or (group_id is null and visibility = 'friends' and public.is_following(auth.uid(), author_id))
  );
