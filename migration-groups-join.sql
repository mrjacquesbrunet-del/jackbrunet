-- ============================================================
--  Groupes : politique d'adhésion (ouverte vs sur validation).
--  À exécuter dans Supabase → SQL Editor, APRÈS migration-groups.sql
--  et migration-groups-extra.sql. Sûr à relancer (idempotent).
--
--  open_join = true  → on rejoint sans validation (adhésion ouverte)
--  open_join = false → le créateur valide chaque demande (défaut)
-- ============================================================

-- 1) Colonne d'adhésion ouverte
alter table public.groups add column if not exists open_join boolean not null default false;

-- 2) Les groupes déjà créés par l'admin passent en adhésion ouverte
do $$
declare admin_id uuid;
begin
  select id into admin_id from auth.users where lower(email) = 'contact@jackbrunet.com' limit 1;
  if admin_id is not null then
    update public.groups set open_join = true where owner_id = admin_id;
  end if;
end $$;

-- 3) Empêcher qu'un membre s'ajoute lui-même comme « approuvé » (sécurité) :
--    depuis l'app, on ne peut insérer qu'une demande « pending ».
--    Les adhésions instantanées passent par la fonction join_group (ci-dessous).
drop policy if exists gm_insert on public.group_members;
create policy gm_insert on public.group_members for insert
  with check (user_id = auth.uid() and status = 'pending');

-- 4) create_group accepte désormais le paramètre p_open_join
drop function if exists public.create_group(text, text, text, text, text, boolean);
create or replace function public.create_group(
  p_name text, p_description text, p_verse_text text,
  p_verse_reference text, p_accent text, p_is_public boolean,
  p_open_join boolean
) returns public.groups language plpgsql security definer set search_path = public as $$
declare g public.groups;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  insert into public.groups (name, description, verse_text, verse_reference, accent, is_public, open_join, owner_id, invite_code)
  values (coalesce(nullif(btrim(p_name), ''), 'Mon groupe'), coalesce(p_description, ''),
          coalesce(p_verse_text, ''), coalesce(p_verse_reference, ''),
          coalesce(nullif(p_accent, ''), 'lime'), coalesce(p_is_public, true),
          coalesce(p_open_join, false), auth.uid(),
          upper(substring(md5(gen_random_uuid()::text) for 7)))
  returning * into g;
  insert into public.group_members (group_id, user_id, role, status)
  values (g.id, auth.uid(), 'owner', 'approved');
  return g;
end; $$;
grant execute on function public.create_group(text, text, text, text, text, boolean, boolean) to authenticated;

-- 5) Rejoindre un groupe : approuvé tout de suite si adhésion ouverte,
--    sinon « en attente » (le créateur valide). Renvoie le statut.
create or replace function public.join_group(p_group_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare is_open boolean; new_status text;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  select open_join into is_open from public.groups where id = p_group_id;
  if is_open is null then raise exception 'Groupe introuvable'; end if;
  new_status := case when is_open then 'approved' else 'pending' end;
  insert into public.group_members (group_id, user_id, role, status)
  values (p_group_id, auth.uid(), 'member', new_status)
  on conflict (group_id, user_id) do update
    set status = case when group_members.status = 'approved' then 'approved' else excluded.status end;
  return new_status;
end; $$;
grant execute on function public.join_group(uuid) to authenticated;
