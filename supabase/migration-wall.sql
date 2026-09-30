-- ============================================================
-- LE MUR — réseau social du profil (étape 1)
-- Publications texte / verset / lien (réseaux connus uniquement),
-- visibilité Public ou Amis (= follow mutuel), réactions,
-- commentaires, relais. Modération via profiles.is_moderator.
-- ============================================================

create table if not exists public.wall_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null default '' check (char_length(body) <= 2000),
  visibility text not null default 'public' check (visibility in ('public','friends')),
  verse_ref text,
  verse_text text check (char_length(coalesce(verse_text,'')) <= 600),
  link_url text check (
    link_url is null
    or link_url ~* '^https?://([a-z0-9-]+\.)*(facebook\.com|fb\.watch|instagram\.com|tiktok\.com|youtube\.com|youtu\.be|jackbrunet\.com)([/?].*)?$'
  ),
  reshare_of uuid references public.wall_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (char_length(body) > 0 or verse_text is not null or link_url is not null or reshare_of is not null)
);
create index if not exists wall_posts_created_idx on public.wall_posts (created_at desc);
create index if not exists wall_posts_author_idx on public.wall_posts (author_id, created_at desc);

create table if not exists public.wall_reactions (
  post_id uuid not null references public.wall_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('pray','heart','dove','hands','sparkles')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.wall_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.wall_posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists wall_comments_post_idx on public.wall_comments (post_id, created_at);

-- Amis = les deux se suivent (aucune demande d'ami à gérer).
create or replace function public.are_friends(a uuid, b uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from follows where follower_id = a and following_id = b)
     and exists (select 1 from follows where follower_id = b and following_id = a);
$$;

alter table public.wall_posts enable row level security;
alter table public.wall_reactions enable row level security;
alter table public.wall_comments enable row level security;

drop policy if exists wall_posts_select on public.wall_posts;
create policy wall_posts_select on public.wall_posts for select using (
  visibility = 'public'
  or author_id = auth.uid()
  or (visibility = 'friends' and public.are_friends(auth.uid(), author_id))
);

drop policy if exists wall_posts_insert on public.wall_posts;
create policy wall_posts_insert on public.wall_posts for insert with check (author_id = auth.uid());

drop policy if exists wall_posts_update on public.wall_posts;
create policy wall_posts_update on public.wall_posts for update using (author_id = auth.uid());

drop policy if exists wall_posts_delete on public.wall_posts;
create policy wall_posts_delete on public.wall_posts for delete using (
  author_id = auth.uid()
  or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.is_moderator)
);

drop policy if exists wall_reactions_select on public.wall_reactions;
create policy wall_reactions_select on public.wall_reactions for select using (true);

drop policy if exists wall_reactions_insert on public.wall_reactions;
create policy wall_reactions_insert on public.wall_reactions for insert with check (user_id = auth.uid());

drop policy if exists wall_reactions_update on public.wall_reactions;
create policy wall_reactions_update on public.wall_reactions for update using (user_id = auth.uid());

drop policy if exists wall_reactions_delete on public.wall_reactions;
create policy wall_reactions_delete on public.wall_reactions for delete using (user_id = auth.uid());

drop policy if exists wall_comments_select on public.wall_comments;
create policy wall_comments_select on public.wall_comments for select using (
  exists (select 1 from public.wall_posts p where p.id = post_id)
);

drop policy if exists wall_comments_insert on public.wall_comments;
create policy wall_comments_insert on public.wall_comments for insert with check (author_id = auth.uid());

drop policy if exists wall_comments_delete on public.wall_comments;
create policy wall_comments_delete on public.wall_comments for delete using (
  author_id = auth.uid()
  or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.is_moderator)
);
