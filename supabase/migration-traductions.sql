-- « Voir la traduction » : mémoire des traductions des textes des membres.
-- Lue et écrite UNIQUEMENT par la fonction « traduire » (clé de service) :
-- aucune règle d'accès pour les utilisateurs.
create table if not exists public.traductions (
  cle text primary key,
  langue text not null,
  source text,
  traduction text not null,
  created_at timestamptz not null default now()
);

alter table public.traductions enable row level security;
