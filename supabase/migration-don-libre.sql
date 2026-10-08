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

-- 4) Seuls les abonnements (batisseur_…) donnent le statut Bâtisseur
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
