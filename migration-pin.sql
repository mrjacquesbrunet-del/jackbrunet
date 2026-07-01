-- ============================================================
--  Épingler un sujet de prière (réservé à l'admin).
--  À exécuter dans Supabase → SQL Editor.
--  (Nécessite public.is_admin(), créée par migration-admin.sql.)
-- ============================================================

alter table public.prayers add column if not exists pinned boolean not null default false;

-- Fonction sécurisée : seul un admin peut épingler/désépingler.
create or replace function public.set_prayer_pinned(pid uuid, val boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Réservé à l''administrateur';
  end if;
  update public.prayers set pinned = val where id = pid;
end;
$$;

grant execute on function public.set_prayer_pinned(uuid, boolean) to authenticated;
