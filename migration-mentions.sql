-- ============================================================
--  Mentions @pseudo : notifier un membre cité dans un sujet de
--  prière ou un commentaire.
--  À exécuter une fois dans Supabase → SQL Editor.
-- ============================================================

-- 1) Autoriser le type de notification 'mention'.
--    (Si la colonne "type" est protégée par une contrainte CHECK,
--     on la remplace pour inclure 'mention'. Tolérant si absente.)
do $$
declare cname text;
begin
  select conname into cname
  from pg_constraint
  where conrelid = 'public.notifications'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%type%';
  if cname is not null then
    execute format('alter table public.notifications drop constraint %I', cname);
  end if;
exception when others then
  null; -- table/contrainte absente : on ignore
end $$;

do $$
begin
  alter table public.notifications
    add constraint notifications_type_check
    check (type in ('pray','heart','comment','follow','mention'));
exception when others then
  null; -- déjà présente ou colonne enum : on ignore
end $$;

-- 2) Fonction sécurisée : crée la notification de mention pour la
--    personne citée, au nom de l'utilisateur connecté (auth.uid()).
create or replace function public.notify_mention(target uuid, prayer uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target is null or target = auth.uid() then
    return;
  end if;
  insert into public.notifications (user_id, actor_id, type, prayer_id, read)
  values (target, auth.uid(), 'mention', prayer, false);
end;
$$;

grant execute on function public.notify_mention(uuid, uuid) to authenticated;
