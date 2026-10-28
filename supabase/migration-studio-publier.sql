-- ============================================================
--  MIGRATION : « Publier partout » du Studio Jack
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--
--  Bucket PRIVÉ « studio-medias » : le Studio y dépose l'image ou la
--  vidéo à publier, la fonction publier-partout la transmet à Postiz
--  par un lien temporaire, puis l'efface. Réservé à l'admin.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit)
values ('studio-medias', 'studio-medias', false, 524288000) -- 500 Mo
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists "studio_medias_admin_select" on storage.objects;
create policy "studio_medias_admin_select" on storage.objects
  for select to authenticated using (bucket_id = 'studio-medias' and public.is_admin());

drop policy if exists "studio_medias_admin_insert" on storage.objects;
create policy "studio_medias_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'studio-medias' and public.is_admin());

drop policy if exists "studio_medias_admin_delete" on storage.objects;
create policy "studio_medias_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'studio-medias' and public.is_admin());
