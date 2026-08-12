# Application Fitness — Sport, Nutrition & Transformation

Application mobile (Expo / React Native + TypeScript + Supabase) de suivi
sportif, nutritionnel et de transformation physique.

> Architecture complète, modèle de données, écrans et découpage du
> développement : voir **`docs/ARCHITECTURE.md`**.

## Démarrer

1. **Créer un projet Supabase dédié** (séparé du site ministériel), puis
   exécuter `supabase/migrations/001_init_fitness.sql` dans le SQL Editor.
2. Copier `.env.example` en `.env` et renseigner l'URL et la clé anon du
   projet (Supabase → Settings → API).
3. Installer et lancer :

```bash
npm install
npx expo start
```

Puis scanner le QR code avec l'application **Expo Go** (iOS/Android), ou
lancer un simulateur.

## Scripts

| Commande | Rôle |
|---|---|
| `npm start` | Serveur de développement Expo |
| `npm test` | Tests unitaires des calculs (Vitest) |
| `npm run typecheck` | Vérification TypeScript |

## Structure

- `app/` — écrans (expo-router) : onglets Aujourd'hui, Sport, Nutrition,
  Progression, Profil + écrans d'authentification.
- `src/logic/` — calculs purs testés (macros, portions, volume, progression).
- `src/services/` — accès Supabase typé (aucune logique métier).
- `src/hooks/` — react-query + auth.
- `src/components/ui/` — design system (Card, ProgressRing, MacroProgress…).
- `supabase/migrations/` — schéma SQL versionné (tables, RLS, storage).
