-- ============================================================
--  Mission Madagascar : 2e jauge « Participation aux frais des
--  bénévoles » (billets d'avion payés par les bénévoles).
--  Objectif : 7 × 900 € + 5 × 1 570 € = 14 150 €.
--  Montant réglé par l'admin, affiché en direct sur le site.
--  Supabase → SQL Editor → Run. Relançable sans risque.
-- ============================================================

alter table public.mission_stats add column if not exists benevoles_eur numeric not null default 0;
alter table public.mission_stats add column if not exists objectif_benevoles_eur numeric not null default 14150;

create or replace function public.set_mission_benevoles(val numeric)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Réservé à l''administrateur';
  end if;
  update public.mission_stats set benevoles_eur = greatest(0, val), updated_at = now() where id = 1;
end $$;
grant execute on function public.set_mission_benevoles(numeric) to authenticated;
