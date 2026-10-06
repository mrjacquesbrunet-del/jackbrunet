-- Les Bâtisseurs : les partenaires mensuels (abonnement Apple / Google).
-- Tant que l'abonnement est actif : badge exclusif + invitation au Zoom
-- mensuel. Le statut a une date de fin (batisseur_jusqu_au), prolongée à
-- chaque paiement et à chaque ouverture de l'app quand l'abonnement est actif.
-- À exécuter APRÈS migration-soutiens.sql. Peut être relancé sans risque.

-- 1) Statut sur le profil
alter table public.profiles add column if not exists batisseur_depuis timestamptz;
alter table public.profiles add column if not exists batisseur_jusqu_au timestamptz;

-- 2) Personne ne peut se l'attribuer soi-même : seuls les fonctions
--    ci-dessous (ou l'admin) peuvent modifier ces colonnes.
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
    new.batisseur_jusqu_au := null;
  else
    new.batisseur_depuis := old.batisseur_depuis;
    new.batisseur_jusqu_au := old.batisseur_jusqu_au;
  end if;
  return new;
end;
$$;

drop trigger if exists proteger_batisseur on public.profiles;
create trigger proteger_batisseur
  before insert or update on public.profiles
  for each row execute function public.proteger_batisseur();

-- 3) Un paiement enregistré : Bâtisseur pour (au moins) 35 jours
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
       set batisseur_depuis = coalesce(batisseur_depuis, now()),
           batisseur_jusqu_au = greatest(coalesce(batisseur_jusqu_au, now()), now() + interval '35 days')
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

-- 4) À l'ouverture de l'app, si l'abonnement est toujours actif chez
--    Apple / Google, l'app prolonge le statut (jamais plus de 40 jours
--    d'avance, et jamais en le raccourcissant).
create or replace function public.synchroniser_batisseur(p_jusqu_au timestamptz)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare v timestamptz;
begin
  if auth.uid() is null or p_jusqu_au is null or p_jusqu_au <= now() then
    return null;
  end if;
  v := least(p_jusqu_au, now() + interval '40 days');
  perform set_config('jb.batisseur', 'on', true);
  update public.profiles
     set batisseur_depuis = coalesce(batisseur_depuis, now()),
         batisseur_jusqu_au = greatest(coalesce(batisseur_jusqu_au, v), v)
   where id = auth.uid()
  returning batisseur_jusqu_au into v;
  perform set_config('jb.batisseur', '', true);
  return v;
end;
$$;

grant execute on function public.synchroniser_batisseur(timestamptz) to authenticated;

-- Rattrapage : les paiements déjà enregistrés
do $$
begin
  perform set_config('jb.batisseur', 'on', true);
  update public.profiles p
     set batisseur_depuis = coalesce(p.batisseur_depuis, s.premier),
         batisseur_jusqu_au = greatest(coalesce(p.batisseur_jusqu_au, s.dernier + interval '35 days'), s.dernier + interval '35 days')
    from (select user_id, min(created_at) as premier, max(created_at) as dernier
            from public.soutiens where user_id is not null group by user_id) s
   where p.id = s.user_id;
  perform set_config('jb.batisseur', '', true);
end;
$$;
