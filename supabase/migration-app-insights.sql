-- ============================================================
-- Analyse d'engagement de l'application (espace admin)
--   - nouveaux évènements : plan_start (plan commencé),
--     meditate (méditation complétée)
--   - RPC analytics_app_insights : actifs, fidèles, taux de retour,
--     méditations, plans commencés, top écrans de l'app
-- À exécuter dans Supabase → SQL Editor.
-- ============================================================

-- 1) Autoriser les nouveaux types d'évènement (on retire l'éventuelle
--    contrainte CHECK existante sur la table, puis on la recrée élargie).
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
     where conrelid = 'public.analytics_events'::regclass and contype = 'c'
  loop
    execute format('alter table public.analytics_events drop constraint %I', c.conname);
  end loop;
end $$;
alter table public.analytics_events add constraint analytics_events_type_check
  check (type in ('page','play','plan_start','meditate'));

-- 2) Statistiques d'engagement de l'application
create or replace function public.analytics_app_insights()
returns json language sql security definer set search_path = public as $$
  select json_build_object(
    'app_active_day',   (select count(distinct device_id) from analytics_events
                          where source = 'app' and created_at >= now() - interval '1 day'),
    'app_active_week',  (select count(distinct device_id) from analytics_events
                          where source = 'app' and created_at >= now() - interval '7 days'),
    'app_active_month', (select count(distinct device_id) from analytics_events
                          where source = 'app' and created_at >= now() - interval '30 days'),
    'regulars_week',    (select count(*) from (
                           select device_id from analytics_events
                            where source = 'app' and created_at >= now() - interval '7 days'
                            group by device_id
                           having count(distinct date_trunc('day', created_at)) >= 3
                         ) r),
    'returning_rate',   coalesce((
                          select round(100.0 * count(distinct a.device_id)
                                 / nullif((select count(distinct device_id) from analytics_events
                                            where source = 'app'
                                              and created_at >= now() - interval '14 days'
                                              and created_at <  now() - interval '7 days'), 0))
                            from analytics_events a
                           where a.source = 'app'
                             and a.created_at >= now() - interval '7 days'
                             and a.device_id in (
                               select device_id from analytics_events
                                where source = 'app'
                                  and created_at >= now() - interval '14 days'
                                  and created_at <  now() - interval '7 days')
                        ), 0),
    'plan_starts_month', (select count(*) from analytics_events
                           where type = 'plan_start' and created_at >= now() - interval '30 days'),
    'plan_starts_total', (select count(*) from analytics_events where type = 'plan_start'),
    'meditations_day',   (select count(*) from analytics_events
                           where type = 'meditate' and created_at >= now() - interval '1 day'),
    'meditations_week',  (select count(*) from analytics_events
                           where type = 'meditate' and created_at >= now() - interval '7 days'),
    'meditations_month', (select count(*) from analytics_events
                           where type = 'meditate' and created_at >= now() - interval '30 days'),
    'top_plans',        (select coalesce(json_agg(t), '[]'::json) from (
                           select page as label, count(*) as n from analytics_events
                            where type = 'plan_start' and created_at >= now() - interval '30 days'
                            group by page order by n desc limit 8) t),
    'top_app_pages',    (select coalesce(json_agg(t), '[]'::json) from (
                           select page as label, count(*) as n from analytics_events
                            where type = 'page' and source = 'app'
                              and created_at >= now() - interval '30 days'
                            group by page order by n desc limit 10) t)
  );
$$;

grant execute on function public.analytics_app_insights() to authenticated;
