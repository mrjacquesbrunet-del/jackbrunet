-- ============================================================
-- ASSISTANT BIBLIQUE — journal des questions/réponses.
-- À exécuter dans Supabase → SQL Editor → Run. Idempotent.
--
-- Sert à :
--  1. la LIMITE quotidienne (10 questions / 24 h), vérifiée côté
--     serveur par l'Edge Function bible-assistant ;
--  2. la relecture pastorale : chaque membre voit son historique,
--     l'app n'écrit JAMAIS ici directement (seule l'Edge Function,
--     avec la clé service, insère).
-- ============================================================
create table if not exists public.assistant_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question text not null check (char_length(question) <= 1000),
  answer text not null,
  created_at timestamptz not null default now()
);
create index if not exists assistant_logs_user_day
  on public.assistant_logs (user_id, created_at desc);

alter table public.assistant_logs enable row level security;
drop policy if exists "assistant_select_own" on public.assistant_logs;
create policy "assistant_select_own" on public.assistant_logs
  for select using (auth.uid() = user_id);
-- Pas de policy insert/update/delete : seule l'Edge Function
-- (service role, qui contourne la RLS) écrit dans cette table.
