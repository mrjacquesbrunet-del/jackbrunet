-- ============================================================
--  RÉACTIONS SUR LES COMMENTAIRES DU MUR (appui long, façon WhatsApp)
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--
--  - Une réaction (🙏 ❤️ 🕊️ 🙌 ✨) par personne et par commentaire.
--  - L'auteur du commentaire reçoit une notification (et un push via le
--    webhook notify-push déjà en place).
-- ============================================================

-- 1) Table
create table if not exists public.comment_reactions (
  comment_id uuid not null references public.prayer_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 8),
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

alter table public.comment_reactions enable row level security;

drop policy if exists "comment_reactions_read" on public.comment_reactions;
create policy "comment_reactions_read" on public.comment_reactions
  for select to authenticated using (true);

drop policy if exists "comment_reactions_insert_own" on public.comment_reactions;
create policy "comment_reactions_insert_own" on public.comment_reactions
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "comment_reactions_update_own" on public.comment_reactions;
create policy "comment_reactions_update_own" on public.comment_reactions
  for update to authenticated using (user_id = auth.uid());

drop policy if exists "comment_reactions_delete_own" on public.comment_reactions;
create policy "comment_reactions_delete_own" on public.comment_reactions
  for delete to authenticated using (user_id = auth.uid());

-- 2) Type de notification autorisé
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in (
    'pray','heart','comment','follow','mention','admin','message','reply',
    'group_comment','group_reaction','group_post','group_message','group_join',
    'comment_reaction'
  ));

-- 3) Notification à l'auteur du commentaire (première réaction de chaque
--    personne uniquement : changer d'emoji ne re-notifie pas).
create or replace function public.notify_comment_reaction()
returns trigger language plpgsql security definer set search_path = public as $$
declare c_author uuid; c_prayer uuid;
begin
  select author_id, prayer_id into c_author, c_prayer
    from public.prayer_comments where id = new.comment_id;
  if c_author is not null and c_author <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, body, link, prayer_id)
    values (
      c_author, new.user_id, 'comment_reaction', new.emoji,
      '/communaute/?prayer=' || c_prayer, c_prayer
    );
  end if;
  return new;
end; $$;

drop trigger if exists on_comment_reaction_notify on public.comment_reactions;
create trigger on_comment_reaction_notify
  after insert on public.comment_reactions
  for each row execute function public.notify_comment_reaction();
