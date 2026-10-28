-- Studio Jack : activité quotidienne de l'application RHEMA (carte « Activité RHEMA » de l'accueil).
-- Réservé à l'admin : la fonction renvoie null pour tout autre compte.
create or replace function public.analytics_app_daily(jours int default 30)
returns json language sql stable security definer set search_path = public as $$
  select case when not public.is_admin() then null else json_build_object(
    'serie', (
      select coalesce(json_agg(json_build_object('jour', j.jour, 'actifs', coalesce(a.n, 0)) order by j.jour), '[]'::json)
        from generate_series((now() at time zone 'Europe/Paris')::date - (jours - 1),
                             (now() at time zone 'Europe/Paris')::date, interval '1 day') as j(jour)
        left join (
          select (created_at at time zone 'Europe/Paris')::date as jour, count(distinct device_id) as n
            from analytics_events
           where source = 'app' and created_at >= now() - make_interval(days => jours + 1)
           group by 1
        ) a on a.jour = j.jour::date
    ),
    'actifs_periode',   (select count(distinct device_id) from analytics_events
                          where source = 'app' and created_at >= now() - make_interval(days => jours)),
    'actifs_precedent', (select count(distinct device_id) from analytics_events
                          where source = 'app'
                            and created_at >= now() - make_interval(days => 2 * jours)
                            and created_at <  now() - make_interval(days => jours)),
    'actifs_aujourdhui', (select count(distinct device_id) from analytics_events
                          where source = 'app' and created_at >= date_trunc('day', now() at time zone 'Europe/Paris') at time zone 'Europe/Paris'),
    'en_ce_moment',     (select count(distinct device_id) from analytics_events
                          where source = 'app' and created_at >= now() - interval '5 minutes'),
    'inscrits_periode', (select count(*) from profiles where created_at >= now() - make_interval(days => jours)),
    'inscrits_precedent', (select count(*) from profiles
                          where created_at >= now() - make_interval(days => 2 * jours)
                            and created_at <  now() - make_interval(days => jours))
  ) end
$$;

revoke all on function public.analytics_app_daily(int) from public, anon;
grant execute on function public.analytics_app_daily(int) to authenticated;

-- Accélère les comptes par jour (sans effet si l'index existe déjà).
create index if not exists analytics_events_source_created_idx on public.analytics_events (source, created_at);
