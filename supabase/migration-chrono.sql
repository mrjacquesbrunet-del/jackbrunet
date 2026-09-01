-- =====================================================================
--  Ajoute « La Chronologie » (chrono) aux classements des jeux.
--  1) La contrainte de la table arcade_scores accepte le nouveau jeu.
--  2) La fonction game_submit accepte le nouveau jeu.
--  Le classement général (game_leaderboard_total) le prend en compte
--  automatiquement (somme de tous les jeux).
--  À exécuter dans Supabase → SQL Editor → Run.
-- =====================================================================

alter table public.arcade_scores
  drop constraint if exists arcade_scores_game_check;

alter table public.arcade_scores
  add constraint arcade_scores_game_check
  check (game in ('quiz','vraifaux','memoriser','quisuisje','chrono'));

create or replace function public.game_submit(p_game text, p_points integer)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  if p_game not in ('quiz','vraifaux','memoriser','quisuisje','chrono') then return; end if;
  insert into public.arcade_scores (user_id, game, points, updated_at)
  values (auth.uid(), p_game, greatest(0, coalesce(p_points, 0)), now())
  on conflict (user_id, game) do update
    set points = greatest(public.arcade_scores.points, excluded.points),
        updated_at = now();
end;
$$;
