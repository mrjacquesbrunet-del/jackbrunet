-- Annonces (bannière in-app) — publiables par l'admin, lues par tous.
-- À exécuter dans Supabase → SQL Editor.

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  link text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

-- Tout le monde peut lire les annonces actives.
drop policy if exists "announcements_read" on public.announcements;
create policy "announcements_read" on public.announcements
  for select using (active = true);

-- Seul l'admin (Jack) peut créer / modifier des annonces.
drop policy if exists "announcements_insert_admin" on public.announcements;
create policy "announcements_insert_admin" on public.announcements
  for insert with check (
    lower(auth.jwt() ->> 'email') in ('contact@jackbrunet.com','mr.jacquesbrunet@gmail.com')
  );

drop policy if exists "announcements_update_admin" on public.announcements;
create policy "announcements_update_admin" on public.announcements
  for update using (
    lower(auth.jwt() ->> 'email') in ('contact@jackbrunet.com','mr.jacquesbrunet@gmail.com')
  );
