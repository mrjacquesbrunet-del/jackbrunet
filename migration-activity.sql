-- Activité & gamification: compte l'activité réelle d'un membre.
-- Corrige « Mon activité » (0 partout) et les points de grade.
-- À exécuter dans Supabase → SQL Editor.
--
--   prayers  = sujets de prière publiés (prayers.author_id)
--   comments = encouragements écrits (prayer_comments.author_id)
--   prays    = « Je prie » posés pour les autres (prayer_reactions type='pray')

create or replace function public.user_activity(uid uuid)
returns table(prayers int, comments int, prays int)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*)::int from prayers          where author_id = uid),
    (select count(*)::int from prayer_comments   where author_id = uid),
    (select count(*)::int from prayer_reactions  where user_id = uid and type = 'pray');
$$;

grant execute on function public.user_activity(uuid) to anon, authenticated;
