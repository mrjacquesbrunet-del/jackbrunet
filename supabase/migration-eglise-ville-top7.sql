-- ============================================================
--  Réseau social : voir les membres d'une église ou d'une ville
--  (clic sur la pastille du profil), suggestions d'églises déjà
--  saisies, et podcasts : émissions les plus écoutées sur 7 jours.
--  Supabase → SQL Editor → Run. Relançable sans risque.
-- ============================================================

create extension if not exists unaccent with schema extensions;

-- Forme comparable d'un nom : minuscules, sans accents, espaces et
-- ponctuation simplifiés (« Église Vie-Nouvelle » = « eglise vie nouvelle »).
create or replace function public.lieu_cle(t text)
returns text language sql immutable set search_path = public, extensions as $$
  select nullif(trim(regexp_replace(lower(extensions.unaccent(coalesce(t, ''))), '[^a-z0-9]+', ' ', 'g')), '');
$$;

-- 1. Membres d'une église ('eglise') ou d'une ville ('ville').
--    La ville respecte la confidentialité : un membre qui a choisi
--    « moi seul » n'apparaît pas dans la liste de sa ville.
--    Les comptes que j'ai bloqués (ou qui m'ont bloqué) sont exclus.
create or replace function public.membres_du_lieu(p_type text, p_valeur text, p_limite int default 200)
returns table (
  id uuid, pseudo text, avatar_url text, verified boolean,
  church text, city text, country text, streak_days int, badge_tier text
)
language sql stable security definer set search_path = public as $$
  select p.id, p.pseudo, p.avatar_url, p.verified, p.church,
         case when coalesce(p.location_privacy, 'public') = 'prive' then null else p.city end,
         case when coalesce(p.location_privacy, 'public') = 'prive' then null else p.country end,
         p.streak_days, p.badge_tier
  from public.profiles p
  where public.lieu_cle(p_valeur) is not null
    and (
      (p_type = 'eglise' and public.lieu_cle(p.church) = public.lieu_cle(p_valeur))
      or (p_type = 'ville' and public.lieu_cle(p.city) = public.lieu_cle(p_valeur)
          and (coalesce(p.location_privacy, 'public') <> 'prive' or p.id = auth.uid()))
    )
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = p.id)
         or (b.blocker_id = p.id and b.blocked_id = auth.uid())
    )
  order by (p.id = auth.uid()) desc, p.verified desc nulls last, p.streak_days desc nulls last, p.pseudo
  limit greatest(1, least(coalesce(p_limite, 200), 500));
$$;
grant execute on function public.membres_du_lieu(text, text, int) to authenticated;

-- 2. Églises déjà renseignées (pour proposer la même orthographe en tapant).
create or replace function public.eglises_existantes(q text)
returns table (nom text, membres bigint)
language sql stable security definer set search_path = public as $$
  select min(p.church) as nom, count(*) as membres
  from public.profiles p
  where public.lieu_cle(p.church) is not null
    and public.lieu_cle(p.church) like '%' || coalesce(public.lieu_cle(q), '') || '%'
  group by public.lieu_cle(p.church)
  order by count(*) desc, min(p.church)
  limit 8;
$$;
grant execute on function public.eglises_existantes(text) to authenticated;

-- 3. Podcasts : émissions les plus écoutées sur les N derniers jours
--    (auditeurs différents, tous épisodes de l'émission confondus).
create or replace function public.emissions_populaires(jours int default 7)
returns table (show_id text, ecoutes bigint)
language sql stable security definer set search_path = public as $$
  select p.show_id::text as show_id,
         count(distinct coalesce(e.device_id, e.id::text)) as ecoutes
  from public.analytics_events e
  join public.podcasts p on p.id::text = e.page
  where e.type = 'play'
    and p.show_id is not null
    and e.created_at > now() - make_interval(days => greatest(1, least(coalesce(jours, 7), 365)))
  group by p.show_id
  order by ecoutes desc
  limit 20;
$$;
grant execute on function public.emissions_populaires(int) to anon, authenticated;
