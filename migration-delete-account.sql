-- Suppression de compte (exigence App Store, règle 5.1.1 / 4.0).
-- À exécuter une fois dans Supabase → SQL Editor → Run.
--
-- Permet à un utilisateur connecté de supprimer définitivement son propre
-- compte (et, par cascade des clés étrangères, ses données associées).

create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  -- Supprime le compte d'authentification ; les données liées partent en
  -- cascade si les clés étrangères sont configurées « on delete cascade ».
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_user() to authenticated;
