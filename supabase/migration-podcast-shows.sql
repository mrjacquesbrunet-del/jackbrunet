-- ============================================================
-- Podcasts : plusieurs ÉMISSIONS (intervenants), gérées par l'admin.
-- Chaque épisode (table podcasts) appartient à une émission.
-- Les épisodes déjà en ligne vont dans « Podcast de Pasteur Jack ».
-- À exécuter dans Supabase → SQL Editor → Run.
-- ============================================================

create table if not exists public.podcast_shows (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  author      text,
  description text,
  category    text,
  cover_path  text,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.podcast_shows enable row level security;

drop policy if exists podcast_shows_read on public.podcast_shows;
create policy podcast_shows_read on public.podcast_shows
  for select using (true);

drop policy if exists podcast_shows_admin_insert on public.podcast_shows;
create policy podcast_shows_admin_insert on public.podcast_shows
  for insert with check (public.is_admin());

drop policy if exists podcast_shows_admin_update on public.podcast_shows;
create policy podcast_shows_admin_update on public.podcast_shows
  for update using (public.is_admin());

drop policy if exists podcast_shows_admin_delete on public.podcast_shows;
create policy podcast_shows_admin_delete on public.podcast_shows
  for delete using (public.is_admin());

-- Lien épisode → émission
alter table public.podcasts
  add column if not exists show_id uuid references public.podcast_shows(id) on delete set null;
create index if not exists podcasts_show_idx on public.podcasts (show_id, created_at desc);

-- Émission par défaut (pochette actuelle « cover.png » du bucket audiovf)
insert into public.podcast_shows (title, author, description, category, cover_path, position)
select 'Podcast de Pasteur Jack', 'Pasteur Jack Brunet',
       'Mes enseignements en audio, à écouter partout, même sans connexion.',
       'Enseignements', 'cover.png', 0
where not exists (select 1 from public.podcast_shows);

-- Les épisodes existants rejoignent cette émission
update public.podcasts
set show_id = (select id from public.podcast_shows order by position, created_at limit 1)
where show_id is null;
