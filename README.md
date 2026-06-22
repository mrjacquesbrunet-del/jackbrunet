# Lumière — Plateforme ministérielle chrétienne

Site vitrine **et** plateforme d'édification quotidienne. Inspiré de l'énergie
visuelle des grandes landing pages modernes (type `landonorris.com`), mais
réorienté vers une expérience **chaleureuse, lumineuse, profonde et centrée sur
Jésus**, pensée pour être visitée **chaque jour**.

## ✨ Direction artistique

- Base nuit profonde immersive + accents vifs (or/aube, violet spirituel, bleu vie).
- Contrastes forts, typographies impactantes (`Sora` display + `Inter`).
- Animations et effets au scroll (Framer Motion : parallaxe, reveals, halos animés).
- Cartes dynamiques, sections immersives, sensation de plateforme vivante et premium.
- Lisible et paisible : l'énergie sert le contenu, jamais l'inverse.

## 🧱 Stack

- **Next.js 15** (App Router) — architecture propre, évolutive, SSR + API.
- **TypeScript** — robustesse.
- **Tailwind CSS** — design system cohérent (`tailwind.config.ts`).
- **Framer Motion** — animations et interactions au scroll.

## 🗂 Architecture

```
src/
├─ app/
│  ├─ layout.tsx            # Header + Footer + Pop-up email, métadonnées, polices
│  ├─ page.tsx              # Page d'accueil (toutes les sections)
│  ├─ a-propos/             # Histoire & vision
│  ├─ boutique/             # Catalogue
│  ├─ dons/                 # Page de soutien complète
│  └─ api/
│     ├─ newsletter/route.ts  # Captation email (web + future app)
│     └─ prayer/route.ts      # Requêtes de prière (web + future app)
├─ components/
│  ├─ layout/  (Header, Footer, EmailPopup)
│  ├─ home/    (Hero, DailyHub, ReadingPlan, LatestVideos, Reels,
│  │           PrayerSpace, Testimonies, Shop, Support, NewsletterCTA)
│  └─ ui/      (Reveal, Section, PageHero, NewsletterForm)
├─ config/site.ts           # Source unique : nav, identité, CTA (partagé future app)
└─ lib/
   ├─ types.ts              # Types du domaine (découplés de la source)
   └─ content.ts            # Couche contenu (mock → CMS/API sans toucher l'UI)
```

## 🎯 Trois usages couverts

1. **Première visite** — Hero fort, histoire, vidéos, vision, boutique, appels email/don.
2. **Usage quotidien** — pensée du jour, verset du jour, plan de lecture, Reels, prière.
3. **Engagement progressif** — newsletter, boutique, témoignages, partenariat mensuel.

## 📧 Stratégie de captation email (présente mais élégante)

Un seul composant réutilisé (`NewsletterForm`) avec un `source` traçable, branché
sur `/api/newsletter`. Points de capture :

- Pop-up différé et mémorisé (`EmailPopup`, cadeau gratuit).
- Carte du Hero, pensée du jour, plan de lecture, après les vidéos, boutique, page dons, footer.
- Grande section dédiée (`NewsletterCTA`) avec cadeau de bienvenue.

## ❤ Stratégie de soutien (jamais agressive)

- Bouton « Soutenir la mission » dans le menu (desktop + mobile).
- Section dons en page d'accueil (présentée comme réponse à la vision).
- Page `/dons` complète : don unique, partenariat mensuel, statistiques d'impact,
  **transparence sur l'utilisation des dons**, témoignages d'impact.
- Appels au soutien après certains contenus.

## 📱 Pensé pour une future application mobile

- **API découplée** : `/api/newsletter` et `/api/prayer` sont déjà les points
  d'entrée que l'app consommera à l'identique.
- **Contenu découplé** (`lib/content.ts`) : remplacer le mock par un CMS/API
  alimentera site **et** app sans changer les composants.
- **Config partagée** (`config/site.ts`) : navigation et identité réutilisables.
- **Mobile-first** : toutes les sections sont conçues d'abord pour le mobile.
- **Base « installable »** : métadonnées `appleWebApp`, `themeColor`, viewport
  (`viewport-fit: cover`) — prêtes pour une PWA puis un wrapper natif.

Modules déjà cartographiés pour l'app : pensée du jour, notifications, plan de
lecture, Bible, vidéos, prières, témoignages, boutique, dons, espace utilisateur,
favoris, contenus sauvegardés.

## 🚀 Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production
```

## 🔌 Prochaines étapes (production)

- Brancher l'emailing (Brevo / Mailchimp / Resend) dans `/api/newsletter`.
- Connecter un CMS (contenus) et un moteur Bible.
- Intégrer le paiement des dons (Stripe) et de la boutique.
- Authentification + espace utilisateur (favoris, contenus sauvegardés).
- PWA (manifest + service worker) puis application mobile.
