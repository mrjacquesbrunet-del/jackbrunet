-- Classement amical de la communauté (top intercesseurs).
-- À exécuter une fois dans Supabase → SQL Editor → Run.
--
-- Points = prières publiées ×5 + « je prie » ×1 + encouragements ×2
-- (même pondération que les grades).

create or replace function public.leaderboard_top(lim int default 10)
returns table (
  id uuid,
  pseudo text,
  avatar_url text,
  prayers bigint,
  prays bigint,
  comments bigint,
  points bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.pseudo,
    p.avatar_url,
    coalesce(pr.cnt, 0) as prayers,
    coalesce(rx.cnt, 0) as prays,
    coalesce(cm.cnt, 0) as comments,
    coalesce(pr.cnt, 0) * 5 + coalesce(rx.cnt, 0) * 1 + coalesce(cm.cnt, 0) * 2 as points
  from profiles p
  left join (select author_id, count(*) cnt from prayers group by author_id) pr on pr.author_id = p.id
  left join (select user_id, count(*) cnt from prayer_reactions where type = 'pray' group by user_id) rx on rx.user_id = p.id
  left join (select author_id, count(*) cnt from comments group by author_id) cm on cm.author_id = p.id
  order by points desc, prayers desc
  limit lim;
$$;

grant execute on function public.leaderboard_top(int) to anon, authenticated;
