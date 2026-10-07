-- ============================================================
--  PRIÈRES EN DIRECT (mur de prière)
--  À coller dans Supabase → SQL Editor → Run. Sûr à relancer.
--
--  - Un membre lance une prière « maintenant » : elle prend la
--    prochaine place libre de la file (1 min 30 chacune), et tous
--    ceux qui sont dans l'app prient en même temps pour elle.
--  - Ou il PROGRAMME une session (date, heure, durée) : les autres
--    peuvent demander « Me prévenir » et reçoivent une notification
--    au début.
--  - « Amen, j'ai prié » est compté ; à la fin, l'auteur reçoit
--    « N personnes ont prié avec toi ».
-- ============================================================

-- 1) Les prières en direct
create table if not exists public.prieres_direct (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  sujet text not null check (char_length(btrim(sujet)) between 3 and 600),
  voice_url text,
  debut timestamptz not null,
  duree_s int not null check (duree_s between 60 and 3600),
  programmee boolean not null default false,
  rappel_envoye boolean not null default false,
  bilan_envoye boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists prieres_direct_debut_idx on public.prieres_direct (debut);

alter table public.prieres_direct enable row level security;

drop policy if exists "prieres_direct_lecture" on public.prieres_direct;
create policy "prieres_direct_lecture" on public.prieres_direct
  for select using (true);

-- Création uniquement par les fonctions ci-dessous (place dans la file, limites).
drop policy if exists "prieres_direct_suppression" on public.prieres_direct;
create policy "prieres_direct_suppression" on public.prieres_direct
  for delete using (
    author_id = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_moderator)
  );

-- 2) « Me prévenir » (sessions programmées)
create table if not exists public.prieres_direct_rappels (
  priere_id uuid not null references public.prieres_direct(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (priere_id, user_id)
);
alter table public.prieres_direct_rappels enable row level security;

drop policy if exists "rappels_lecture" on public.prieres_direct_rappels;
create policy "rappels_lecture" on public.prieres_direct_rappels for select using (true);
drop policy if exists "rappels_ajout" on public.prieres_direct_rappels;
create policy "rappels_ajout" on public.prieres_direct_rappels for insert with check (user_id = auth.uid());
drop policy if exists "rappels_retrait" on public.prieres_direct_rappels;
create policy "rappels_retrait" on public.prieres_direct_rappels for delete using (user_id = auth.uid());

-- 3) « Amen, j'ai prié »
create table if not exists public.prieres_direct_amens (
  priere_id uuid not null references public.prieres_direct(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (priere_id, user_id)
);
alter table public.prieres_direct_amens enable row level security;

drop policy if exists "amens_lecture" on public.prieres_direct_amens;
create policy "amens_lecture" on public.prieres_direct_amens for select using (true);
drop policy if exists "amens_ajout" on public.prieres_direct_amens;
create policy "amens_ajout" on public.prieres_direct_amens for insert with check (user_id = auth.uid());

-- 4) Lancer une prière MAINTENANT : prochaine place libre de la file
create or replace function public.lancer_priere_direct(p_sujet text, p_voice text default null)
returns public.prieres_direct
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  libre timestamptz;
  r public.prieres_direct;
begin
  if uid is null then raise exception 'Connexion requise'; end if;
  if char_length(btrim(coalesce(p_sujet, ''))) < 3 then raise exception 'Sujet trop court'; end if;
  -- Pas plus de 2 prières en attente par personne.
  if (select count(*) from public.prieres_direct
        where author_id = uid and not programmee and debut + make_interval(secs => duree_s) > now()) >= 2 then
    raise exception 'Tu as déjà 2 prières dans la file';
  end if;
  -- Une seule attribution de place à la fois.
  perform pg_advisory_xact_lock(424242);
  select greatest(now() + interval '3 seconds', coalesce(max(debut + make_interval(secs => duree_s)), now()))
    into libre
    from public.prieres_direct
    where not programmee and debut + make_interval(secs => duree_s) > now();
  insert into public.prieres_direct (author_id, sujet, voice_url, debut, duree_s, programmee)
    values (uid, btrim(p_sujet), nullif(p_voice, ''), libre, 90, false)
    returning * into r;
  return r;
end; $$;

-- 5) PROGRAMMER une session (dans 5 min à 30 jours, 5 à 60 min)
create or replace function public.programmer_priere_direct(
  p_sujet text, p_debut timestamptz, p_duree_min int, p_voice text default null
)
returns public.prieres_direct
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  r public.prieres_direct;
begin
  if uid is null then raise exception 'Connexion requise'; end if;
  if char_length(btrim(coalesce(p_sujet, ''))) < 3 then raise exception 'Sujet trop court'; end if;
  if p_debut < now() + interval '4 minutes' or p_debut > now() + interval '30 days' then
    raise exception 'Choisis une heure entre dans 5 minutes et dans 30 jours';
  end if;
  if p_duree_min not in (5, 10, 15, 30, 60) then raise exception 'Durée invalide'; end if;
  if (select count(*) from public.prieres_direct
        where author_id = uid and programmee and debut > now()) >= 3 then
    raise exception 'Tu as déjà 3 sessions programmées';
  end if;
  insert into public.prieres_direct (author_id, sujet, voice_url, debut, duree_s, programmee)
    values (uid, btrim(p_sujet), nullif(p_voice, ''), p_debut, p_duree_min * 60, true)
    returning * into r;
  insert into public.prieres_direct_rappels (priere_id, user_id) values (r.id, uid)
    on conflict do nothing;
  return r;
end; $$;

grant execute on function public.lancer_priere_direct(text, text) to authenticated;
grant execute on function public.programmer_priere_direct(text, timestamptz, int, text) to authenticated;

-- 6) Nouveau type de notification
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in (
    'pray','heart','comment','follow','mention','admin','message','reply',
    'group_comment','group_reaction','group_post','group_message','group_join',
    'comment_reaction','pray_digest','follow_up','challenge','friend_score',
    'duo_invite','duo_accept','duo_read','duo_note','priere_direct'
  ));

-- 7) Chaque minute : rappels au début des sessions, bilan à la fin, ménage
create or replace function public.prieres_direct_tick()
returns void language plpgsql security definer set search_path = public as $$
declare s record; n int;
begin
  -- Début d'une session programmée → tous ceux qui ont demandé « Me prévenir ».
  for s in
    select * from public.prieres_direct
    where programmee and not rappel_envoye and debut <= now() + interval '1 minute'
  loop
    insert into public.notifications (user_id, actor_id, type, body, link)
      select rp.user_id, s.author_id, 'priere_direct',
             'La prière en direct commence : « ' || left(s.sujet, 80) || ' »',
             '/communaute/?direct=' || s.id
      from public.prieres_direct_rappels rp where rp.priere_id = s.id;
    update public.prieres_direct set rappel_envoye = true where id = s.id;
  end loop;

  -- Fin d'une prière → l'auteur apprend combien ont prié avec lui.
  for s in
    select * from public.prieres_direct
    where not bilan_envoye and debut + make_interval(secs => duree_s) <= now()
  loop
    select count(*) into n from public.prieres_direct_amens a
      where a.priere_id = s.id and a.user_id <> s.author_id;
    if n > 0 then
      insert into public.notifications (user_id, type, body, link)
        values (s.author_id, 'priere_direct',
                case when n = 1 then '1 personne a prié avec toi en direct'
                     else n || ' personnes ont prié avec toi en direct' end,
                '/communaute/');
    end if;
    update public.prieres_direct set bilan_envoye = true where id = s.id;
  end loop;

  -- Ménage : les prières terminées depuis plus de 7 jours.
  delete from public.prieres_direct where debut < now() - interval '7 days';
end; $$;

select cron.unschedule('prieres-direct')
  where exists (select 1 from cron.job where jobname = 'prieres-direct');
select cron.schedule('prieres-direct', '* * * * *', $$select public.prieres_direct_tick()$$);

-- 8) Mise à jour en direct de la liste dans l'app
do $$
begin
  alter publication supabase_realtime add table public.prieres_direct;
exception when duplicate_object then null;
end $$;

-- 9) Les prières en direct peuvent être signalées
alter table public.reports drop constraint if exists reports_target_type_check;
alter table public.reports add constraint reports_target_type_check
  check (target_type in (
    'group_post','group_comment','group_message','prayer','prayer_comment',
    'wall_post','wall_comment','message','profile','priere_direct'
  )) not valid;
