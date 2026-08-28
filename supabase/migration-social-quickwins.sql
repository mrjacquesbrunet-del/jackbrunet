-- ============================================================
--  RÉSEAU SOCIAL — petits plus (présence + réactions rapides)
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--
--  1) Présence « En ligne / Actif il y a X » : colonne last_seen_at
--     sur les profils (l'app la met à jour ~1×/min d'activité).
--  2) Réactions rapides sur les sujets de prière (appui long) :
--     🙏 pray · ❤️ heart · 🕊️ dove · 🙌 hands · ✨ sparkles.
--     La notification envoyée reste 'pray' ou 'heart' (les nouveaux
--     emojis notifient comme un ❤️) pour ne pas toucher au reste.
-- ============================================================

-- 1) Présence
alter table public.profiles
  add column if not exists last_seen_at timestamptz;

-- 2) Types de réactions élargis
alter table public.prayer_reactions
  drop constraint if exists prayer_reactions_type_check;
alter table public.prayer_reactions
  add constraint prayer_reactions_type_check
  check (type in ('heart','pray','dove','hands','sparkles'));

-- La notification correspondante reste dans les types connus.
create or replace function public.notify_on_reaction()
returns trigger language plpgsql security definer set search_path = public as $$
declare aid uuid;
begin
  select author_id into aid from public.prayers where id = new.prayer_id;
  if aid is not null and aid <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, prayer_id)
    values (
      aid,
      new.user_id,
      case when new.type = 'pray' then 'pray' else 'heart' end,
      new.prayer_id
    );
  end if;
  return new;
end; $$;
