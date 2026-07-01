-- ============================================================
--  Statistiques intégrées (anonymes) : pages vues + écoutes.
--  Prérequis : public.is_admin() (migration-admin.sql).
--  À exécuter dans Supabase → SQL Editor.
-- ============================================================

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  type text not null,          -- 'page' (vue de page) | 'play' (écoute audio)
  page text,                   -- route (/ecouter) ou id de l'épisode
  device_id text,              -- identifiant anonyme d'appareil (pas de données perso)
  created_at timestamptz not null default now()
);
create index if not exists analytics_created_idx on public.analytics_events (created_at);
create index if not exists analytics_type_idx on public.analytics_events (type, created_at);

alter table public.analytics_events enable row level security;

-- Tout le monde peut enregistrer un évènement (anonyme). Personne ne peut lire
-- directement (les stats passent par des fonctions réservées à l'admin).
drop policy if exists "analytics_insert" on public.analytics_events;
create policy "analytics_insert" on public.analytics_events for insert with check (true);

-- Résumé chiffré (jour / semaine / mois), réservé à l'admin.
create or replace function public.analytics_summary()
returns json language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur'; end if;
  return (
    select json_build_object(
      'plays_day',      (select count(*) from analytics_events where type='play'  and created_at > now() - interval '1 day'),
      'plays_week',     (select count(*) from analytics_events where type='play'  and created_at > now() - interval '7 day'),
      'plays_month',    (select count(*) from analytics_events where type='play'  and created_at > now() - interval '30 day'),
      'listeners_day',  (select count(distinct device_id) from analytics_events where type='play' and created_at > now() - interval '1 day'),
      'listeners_week', (select count(distinct device_id) from analytics_events where type='play' and created_at > now() - interval '7 day'),
      'listeners_month',(select count(distinct device_id) from analytics_events where type='play' and created_at > now() - interval '30 day'),
      'visitors_day',   (select count(distinct device_id) from analytics_events where created_at > now() - interval '1 day'),
      'visitors_week',  (select count(distinct device_id) from analytics_events where created_at > now() - interval '7 day'),
      'visitors_month', (select count(distinct device_id) from analytics_events where created_at > now() - interval '30 day')
    )
  );
end; $$;
grant execute on function public.analytics_summary() to authenticated;

-- Top pages / top épisodes, réservé à l'admin.
create or replace function public.analytics_top(kind text, days int default 30)
returns table(label text, n bigint) language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Réservé à l''administrateur'; end if;
  return query
    select page as label, count(*)::bigint as n
    from public.analytics_events
    where type = kind and page is not null and created_at > now() - (days || ' days')::interval
    group by page order by n desc limit 25;
end; $$;
grant execute on function public.analytics_top(text, int) to authenticated;
