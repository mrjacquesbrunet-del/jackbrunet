-- ============================================================
--  Églises : retrouver aussi les noms approchants dans la même liste
--  (« Église Tout est possible pour » = « Tout est possible pour »,
--  « Eglise Vie-Nouvelle, Bordeaux » ≈ « Vie Nouvelle Bordeaux »,
--  petites fautes de frappe).
--  À lancer APRÈS migration-eglise-ville-top7.sql.
--  Supabase → SQL Editor → Run. Relançable sans risque.
-- ============================================================

create extension if not exists pg_trgm with schema extensions;

-- Nom d'église réduit à l'essentiel : sans « église / church / igreja »
-- ni les petits mots (de, du, la, le, les, l', d', the, of).
create or replace function public.eglise_cle(t text)
returns text language sql immutable set search_path = public, extensions as $$
  select nullif(trim(regexp_replace(
    regexp_replace(' ' || coalesce(public.lieu_cle(t), '') || ' ',
                   ' (eglise|eglises|church|igreja|de|du|des|la|le|les|l|d|the|of)(?= )', ' ', 'g'),
    ' +', ' ', 'g')), '');
$$;

-- Deux noms désignent-ils la même église ?
--  - même nom réduit ;
--  - ou l'un contient l'autre (au moins 2 mots ou 10 lettres, pour éviter
--    qu'un mot isolé comme « vie » regroupe tout) ;
--  - ou très proches à l'écriture (fautes de frappe).
create or replace function public.meme_eglise(a text, b text)
returns boolean language sql immutable set search_path = public, extensions as $$
  with k as (select public.eglise_cle(a) as x, public.eglise_cle(b) as y),
       c as (select x, y,
                    case when length(x) <= length(y) then x else y end as court,
                    case when length(x) <= length(y) then y else x end as long
             from k)
  select coalesce(
    x is not null and y is not null and (
      x = y
      or ((position(' ' in court) > 0 or length(court) >= 10)
          and (' ' || long || ' ') like ('% ' || court || ' %'))
      or extensions.similarity(x, y) >= 0.6
    ), false)
  from c;
$$;

-- Membres d'une église (noms approchants compris) ou d'une ville.
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
      (p_type = 'eglise' and p.church is not null and public.meme_eglise(p.church, p_valeur))
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

-- Suggestions pendant la saisie : regroupées par nom réduit, et les noms
-- approchants remontent aussi.
create or replace function public.eglises_existantes(q text)
returns table (nom text, membres bigint)
language sql stable security definer set search_path = public as $$
  select min(p.church) as nom, count(*) as membres
  from public.profiles p
  where public.eglise_cle(p.church) is not null
    and (public.eglise_cle(p.church) like '%' || coalesce(public.eglise_cle(q), public.lieu_cle(q), '') || '%'
         or public.meme_eglise(p.church, q))
  group by public.eglise_cle(p.church)
  order by count(*) desc, min(p.church)
  limit 8;
$$;
grant execute on function public.eglises_existantes(text) to authenticated;
