-- ============================================================
-- Deep-link des notifications vers le COMMENTAIRE précis
-- Objectif : taper « X a réagi / répondu / t'a mentionné » ouvre le mur
--            ET défile jusqu'au commentaire exact (pas seulement le sujet).
-- À exécuter dans Supabase → SQL Editor.
-- ============================================================

-- 1) Nouvelle colonne : le commentaire concerné (nullable)
alter table public.notifications add column if not exists comment_id uuid;

-- 2) Commentaire sur ta prière → la notif pointe vers CE commentaire
create or replace function public.notify_on_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare aid uuid;
begin
  select author_id into aid from public.prayers where id = new.prayer_id;
  if aid is not null and aid <> new.author_id then
    insert into public.notifications (user_id, actor_id, type, prayer_id, comment_id, link)
    values (
      aid, new.author_id, 'comment', new.prayer_id, new.id,
      '/communaute/?prayer=' || new.prayer_id || '&c=' || new.id
    );
  end if;
  return new;
end; $$;

drop trigger if exists on_comment_notify on public.prayer_comments;
create trigger on_comment_notify
  after insert on public.prayer_comments
  for each row execute function public.notify_on_comment();

-- 3) Réaction sur ton commentaire → la notif pointe vers CE commentaire
create or replace function public.notify_comment_reaction()
returns trigger language plpgsql security definer set search_path = public as $$
declare c_author uuid; c_prayer uuid;
begin
  select author_id, prayer_id into c_author, c_prayer
    from public.prayer_comments where id = new.comment_id;
  if c_author is not null and c_author <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, body, link, prayer_id, comment_id)
    values (
      c_author, new.user_id, 'comment_reaction', new.emoji,
      '/communaute/?prayer=' || c_prayer || '&c=' || new.comment_id, c_prayer, new.comment_id
    );
  end if;
  return new;
end; $$;

drop trigger if exists on_comment_reaction_notify on public.comment_reactions;
create trigger on_comment_reaction_notify
  after insert on public.comment_reactions
  for each row execute function public.notify_comment_reaction();

-- 4) Mention @pseudo → la notif pointe vers le commentaire si fourni, sinon le sujet.
--    On remplace l'ancienne version (2 arguments) par une version à 3 arguments
--    (le 3ᵉ, cmt, a une valeur par défaut : les anciens appels restent valides).
drop function if exists public.notify_mention(uuid, uuid);
drop function if exists public.notify_mention(uuid, uuid, uuid);
create or replace function public.notify_mention(target uuid, prayer uuid, cmt uuid default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if target is null or target = auth.uid() then return; end if;
  insert into public.notifications (user_id, actor_id, type, prayer_id, comment_id, link)
  values (
    target, auth.uid(), 'mention', prayer, cmt,
    case
      when prayer is not null and cmt is not null then '/communaute/?prayer=' || prayer || '&c=' || cmt
      when prayer is not null then '/communaute/?prayer=' || prayer
      else null
    end
  );
end; $$;
grant execute on function public.notify_mention(uuid, uuid, uuid) to authenticated;
