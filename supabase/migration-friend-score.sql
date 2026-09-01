-- ============================================================
--  NOTIFICATION SOCIALE : « X a marqué N points au Défi du jour ! »
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--
--  À la fin du Défi du jour (Quiz), les ABONNÉS du joueur reçoivent
--  la notification (cloche + push, famille « Défis & duels » dans les
--  préférences). Garde-fou : une seule diffusion par 20 h.
-- ============================================================

-- 1) Autoriser le type 'friend_score' (NOT VALID : n'exige rien des
--    lignes existantes, ne s'applique qu'aux nouvelles).
alter table public.notifications
  drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check
  check (type in (
    'pray','heart','comment','follow','mention','admin','message','reply',
    'group_comment','group_reaction','group_post','group_message','group_join',
    'comment_reaction','pray_digest','follow_up','challenge','friend_score'
  )) not valid;

-- 2) La diffusion aux abonnés.
create or replace function public.notify_friends_score(points int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pseudo_ text;
  body_ text;
begin
  if points is null or points <= 0 then
    return;
  end if;
  -- Une seule diffusion par ~journée, même si l'app est réinstallée.
  if exists (
    select 1 from public.notifications
    where actor_id = auth.uid() and type = 'friend_score'
      and created_at > now() - interval '20 hours'
  ) then
    return;
  end if;
  select pseudo into pseudo_ from public.profiles where id = auth.uid();
  body_ := coalesce(nullif(trim(pseudo_), ''), 'Un ami')
           || ' a marqué ' || points || ' points au Défi du jour !';
  insert into public.notifications (user_id, actor_id, type, body, link)
  select f.follower_id, auth.uid(), 'friend_score', left(body_, 200), '/quiz'
  from public.follows f
  where f.following_id = auth.uid();
end;
$$;

grant execute on function public.notify_friends_score(int) to authenticated;
