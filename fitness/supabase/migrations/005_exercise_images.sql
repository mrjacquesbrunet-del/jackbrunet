-- ============================================================================
-- APPLICATION FITNESS — MIGRATION 005 : PHOTOS DES EXERCICES
--
-- À exécuter APRÈS les migrations 001 à 004, sur le projet Supabase dédié.
-- Démarche : Supabase → SQL Editor → New query → coller tout → Run.
--
-- Source des photos : Free Exercise DB (github.com/yuhonas/free-exercise-db),
-- 873 exercices photographiés, licence Unlicense (domaine public) —
-- utilisation totalement libre. Chaque exercice de la bibliothèque de base
-- est relié à sa photo de démonstration.
-- ============================================================================

alter table public.exercises
  add column if not exists image_url text; -- URL publique (exercices de la base globale)

do $$
declare
  base text := 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
begin
  update public.exercises set image_url = base || 'Barbell_Bench_Press_-_Medium_Grip/0.jpg'         where user_id is null and name = 'Développé couché';
  update public.exercises set image_url = base || 'Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg'  where user_id is null and name = 'Développé incliné';
  update public.exercises set image_url = base || 'Dumbbell_Flyes/0.jpg'                             where user_id is null and name = 'Écarté haltères';
  update public.exercises set image_url = base || 'Pullups/0.jpg'                                    where user_id is null and name = 'Tractions';
  update public.exercises set image_url = base || 'Bent_Over_Barbell_Row/0.jpg'                      where user_id is null and name = 'Rowing barre';
  update public.exercises set image_url = base || 'Wide-Grip_Lat_Pulldown/0.jpg'                     where user_id is null and name = 'Tirage vertical';
  update public.exercises set image_url = base || 'Barbell_Squat/0.jpg'                              where user_id is null and name = 'Squat';
  update public.exercises set image_url = base || 'Leg_Press/0.jpg'                                  where user_id is null and name = 'Presse à cuisses';
  update public.exercises set image_url = base || 'Bodyweight_Walking_Lunge/0.jpg'                   where user_id is null and name = 'Fentes marchées';
  update public.exercises set image_url = base || 'Romanian_Deadlift/0.jpg'                          where user_id is null and name = 'Soulevé de terre roumain';
  update public.exercises set image_url = base || 'Standing_Military_Press/0.jpg'                    where user_id is null and name = 'Développé militaire';
  update public.exercises set image_url = base || 'Side_Lateral_Raise/0.jpg'                         where user_id is null and name = 'Élévations latérales';
  update public.exercises set image_url = base || 'Barbell_Curl/0.jpg'                               where user_id is null and name = 'Curl biceps';
  update public.exercises set image_url = base || 'Triceps_Pushdown/0.jpg'                           where user_id is null and name = 'Extension triceps poulie';
  update public.exercises set image_url = base || 'Dips_-_Triceps_Version/0.jpg'                     where user_id is null and name = 'Dips';
  update public.exercises set image_url = base || 'Plank/0.jpg'                                      where user_id is null and name = 'Gainage planche';
  update public.exercises set image_url = base || 'Crunches/0.jpg'                                   where user_id is null and name = 'Crunch';
  update public.exercises set image_url = base || 'Walking_Treadmill/0.jpg'                          where user_id is null and name = 'Marche rapide';
  update public.exercises set image_url = base || 'Bicycling_Stationary/0.jpg'                       where user_id is null and name = 'Vélo';
  update public.exercises set image_url = base || 'Rowing_Stationary/0.jpg'                          where user_id is null and name = 'Rameur';
end;
$$;

-- ============================================================================
-- FIN DE LA MIGRATION 005
-- ============================================================================
