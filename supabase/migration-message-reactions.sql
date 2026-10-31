-- ============================================================
--  Messages privés : réactions façon WhatsApp (un émoji par personne et
--  par message) et arrivée des messages en direct (temps réel).
--  À exécuter dans Supabase → SQL Editor. Sûr à relancer.
-- ============================================================

create table if not exists public.message_reactions (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  emoji      text not null check (char_length(emoji) between 1 and 8),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id)
);
alter table public.message_reactions enable row level security;

-- Seuls les deux personnes de la conversation voient et posent des réactions.
drop policy if exists message_reactions_select on public.message_reactions;
create policy message_reactions_select on public.message_reactions for select using (
  exists (select 1 from public.messages m where m.id = message_reactions.message_id
          and auth.uid() in (m.sender_id, m.recipient_id))
);
drop policy if exists message_reactions_insert on public.message_reactions;
create policy message_reactions_insert on public.message_reactions for insert with check (
  user_id = auth.uid()
  and exists (select 1 from public.messages m where m.id = message_reactions.message_id
              and auth.uid() in (m.sender_id, m.recipient_id))
);
drop policy if exists message_reactions_update on public.message_reactions;
create policy message_reactions_update on public.message_reactions for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists message_reactions_delete on public.message_reactions;
create policy message_reactions_delete on public.message_reactions for delete using (user_id = auth.uid());

-- Temps réel : nouveaux messages et réactions poussés à l'app sans attendre.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'message_reactions') then
    alter publication supabase_realtime add table public.message_reactions;
  end if;
end $$;
