-- Les Bâtisseurs : toute personne connectée qui soutient l'app (achat
-- intégré) devient « Bâtisseur » : badge exclusif + accès au Zoom mensuel.
-- À exécuter APRÈS migration-soutiens.sql.

-- 1) Statut sur le profil (date du premier soutien)
alter table public.profiles add column if not exists batisseur_depuis timestamptz;

-- 2) Personne ne peut se l'attribuer soi-même : seul un soutien (ou l'admin)
--    peut modifier cette colonne.
create or replace function public.proteger_batisseur()
returns trigger
language plpgsql
as $$
begin
  if coalesce(current_setting('jb.batisseur', true), '') = 'on' or public.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.batisseur_depuis := null;
  elsif new.batisseur_depuis is distinct from old.batisseur_depuis then
    new.batisseur_depuis := old.batisseur_depuis;
  end if;
  return new;
end;
$$;

drop trigger if exists proteger_batisseur on public.profiles;
create trigger proteger_batisseur
  before insert or update on public.profiles
  for each row execute function public.proteger_batisseur();

-- 3) Un soutien enregistré fait de la personne un Bâtisseur
create or replace function public.soutien_vers_batisseur()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is not null then
    perform set_config('jb.batisseur', 'on', true);
    update public.profiles
       set batisseur_depuis = coalesce(batisseur_depuis, now())
     where id = new.user_id;
    perform set_config('jb.batisseur', '', true);
  end if;
  return new;
end;
$$;

drop trigger if exists soutien_vers_batisseur on public.soutiens;
create trigger soutien_vers_batisseur
  after insert on public.soutiens
  for each row execute function public.soutien_vers_batisseur();

-- Rattrapage : les soutiens déjà enregistrés
do $$
begin
  perform set_config('jb.batisseur', 'on', true);
  update public.profiles p
     set batisseur_depuis = s.premier
    from (select user_id, min(created_at) as premier
            from public.soutiens where user_id is not null group by user_id) s
   where p.id = s.user_id and p.batisseur_depuis is null;
  perform set_config('jb.batisseur', '', true);
end;
$$;

-- 4) Le Zoom mensuel (une seule ligne), visible par les Bâtisseurs et l'admin
create table if not exists public.batisseurs_zoom (
  id int primary key default 1 check (id = 1),
  prochaine_date timestamptz,
  lien text,
  message text,
  updated_at timestamptz not null default now()
);
insert into public.batisseurs_zoom (id) values (1) on conflict (id) do nothing;

alter table public.batisseurs_zoom enable row level security;

drop policy if exists "zoom_lecture" on public.batisseurs_zoom;
create policy "zoom_lecture" on public.batisseurs_zoom
  for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.profiles p
                where p.id = auth.uid() and p.batisseur_depuis is not null)
  );

drop policy if exists "zoom_admin" on public.batisseurs_zoom;
create policy "zoom_admin" on public.batisseurs_zoom
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
