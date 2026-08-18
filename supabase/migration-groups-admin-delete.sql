-- ============================================================
--  MIGRATION : suppression de groupes par l'administrateur
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--
--  1) is_admin() reconnaît les deux emails administrateurs.
--  2) L'admin peut supprimer n'importe quel groupe (et son contenu).
--  3) Supprime le groupe « Faithful ».
-- ============================================================

-- 1) Les deux emails admin (alignés sur ADMIN_EMAILS du code).
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (auth.jwt() ->> 'email') in ('mr.jacquesbrunet@gmail.com', 'contact@jackbrunet.com'),
    false
  );
$$;

-- 2) Politiques de suppression admin sur les groupes et leur contenu.
drop policy if exists "groups_delete_admin" on public.groups;
create policy "groups_delete_admin" on public.groups
  for delete using (public.is_admin());

drop policy if exists "group_members_delete_admin" on public.group_members;
create policy "group_members_delete_admin" on public.group_members
  for delete using (public.is_admin());

drop policy if exists "group_posts_delete_admin" on public.group_posts;
create policy "group_posts_delete_admin" on public.group_posts
  for delete using (public.is_admin());

drop policy if exists "group_comments_delete_admin" on public.group_comments;
create policy "group_comments_delete_admin" on public.group_comments
  for delete using (public.is_admin());

drop policy if exists "group_reactions_delete_admin" on public.group_reactions;
create policy "group_reactions_delete_admin" on public.group_reactions
  for delete using (public.is_admin());

drop policy if exists "group_messages_delete_admin" on public.group_messages;
create policy "group_messages_delete_admin" on public.group_messages
  for delete using (public.is_admin());

-- 3) Suppression du groupe « Faithful » (et de tout son contenu).
--    L'éditeur SQL n'est pas soumis aux politiques : effet immédiat.
delete from public.group_reactions
  where post_id in (select id from public.group_posts
    where group_id in (select id from public.groups where name ilike 'faithful'));
delete from public.group_comments
  where post_id in (select id from public.group_posts
    where group_id in (select id from public.groups where name ilike 'faithful'));
delete from public.group_messages
  where group_id in (select id from public.groups where name ilike 'faithful');
delete from public.group_posts
  where group_id in (select id from public.groups where name ilike 'faithful');
delete from public.group_members
  where group_id in (select id from public.groups where name ilike 'faithful');
delete from public.groups where name ilike 'faithful';
