-- ============================================================
--  SOUTIEN COMPLET : soutiens + Bâtisseurs + Don libre & objectif
--  Supabase → SQL Editor → coller → Run. Sûr à relancer.
-- ============================================================

-- ===== A. SOUTIENS =====
-- Soutiens « en un clic » (achats intégrés Apple / Google).
-- Une ligne par soutien, écrite par l'app après un paiement réussi.
-- Lecture réservée à l'admin (public.is_admin()).
create table if not exists public.soutiens (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  produit text not null,
  montant numeric(10, 2),
  devise text,
  plateforme text,
  transaction_id text,
  created_at timestamptz not null default now()
);

alter table public.soutiens enable row level security;

drop policy if exists "soutiens_insert" on public.soutiens;
create policy "soutiens_insert" on public.soutiens
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "soutiens_admin_select" on public.soutiens;
create policy "soutiens_admin_select" on public.soutiens
  for select to authenticated
  using (public.is_admin());

-- ===== B. BÂTISSEURS =====
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
  if new.user_id is not null and new.produit like 'batisseur_%' then
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
            from public.soutiens where user_id is not null and produit like 'batisseur_%' group by user_id) s
   where p.id = s.user_id;
  perform set_config('jb.batisseur', '', true);
end;
$$;

-- ===== C. DON LIBRE + OBJECTIF =====
-- ============================================================
--  DON LIBRE (achats intégrés Apple / Google) + OBJECTIF
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--  À exécuter APRÈS migration-soutiens.sql et migration-batisseurs.sql.
--
--  - Chaque don libre est une ligne de « soutiens » (produit don_libre_20…).
--  - L'objectif (mensuel ou global) est réglable par l'admin.
--  - Un don libre ne rend PAS Bâtisseur (réservé aux abonnements).
-- ============================================================

-- 1) L'objectif affiché au-dessus du don libre (une seule ligne)
create table if not exists public.objectif_don (
  id int primary key default 1 check (id = 1),
  titre text not null default 'Objectif du mois',
  montant_eur numeric(12, 2) not null default 10000,
  periode text not null default 'mensuel' check (periode in ('mensuel', 'total')),
  depuis timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
insert into public.objectif_don (id) values (1) on conflict (id) do nothing;
-- Objectif de départ : 10 000 € par mois (modifiable ensuite dans l'espace admin).
update public.objectif_don set montant_eur = 10000, periode = 'mensuel' where id = 1 and montant_eur = 3000;
-- Dons reçus HORS de l'app (site / Stripe, virements…), saisis par l'admin.
-- En objectif mensuel, la saisie ne compte que pour le mois où elle est faite.
alter table public.objectif_don add column if not exists ajout_manuel_eur numeric(12, 2) not null default 0;
alter table public.objectif_don add column if not exists ajout_le timestamptz not null default now();

alter table public.objectif_don enable row level security;
drop policy if exists "objectif_don_lecture" on public.objectif_don;
create policy "objectif_don_lecture" on public.objectif_don for select using (true);
drop policy if exists "objectif_don_admin" on public.objectif_don;
create policy "objectif_don_admin" on public.objectif_don for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 2) Une transaction Apple / Google ne compte qu'une fois
create unique index if not exists soutiens_transaction_unique
  on public.soutiens (plateforme, transaction_id) where transaction_id is not null;

-- 3) Progression = dons libres (en euros, lus dans l'identifiant du produit)
--    + Bâtisseurs actifs (leur montant mensuel ; en objectif global : tous
--    leurs paiements enregistrés) + dons reçus hors de l'app (saisie admin).
create or replace function public.progression_don()
returns table (titre text, objectif numeric, collecte numeric, dons bigint, periode text)
language sql
stable
security definer
set search_path = public
as $$
  with o as (
    select *, case when periode = 'mensuel' then date_trunc('month', now()) else depuis end as debut
      from public.objectif_don where id = 1
  ),
  libres as (
    select coalesce(sum(nullif(regexp_replace(s.produit, '\D', '', 'g'), '')::numeric), 0) as eur,
           count(*) as nb
      from public.soutiens s, o
     where s.produit like 'don_libre_%' and s.created_at >= o.debut
  ),
  batisseurs as (
    select coalesce(sum(nullif(regexp_replace(x.produit, '\D', '', 'g'), '')::numeric / 100), 0) as eur
      from (
        -- objectif mensuel : le dernier abonnement de chaque Bâtisseur actif
        select distinct on (s.user_id) s.produit
          from public.soutiens s
          join public.profiles p on p.id = s.user_id
         where s.produit like 'batisseur_%' and p.batisseur_jusqu_au > now()
         order by s.user_id, s.created_at desc, s.id desc
      ) x, o
     where o.periode = 'mensuel'
    union all
    select coalesce(sum(nullif(regexp_replace(s.produit, '\D', '', 'g'), '')::numeric / 100), 0)
      from public.soutiens s, o
     where o.periode = 'total' and s.produit like 'batisseur_%' and s.created_at >= o.debut
  )
  select o.titre,
         o.montant_eur,
         round((select eur from libres)
           + (select coalesce(sum(eur), 0) from batisseurs)
           + case when o.periode = 'total' or o.ajout_le >= o.debut then o.ajout_manuel_eur else 0 end, 2),
         (select nb from libres),
         o.periode
    from o;
$$;

grant execute on function public.progression_don() to anon, authenticated;
