-- ============================================================
--  MIGRATION : NOTES VOCALES (mur de prière + groupes)
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--
--  1. Colonne audio_url sur les commentaires du mur et les messages
--     de groupe (la note vocale remplace le texte quand présente).
--  2. Bucket de stockage « voices » : chaque membre dépose ses notes
--     dans SON dossier (son id) ; lecture publique (URLs non devinables).
-- ============================================================

-- 1) Colonnes ------------------------------------------------
alter table public.prayer_comments add column if not exists audio_url text;
alter table public.group_messages  add column if not exists audio_url text;

-- 2) Bucket public « voices » -------------------------------
insert into storage.buckets (id, name, public)
values ('voices', 'voices', true)
on conflict (id) do update set public = true;

-- 3) Règles d'accès (storage.objects) -----------------------
-- Lecture publique des notes vocales
drop policy if exists "voices_public_read" on storage.objects;
create policy "voices_public_read" on storage.objects
  for select using (bucket_id = 'voices');

-- Chaque membre dépose uniquement dans SON dossier (son id)
drop policy if exists "voices_insert_own" on storage.objects;
create policy "voices_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'voices'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "voices_delete_own" on storage.objects;
create policy "voices_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'voices'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
