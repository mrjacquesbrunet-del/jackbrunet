-- ============================================================
--  Message privé de l'admin à TOUS les membres (messagerie).
--  A coller dans Supabase -> SQL Editor -> Run.
--  (Necessite public.is_admin(), la table messages et la table
--   notifications, deja creees par migration-tout.sql.)
--
--  Depose un message dans la boite de chaque membre (de la part de
--  Pasteur Jack) ET cree une notification cliquable vers /messages.
-- ============================================================

create or replace function public.admin_broadcast_message(message text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_id uuid := auth.uid();
  n integer := 0;
begin
  if not public.is_admin() then
    raise exception 'Réservé à l''administrateur';
  end if;
  if coalesce(btrim(message), '') = '' then
    return 0;
  end if;

  -- Un message dans la boite de chaque membre (sauf l'admin lui-meme).
  insert into public.messages (sender_id, recipient_id, body)
  select admin_id, p.id, message
  from public.profiles p
  where p.id <> admin_id;
  get diagnostics n = row_count;

  -- Notifie chacun qu'il a recu un message (cloche), lien vers la messagerie.
  insert into public.notifications (user_id, actor_id, type, body, link)
  select p.id, admin_id, 'admin', 'Nouveau message de Pasteur Jack', '/messages'
  from public.profiles p
  where p.id <> admin_id;

  return n;
end;
$$;

grant execute on function public.admin_broadcast_message(text) to authenticated;
