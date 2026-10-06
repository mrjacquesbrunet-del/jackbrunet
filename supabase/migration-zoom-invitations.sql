-- Invitations au Zoom des Bâtisseurs.
-- L'admin envoie une invitation (date, lien, petit mot) : chaque Bâtisseur
-- reçoit une notification dans l'app (+ push via le webhook notify-push
-- existant) qui ouvre la page /zoom ; l'e-mail part via la fonction
-- « invite-batisseurs ». À exécuter APRÈS migration-batisseurs.sql.

create table if not exists public.zoom_invitations (
  id bigint generated always as identity primary key,
  date_zoom timestamptz,
  lien text not null,
  message text,
  created_at timestamptz not null default now()
);

alter table public.zoom_invitations enable row level security;

drop policy if exists "zoom_invitations_lecture" on public.zoom_invitations;
create policy "zoom_invitations_lecture" on public.zoom_invitations
  for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.profiles p
                where p.id = auth.uid() and p.batisseur_jusqu_au > now())
  );

-- Envoi : enregistre l'invitation et notifie tous les Bâtisseurs.
create or replace function public.inviter_batisseurs(
  p_date timestamptz,
  p_lien text,
  p_message text,
  p_texte text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  inv_id bigint;
  n integer;
begin
  if not public.is_admin() then
    raise exception 'Réservé à l''administrateur';
  end if;
  insert into public.zoom_invitations (date_zoom, lien, message)
  values (p_date, p_lien, nullif(trim(p_message), ''))
  returning id into inv_id;

  insert into public.notifications (user_id, actor_id, type, body, link, read)
  select p.id, auth.uid(), 'admin', p_texte, '/zoom/', false
    from public.profiles p
   where p.batisseur_jusqu_au > now();
  get diagnostics n = row_count;

  return json_build_object('invitation_id', inv_id, 'notifies', n);
end;
$$;

grant execute on function public.inviter_batisseurs(timestamptz, text, text, text) to authenticated;
