-- ============================================================
--  Dévotionnels gérés par l'admin (écriture, ajout, suppression).
--  A coller dans Supabase -> SQL Editor -> Run.
--  (Necessite public.is_admin(), deja creee par migration-admin.sql
--   / migration-tout.sql.)
--
--  L'application lit les devotionnels publies (published = true) et
--  les affiche a la place des 60 devotionnels integres. Si la table
--  est VIDE, l'app utilise automatiquement les 60 par defaut (repli
--  de securite : la meditation du jour ne casse jamais).
--
--  Depuis l'espace admin (/admin), Pasteur Jack peut importer ses 60
--  devotionnels existants d'un clic, puis les modifier / en ajouter /
--  en supprimer. Tout est en direct (OTA), sans reconstruire.
-- ============================================================

create table if not exists public.devotions (
  position                 integer primary key,
  theme                    text    not null default '',
  verse_text               text    not null default '',
  verse_reference          text    not null default '',
  punchline                text    not null default '',
  meditation               text    not null default '',
  declaration_text         text    not null default '',
  declaration_reference    text    not null default '',
  questions                jsonb   not null default '[]'::jsonb,
  published                boolean not null default true,
  updated_at               timestamptz not null default now()
);

alter table public.devotions enable row level security;

-- Lecture publique des devotionnels publies (tout le monde, meme non connecte).
drop policy if exists "devotions_read_published" on public.devotions;
create policy "devotions_read_published"
  on public.devotions for select
  using (published = true);

-- L'admin voit TOUT (y compris les brouillons non publies).
drop policy if exists "devotions_admin_read_all" on public.devotions;
create policy "devotions_admin_read_all"
  on public.devotions for select
  using (public.is_admin());

-- L'admin peut inserer / modifier / supprimer.
drop policy if exists "devotions_admin_insert" on public.devotions;
create policy "devotions_admin_insert"
  on public.devotions for insert
  with check (public.is_admin());

drop policy if exists "devotions_admin_update" on public.devotions;
create policy "devotions_admin_update"
  on public.devotions for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "devotions_admin_delete" on public.devotions;
create policy "devotions_admin_delete"
  on public.devotions for delete
  using (public.is_admin());
