-- Messagerie privée entre membres (1 à 1). À exécuter dans Supabase → SQL Editor.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

create index if not exists messages_pair_idx on public.messages(sender_id, recipient_id, created_at);
create index if not exists messages_recipient_idx on public.messages(recipient_id, read);

alter table public.messages enable row level security;

drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert with check (auth.uid() = sender_id);

drop policy if exists messages_update_read on public.messages;
create policy messages_update_read on public.messages
  for update using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

-- Liste des conversations: dernier message + non-lus par interlocuteur.
create or replace function public.my_conversations()
returns table(partner_id uuid, last_body text, last_at timestamptz, unread int)
language sql
stable
security definer
set search_path = public
as $$
  with m as (
    select *,
      case when sender_id = auth.uid() then recipient_id else sender_id end as partner
    from messages
    where sender_id = auth.uid() or recipient_id = auth.uid()
  )
  select distinct on (partner)
    partner as partner_id,
    body as last_body,
    created_at as last_at,
    (select count(*)::int from messages x
       where x.recipient_id = auth.uid() and x.sender_id = m.partner and x.read = false) as unread
  from m
  order by partner, created_at desc;
$$;
grant execute on function public.my_conversations() to authenticated;

-- Nombre total de messages non lus.
create or replace function public.unread_messages()
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from messages where recipient_id = auth.uid() and read = false;
$$;
grant execute on function public.unread_messages() to authenticated;
