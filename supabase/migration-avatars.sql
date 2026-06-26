-- ============================================================
--  MIGRATION : stockage des photos de profil (avatars)
--  À coller dans Supabase → SQL Editor → Run.
--  Sûr à relancer.
--
--  Crée un bucket public « avatars » et autorise chaque membre
--  à déposer / remplacer SA propre photo (dossier = son id).
-- ============================================================

-- 1) Bucket public ------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- 2) Règles d'accès (storage.objects) -----------------------
-- Lecture publique des avatars
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

-- Chaque membre gère uniquement les fichiers de SON dossier (son id)
drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
