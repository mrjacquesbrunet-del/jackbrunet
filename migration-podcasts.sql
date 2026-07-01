-- ============================================================
--  Podcasts / « Écouter » : table des audios (titre + fichier).
--  Permet de garder de jolis titres (accents, apostrophes…) même si le
--  fichier stocké porte un nom technique propre.
--  Prérequis : un bucket Storage public nommé « audio », et la fonction
--  public.is_admin() (migration-admin.sql).
--  À exécuter dans Supabase → SQL Editor.
-- ============================================================

create table if not exists public.podcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  path text not null,
  created_at timestamptz not null default now()
);

alter table public.podcasts enable row level security;

drop policy if exists "podcasts_read" on public.podcasts;
create policy "podcasts_read" on public.podcasts for select using (true);

drop policy if exists "podcasts_admin_insert" on public.podcasts;
create policy "podcasts_admin_insert" on public.podcasts
  for insert with check (public.is_admin());

drop policy if exists "podcasts_admin_delete" on public.podcasts;
create policy "podcasts_admin_delete" on public.podcasts
  for delete using (public.is_admin());

-- Storage : lecture publique + envoi/suppression réservés à l'admin.
drop policy if exists "audio_public_read" on storage.objects;
create policy "audio_public_read" on storage.objects
  for select using (bucket_id = 'audio');

drop policy if exists "audio_admin_insert" on storage.objects;
create policy "audio_admin_insert" on storage.objects
  for insert with check (bucket_id = 'audio' and public.is_admin());

drop policy if exists "audio_admin_delete" on storage.objects;
create policy "audio_admin_delete" on storage.objects
  for delete using (bucket_id = 'audio' and public.is_admin());
