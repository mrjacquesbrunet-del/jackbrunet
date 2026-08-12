# Application Fitness — Architecture technique

Application mobile de suivi sportif, nutritionnel et de transformation
physique. Pensée d'abord mono-utilisateur, mais architecturée dès le départ
pour le multi-utilisateurs (chaque table est rattachée à `user_id` + RLS).

---

## 1. Architecture technique globale

| Couche | Choix | Rôle |
|---|---|---|
| Mobile | **Expo (React Native) + TypeScript + expo-router** | UI, navigation par fichiers, iOS + Android depuis un seul code |
| Backend | **Supabase** (projet dédié, séparé du site ministériel) | PostgreSQL, Auth, Storage privé, RLS, API auto-générée |
| État serveur | **TanStack Query (react-query)** | Cache, revalidation, mode hors connexion (persistance à venir) |
| État local | **Zustand** | Séance en cours (mode entraînement), état UI éphémère |
| Icônes | **lucide-react-native** | Icônes en trait (pas d'emojis dans l'interface) |
| Graphiques | **react-native-svg** (composants maison) | Anneaux/barres de progression, courbe de poids |
| Tests | **Vitest** | Tests unitaires des calculs (`src/logic`) |

Séparation stricte des responsabilités :

```
UI (app/ + src/components)  →  hooks (src/hooks)  →  services (src/services)  →  Supabase
                                        ↓
                              calculs purs (src/logic)  ← testés unitairement
```

- **`src/logic`** : fonctions pures, sans dépendance à Supabase ni à React.
  Tous les calculs (macros, portions, volumes, progression) vivent ici et
  nulle part ailleurs — jamais dupliqués dans les écrans.
- **`src/services`** : seule couche qui parle à Supabase (CRUD typé).
- **`src/hooks`** : branchent les services sur react-query pour les écrans.
- **`app/` + `src/components`** : uniquement de la présentation.

## 2. Arborescence de l'application

```
fitness/
├─ app/                          # Écrans (expo-router, navigation par fichiers)
│  ├─ _layout.tsx                # Providers (Auth, Query, Thème) + garde d'authentification
│  ├─ (auth)/                    # Écrans non connectés
│  │  ├─ sign-in.tsx             # Connexion
│  │  └─ sign-up.tsx             # Inscription
│  └─ (tabs)/                    # 5 onglets principaux
│     ├─ _layout.tsx             # Barre d'onglets
│     ├─ index.tsx               # 1. Aujourd'hui (dashboard)
│     ├─ sport.tsx               # 2. Sport (programmes, séances, exercices)
│     ├─ nutrition.tsx           # 3. Nutrition (journal, aliments, recettes)
│     ├─ progression.tsx         # 4. Progression (poids, mensurations, photos, stats)
│     └─ profil.tsx              # 5. Profil / réglages
├─ src/
│  ├─ lib/                       # supabase.ts, theme.ts, dates.ts
│  ├─ types/                     # domain.ts (types du modèle de données)
│  ├─ logic/                     # nutrition.ts, workout.ts, progress.ts (+ tests)
│  ├─ services/                  # profile, nutrition, tracking, sport
│  ├─ hooks/                     # useAuth, useToday, …
│  └─ components/ui/             # Card, ProgressRing, ProgressBar, MacroProgress, MetricCard…
├─ supabase/migrations/          # SQL versionné (001_init_fitness.sql…)
└─ docs/ARCHITECTURE.md          # Ce document
```

Écrans à ajouter au fil des étapes (routes empilées au-dessus des onglets) :
`workout/[sessionId]` (mode entraînement), `recipe/[id]`, `recipe/new`,
`food/new`, `photos/compare`, `onboarding`, `checkin`.

## 3. Schéma PostgreSQL

Voir `supabase/migrations/` : `001_init_fitness.sql` (schéma initial + RLS
+ index + triggers + buckets privés + données de base) puis
`002_body_checkins.sql` (bilans corporels).

Tables V1 : `profiles`, `nutrition_goals`, `foods`, `recipes`,
`recipe_ingredients`, `meal_entries`, `water_entries`, `step_entries`,
`weight_entries`, `progress_photos`, `exercises`,
`workouts`, `workout_exercises`, `workout_programs`, `program_days`,
`workout_sessions`, `workout_sets`, `goals`, `weekly_checkins`,
`daily_logs`, `favorites`, `notification_prefs`, `body_checkins`,
`body_measurements`.

Bilans corporels (migration 002) :

- `body_checkins` — bilan **initial** (unique par utilisateur, jamais
  écrasé : c'est la référence départ → aujourd'hui), **mensuel** ou
  **manuel** ; poids, ressenti (énergie/motivation 1-5), notes. Le poids
  d'un bilan alimente aussi `weight_entries` (une seule courbe de poids).
- `body_measurements` — mensurations détaillées : type (cou, épaules,
  poitrine, **taille** ET **ventre** distincts, hanches, biceps,
  avant-bras, cuisse, mollet, personnalisée), côté (gauche/droit/centre),
  état (relâché/contracté), **toujours stockées en cm** (conversion
  cm ↔ pouces à l'affichage selon `profiles.measurement_unit`).
  Rattachées à un bilan (`checkin_id`) ou ponctuelles. Remplace
  l'ancienne table `measurement_entries`.
- Photos de bilan : `progress_photos.checkin_id` (une seule table photos ;
  l'entité « CheckInPhoto » du cahier des charges est couverte par ce lien).
- Rappel mensuel : dû un mois après le dernier bilan (`isCheckinDue`),
  reportable via `profiles.checkin_snoozed_until`.

Phase 2 (tables prévues, non créées) : `shopping_lists`,
`shopping_list_items`, `activity_entries` (import HealthKit / Health
Connect), `meal_plans` (modèles de journées répétables).

## 4. Relations entre les tables

```
auth.users 1—1 profiles
auth.users 1—N nutrition_goals        (historique : end_date null = actif)
auth.users 1—N foods                  (user_id null = base globale en lecture)
auth.users 1—N recipes 1—N recipe_ingredients N—1 foods
auth.users 1—N meal_entries N—1 foods | recipes   (instantané macros figé)
auth.users 1—N water_entries / step_entries / weight_entries /
             measurement_entries / progress_photos / goals /
             weekly_checkins / daily_logs / favorites / notification_prefs
auth.users 1—N exercises              (user_id null = base globale)
auth.users 1—N workouts 1—N workout_exercises N—1 exercises
auth.users 1—N workout_programs 1—N program_days N—1 workouts
auth.users 1—N workout_sessions 1—N workout_sets N—1 exercises
```

Choix structurants :

- **Instantané nutritionnel** dans `meal_entries` : les macros sont copiées
  au moment de l'ajout — modifier un aliment plus tard ne réécrit pas
  l'historique.
- **Objectifs nutritionnels historisés** : on ne modifie jamais un objectif,
  on le clôt (`end_date`) et on en crée un nouveau.
- **Poids courant jamais stocké** : toujours dérivé de la dernière
  `weight_entries` (une seule source de vérité).
- **Statuts** : `meal_entries.status` (`planned`/`consumed`),
  `workout_sessions.status` (`planned`/`started`/`completed`/`skipped`).

## 5. Écrans

| Écran | Contenu |
|---|---|
| Aujourd'hui | Salutation + jour du programme, progression globale du jour, carte calories/macros, pas, eau, séance du jour, dernier poids |
| Sport | Programme actif, planning hebdo, bibliothèque séances + exercices, historique/records |
| Mode entraînement | Exercice par exercice, saisie série (poids × reps), chrono de repos (+15 s / pause / passer) |
| Nutrition | Journal du jour par repas (prévu/consommé), aliments, recettes, favoris/récents |
| Progression | Poids (courbe + moyenne mobile), mensurations, photos + comparateur, statistiques |
| Profil | Infos, objectifs nutritionnels, objectifs, notifications, export, thème |
| Onboarding | Objectif principal, mensurations de départ, objectifs quotidiens |

## 6. Navigation

- **5 onglets** (expo-router `(tabs)`) : Aujourd'hui / Sport / Nutrition /
  Progression / Profil.
- **Bouton « + » rapide** (à l'étape UI suivante) : feuille d'actions —
  repas, aliment, recette, eau, poids, mensuration, photo, séance.
- Les flux ponctuels (mode entraînement, création recette, comparateur
  photos) sont des routes empilées plein écran au-dessus des onglets.
- Garde d'authentification dans `app/_layout.tsx` : non connecté → `(auth)`.

## 7. Composants réutilisables

`Card`, `ProgressRing`, `ProgressBar`, `MacroProgress`, `MetricCard`,
`QuickAddButton`, `WorkoutCard`, `MealCard`, `ExerciseRow`, `FoodRow`,
`WeightChart`, `CalendarDay`, `PhotoComparison`, `RestTimer`, `EmptyState`.

Trois états visuels par objectif : *non commencé* / *en cours* / *terminé*
(`goalState()` dans `src/logic/progress.ts` — jamais recalculé dans l'UI).

## 8. Services (src/services)

| Fichier | Domaine |
|---|---|
| `profile.ts` | Profil, objectifs nutritionnels (historisés) |
| `nutrition.ts` | Aliments, recettes + ingrédients, journal des repas |
| `tracking.ts` | Eau, pas, poids, mensurations, photos (upload bucket privé + URL signées) |
| `sport.ts` | Exercices, séances, programmes, sessions, séries, records |

Règles : chaque fonction est typée, retourne des types de `src/types/domain.ts`,
et ne contient **aucun calcul** (les calculs sont dans `src/logic`).

## 9. Hooks (src/hooks)

- `useAuth` — session Supabase (provider + garde de navigation).
- `useToday` — agrège la journée : repas, eau, pas, séance, objectif actif.
- À venir : `useWeightHistory`, `useWorkoutSession` (mode entraînement),
  `useFoodSearch`, `useRecipe`, `useRestTimer`.

## 10. Gestion d'état

- **TanStack Query** pour tout ce qui vient de Supabase : clés du type
  `['meals', date]`, `['water', date]`, `['weights']`… Invalidation ciblée
  après chaque mutation.
- **Zustand** pour la séance en cours (mode entraînement) : séries saisies,
  chrono de repos — persisté localement pour survivre à un kill de l'app,
  synchronisé vers Supabase à la fin de la séance.
- Hors connexion (étape ultérieure) : persistance du cache react-query dans
  AsyncStorage + file de mutations rejouée au retour du réseau.

## 11. Calculs nutritionnels (src/logic/nutrition.ts)

- `scaleMacros(food, quantity, unit)` — règle de trois sur la portion de
  référence (165 kcal / 100 g → 175 g = 289 kcal).
- `calculateRecipeMacros(ingredients)` — somme des ingrédients + valeurs
  par portion.
- `calculateDailyMacros(entries, { status })` — totaux du jour, en séparant
  **prévu** et **réellement consommé**.
- `remainingMacros(goal, consumed)` — restant par macro.
- `macroCalories(protein, carbs, fat)` — 4/4/9 kcal par gramme.

## 12. Calculs sportifs (src/logic/workout.ts)

- `calculateWorkoutVolume(sets)` — Σ (poids × reps) des séries complétées.
- `personalRecord(sets)` — meilleure charge, meilleur volume sur un exercice.
- `sessionProgress(sets)` — % de séries complétées.
- `estimatedOneRepMax(weight, reps)` — formule d'Epley (indicatif).

## 13. Gestion des photos

- Bucket Supabase **privé** `progress-photos` (jamais public).
- Chemin : `<user_id>/<uuid>.jpg` — les policies Storage n'autorisent que le
  propriétaire du dossier.
- Affichage via **URLs signées** temporaires (`createSignedUrl`, 1 h).
- Compression côté client avant upload (expo-image-manipulator, à venir).
- Comparateur avant/après : deux photos côte à côte + slider — **aucun
  filtre ni retouche automatique**.

## 14. Sécurité & Row Level Security

- RLS activée sur **toutes** les tables ; policies `auth.uid() = user_id`
  (select/insert/update/delete) — voir migration 001.
- Tables enfants (`recipe_ingredients`, `workout_exercises`, `program_days`,
  `workout_sets`) : accès via `exists` sur le parent.
- `foods` / `exercises` : lecture des lignes globales (`user_id is null`),
  écriture uniquement sur ses propres lignes.
- Buckets Storage privés, accès par préfixe `user_id`, URLs signées.
- Auth Supabase (email + mot de passe pour la V1), session persistée dans
  AsyncStorage.
- Export et suppression des données : prévu en Phase 2 (fonction backend).
- Aucun secret dans le code : `EXPO_PUBLIC_SUPABASE_URL` et
  `EXPO_PUBLIC_SUPABASE_ANON_KEY` dans `.env` (jamais commité ; la clé anon
  est publique par conception, la sécurité repose sur la RLS).

## 15. Découpage du développement

| Étape | Contenu | Statut |
|---|---|---|
| 1 | Architecture + schéma SQL + RLS + squelette app (tabs, thème, auth, calculs testés) | ✅ fait |
| 1b | Bilans corporels : schéma (002), services, calculs de comparaison, design system étendu | ✅ fait |
| 2 | Onboarding = **bilan de départ en 5 étapes** (poids/infos, photos guidées, mensurations, objectifs, récapitulatif) + profil + objectifs nutritionnels | à faire |
| 3 | Dashboard Aujourd'hui complet (eau, pas, poids en saisie rapide) | entamé (eau fonctionnelle) |
| 4 | Aliments + recettes + journal des repas (prévu/consommé) | à faire |
| 5 | Programmes + séances + planning hebdo | à faire |
| 6 | Mode entraînement (séries, chrono repos) + historique/records | à faire |
| 7 | Progression : courbe poids, mensurations, photos + comparateur | à faire |
| 8 | Calendrier global + historique + bouton « + » global | à faire |
| 8b | Check-in mensuel (même protocole que le bilan de départ, rappel reportable, comparaison automatique, vue Transformation) | à faire |
| 9 | Phase 2 : stats avancées, liste de courses, check-in hebdo, notifications, HealthKit/Health Connect, scanner code-barres | à faire |
| 10 | Phase 3 : IA (recettes, menus, ajustement programme — toujours avec validation) | à faire |
