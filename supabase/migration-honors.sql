-- ============================================================
--  TITRES À RÉPÉTITION (« ×N ») : champions & intercesseurs
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--
--  Chaque dimanche 23 h 50 (UTC), le serveur enregistre :
--   - champion_semaine     : n°1 de la ligue des jeux de la semaine
--   - intercesseur_semaine : n°1 de la prière sur 7 jours
--  Et chaque 1er du mois à 00 h 10 :
--   - intercesseur_mois    : n°1 de la prière sur 30 jours
--  Les profils affichent ensuite « Champion de la semaine ×3 », etc.
-- ============================================================

create table if not exists public.honors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('champion_semaine','intercesseur_semaine','intercesseur_mois')),
  period text not null,           -- ex. '2026-S36' ou '2026-08'
  created_at timestamptz not null default now(),
  unique (user_id, kind, period)
);

alter table public.honors enable row level security;
drop policy if exists "honors lisibles" on public.honors;
create policy "honors lisibles" on public.honors
  for select to authenticated using (true);
-- (aucune policy d'écriture : seuls les jobs serveur insèrent)

-- Attribution hebdomadaire (appelée par pg_cron le dimanche soir).
create or replace function public.award_weekly_honors()
returns void language plpgsql security definer set search_path = public as $$
declare
  wk text := to_char(now(), 'IYYY') || '-S' || to_char(now(), 'IW');
  champ uuid;
  interc uuid;
begin
  select user_id into champ from public.arcade_week_leaderboard(1) limit 1;
  if champ is not null then
    insert into public.honors (user_id, kind, period)
    values (champ, 'champion_semaine', wk)
    on conflict do nothing;
  end if;
  select user_id into interc from public.top_intercessors(7, 1) limit 1;
  if interc is not null then
    insert into public.honors (user_id, kind, period)
    values (interc, 'intercesseur_semaine', wk)
    on conflict do nothing;
  end if;
end; $$;

-- Attribution mensuelle (1er du mois).
create or replace function public.award_monthly_honors()
returns void language plpgsql security definer set search_path = public as $$
declare
  mo text := to_char(now() - interval '2 days', 'YYYY-MM');
  interc uuid;
begin
  select user_id into interc from public.top_intercessors(30, 1) limit 1;
  if interc is not null then
    insert into public.honors (user_id, kind, period)
    values (interc, 'intercesseur_mois', mo)
    on conflict do nothing;
  end if;
end; $$;

-- Rendez-vous automatiques (pg_cron, déjà activé pour purge-voices).
select cron.unschedule('award-weekly-honors')
  where exists (select 1 from cron.job where jobname = 'award-weekly-honors');
select cron.schedule('award-weekly-honors', '50 23 * * 0', 'select public.award_weekly_honors()');

select cron.unschedule('award-monthly-honors')
  where exists (select 1 from cron.job where jobname = 'award-monthly-honors');
select cron.schedule('award-monthly-honors', '10 0 1 * *', 'select public.award_monthly_honors()');
