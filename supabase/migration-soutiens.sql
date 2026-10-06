-- Soutiens « en un clic » (achats intégrés Apple / Google).
-- Une ligne par soutien, écrite par l'app après un paiement réussi.
-- Lecture réservée à l'admin (public.is_admin()).
create table if not exists public.soutiens (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  produit text not null,
  montant numeric(10, 2),
  devise text,
  plateforme text,
  transaction_id text,
  created_at timestamptz not null default now()
);

alter table public.soutiens enable row level security;

drop policy if exists "soutiens_insert" on public.soutiens;
create policy "soutiens_insert" on public.soutiens
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "soutiens_admin_select" on public.soutiens;
create policy "soutiens_admin_select" on public.soutiens
  for select to authenticated
  using (public.is_admin());
