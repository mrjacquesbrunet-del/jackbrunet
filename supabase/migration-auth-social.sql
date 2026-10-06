-- Connexion Google / Apple : le profil créé à l'inscription reprend le
-- prénom et la photo fournis par Google (Apple ne fournit pas de photo).
-- Le déclencheur on_auth_user_created existe déjà ; on remplace seulement
-- la fonction. Rien n'est modifié pour les profils déjà existants.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  prenom text := nullif(trim(coalesce(
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'given_name',
    split_part(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), ' ', 1)
  )), '');
  photo text := nullif(coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'), '');
begin
  insert into public.profiles (id, pseudo, avatar_url)
  values (new.id, coalesce(prenom, nullif(split_part(new.email, '@', 1), ''), 'Ami(e)'), photo)
  on conflict (id) do nothing;
  return new;
end; $$;
