-- ============================================================
--  « En ligne maintenant » : qui peut voir qui est en ligne.
--  À exécuter dans Supabase → SQL Editor (après migration-follows.sql
--  et migration-reports.sql). Sûr à relancer.
--
--  presence_visibility (réglage du profil) :
--    amis      → visible seulement par les amis (abonnés l'un à l'autre) — défaut
--    tous      → visible par tous les membres connectés
--    personne  → jamais visible en ligne
--  Les blocages (dans un sens ou dans l'autre) masquent toujours la présence.
-- ============================================================

-- Blocages (déjà créés par migration-reports.sql ; repris ici par sécurité).
create table if not exists public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);
alter table public.blocks enable row level security;
drop policy if exists blocks_select on public.blocks;
create policy blocks_select on public.blocks for select using (blocker_id = auth.uid());
drop policy if exists blocks_insert on public.blocks;
create policy blocks_insert on public.blocks for insert with check (blocker_id = auth.uid());
drop policy if exists blocks_delete on public.blocks;
create policy blocks_delete on public.blocks for delete using (blocker_id = auth.uid());

alter table public.profiles
  add column if not exists presence_visibility text not null default 'amis';

alter table public.profiles drop constraint if exists profiles_presence_visibility_check;
alter table public.profiles add constraint profiles_presence_visibility_check
  check (presence_visibility in ('amis', 'tous', 'personne'));

-- Le membre connecté a-t-il le droit de voir la présence de « cible » ?
create or replace function public.peut_voir_presence(cible uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from profiles p
    where p.id = cible
      and auth.uid() is not null
      and p.id <> auth.uid()
      and p.presence_visibility <> 'personne'
      and (
        p.presence_visibility = 'tous'
        or (
          exists (select 1 from follows f where f.follower_id = auth.uid() and f.following_id = p.id)
          and exists (select 1 from follows f where f.follower_id = p.id and f.following_id = auth.uid())
        )
      )
      and not exists (
        select 1 from blocks b
        where (b.blocker_id = auth.uid() and b.blocked_id = p.id)
           or (b.blocker_id = p.id and b.blocked_id = auth.uid())
      )
  );
$$;

-- Dernière activité d'un membre, seulement si on a le droit de la voir.
create or replace function public.presence_de(cible uuid)
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select p.last_seen_at
  from profiles p
  where p.id = cible and public.peut_voir_presence(cible);
$$;

-- Membres en ligne (actifs depuis moins de 3 minutes) que je peux voir.
create or replace function public.membres_en_ligne(limite int default 40)
returns table (id uuid, pseudo text, avatar_url text, verified boolean, last_seen_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.pseudo, p.avatar_url, p.verified, p.last_seen_at
  from profiles p
  where p.last_seen_at > now() - interval '3 minutes'
    and public.peut_voir_presence(p.id)
  order by p.last_seen_at desc
  limit greatest(1, least(coalesce(limite, 40), 60));
$$;

revoke all on function public.peut_voir_presence(uuid) from public, anon;
revoke all on function public.presence_de(uuid) from public, anon;
revoke all on function public.membres_en_ligne(int) from public, anon;
grant execute on function public.peut_voir_presence(uuid) to authenticated;
grant execute on function public.presence_de(uuid) to authenticated;
grant execute on function public.membres_en_ligne(int) to authenticated;

-- Accélère la recherche des membres actifs.
create index if not exists profiles_last_seen_idx on public.profiles (last_seen_at desc);
