-- ============================================================
--  DUEL EN LIGNE (Vrai ou Faux en direct)
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--
--  notify_duel : envoie une notification « défi en direct » à un
--  membre connecté, avec le lien du salon (/vrai-faux?duel=CODE).
--  Le jeu lui-même passe par Supabase Realtime (aucune table).
-- ============================================================

create or replace function public.notify_duel(target uuid, body text, link text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target is null or target = auth.uid() then
    return;
  end if;
  insert into public.notifications (user_id, actor_id, type, body, link)
  values (target, auth.uid(), 'challenge', left(body, 200), left(link, 200));
end;
$$;

grant execute on function public.notify_duel(uuid, text, text) to authenticated;
