-- Réponses aux commentaires du mur de prière (fil à un niveau).
-- À exécuter dans Supabase → SQL Editor.
--
-- Ajoute une colonne parent_id: une réponse pointe vers le commentaire parent.
-- Si le commentaire parent est supprimé, ses réponses le sont aussi (cascade).

alter table public.prayer_comments
  add column if not exists parent_id uuid
  references public.prayer_comments(id) on delete cascade;

create index if not exists prayer_comments_parent_idx
  on public.prayer_comments(parent_id);
