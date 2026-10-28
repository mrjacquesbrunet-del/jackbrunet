-- ============================================================
--  Stories façon Instagram : qui a vu, j'aime, réponses en message.
--  À exécuter dans Supabase → SQL Editor. Sûr à relancer.
-- ============================================================

-- 1) Vues : l'heure de la vue, et l'auteur voit QUI a vu ses stories.
alter table public.story_views add column if not exists vu_le timestamptz not null default now();

drop policy if exists story_views_auteur_lit on public.story_views;
create policy story_views_auteur_lit on public.story_views for select using (
  exists (select 1 from public.stories s where s.id = story_views.story_id and s.author_id = auth.uid())
);

-- 2) J'aime sur une story.
create table if not exists public.story_likes (
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (story_id, user_id)
);
alter table public.story_likes enable row level security;

-- Je vois mes j'aime ; l'auteur voit les j'aime de ses stories.
drop policy if exists story_likes_select on public.story_likes;
create policy story_likes_select on public.story_likes for select using (
  user_id = auth.uid()
  or exists (select 1 from public.stories s where s.id = story_likes.story_id and s.author_id = auth.uid())
);
-- J'aime seulement une story que je peux voir (le RLS de stories s'applique).
drop policy if exists story_likes_insert on public.story_likes;
create policy story_likes_insert on public.story_likes for insert with check (
  user_id = auth.uid()
  and exists (select 1 from public.stories s where s.id = story_likes.story_id)
);
drop policy if exists story_likes_delete on public.story_likes;
create policy story_likes_delete on public.story_likes for delete using (user_id = auth.uid());

-- 3) Réponse à une story : un message privé relié à la story (avec l'image,
--    gardée dans la conversation même après les 24 h).
alter table public.messages add column if not exists story_id uuid;
alter table public.messages add column if not exists story_image text;
