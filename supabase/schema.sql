-- ============================================================
--  Espace communautaire de prière — schéma Supabase
--  À coller dans Supabase → SQL Editor → Run.
--  Sûr à relancer (IF NOT EXISTS / OR REPLACE).
-- ============================================================

-- 1) PROFILS ---------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pseudo text not null default 'Ami(e)',
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_read_all" on public.profiles;
create policy "profiles_read_all" on public.profiles
  for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Crée automatiquement un profil à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, pseudo)
  values (new.id, coalesce(split_part(new.email, '@', 1), 'Ami(e)'))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) AMITIÉS ---------------------------------------------------
create table if not exists public.friendships (
  requester uuid not null references auth.users(id) on delete cascade,
  addressee uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  primary key (requester, addressee)
);

alter table public.friendships enable row level security;

drop policy if exists "friend_read_mine" on public.friendships;
create policy "friend_read_mine" on public.friendships
  for select using (auth.uid() = requester or auth.uid() = addressee);

drop policy if exists "friend_insert" on public.friendships;
create policy "friend_insert" on public.friendships
  for insert with check (auth.uid() = requester);

drop policy if exists "friend_update" on public.friendships;
create policy "friend_update" on public.friendships
  for update using (auth.uid() = addressee or auth.uid() = requester);

drop policy if exists "friend_delete" on public.friendships;
create policy "friend_delete" on public.friendships
  for delete using (auth.uid() = requester or auth.uid() = addressee);

-- Sont-ils amis (acceptés) ?
create or replace function public.are_friends(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and ((f.requester = a and f.addressee = b)
        or (f.requester = b and f.addressee = a))
  );
$$;

-- 3) PRIÈRES ---------------------------------------------------
create table if not exists public.prayers (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  visibility text not null default 'public' check (visibility in ('public','friends','private')),
  answered boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists prayers_created_idx on public.prayers (created_at desc);

alter table public.prayers enable row level security;

drop policy if exists "prayers_read_visible" on public.prayers;
create policy "prayers_read_visible" on public.prayers
  for select using (
    visibility = 'public'
    or author_id = auth.uid()
    or (visibility = 'friends' and public.are_friends(author_id, auth.uid()))
  );

drop policy if exists "prayers_insert_own" on public.prayers;
create policy "prayers_insert_own" on public.prayers
  for insert with check (author_id = auth.uid());

drop policy if exists "prayers_update_own" on public.prayers;
create policy "prayers_update_own" on public.prayers
  for update using (author_id = auth.uid());

drop policy if exists "prayers_delete_own" on public.prayers;
create policy "prayers_delete_own" on public.prayers
  for delete using (author_id = auth.uid());

-- 4) RÉACTIONS (❤️ / 🙏) --------------------------------------
create table if not exists public.prayer_reactions (
  prayer_id uuid not null references public.prayers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('heart','pray')),
  created_at timestamptz not null default now(),
  primary key (prayer_id, user_id, type)
);

alter table public.prayer_reactions enable row level security;

drop policy if exists "reactions_read" on public.prayer_reactions;
create policy "reactions_read" on public.prayer_reactions
  for select using (
    exists (select 1 from public.prayers p where p.id = prayer_id)
  );

drop policy if exists "reactions_insert_own" on public.prayer_reactions;
create policy "reactions_insert_own" on public.prayer_reactions
  for insert with check (user_id = auth.uid());

drop policy if exists "reactions_delete_own" on public.prayer_reactions;
create policy "reactions_delete_own" on public.prayer_reactions
  for delete using (user_id = auth.uid());

-- 5) COMMENTAIRES ---------------------------------------------
create table if not exists public.prayer_comments (
  id uuid primary key default gen_random_uuid(),
  prayer_id uuid not null references public.prayers(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists comments_prayer_idx on public.prayer_comments (prayer_id, created_at);

alter table public.prayer_comments enable row level security;

drop policy if exists "comments_read" on public.prayer_comments;
create policy "comments_read" on public.prayer_comments
  for select using (
    exists (select 1 from public.prayers p where p.id = prayer_id)
  );

drop policy if exists "comments_insert_own" on public.prayer_comments;
create policy "comments_insert_own" on public.prayer_comments
  for insert with check (author_id = auth.uid());

drop policy if exists "comments_delete_own" on public.prayer_comments;
create policy "comments_delete_own" on public.prayer_comments
  for delete using (author_id = auth.uid());

-- 6) (Optionnel) Stockage des avatars : créer un bucket "avatars" public
--    dans Supabase → Storage, puis autoriser l'upload par l'utilisateur.
