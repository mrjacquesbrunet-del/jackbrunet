-- Synchronisation du compte : carnet, versets, plans (données privées)

-- 1) CARNET (notes)
create table if not exists public.notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  category text not null default 'Note',
  title text not null default '',
  body text not null default '',
  answered boolean not null default false,
  ts bigint not null default 0,
  primary key (user_id, id)
);
alter table public.notes enable row level security;
drop policy if exists "notes_own" on public.notes;
create policy "notes_own" on public.notes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 2) VERSETS ENREGISTRÉS (snippets)
create table if not exists public.snippets (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  text text not null default '',
  reference text,
  kind text not null default 'texte',
  ts bigint not null default 0,
  primary key (user_id, id)
);
alter table public.snippets enable row level security;
drop policy if exists "snippets_own" on public.snippets;
create policy "snippets_own" on public.snippets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 3) SURLIGNAGES (highlights)
create table if not exists public.highlights (
  user_id uuid not null references auth.users(id) on delete cascade,
  hid text not null,
  primary key (user_id, hid)
);
alter table public.highlights enable row level security;
drop policy if exists "highlights_own" on public.highlights;
create policy "highlights_own" on public.highlights
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 4) PROGRESSION DES PLANS
create table if not exists public.plan_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  days int[] not null default '{}',
  primary key (user_id, slug)
);
alter table public.plan_progress enable row level security;
drop policy if exists "plan_progress_own" on public.plan_progress;
create policy "plan_progress_own" on public.plan_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
