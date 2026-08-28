-- ============================================================
--  PUSH TÉLÉPHONE POUR LES MESSAGES PRIVÉS
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--
--  Chaque message privé reçu crée une notification (cloche) ;
--  le webhook « notifications » → fonction notify-push (déjà en
--  place) envoie alors la notification PUSH OneSignal sur le
--  téléphone du destinataire : « X t'a envoyé un message », clic
--  → ouvre directement la conversation.
--
--  Anti-doublon : si une notification de message du même
--  expéditeur date de moins de 10 secondes (ex. plusieurs
--  messages d'affilée, ou broadcast), on n'en recrée pas.
-- ============================================================

create or replace function public.notify_dm_push()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Pas de notification pour un message à soi-même.
  if new.recipient_id = new.sender_id then
    return new;
  end if;

  -- Anti-doublon (messages rapprochés → une seule notification).
  if exists (
    select 1 from public.notifications
    where user_id = new.recipient_id
      and actor_id = new.sender_id
      and type = 'message'
      and created_at > now() - interval '10 seconds'
  ) then
    return new;
  end if;

  insert into public.notifications (user_id, actor_id, type, body, link, read)
  values (
    new.recipient_id,
    new.sender_id,
    'message',
    case when coalesce(new.body, '') = '' then 'Note vocale' else left(new.body, 140) end,
    '/messages/?u=' || new.sender_id,
    false
  );
  return new;
end $$;

drop trigger if exists trg_notify_dm on public.messages;
create trigger trg_notify_dm
  after insert on public.messages
  for each row execute function public.notify_dm_push();
