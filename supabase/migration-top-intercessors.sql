-- ============================================================
-- Intercesseurs de la semaine (mur de prière)
-- Classement des membres ayant le plus prié / encouragé les autres
-- (réactions « Je prie » + commentaires) sur les N derniers jours.
-- À exécuter dans Supabase → SQL Editor.
-- ============================================================

create or replace function public.top_intercessors(days int default 7, lim int default 4)
returns table(user_id uuid, score bigint)
language sql security definer set search_path = public as $$
  select u.uid as user_id, sum(u.n)::bigint as score from (
    select r.user_id as uid, count(*) as n
      from public.prayer_reactions r
      join public.prayers p on p.id = r.prayer_id
     where r.type = 'pray'
       and r.created_at >= now() - make_interval(days => days)
       and r.user_id <> p.author_id          -- prier pour les AUTRES
     group by r.user_id
    union all
    select c.author_id, count(*)
      from public.prayer_comments c
      join public.prayers p on p.id = c.prayer_id
     where c.created_at >= now() - make_interval(days => days)
       and c.author_id <> p.author_id        -- encourager les AUTRES
     group by c.author_id
  ) u
  group by u.uid
  order by score desc
  limit lim;
$$;

grant execute on function public.top_intercessors(int, int) to authenticated;
