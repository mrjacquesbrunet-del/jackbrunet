# Jack Brunet — Plateforme ministérielle chrétienne

> **Le site en ligne (à partager) :**
> ## https://mrjacquesbrunet-del.github.io/jackbrunet/
>
> Cette page-ci (sur github.com) est uniquement la fiche technique du code.
> Le vrai site, celui que voient les visiteurs, est à l'adresse ci-dessus.

Site vitrine **et** plateforme d'édification quotidienne, centrée sur Jésus,
pensée pour être visitée **chaque jour** : pensée du jour, verset du jour, plan
de lecture, Shorts et prédications de la chaîne, espace de prière, témoignages,
boutique et soutien.

## Modifier le site soi-même (sans coder)

Le contenu (textes, pensées, versets, vidéos mises en avant, livre, photos,
témoignages, soutien…) se modifie via un espace d'administration visuel, sans
toucher au code. Chaque modification est enregistrée puis publiée
automatiquement sur le site en quelques minutes, et garde un historique
(sauvegarde) sur GitHub. Le guide complet est dans **`ADMIN.md`**.

## Stack technique

- **Next.js 15** (App Router) + **TypeScript**.
- **Tailwind CSS** — charte graphique (`tailwind.config.ts`).
- **Framer Motion** — animations et interactions au scroll.
- **Export statique** déployé sur **GitHub Pages** via GitHub Actions
  (`.github/workflows/deploy.yml`), avec import automatique des vidéos YouTube.

## Charte graphique

- Couleurs : Olive `#3A3F28`, Lime `#CAF000` (accent), Crème `#F3F3ED` (fond),
  Encre `#1F2216` (texte sur lime).
- Typographies : **Playfair Display** (serif) + **Archivo** (sans).
- Logo : « JACKBRUNET ».
- Thème clair dominant, avec sections sombres texturées (topographie).

## Architecture

```
content/                       # Contenu éditable (JSON) lu par l'app
.pages.yml                     # Configuration de l'espace d'administration visuel
src/
├─ app/
│  ├─ layout.tsx               # Header + Footer + Pop-up email, métadonnées, polices
│  ├─ page.tsx                 # Page d'accueil (landing)
│  ├─ videos/                  # Catalogue complet (Shorts + prédications)
│  ├─ a-propos/                # Histoire & vision
│  ├─ boutique/                # Le livre RHEMA
│  ├─ dons/                    # Page de soutien complète
│  └─ api/                     # Newsletter, prière, témoignage (web + future app)
├─ components/                 # layout / home / ui
├─ config/site.ts             # Source unique : nav, identité, CTA
└─ lib/
   ├─ types.ts                 # Types du domaine
   └─ content.ts              # Couche contenu (JSON → CMS/API sans toucher l'UI)
```

## Intégration YouTube (chaîne @Jack_brnt)

Les vidéos sont importées automatiquement au build (`scripts/fetch-youtube.mjs`,
clé `YOUTUBE_API_KEY`) : les Shorts (≤ 3 min) alimentent le fil vertical, les
formats longs alimentent le catalogue, classés automatiquement par thème, les
plus récents en avant. Un rafraîchissement quotidien ajoute les nouvelles vidéos.

## Démarrer (développement)

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production
```

## Prochaines étapes (production)

- Brancher l'emailing (Brevo / Mailchimp / Resend) dans `/api/newsletter`.
- Intégrer le paiement des dons (Stripe) et de la boutique.
- Authentification + espace utilisateur (favoris, contenus sauvegardés).
- PWA puis application mobile.
