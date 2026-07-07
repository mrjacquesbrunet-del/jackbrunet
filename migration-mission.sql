-- ============================================================
--  Collecte Mission Madagascar : montant piloté en direct.
--  A coller dans Supabase -> SQL Editor -> Run.
--  (Necessite public.is_admin(), deja creee par migration-tout.sql.)
-- ============================================================

create table if not exists public.mission_stats (
  id int primary key default 1,
  raised_eur numeric not null default 0,
  objective_eur numeric not null default 10000,
  updated_at timestamptz not null default now(),
  constraint mission_single check (id = 1)
);

-- Ligne unique, initialisee au montant deja recu (152 EUR).
insert into public.mission_stats (id, raised_eur, objective_eur)
values (1, 152, 10000)
on conflict (id) do nothing;

alter table public.mission_stats enable row level security;

-- Lecture publique (pour afficher la barre sur le site).
drop policy if exists mission_stats_read on public.mission_stats;
create policy mission_stats_read on public.mission_stats for select using (true);

-- Ecriture reservee a l'admin, via une fonction securisee.
create or replace function public.set_mission_raised(val numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Réservé à l''administrateur';
  end if;
  update public.mission_stats set raised_eur = val, updated_at = now() where id = 1;
end;
$$;

grant execute on function public.set_mission_raised(numeric) to authenticated;
