-- ============================================================
--  Q&R — Questions posées par les membres (« mur des questions »)
--  À exécuter dans Supabase → SQL Editor → Run.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.faq_questions (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  body         text not null,
  author_name  text,
  author_id    uuid references auth.users(id) on delete set null,
  category     text,
  status       text not null default 'nouvelle',   -- 'nouvelle' | 'publiee' | 'masquee'
  answer       text,
  answer_verse text,
  answered_at  timestamptz
);

create index if not exists faq_questions_created_idx on public.faq_questions (created_at desc);
create index if not exists faq_questions_status_idx  on public.faq_questions (status);

alter table public.faq_questions enable row level security;

-- Lecture publique de toutes les questions non masquées.
drop policy if exists faq_read on public.faq_questions;
create policy faq_read on public.faq_questions
  for select using (status <> 'masquee');

-- N'importe qui peut poser une question (corps 5..1000 caractères).
drop policy if exists faq_insert on public.faq_questions;
create policy faq_insert on public.faq_questions
  for insert with check (
    char_length(btrim(body)) between 5 and 1000
  );

-- Seul l'admin (Pasteur Jack) peut répondre / masquer / supprimer.
drop policy if exists faq_admin_update on public.faq_questions;
create policy faq_admin_update on public.faq_questions
  for update using (
    coalesce(auth.jwt() ->> 'email', '') in
      ('contact@jackbrunet.com', 'mr.jacquesbrunet@gmail.com')
  );

drop policy if exists faq_admin_delete on public.faq_questions;
create policy faq_admin_delete on public.faq_questions
  for delete using (
    coalesce(auth.jwt() ->> 'email', '') in
      ('contact@jackbrunet.com', 'mr.jacquesbrunet@gmail.com')
  );

-- Droits pour les rôles publics (RLS reste la vraie barrière de sécurité).
grant select, insert on public.faq_questions to anon, authenticated;
grant update, delete on public.faq_questions to authenticated;
