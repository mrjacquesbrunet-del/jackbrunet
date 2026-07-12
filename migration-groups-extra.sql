-- ============================================================
--  Groupes: image de couverture, groupes par défaut, et boîte
--  « témoignage / contact pasteur ». A lancer APRES migration-groups.sql.
-- ============================================================

-- Image de couverture (facultative) pour les cartes « Découvrir ».
alter table public.groups add column if not exists image text not null default '';

-- Boîte de réception « témoignage / contact » (lisible par l'admin).
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid,
  first_name text not null default '',
  last_name  text not null default '',
  body       text not null,
  kind       text not null default 'contact',  -- contact | temoignage
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
drop policy if exists cm_insert on public.contact_messages;
create policy cm_insert on public.contact_messages for insert with check (true);
drop policy if exists cm_admin_read on public.contact_messages;
create policy cm_admin_read on public.contact_messages for select using (public.is_admin());

-- Groupes précréés (publics), appartenant à l'admin. Idempotent (ne recrée pas
-- ceux qui existent déjà).
do $$
declare admin_id uuid; r record;
begin
  select id into admin_id from auth.users where lower(email) = 'mr.jacquesbrunet@gmail.com' limit 1;
  if admin_id is null then
    raise notice 'Compte admin introuvable — aucun groupe par défaut créé.';
    return;
  end if;
  for r in
    select * from (values
      ('Groupe de discussion', 'Échange, questions et entraide au quotidien.', 'lime'),
      ('Groupe Louanges',      'Partage tes chants, playlists et moments de louange.', 'violet'),
      ('Mission',              'Prière et soutien pour les missions et l''évangélisation.', 'sunset'),
      ('Famille en Christ',    'S''encourager et grandir ensemble dans la foi.', 'ocean'),
      ('Intercession',         'Unis dans la prière, les uns pour les autres.', 'gold'),
      ('Jeunes & Foi',         'Un espace pour la nouvelle génération.', 'rose')
    ) as t(name, descr, accent)
  loop
    if not exists (select 1 from public.groups where name = r.name) then
      with g as (
        insert into public.groups (name, description, accent, is_public, owner_id, invite_code)
        values (r.name, r.descr, r.accent, true, admin_id,
                upper(substring(md5(gen_random_uuid()::text) for 7)))
        returning id
      )
      insert into public.group_members (group_id, user_id, role, status)
      select id, admin_id, 'owner', 'approved' from g;
    end if;
  end loop;
end $$;
