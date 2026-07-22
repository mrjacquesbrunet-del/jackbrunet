# Église Tout est possible Pau — Site officiel

> **Annoncer. Restaurer. Équiper. Envoyer.** Valeur centrale : l'Amour.

Site premium de l'Église Tout est possible Pau : design minimaliste haut de
gamme (noir profond, crème, verts), hero cinématographique avec mots animés,
parcours pensé pour les personnes qui ne connaissent pas encore Dieu.

## Pages

| Route | Page |
| --- | --- |
| `/` | Accueil (hero animé, mission, dimanche, témoignages, messages) |
| `/premiere-visite` | Première visite (déroulé, FAQ, réassurance) |
| `/a-propos` | Histoire, valeurs, ce que nous croyons |
| `/vision` | Annoncer · Restaurer · Équiper · Envoyer + l'Amour |
| `/equipe` | Équipe pastorale |
| `/reunions` | Horaires + infos pratiques |
| `/messages` | Prédications YouTube (import automatique) |
| `/temoignages` | « Des vies transformées » (carrousel photos/vidéos) |
| `/dons` | Dons HelloAsso, transparence, reçu fiscal |
| `/contact` | Contact |
| `/mentions-legales`, `/confidentialite` | Pages légales |

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** — charte dans `tailwind.config.ts`
- **Framer Motion** — animations élégantes, respect de `prefers-reduced-motion`
- **Contenu 100 % éditable** via `content/*.json` + Pages CMS (`.pages.yml`) — voir `ADMIN.md`
- **SEO** : métadonnées par page, Schema.org (`Church` + horaires), Open Graph,
  `sitemap.xml`, `robots.txt`, SEO local Pau / Pyrénées-Atlantiques
- **Performance** : aucune iframe YouTube au chargement (lecteur « lite » au clic),
  une seule police variable, images `next/image`, lazy loading

## Charte graphique

| Usage | Couleur |
| --- | --- |
| Fond principal | Noir profond `#121212` |
| Fond clair | Crème `#FCFEE9` |
| Vert principal | `#A3CD86` |
| Vert accent (hover / micro-interactions uniquement) | `#30FF12` |

Typographie : **Plus Jakarta Sans** (variable). Titres imposants, sections très aérées.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production
```

## Vidéo du hero

Le hero affiche une vidéo plein écran dès qu'une URL `.mp4` est renseignée dans
**Paramètres du site → Vidéo d'accueil** (CMS) ou `content/settings.json`
(`hero.videoUrl`). Sans vidéo, un fond cinématographique animé prend le relais —
le site reste superbe en attendant le tournage (louange, familles, accueil,
baptêmes…).

## YouTube (import automatique des messages)

```bash
YOUTUBE_API_KEY=xxx npm run youtube
```

Renseigne le `handle` (ex. `@monEglise`) ou le `channelId` dans
`content/settings.json`. Le script écrit `content/videos.generated.json`,
consommé par l'accueil et la page Messages. À planifier en CI (cron quotidien).

## Dons (HelloAsso)

Renseigne l'URL de la page de don HelloAsso dans les paramètres. Optionnel :
une URL de **widget** HelloAsso pour intégrer le formulaire directement dans la
page `/dons`.

## Langues (FR / ES)

L'architecture multilingue est prête (`src/i18n/` : dictionnaires `fr` et `es`).
Pour activer l'espagnol : dupliquer `content/` en version espagnole et déployer
avec `NEXT_PUBLIC_LOCALE=es` (ou brancher un routage `/es`). Aucun composant à
modifier.

## Déploiement

- **Vercel** (recommandé) : import du dossier, zéro config.
- **Statique** (GitHub Pages, etc.) : `EXPORT=true npm run build` → dossier `out/`.

## SEO local — après mise en ligne

1. Créer / revendiquer la fiche **Google Business Profile** « Église Tout est
   possible Pau » (catégorie : Église, zone : Pau, Pyrénées-Atlantiques) et y
   renseigner l'URL du site.
2. Déclarer le site dans **Google Search Console** et soumettre `sitemap.xml`.
3. Renseigner l'adresse définitive dans les paramètres du CMS (elle alimente
   automatiquement le Schema.org `Church`).
