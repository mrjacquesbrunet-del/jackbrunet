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
  montant_eur numeric(12, 2) not null default 3000,
  periode text not null default 'mensuel' check (periode in ('mensuel', 'total')),
  depuis timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
insert into public.objectif_don (id) values (1) on conflict (id) do nothing;

alter table public.objectif_don enable row level security;
drop policy if exists "objectif_don_lecture" on public.objectif_don;
create policy "objectif_don_lecture" on public.objectif_don for select using (true);
drop policy if exists "objectif_don_admin" on public.objectif_don;
create policy "objectif_don_admin" on public.objectif_don for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 2) Une transaction Apple / Google ne compte qu'une fois
create unique index if not exists soutiens_transaction_unique
  on public.soutiens (plateforme, transaction_id) where transaction_id is not null;

-- 3) Progression : somme des dons libres (en euros, lue dans l'identifiant
--    du produit) sur le mois en cours, ou depuis le début de l'objectif.
create or replace function public.progression_don()
returns table (titre text, objectif numeric, collecte numeric, dons bigint, periode text)
language sql
stable
security definer
set search_path = public
as $$
  select o.titre,
         o.montant_eur,
         coalesce(sum(nullif(regexp_replace(s.produit, '\D', '', 'g'), '')::numeric), 0),
         count(s.id),
         o.periode
    from public.objectif_don o
    left join public.soutiens s
      on s.produit like 'don_libre_%'
     and s.created_at >= case when o.periode = 'mensuel'
                              then date_trunc('month', now())
                              else o.depuis end
   where o.id = 1
   group by o.titre, o.montant_eur, o.periode;
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
