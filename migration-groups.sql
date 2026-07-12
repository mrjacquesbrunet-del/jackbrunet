-- ============================================================
--  Groupes fermés (type groupe Facebook privé).
--  A coller dans Supabase -> SQL Editor -> Run.
--  Necessite: table profiles, notifications (migration-tout.sql).
--
--  Fonctionnalites:
--   - Repertoire de groupes (publics), recherche, demande a rejoindre.
--   - Acces par lien / code d'invitation (rejoint automatiquement).
--   - Feed par groupe (posts, commentaires, reactions emoji).
--   - Chat de groupe.
--   - Personnalisation (nom, verset, couleur d'accent).
--  Securite: seuls les membres approuves voient/ecrivent dans un groupe.
-- ============================================================

-- ---------- Tables ----------
create table if not exists public.groups (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text not null default '',
  verse_text       text not null default '',
  verse_reference  text not null default '',
  accent           text not null default 'lime',
  invite_code      text not null unique,
  is_public        boolean not null default true,
  owner_id         uuid not null,
  created_at       timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id   uuid not null references public.groups(id) on delete cascade,
  user_id    uuid not null,
  role       text not null default 'member',   -- owner | admin | member
  status     text not null default 'approved', -- pending | approved
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.group_posts (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  author_id  uuid not null,
  body       text not null,
  kind       text not null default 'post',     -- post | plan | percee | priere
  created_at timestamptz not null default now()
);

create table if not exists public.group_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.group_posts(id) on delete cascade,
  group_id   uuid not null references public.groups(id) on delete cascade,
  author_id  uuid not null,
  body       text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.group_reactions (
  post_id  uuid not null references public.group_posts(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id  uuid not null,
  emoji    text not null,
  primary key (post_id, user_id, emoji)
);

create table if not exists public.group_messages (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  author_id  uuid not null,
  body       text not null,
  created_at timestamptz not null default now()
);

create index if not exists group_members_user_idx on public.group_members(user_id);
create index if not exists group_posts_group_idx on public.group_posts(group_id, created_at desc);
create index if not exists group_messages_group_idx on public.group_messages(group_id, created_at);

-- ---------- Fonctions d'aide (security definer, evitent la recursion RLS) ----------
create or replace function public.is_group_member(gid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.group_members m
    where m.group_id = gid and m.user_id = auth.uid() and m.status = 'approved'
  );
$$;

create or replace function public.is_group_admin(gid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.group_members m
    where m.group_id = gid and m.user_id = auth.uid()
      and m.status = 'approved' and m.role in ('owner', 'admin')
  );
$$;

-- ---------- RLS ----------
alter table public.groups          enable row level security;
alter table public.group_members   enable row level security;
alter table public.group_posts     enable row level security;
alter table public.group_comments  enable row level security;
alter table public.group_reactions enable row level security;
alter table public.group_messages  enable row level security;

-- groups: repertoire public visible par tous; groupes prives visibles aux membres.
drop policy if exists groups_select on public.groups;
create policy groups_select on public.groups for select
  using (is_public or public.is_group_member(id) or owner_id = auth.uid());

drop policy if exists groups_insert on public.groups;
create policy groups_insert on public.groups for insert
  with check (owner_id = auth.uid());

drop policy if exists groups_update on public.groups;
create policy groups_update on public.groups for update
  using (owner_id = auth.uid() or public.is_group_admin(id))
  with check (owner_id = auth.uid() or public.is_group_admin(id));

drop policy if exists groups_delete on public.groups;
create policy groups_delete on public.groups for delete using (owner_id = auth.uid());

-- group_members
drop policy if exists gm_select on public.group_members;
create policy gm_select on public.group_members for select
  using (user_id = auth.uid() or public.is_group_member(group_id) or public.is_group_admin(group_id));

drop policy if exists gm_insert on public.group_members;
create policy gm_insert on public.group_members for insert
  with check (user_id = auth.uid());  -- on ne peut demander a rejoindre que pour soi

drop policy if exists gm_update on public.group_members;
create policy gm_update on public.group_members for update
  using (public.is_group_admin(group_id))
  with check (public.is_group_admin(group_id));

drop policy if exists gm_delete on public.group_members;
create policy gm_delete on public.group_members for delete
  using (user_id = auth.uid() or public.is_group_admin(group_id));

-- group_posts
drop policy if exists gp_select on public.group_posts;
create policy gp_select on public.group_posts for select using (public.is_group_member(group_id));
drop policy if exists gp_insert on public.group_posts;
create policy gp_insert on public.group_posts for insert
  with check (author_id = auth.uid() and public.is_group_member(group_id));
drop policy if exists gp_delete on public.group_posts;
create policy gp_delete on public.group_posts for delete
  using (author_id = auth.uid() or public.is_group_admin(group_id));

-- group_comments
drop policy if exists gc_select on public.group_comments;
create policy gc_select on public.group_comments for select using (public.is_group_member(group_id));
drop policy if exists gc_insert on public.group_comments;
create policy gc_insert on public.group_comments for insert
  with check (author_id = auth.uid() and public.is_group_member(group_id));
drop policy if exists gc_delete on public.group_comments;
create policy gc_delete on public.group_comments for delete
  using (author_id = auth.uid() or public.is_group_admin(group_id));

-- group_reactions
drop policy if exists gr_select on public.group_reactions;
create policy gr_select on public.group_reactions for select using (public.is_group_member(group_id));
drop policy if exists gr_insert on public.group_reactions;
create policy gr_insert on public.group_reactions for insert
  with check (user_id = auth.uid() and public.is_group_member(group_id));
drop policy if exists gr_delete on public.group_reactions;
create policy gr_delete on public.group_reactions for delete using (user_id = auth.uid());

-- group_messages
drop policy if exists gmsg_select on public.group_messages;
create policy gmsg_select on public.group_messages for select using (public.is_group_member(group_id));
drop policy if exists gmsg_insert on public.group_messages;
create policy gmsg_insert on public.group_messages for insert
  with check (author_id = auth.uid() and public.is_group_member(group_id));

-- ---------- RPCs ----------
-- Cree un groupe + rend le createur proprietaire (membre approuve).
create or replace function public.create_group(
  p_name text, p_description text, p_verse_text text,
  p_verse_reference text, p_accent text, p_is_public boolean
) returns public.groups language plpgsql security definer set search_path = public as $$
declare g public.groups;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  insert into public.groups (name, description, verse_text, verse_reference, accent, is_public, owner_id, invite_code)
  values (coalesce(nullif(btrim(p_name), ''), 'Mon groupe'), coalesce(p_description, ''),
          coalesce(p_verse_text, ''), coalesce(p_verse_reference, ''),
          coalesce(nullif(p_accent, ''), 'lime'), coalesce(p_is_public, true), auth.uid(),
          upper(substring(md5(gen_random_uuid()::text) for 7)))
  returning * into g;
  insert into public.group_members (group_id, user_id, role, status)
  values (g.id, auth.uid(), 'owner', 'approved');
  return g;
end; $$;

-- Rejoint un groupe via son code d'invitation (approuve immediatement).
create or replace function public.join_group_by_code(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare gid uuid;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  select id into gid from public.groups where invite_code = upper(btrim(p_code)) limit 1;
  if gid is null then raise exception 'Code invalide'; end if;
  insert into public.group_members (group_id, user_id, role, status)
  values (gid, auth.uid(), 'member', 'approved')
  on conflict (group_id, user_id) do update set status = 'approved';
  return gid;
end; $$;

grant execute on function public.create_group(text, text, text, text, text, boolean) to authenticated;
grant execute on function public.join_group_by_code(text) to authenticated;
