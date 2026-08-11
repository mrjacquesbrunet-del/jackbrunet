-- ============================================================
-- Provenance des visites (app native ou site) + ventilation
-- dans les totaux de l'espace admin.
-- À exécuter dans Supabase → SQL Editor.
-- ============================================================

-- 1) Colonne de provenance (les anciennes lignes restent sans source)
alter table public.analytics_events add column if not exists source text;

-- 2) Totaux enrichis : total, uniques, et ventilation app / site
create or replace function public.analytics_totals()
returns json language sql security definer set search_path = public as $$
  select json_build_object(
    'visits_total',   (select count(*) from public.analytics_events where type = 'page'),
    'visitors_total', (select count(distinct device_id) from public.analytics_events where type = 'page'),
    'visits_app',     (select count(*) from public.analytics_events where type = 'page' and source = 'app'),
    'visits_site',    (select count(*) from public.analytics_events where type = 'page' and source = 'site')
  );
$$;

grant execute on function public.analytics_totals() to authenticated;
