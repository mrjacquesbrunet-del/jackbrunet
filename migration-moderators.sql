-- ============================================================
--  Modérateurs : l'admin nomme des modérateurs (en un clic depuis
--  un profil). Un modérateur peut supprimer commentaires, posts et
--  groupes, partout dans l'app.
--  À exécuter dans Supabase → SQL Editor, APRÈS migration-admin.sql
--  et migration-groups.sql. Sûr à relancer (idempotent).
-- ============================================================

-- 1) Drapeau modérateur sur le profil
alter table public.profiles add column if not exists is_moderator boolean not null default false;

-- 2) Sécurité : personne ne peut se nommer modérateur soi-même.
--    Seul l'admin peut changer ce champ (via set_moderator ci-dessous).
create or replace function public.guard_is_moderator()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.is_moderator is distinct from old.is_moderator and not public.is_admin() then
    new.is_moderator := old.is_moderator;
  end if;
  return new;
end; $$;
drop trigger if exists trg_guard_is_moderator on public.profiles;
create trigger trg_guard_is_moderator before update on public.profiles
  for each row execute function public.guard_is_moderator();

-- 3) Helper : l'utilisateur courant est-il modérateur (ou admin) ?
create or replace function public.is_moderator()
returns boolean language sql security definer stable set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_moderator = true
  );
$$;
grant execute on function public.is_moderator() to authenticated, anon;

-- 4) Admin : nommer / retirer un modérateur
create or replace function public.set_moderator(p_user_id uuid, p_on boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Réservé à l''administrateur';
  end if;
  update public.profiles set is_moderator = coalesce(p_on, false) where id = p_user_id;
end; $$;
grant execute on function public.set_moderator(uuid, boolean) to authenticated;

-- 5) Politiques de suppression : autoriser aussi les modérateurs
--    (is_moderator() inclut déjà l'admin).

-- Mur de prière : sujets + commentaires
drop policy if exists "prayers_delete_admin" on public.prayers;
create policy "prayers_delete_admin" on public.prayers
  for delete using (author_id = auth.uid() or public.is_moderator());

drop policy if exists "comments_delete_admin" on public.prayer_comments;
create policy "comments_delete_admin" on public.prayer_comments
  for delete using (author_id = auth.uid() or public.is_moderator());

-- Groupes : publications, commentaires, et le groupe lui-même
drop policy if exists gp_delete on public.group_posts;
create policy gp_delete on public.group_posts for delete
  using (author_id = auth.uid() or public.is_group_admin(group_id) or public.is_moderator());

drop policy if exists gc_delete on public.group_comments;
create policy gc_delete on public.group_comments for delete
  using (author_id = auth.uid() or public.is_group_admin(group_id) or public.is_moderator());

drop policy if exists groups_delete on public.groups;
create policy groups_delete on public.groups for delete
  using (owner_id = auth.uid() or public.is_moderator());
