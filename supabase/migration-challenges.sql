-- =====================================================================
--  Défi à un ami : le défieur joue 10 questions (Quiz ou Vrai ou Faux),
--  son ami joue EXACTEMENT les mêmes (même seed) et on compare les scores.
--  Notification in-app à l'ami. À exécuter dans Supabase → SQL Editor → Run.
-- =====================================================================

create table if not exists public.game_challenges (
  id               uuid primary key default gen_random_uuid(),
  game             text not null check (game in ('quiz','vraifaux')),
  seed             bigint not null,
  challenger_id    uuid not null references auth.users(id) on delete cascade,
  opponent_id      uuid not null references auth.users(id) on delete cascade,
  challenger_score integer not null,
  opponent_score   integer,
  status           text not null default 'pending',   -- pending | done
  created_at       timestamptz not null default now(),
  played_at        timestamptz
);
create index if not exists game_challenges_opp on public.game_challenges(opponent_id, status);
create index if not exists game_challenges_ch on public.game_challenges(challenger_id);

alter table public.game_challenges enable row level security;

-- Chacun voit les défis où il est impliqué. Écritures via fonctions seulement.
drop policy if exists "challenges visibles" on public.game_challenges;
create policy "challenges visibles"
  on public.game_challenges for select
  using (auth.uid() = challenger_id or auth.uid() = opponent_id);

-- Autorise le type de notification « challenge » (sinon l'insert de notif
-- ci-dessous violerait la contrainte et ferait échouer la création du défi).
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in (
    'pray','heart','comment','follow','mention','admin','message','reply',
    'group_comment','group_reaction','group_post','group_message','group_join',
    'comment_reaction','pray_digest','follow_up','challenge'
  ));

-- Crée un défi (le défieur a déjà joué : p_score) + notifie l'ami.
create or replace function public.challenge_create(p_game text, p_seed bigint, p_opponent uuid, p_score integer)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_pseudo text;
  v_label text;
begin
  if auth.uid() is null then return null; end if;
  if p_opponent is null or p_opponent = auth.uid() then return null; end if;
  if p_game not in ('quiz','vraifaux') then return null; end if;

  insert into public.game_challenges (game, seed, challenger_id, opponent_id, challenger_score)
  values (p_game, p_seed, auth.uid(), p_opponent, greatest(0, coalesce(p_score, 0)))
  returning id into v_id;

  select pseudo into v_pseudo from public.profiles where id = auth.uid();
  v_label := case when p_game = 'quiz' then 'Le jeu des connaissances' else 'Vrai ou Faux' end;

  insert into public.notifications (user_id, actor_id, type, body, link)
  values (
    p_opponent,
    auth.uid(),
    'challenge',
    coalesce(v_pseudo, 'Un joueur') || ' te défie sur ' || v_label || ' !',
    '/defi'
  );

  return v_id;
end;
$$;

-- L'ami répond au défi (une seule fois).
create or replace function public.challenge_answer(p_id uuid, p_score integer)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_challenger uuid;
  v_opp_pseudo text;
begin
  if auth.uid() is null then return; end if;

  update public.game_challenges
     set opponent_score = greatest(0, coalesce(p_score, 0)),
         status = 'done',
         played_at = now()
   where id = p_id and opponent_id = auth.uid() and opponent_score is null
   returning challenger_id into v_challenger;

  if v_challenger is not null then
    select pseudo into v_opp_pseudo from public.profiles where id = auth.uid();
    insert into public.notifications (user_id, actor_id, type, body, link)
    values (
      v_challenger,
      auth.uid(),
      'challenge',
      coalesce(v_opp_pseudo, 'Ton ami') || ' a relevé ton défi — vois le résultat !',
      '/defi'
    );
  end if;
end;
$$;

-- Liste des défis de l'utilisateur (avec pseudo + photo des deux joueurs).
create or replace function public.challenges_list()
returns table (
  id uuid, game text, seed bigint, status text, created_at timestamptz,
  i_am_challenger boolean,
  challenger_id uuid, challenger_pseudo text, challenger_avatar text, challenger_score integer,
  opponent_id uuid, opponent_pseudo text, opponent_avatar text, opponent_score integer
)
language sql security definer set search_path = public as $$
  select c.id, c.game, c.seed, c.status, c.created_at,
         (c.challenger_id = auth.uid()) as i_am_challenger,
         c.challenger_id, cp.pseudo, cp.avatar_url, c.challenger_score,
         c.opponent_id, op.pseudo, op.avatar_url, c.opponent_score
  from public.game_challenges c
  join public.profiles cp on cp.id = c.challenger_id
  join public.profiles op on op.id = c.opponent_id
  where c.challenger_id = auth.uid() or c.opponent_id = auth.uid()
  order by c.created_at desc
  limit 60;
$$;

-- Nombre de défis reçus à relever (pour la pastille).
create or replace function public.challenges_pending()
returns integer
language sql security definer set search_path = public as $$
  select count(*)::int from public.game_challenges
  where opponent_id = auth.uid() and status = 'pending';
$$;

grant execute on function public.challenge_create(text, bigint, uuid, integer) to authenticated;
grant execute on function public.challenge_answer(uuid, integer) to authenticated;
grant execute on function public.challenges_list() to authenticated;
grant execute on function public.challenges_pending() to authenticated;
