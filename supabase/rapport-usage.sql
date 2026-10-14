-- ============================================================
-- Rapport d'usage (lecture seule, ne modifie rien)
-- À exécuter dans Supabase → SQL Editor, une requête à la fois.
-- ============================================================

-- REQUÊTE 1 — Ce qui est le plus vu, écouté, et surtout là où les gens
-- REVIENNENT (90 derniers jours, appareils anonymes).
--   personnes      : appareils différents
--   revenants      : appareils venus au moins 2 jours différents
--   taux_retour_pct: revenants / personnes
--   jours_par_pers : nombre moyen de jours où chacun est revenu
with ev as (
  select e.type, e.page,
         coalesce(e.device_id, e.id::text) as appareil,
         (e.created_at at time zone 'Europe/Paris')::date as jour
  from public.analytics_events e
  where e.created_at > now() - interval '90 days'
    and (e.type <> 'page' or e.source = 'app')
),
lignes as (
  select '1. Rubrique' as section,
         coalesce(nullif(split_part(page, '/', 2), ''), 'accueil') as item,
         appareil, jour
  from ev where type = 'page'
  union all
  select '2. Écran', page, appareil, jour from ev where type = 'page'
  union all
  select '3. Écoute',
         case
           when page like 'bible:%' then 'Bible audio · ' || regexp_replace(substr(page, 7), '\s+\d+$', '')
           when page like 'meditation:%' then 'Méditation du jour (audio)'
           else coalesce((select 'Podcast · ' || p.title from public.podcasts p where p.id::text = ev.page), page)
         end,
         appareil, jour
  from ev where type = 'play'
  union all
  select '4. Plan commencé', page, appareil, jour from ev where type = 'plan_start'
  union all
  select '5. Méditation lue', 'Méditation du jour', appareil, jour from ev where type = 'meditate'
),
par_personne as (
  select section, item, appareil, count(*) as fois, count(distinct jour) as jours
  from lignes group by section, item, appareil
),
stats as (
  select section, item,
         sum(fois) as vues,
         count(*) as personnes,
         count(*) filter (where jours >= 2) as revenants,
         round(100.0 * count(*) filter (where jours >= 2) / count(*)) as taux_retour_pct,
         round(avg(jours), 1) as jours_par_pers
  from par_personne group by section, item
),
classe as (
  select *, row_number() over (partition by section order by revenants desc, personnes desc) as rang
  from stats where personnes >= 2
)
select section, rang, item, vues, personnes, revenants, taux_retour_pct, jours_par_pers
from classe where rang <= 15
order by section, rang;


-- REQUÊTE 2 — Notes données par les membres (plans, formations) et
-- nombre de commentaires par plan.
select 'Plan (note)' as type, plan_slug as item, count(*) as nombre,
       round(avg(stars), 2) as moyenne, null::text as dernier_texte
from public.plan_ratings group by plan_slug
union all
select 'Formation (note)', formation_id, count(*), round(avg(note), 2),
       (array_agg(avis order by created_at desc) filter (where coalesce(btrim(avis), '') <> ''))[1]
from public.formation_ratings group by formation_id
union all
select 'Plan (commentaires)', plan_slug, count(*), null,
       (array_agg(body order by created_at desc))[1]
from public.plan_comments group by plan_slug
order by type, nombre desc;


-- REQUÊTE 3 — Les 80 derniers retours écrits (sans noms) : avis de
-- formation, commentaires de plans, questions FAQ, questions à l'assistant.
select * from (
  select 'Avis formation' as source, formation_id as item, note::text as detail, avis as texte, created_at
  from public.formation_ratings where coalesce(btrim(avis), '') <> ''
  union all
  select 'Commentaire plan', plan_slug, null, body, created_at from public.plan_comments
  union all
  select 'Question FAQ', coalesce(category, '—'), status, body, created_at from public.faq_questions
  union all
  select 'Question assistant', '—', null, question, created_at from public.assistant_logs
) t
order by created_at desc
limit 80;


-- REQUÊTE 4 — Plans : jusqu'où les membres connectés vont (jours cochés).
-- C'est le vrai « retour » sur un plan : revenir jour après jour.
select slug as plan,
       count(*) as membres,
       round(avg(cardinality(days)), 1) as jours_moyens,
       round(100.0 * count(*) filter (where cardinality(days) >= 3) / count(*)) as pct_3_jours_et_plus,
       round(100.0 * count(*) filter (where cardinality(days) >= 7) / count(*)) as pct_7_jours_et_plus,
       max(cardinality(days)) as record
from public.plan_progress
where cardinality(days) > 0
group by slug
order by membres desc;
