-- ============================================================
--  MIGRATION : modération administrateur
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--
--  Permet à l'admin (Jack) de supprimer n'importe quel commentaire
--  ou prière inapproprié sur le mur de prière.
-- ============================================================

-- L'administrateur est identifié par son email.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((auth.jwt() ->> 'email') = 'mr.jacquesbrunet@gmail.com', false);
$$;

drop policy if exists "comments_delete_admin" on public.prayer_comments;
create policy "comments_delete_admin" on public.prayer_comments
  for delete using (public.is_admin());

drop policy if exists "prayers_delete_admin" on public.prayers;
create policy "prayers_delete_admin" on public.prayers
  for delete using (public.is_admin());
