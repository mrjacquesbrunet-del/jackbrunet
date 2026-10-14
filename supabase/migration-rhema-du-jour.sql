-- ============================================================
-- Émission « RHEMA du jour » (les épisodes courts de Pasteur Jack)
-- avec sa pochette fournie dans l'app. À exécuter dans Supabase → SQL Editor → Run.
-- (Recrée au besoin la table des émissions : sans risque si elle existe déjà.)
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
create policy podcast_shows_read on public.podcast_shows for select using (true);
drop policy if exists podcast_shows_admin_insert on public.podcast_shows;
create policy podcast_shows_admin_insert on public.podcast_shows for insert with check (public.is_admin());
drop policy if exists podcast_shows_admin_update on public.podcast_shows;
create policy podcast_shows_admin_update on public.podcast_shows for update using (public.is_admin());
drop policy if exists podcast_shows_admin_delete on public.podcast_shows;
create policy podcast_shows_admin_delete on public.podcast_shows for delete using (public.is_admin());

alter table public.podcasts
  add column if not exists show_id uuid references public.podcast_shows(id) on delete set null;
create index if not exists podcasts_show_idx on public.podcasts (show_id, created_at desc);

-- L'émission par défaut devient « RHEMA du jour » (ou est créée)
update public.podcast_shows
set title = 'RHEMA du jour',
    author = 'Pasteur Jack Brunet',
    description = 'Une parole courte pour chaque jour : quelques minutes pour nourrir ta foi, où que tu sois.',
    category = 'Parole du jour',
    cover_path = '/img/podcast/rhema-du-jour.jpg',
    position = 0
where title in ('Podcast de Pasteur Jack', 'RHEMA du jour') or cover_path = 'cover.png';

insert into public.podcast_shows (title, author, description, category, cover_path, position)
select 'RHEMA du jour', 'Pasteur Jack Brunet',
       'Une parole courte pour chaque jour : quelques minutes pour nourrir ta foi, où que tu sois.',
       'Parole du jour', '/img/podcast/rhema-du-jour.jpg', 0
where not exists (select 1 from public.podcast_shows where title = 'RHEMA du jour');

-- Tous les épisodes sans émission rejoignent « RHEMA du jour »
update public.podcasts
set show_id = (select id from public.podcast_shows where title = 'RHEMA du jour' order by created_at limit 1)
where show_id is null;
