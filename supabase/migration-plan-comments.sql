-- ============================================================
-- Avis et commentaires sur les plans de lecture
-- À exécuter dans Supabase → SQL Editor → Run.
-- ============================================================

create table if not exists public.plan_comments (
  id         uuid primary key default gen_random_uuid(),
  plan_slug  text not null,
  user_id    uuid not null references auth.users(id) on delete cascade,
  body       text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists plan_comments_slug_idx on public.plan_comments (plan_slug, created_at desc);

alter table public.plan_comments enable row level security;

-- Tout le monde peut lire les commentaires d'un plan.
drop policy if exists plan_comments_select on public.plan_comments;
create policy plan_comments_select on public.plan_comments
  for select using (true);

-- Une personne connectée publie en son nom.
drop policy if exists plan_comments_insert on public.plan_comments;
create policy plan_comments_insert on public.plan_comments
  for insert with check (auth.uid() = user_id);

-- On supprime son propre commentaire ; l'administrateur et les modérateurs
-- peuvent supprimer n'importe lequel.
drop policy if exists plan_comments_delete on public.plan_comments;
create policy plan_comments_delete on public.plan_comments
  for delete using (
    auth.uid() = user_id
    or public.is_admin()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_moderator)
  );

-- Nombre de commentaires par plan (pour la bulle).
create or replace function public.plan_comments_counts()
returns table(plan_slug text, cnt bigint)
language sql security definer set search_path = public as $$
  select plan_slug, count(*)::bigint from public.plan_comments group by plan_slug;
$$;
grant execute on function public.plan_comments_counts() to anon, authenticated;
