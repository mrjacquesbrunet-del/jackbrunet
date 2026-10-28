-- Studio Jack : planning, idées, punchlines, tâches, agenda et suivi des statistiques.
-- Une seule table de documents JSON, lisible et modifiable UNIQUEMENT par l'admin
-- (is_admin() : les adresses e-mail de Jack). Aucun accès anonyme.

create table if not exists public.studio_docs (
  coll text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (coll, id)
);

alter table public.studio_docs enable row level security;

drop policy if exists "studio_admin_select" on public.studio_docs;
create policy "studio_admin_select" on public.studio_docs
  for select to authenticated using (public.is_admin());

drop policy if exists "studio_admin_insert" on public.studio_docs;
create policy "studio_admin_insert" on public.studio_docs
  for insert to authenticated with check (public.is_admin());

drop policy if exists "studio_admin_update" on public.studio_docs;
create policy "studio_admin_update" on public.studio_docs
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "studio_admin_delete" on public.studio_docs;
create policy "studio_admin_delete" on public.studio_docs
  for delete to authenticated using (public.is_admin());

revoke all on public.studio_docs from anon;
