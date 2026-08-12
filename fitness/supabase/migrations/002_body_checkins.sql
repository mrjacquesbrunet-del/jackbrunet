-- ============================================================================
-- APPLICATION FITNESS — MIGRATION 002 : BILANS CORPORELS (CHECK-INS)
--
-- À exécuter APRÈS la migration 001, sur le même projet Supabase dédié.
-- Démarche : Supabase → SQL Editor → New query → coller tout → Run.
--
-- Contenu :
--  - bilans corporels (initial / mensuel / manuel) : body_checkins
--  - mensurations détaillées (côté, relâché/contracté, cm normalisés) :
--    body_measurements — remplace l'ancienne table measurement_entries
--  - photos rattachées à un bilan : colonne checkin_id sur progress_photos
--    (une seule table photos ; le lien au bilan couvre l'entité CheckInPhoto)
--  - préférences profil : unité d'affichage (cm/pouces), verrou biométrique
--    des photos, report du rappel mensuel
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFIL : nouvelles préférences
-- ----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists measurement_unit text not null default 'cm'
    check (measurement_unit in ('cm', 'in')),
  add column if not exists photo_biometric_lock boolean not null default false,
  add column if not exists checkin_snoozed_until date;

-- ----------------------------------------------------------------------------
-- 2. BILANS CORPORELS
-- ----------------------------------------------------------------------------
create table public.body_checkins (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null default current_date,
  checkin_type text not null default 'manual'
               check (checkin_type in ('initial', 'monthly', 'manual')),
  weight_kg    numeric(5,2) check (weight_kg > 0),
  energy       smallint check (energy between 1 and 5),
  motivation   smallint check (motivation between 1 and 5),
  notes        text,
  created_at   timestamptz not null default now()
);

create index idx_body_checkins_user_date on public.body_checkins (user_id, checkin_date desc);

-- Un seul bilan initial par utilisateur : c'est la référence de départ,
-- elle ne doit jamais être écrasée (comparaison départ → aujourd'hui).
create unique index uniq_body_checkins_initial
  on public.body_checkins (user_id)
  where checkin_type = 'initial';

-- ----------------------------------------------------------------------------
-- 3. MENSURATIONS DÉTAILLÉES
--    Toujours stockées en CENTIMÈTRES (unité normalisée) ; la conversion
--    cm ↔ pouces se fait à l'affichage selon profiles.measurement_unit.
-- ----------------------------------------------------------------------------
create table public.body_measurements (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  checkin_id        uuid references public.body_checkins(id) on delete cascade, -- null = mesure ponctuelle
  measured_on       date not null default current_date,
  measurement_type  text not null check (measurement_type in (
                    'neck', 'shoulders', 'chest', 'waist', 'abdomen', 'hips',
                    'biceps', 'forearm', 'thigh', 'calf', 'custom')),
  custom_label      text, -- obligatoire quand measurement_type = 'custom'
  side              text not null default 'center'
                    check (side in ('left', 'right', 'center')),
  measurement_state text not null default 'not_applicable'
                    check (measurement_state in ('relaxed', 'flexed', 'not_applicable')),
  value_cm          numeric(6,2) not null check (value_cm > 0),
  created_at        timestamptz not null default now(),
  constraint custom_needs_label
    check (measurement_type <> 'custom' or custom_label is not null)
);

create index idx_body_measurements_user_type
  on public.body_measurements (user_id, measurement_type, measured_on desc);
create index idx_body_measurements_checkin on public.body_measurements (checkin_id);

-- L'ancienne table simple est remplacée par body_measurements
-- (plus flexible : côté gauche/droit, relâché/contracté, taille ET ventre,
-- mesures personnalisées, rattachement à un bilan).
drop table if exists public.measurement_entries;

-- ----------------------------------------------------------------------------
-- 4. PHOTOS : rattachement à un bilan
--    (progress_photos reste LA table des photos ; une photo de bilan est une
--    photo avec checkin_id renseigné — couvre l'entité « CheckInPhoto »)
-- ----------------------------------------------------------------------------
alter table public.progress_photos
  add column if not exists checkin_id uuid references public.body_checkins(id) on delete set null;

create index idx_progress_photos_checkin on public.progress_photos (checkin_id);

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
alter table public.body_checkins     enable row level security;
alter table public.body_measurements enable row level security;

create policy "body_checkins_select_own" on public.body_checkins
  for select using (auth.uid() = user_id);
create policy "body_checkins_insert_own" on public.body_checkins
  for insert with check (auth.uid() = user_id);
create policy "body_checkins_update_own" on public.body_checkins
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "body_checkins_delete_own" on public.body_checkins
  for delete using (auth.uid() = user_id);

create policy "body_measurements_select_own" on public.body_measurements
  for select using (auth.uid() = user_id);
create policy "body_measurements_insert_own" on public.body_measurements
  for insert with check (auth.uid() = user_id);
create policy "body_measurements_update_own" on public.body_measurements
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "body_measurements_delete_own" on public.body_measurements
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- FIN DE LA MIGRATION 002
-- ============================================================================
