-- ============================================================
--  DONS STRIPE → BARRE D'OBJECTIF (automatique)
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--  À exécuter APRÈS migration-soutien-complet.sql (déjà fait).
--
--  - Chaque paiement Stripe (don unique ou mensualité) est enregistré
--    par la fonction « stripe-webhook » dans la table dons_site.
--  - La barre additionne désormais : dons libres Apple / Google
--    + Bâtisseurs actifs + dons Stripe + saisie manuelle (virements…).
--  - Les dons « Mission Madagascar » sont gardés à part (catégorie
--    madagascar) et ne comptent pas dans la barre générale.
-- ============================================================

-- 1) Les dons reçus par Stripe (une ligne par paiement)
create table if not exists public.dons_site (
  id text primary key,                         -- pi_… (don unique) ou in_… (mensualité)
  montant_eur numeric(12, 2) not null,
  mensuel boolean not null default false,
  categorie text not null default 'mission',   -- 'mission' ou 'madagascar'
  paiement text,                               -- pi_… (sert aux remboursements)
  rembourse boolean not null default false,
  paye_le timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists dons_site_paye_le on public.dons_site (paye_le);
create index if not exists dons_site_paiement on public.dons_site (paiement);

alter table public.dons_site enable row level security;
-- Lecture réservée à l'admin ; l'écriture se fait uniquement par la
-- fonction stripe-webhook (clé service, qui passe outre ces règles).
drop policy if exists "dons_site_admin" on public.dons_site;
create policy "dons_site_admin" on public.dons_site for select to authenticated
  using (public.is_admin());

-- 2) Progression = dons libres + Bâtisseurs actifs + dons Stripe + saisie admin
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
  site as (
    select coalesce(sum(d.montant_eur), 0) as eur, count(*) as nb
      from public.dons_site d, o
     where d.categorie = 'mission' and not d.rembourse and d.paye_le >= o.debut
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
           + (select eur from site)
           + (select coalesce(sum(eur), 0) from batisseurs)
           + case when o.periode = 'total' or o.ajout_le >= o.debut then o.ajout_manuel_eur else 0 end, 2),
         (select nb from libres) + (select nb from site),
         o.periode
    from o;
$$;

grant execute on function public.progression_don() to anon, authenticated;
