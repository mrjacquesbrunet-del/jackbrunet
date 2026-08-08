-- ============================================================
--  Épingler / désépingler un sujet de prière : ouvert aux
--  MODÉRATEURS (en plus des admins).
--  À exécuter dans Supabase → SQL Editor.
--  (Nécessite public.is_moderator(), créée par migration-moderators.sql,
--   qui inclut déjà l'admin.)
-- ============================================================

-- Idempotent : s'assure que la colonne existe (au cas où migration-pin.sql
-- n'aurait pas été exécutée).
alter table public.prayers add column if not exists pinned boolean not null default false;

-- Redéfinit la fonction : un modérateur OU un admin peut épingler.
create or replace function public.set_prayer_pinned(pid uuid, val boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_moderator() then
    raise exception 'Réservé aux modérateurs';
  end if;
  update public.prayers set pinned = val where id = pid;
end;
$$;

grant execute on function public.set_prayer_pinned(uuid, boolean) to authenticated;
