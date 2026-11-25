-- ============================================================
--  « Modifier » : chacun peut corriger SES sujets de prière, ses
--  commentaires et réponses, ses publications, commentaires et
--  messages dans les groupes. Mention « modifié » affichée.
--  Supabase → SQL Editor → Run. Relançable sans risque.
-- ============================================================

alter table public.prayers         add column if not exists edited_at timestamptz;
alter table public.prayer_comments add column if not exists edited_at timestamptz;
alter table public.group_posts     add column if not exists edited_at timestamptz;
alter table public.group_comments  add column if not exists edited_at timestamptz;
alter table public.group_messages  add column if not exists edited_at timestamptz;

-- Modifier le texte d'une de MES publications (seul l'auteur le peut).
create or replace function public.modifier_publication(p_type text, p_id uuid, p_body text)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  texte text := trim(coalesce(p_body, ''));
begin
  if auth.uid() is null or texte = '' or char_length(texte) > 5000 then return false; end if;
  if p_type = 'priere' then
    update public.prayers set body = texte, edited_at = now() where id = p_id and author_id = auth.uid();
  elsif p_type = 'commentaire' then
    update public.prayer_comments set body = texte, edited_at = now() where id = p_id and author_id = auth.uid();
  elsif p_type = 'groupe_post' then
    update public.group_posts set body = texte, edited_at = now() where id = p_id and author_id = auth.uid();
  elsif p_type = 'groupe_commentaire' then
    update public.group_comments set body = texte, edited_at = now() where id = p_id and author_id = auth.uid();
  elsif p_type = 'groupe_message' then
    update public.group_messages set body = texte, edited_at = now() where id = p_id and author_id = auth.uid();
  else
    return false;
  end if;
  return found;
end $$;
grant execute on function public.modifier_publication(text, uuid, text) to authenticated;
