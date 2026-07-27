# Mission Madagascar — Brief pour la création de contenu réseaux sociaux

> **À quoi sert ce fichier ?** Il rassemble tout ce qu'il faut savoir sur la
> Mission Madagascar pour créer du contenu (posts, reels, stories, visuels,
> textes) dans une conversation dédiée, sans avoir à re-expliquer le projet.
> Dans une nouvelle conversation, il suffit de dire :
> « Lis docs/MISSION-MADAGASCAR-RESEAUX.md et aide-moi à créer du contenu réseaux ».

---

## 1. La mission en bref (faits vérifiés)

- **Nom** : Mission Madagascar
- **Slogan** : « Annoncer · Aimer · Servir »
- **Accroche principale** : « Porter la lumière de Jésus à Madagascar »
- **Quand** : début novembre · **10 jours**
- **Qui** : Pasteur Jack Brunet (ministère « Jack Brunet », jackbrunet.com)
- **Quoi** (3 volets) :
  1. Une **conférence d'évangélisation** ;
  2. De l'**évangélisation de rue** ;
  3. La **visite et le soutien d'œuvres locales** : orphelinats, prisons et
     autres — soutien par la présence ET par les moyens.
- **Objectif financier** : **10 000 €** (jauge de progression affichée en direct
  sur la page de la mission ; le montant collecté évolue).

## 2. Le cœur du message (à réutiliser dans les contenus)

- Dieu a placé Madagascar sur le cœur du Pasteur Jack ; après plusieurs
  confirmations, l'équipe répond à un **appel**, pas à un simple événement.
- Madagascar : une terre magnifique (histoire, culture, visages) mais aux
  **besoins immenses** — pauvreté, enfants vulnérables, familles en difficulté,
  détenus oubliés, œuvres locales à bout de moyens.
- Au-delà du matériel : une **faim spirituelle profonde**. Beaucoup ont besoin
  d'entendre que Dieu les aime, que Jésus sauve, restaure, relève, pardonne,
  et donne une espérance qui ne dépend pas des circonstances.
- Posture : **humilité, respect, amour** — « notre but n'est pas d'arriver avec
  des réponses toutes faites, mais de servir ».
- Trois façons de participer pour la communauté : **prier**, **donner**,
  **partager** (suivre et relayer sur les réseaux).

## 3. Liens officiels (à mettre dans les contenus)

- **Page de la mission** : https://jackbrunet.com/mission-madagascar
- **Don dédié (Stripe)** : https://donate.stripe.com/28EfZi5A6bFEeiZaQwa3u04
- **Instagram de la mission** : https://www.instagram.com/missionmadagascar
  (@missionmadagascar)
- Site principal : https://jackbrunet.com · Application « Jack Brunet : Foi &
  Prière » (App Store / Google Play)

## 4. Identité visuelle de la mission

La mission a sa **propre palette**, distincte de la charte de l'app :

| Usage | Couleur |
|---|---|
| Orange mission (accent, CTA) | `#E0892B` |
| Vert très foncé (texte) | `#1F2E24` |
| Crème chaud (fonds) | `#FAF6F0` |

- **Logo mission** : `public/mission/logo-web.webp` (dans ce dépôt)
- **Visuel pasteur** : `public/mission/pasteur-scene.png`
- Typo du site : Archivo (texte) + Playfair Display (titres élégants)
- Rappel charte de l'app (si besoin de cohérence) : lime `#CAF000`, olive
  `#292E21`/`#26301A`, crème `#F3F3ED`, nuit `#14160E`.

## 5. Ton de voix

- **Tutoiement** chaleureux (comme l'app et les dévotionnels du Pasteur Jack).
- Foi assumée, espérance, concret ; jamais culpabilisant ni misérabiliste :
  on montre la **dignité** des personnes et la **joie** de servir.
- Vocabulaire récurrent du ministère : annoncer, aimer, servir, lumière,
  espérance, « Dieu agit », « tout est possible ».
- Signature possible : « Annoncer · Aimer · Servir 🧡 » + lien.

## 6. Idées de piliers de contenu (point de départ)

1. **Compte à rebours / annonce** (dates, le pourquoi, l'appel)
2. **Les 3 volets** en carrousels (conférence · rue · orphelinats & prisons)
3. **Prière** : sujets concrets, rendez-vous de prière, versets
4. **Collecte** : progression vers les 10 000 €, transparence sur l'usage
5. **Coulisses / préparatifs** puis, sur place, témoignages et récits
6. **Après la mission** : fruits, remerciements, suite

## 7. Contexte technique (si la conversation doit toucher au site/app)

- Dépôt : `mrjacquesbrunet-del/jackbrunet` · branche de travail
  `claude/great-hamilton-ieokug`
- Page mission : `src/app/mission-madagascar/page.tsx` ·
  données : `content/mission.json` (objectif, montant collecté, période)
- Le montant collecté (`raisedEur`) est mis à jour par l'admin depuis l'app
  (espace admin) — ne pas le modifier à la main sans demande explicite.
