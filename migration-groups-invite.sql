-- ============================================================
--  Groupes: inviter des amis directement (avec notification +
--  accepter / refuser). A lancer APRES migration-groups.sql.
-- ============================================================

-- Un membre peut avoir le statut 'invited' (invité, pas encore accepté).
-- (La colonne status est libre, aucune contrainte a modifier.)

-- Voir un groupe si on en est proprietaire, s'il est public, OU si on a une
-- ligne d'appartenance (invite / en attente / approuve) — permet a un invite
-- de voir un groupe prive pour accepter.
create or replace function public.has_group_membership(gid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.group_members m where m.group_id = gid and m.user_id = auth.uid());
$$;

drop policy if exists groups_select on public.groups;
create policy groups_select on public.groups for select
  using (is_public or public.has_group_membership(id) or owner_id = auth.uid());

-- Inviter un membre (admin uniquement): cree la ligne 'invited' + notifie.
create or replace function public.invite_to_group(p_group_id uuid, p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare g_name text;
begin
  if not public.is_group_admin(p_group_id) then
    raise exception 'Reserve aux administrateurs du groupe';
  end if;
  select name into g_name from public.groups where id = p_group_id;

  insert into public.group_members (group_id, user_id, role, status)
  values (p_group_id, p_user_id, 'member', 'invited')
  on conflict (group_id, user_id) do nothing;

  insert into public.notifications (user_id, actor_id, type, body, link)
  values (p_user_id, auth.uid(), 'follow',
          'Tu es invité(e) à rejoindre le groupe « ' || coalesce(g_name, 'un groupe') || ' »',
          '/groupe?g=' || p_group_id::text);
end; $$;

-- Accepter une invitation: passe sa propre ligne 'invited' -> 'approved'.
create or replace function public.accept_group_invite(p_group_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.group_members
    set status = 'approved'
    where group_id = p_group_id and user_id = auth.uid() and status = 'invited';
end; $$;

grant execute on function public.invite_to_group(uuid, uuid) to authenticated;
grant execute on function public.accept_group_invite(uuid) to authenticated;
