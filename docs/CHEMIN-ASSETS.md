# Le Chemin — plan d'habillage Pixar (passage de relais)

Contexte : le moteur du jeu « Le Chemin » est terminé (route `/chemin`,
composant `src/components/chemin/CheminScreen.tsx`, contenu
`src/config/chemin/`). Jack a validé le **style Pixar 3D** sur deux
maquettes Seedream 5 Pro. Il reste à générer, télécharger et intégrer
les visuels, puis activer la carte dans le hub des jeux.

## Réseau

Les téléchargements se font sur `pikaso.cdnpk.net` (CDN Magnific).
Jack a autorisé ce domaine dans la politique réseau de l'environnement —
si un `curl` renvoie encore 403, la session tourne sous l'ancienne
politique : il faut une session fraîche.

## Références de style validées (compte Magnific de Jack, projet Personnel)

- Carte du sentier d'Éden, Pixar 3D : creation `cpItXZv0eP`
  (`https://www.magnific.com/app/creation/cpItXZv0eP`)
- Carte de collection Noé, Pixar 3D : creation `5jw7lHMKxe`
  (`https://www.magnific.com/app/creation/5jw7lHMKxe`)

Utiliser ces creations comme `references` (type `image`) dans
`images_generate` pour garder la cohérence de style entre chapitres.

Important : les médaillons/coffres/UI sont dessinés par l'app par-dessus
le décor — demander des décors SANS médaillons ni éléments d'interface
(les maquettes de style en contiennent ; pour les décors finaux, préciser
« no level nodes, no UI » dans le prompt), et garder la **bande verticale
centrale dégagée** pour que les médaillons restent lisibles.

## Fait — chapitres 1 et 2 habillés

Tous les visuels ci-dessous sont générés en Seedream 5 Pro, resolution
2k, puis recompressés (Pillow, JPEG progressif) à l'installation.

| Fichier | Source | Format installé |
| --- | --- | --- |
| `public/img/chemin/decor-1.jpg` | creation `ksJ3hMo16B` (Éden propre, réf. image `cpItXZv0eP`) | 1080×1920, 329 Ko |
| `public/img/chemin/decor-2.jpg` | creation `Sy3WHaBUb8` (fin du déluge, réf. image `cpItXZv0eP`) | 1080×1920, 271 Ko |
| `public/img/chemin/cartes/creation.jpg` | creation `VXhHiNUMMU` (réf. image `5jw7lHMKxe`) | 600×900, 177 Ko |
| `public/img/chemin/cartes/noe.jpg` | creation `5jw7lHMKxe` (la maquette validée) | 600×900, 135 Ko |
| `public/img/jeux/chemin.png` | creation `cpIu9NJ0eP`, détourée | 520×469, PNG transparent |

Le décor 1 n'est **pas** la maquette `cpItXZv0eP` : celle-ci contient les
médaillons et le coffre, qui feraient doublon avec ceux dessinés par
l'app. Elle sert de référence de style, le décor final est une
regénération propre.

## Fait — intégration

- Les chemins d'images étaient déjà branchés dans les données
  (`src/config/chemin/*.ts` : champs `decor` et `carte.image`).
- Carte du hub ajoutée dans `src/components/games/GamesHub.tsx`
  (id `chemin`, en première position, dégradé vert `#34D399 → #059669`,
  icône `IconRoute` en repli).
- Rendu vérifié via Playwright sur `out/` servi en local : chapitre 1
  (vierge et à mi-parcours), chapitre 2, album des cartes, hub des jeux.

### Réserve connue

L'en-tête global du site (`src/components/layout/Header.tsx`) écrit
toujours en `text-night-900` : le logo « JACKBRUNET » passe mal sur le
décor clair de l'Éden. C'est vrai sur toutes les pages sombres (jeux,
soaking), donc hors périmètre de cette passe — à traiter globalement
(variante claire de l'en-tête sous `dark-ctx`) si Jack le souhaite.

## Méthode pour les chapitres suivants

1. `images_generate` en 9:16 / 2k pour le décor, avec
   `references: [{ type: "image", identifier: "cpItXZv0eP" }]` et la
   consigne « no level nodes, no UI, central band uncluttered ».
2. `images_generate` en 2:3 / 2k pour la carte, avec
   `references: [{ type: "image", identifier: "5jw7lHMKxe" }]` et
   « same ornate carved golden 3D frame as the reference, no text ».
3. Générer 2 variantes (`count: 2`) et choisir celle dont la bande
   centrale est la plus dégagée.
4. Télécharger l'`url` de la creation depuis `pikaso.cdnpk.net`,
   recompresser (décor 1080×1920 < 350 Ko, carte 600×900 < 180 Ko).
5. Build `npm run build:app`, captures, `date +%s > .ota-release`,
   commit + push.

## Suite du contenu (après validation de Jack sur les 2 chapitres)

Chapitres suivants : Abraham, Joseph, Moïse et l'Exode, Josué, David,
Salomon, Élie, Daniel, Jonas, Esther, Jésus (plusieurs chapitres),
Actes, Paul, Apocalypse. À chaque chapitre : contenu (récits + exercices
dans `src/config/chemin/`), décor 2K, carte de personnage.

## Habillage premium des autres jeux (2e passe)

Chaque jeu a désormais son propre décor 3D plein écran, fixe derrière
l'interface arcade qui défile par-dessus, dans le même style Pixar sombre
et cinématique que Le Chemin.

| Fichier | Univers |
| --- | --- |
| `public/img/jeux/decors/quiz.jpg` | bibliothèque-cathédrale du savoir, or et nuit |
| `public/img/jeux/decors/memoriser.jpg` | jardin nocturne, arbre lumineux, lucioles |
| `public/img/jeux/decors/quisuisje.jpg` | galerie des mystères, projecteur bleu |
| `public/img/jeux/decors/vraifaux.jpg` | balance colossale dans l'arène, vert / rouge |
| `public/img/jeux/decors/chronologie.jpg` | horloge cosmique et sablier, nébuleuse violette |
| `public/img/jeux/decors/defi.jpg` | arène de duel, deux podiums et trophée |

Format : 1000×1778, JPEG progressif, ~160 Ko pièce (0,95 Mo au total).

**Style : celui des illustrations du hub, pas celui du Chemin.** Une
première version en rendu Pixar cinématique / photoréaliste a été refusée
par Jack : elle ne collait pas à la DA de l'app. Les décors définitifs sont
en **3D cartoon glossy** — formes rondes et épaisses, rochers violets,
touffes d'herbe vertes, étoiles dorées à quatre branches, fond violet
sombre avec un halo de couleur — exactement le rendu des illustrations
`public/img/jeux/*.png`.

Méthode : les illustrations du hub ont été **téléversées dans Magnific**
et passées en `references` (type `image`) à `images_generate`. C'est ce qui
verrouille le style ; un prompt seul ne suffit pas et repart en
photoréalisme. Références utilisées : l'illustration Mémoriser (livre +
ampoule + cœur) et l'illustration Chronologie (chronomètre + parchemin).
À refaire pour tout nouveau décor de jeu.

Mise en œuvre :

- `GameDecor` dans `ArcadeUI.tsx` pose l'image en `fixed inset-0 z-0` avec
  un dégradé sombre par-dessus ; `ArcadeShell` prend une prop `decor`.
- Les panneaux `.qm-card` et les fonds de héros sont passés en translucide
  pour que la scène respire derrière l'interface.
- Les mêmes décors servent de fond aux cartes du hub, teintés par la
  couleur de chaque jeu.

### Pièges rencontrés (à retenir)

- **`onLoad` ne se déclenche pas** quand l'image du décor est déjà chargée
  au moment de l'hydratation (export statique) : le décor restait invisible.
  Il faut lire `complete` via une `ref` au montage. Même correctif appliqué
  à `DecorImage` dans `CheminScreen.tsx`.
- **`-z-10` n'est pas fiable** selon le conteneur : sur `/defi` le décor
  passait derrière le fond du body. On utilise `z-0`, et le contenu qui doit
  passer au-dessus doit simplement être positionné (`relative`).
- **`ChallengeScreen` a sa propre coque plein écran opaque** : le décor doit
  être posé dedans, pas sur la page.

### Correctif de mise en page

Dans tous les héros de jeu, le titre débordait sous l'illustration. Colonne
de texte élargie à 62 %, illustration bornée à 38 % et `h-32`, et le titre
prend `font-size: clamp(1.4rem, 7vw, 2rem)` pour tenir sur les petits
écrans.
