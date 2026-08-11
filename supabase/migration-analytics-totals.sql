-- ============================================================
-- Totaux d'audience depuis le lancement (espace admin)
--   visits_total   : toutes les visites de pages enregistrées
--   visitors_total : appareils uniques (anonymes)
-- À exécuter dans Supabase → SQL Editor.
-- ============================================================

create or replace function public.analytics_totals()
returns json language sql security definer set search_path = public as $$
  select json_build_object(
    'visits_total',   (select count(*) from public.analytics_events where type = 'page'),
    'visitors_total', (select count(distinct device_id) from public.analytics_events where type = 'page')
  );
$$;

grant execute on function public.analytics_totals() to authenticated;
