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

## Intérieur du Chemin — vrais assets 3D (3e passe)

Le sentier était dessiné en CSS (cercles en dégradé) et le coffre en SVG.
Tout est remplacé par des assets 3D détourés, générés dans la DA :

| Fichier | Rôle |
| --- | --- |
| `public/img/chemin/ui/dalle-or.png` | étape terminée (face dorée) |
| `public/img/chemin/ui/dalle-active.png` | étape en cours (face verte, halo) |
| `public/img/chemin/ui/dalle-verrou.png` | étape verrouillée (pierre éteinte) |
| `public/img/chemin/ui/coffre.png` | coffre fermé |
| `public/img/chemin/ui/coffre-ouvert.png` | coffre ouvert, trésor et rayon |

**Les trois dalles partagent le même gabarit.** Elles sont générées avec
une face VIDE, puis normalisées à l'installation : le script mesure le
diamètre réel du médaillon (sa rangée de pixels la plus large donne son
axe), le met à l'échelle sur 300 px et le centre dans un canevas de
360 px. Le chiffre, la coche et le cadenas sont ensuite posés en HTML au
centre — donc typographie nette et zéro décalage d'un état à l'autre.
Refaire une dalle sans repasser par cette normalisation la décalerait.

### Autres corrections de la carte

- **Sentier** : les pavés sont posés en HTML, plus en SVG. Le tracé SVG
  utilisait `preserveAspectRatio="none"` sur une zone bien plus haute que
  large : les pointillés devenaient des taches ovales et le contour noir
  une bande grise.
- **Espacement** : la hauteur du sentier suit le nombre d'étapes
  (`étapes × 98 px`), les dalles se chevauchaient à 440 px fixes.
- **Cadrage à l'ouverture** : on défile sur l'étape en cours (à ~60 % de
  l'écran), sinon on atterrit sur les étapes verrouillées du haut.
- **En-tête de chapitre fixe** : `position: sticky` ne s'accroche pas ici,
  parce que `body` porte `overflow-x: hidden` — il devient le conteneur de
  référence du sticky alors que c'est `html` qui défile. D'où une barre
  `fixed` et un fondu sombre en dessous.
- **Décor fixe** : le décor du chapitre ne défile plus avec le sentier
  (il s'étirait sur toute la hauteur de page).

### Écran de leçon

Le récit et les exercices tournaient sur un dégradé plat. Le décor du
chapitre y est prolongé, assombri à 82 %, pour que l'intérieur du jeu
reste dans le même monde que la carte.

### Décor de Qui suis-je refait

La première version (galerie de masques, silhouettes encapuchonnées,
statues) a été refusée : imagerie mystique, inadaptée à un jeu chrétien.
Le décor actuel est chaleureux — point d'interrogation doré, parchemin,
loupe, colombes, îlots violets — avec, dans le prompt, une interdiction
explicite des masques, figures encapuchonnées, statues et symboles
occultes. **À reprendre dans tout prompt de ce jeu.**

## Unification et contenu (4e passe)

### Décors du Chemin dans la DA des jeux

Les décors des chapitres 1 et 2 étaient en Pixar cinématique, les jeux en
3D cartoon glossy : deux registres dans la même app. Les deux décors sont
refaits dans la DA des jeux (mêmes références de style que les décors de
jeu), avec une **bande centrale vide** demandée explicitement au prompt :
tout le décor est arrangé sur les bords, le chemin est dessiné par l'app.

### La route est dessinée par l'app

Les dalles flottaient sur l'herbe. La route est maintenant tracée en
**pixels réels** de la zone du sentier (mesurée par un `ResizeObserver`) :

- `roadPath` donne le lit de terre ;
- `roadSlabs` échantillonne la courbe, la parcourt à pas constant et
  renvoie position + angle de chaque pavé doré, orienté dans le sens de
  la marche.

Les dalles et les pavés viennent des **mêmes points**, donc les
médaillons tombent toujours pile sur le chemin, quel que soit le nombre
d'étapes ou la taille de l'écran. Ne jamais revenir à un viewBox 0-100 en
`preserveAspectRatio="none"` : la zone est bien plus haute que large et
tout s'y étire. L'amplitude horizontale est passée de 27 % à 21 % pour
que les dalles restent dans le cadre.

### Épreuves variées et difficulté

Deux nouveaux types d'exercice dans `CheminExercice` :

- **`qui`** — Qui suis-je : les indices se dévoilent un par un, puis on
  désigne parmi quatre noms ;
- **`verset`** — le verset à reconstruire mot à mot. Attention : la
  validation compare le **texte** posé et non l'index du jeton, sinon un
  verset contenant deux fois le même mot (« sa mère », « sa femme »)
  compterait un mot juste comme faux.

Chaque exercice porte un `niveau` (`facile` par défaut, `moyen`,
`expert`) affiché en pastille et qui ajoute un bonus d'XP (`XP_NIVEAU`).
`defiEtape()` déduit l'intitulé de l'épreuve du premier exercice, annoncé
au joueur sur l'écran de récit (« Puis : Qui suis-je ? »).

Les 18 étapes des deux chapitres sont réécrites : chaque étape a son
épreuve dominante (questions, chronologie, mot manquant, qui suis-je,
verset) et un mélange de difficultés, avec des questions expertes
(dimensions de l'arche, les quatre fleuves d'Éden, les 150 jours, la
promesse de Genèse 3:15).

## Dalles posées à plat (5e passe)

Jack a fourni une référence : des **dalles de pierre couchées au sol**, vues
en perspective (donc elliptiques), le chiffre gravé en crème sur la face,
et un sentier de pierre sable qui serpente entre elles. Les médaillons
verticaux face caméra sont remplacés par ces dalles.

| Fichier | État |
| --- | --- |
| `dalle-or.png` | étape terminée — pierre dorée, étincelles |
| `dalle-active.png` | étape en cours — pierre violette |
| `dalle-verrou.png` | étape verrouillée — pierre grise |

### Le calage : ajustement d'ellipse, pas « rangée la plus large »

Pour une dalle couchée, le chiffre doit tomber au centre de la FACE, pas au
milieu de l'image. Deux méthodes ont échoué avant la bonne :

1. *Rangée la plus large* — un cylindre vu de biais a une bande entière à
   largeur maximale (du haut de la face au bas de la paroi), et surtout le
   rebord rocheux évase la dalle vers le bas : le repère tombait trop bas.
2. *Étendue gauche-droite de la ligne* — les étincelles détachées autour de
   la dalle dorée élargissaient la mesure et la dalle sortait surdimensionnée.

La méthode retenue (`fit_face`) : on prend le plus large **segment continu**
par ligne (les étincelles isolées sont ignorées), puis on ajuste une
parabole sur `largeur²` en fonction de `y` sur le haut de la silhouette —
pour une ellipse, `largeur²` est exactement une parabole en `y`, et son
sommet donne le centre et le diamètre de la face. Les trois dalles sont
ensuite normalisées à 300 px de face, centre placé à **40 % de la hauteur**
d'un canevas 360×400.

Côté app : le point du sentier est aligné sur ce centre de face
(`transform: translate(-50%, -40%)`), et le chiffre est posé à `top: 40%`
avec un `scaleY(.86)` pour épouser la perspective.

### Le sentier

Passé du pavé doré à la **pierre sable** de la référence : un lit de terre
(62 px), la bande de sentier (54 px), puis de petits pavés clairs disposés
en deux ou trois rangées alternées d'une ligne à l'autre, pour un
appareillage irrégulier plutôt qu'un alignement à la règle.

## Le sentier est PEINT dans la carte (6e passe) — méthode définitive

Jack veut le rendu de sa référence : l'illustration entière, avec son
sentier de pierre, et les dalles posées dessus. Le chemin n'est donc plus
dessiné par l'app.

**Chaque chapitre a une carte peinte** (`decor`) contenant son sentier de
pierre sable qui monte du bas vers le haut, et **un tableau `sentier`** de
points en % de l'image, un par étape, sur lesquels les dalles sont posées.

### Comment relever le `sentier` d'une nouvelle carte

1. Générer la carte en 9:16 / 2k avec les références de style, en exigeant
   un sentier de pierre claire continu du bas au haut de l'image et
   **aucune plateforme, aucun chiffre** dessus.
2. Faire tourner le relevé (script dans l'historique de cette passe) : il
   suit le sentier de bas en haut, ligne par ligne, en gardant le segment
   de sable le plus proche du précédent — ce qui l'empêche de sauter sur un
   rocher clair ou une bande de l'arc-en-ciel.
3. Borner le haut du parcours là où le sentier s'arrête réellement. Sans
   ça, sur le chapitre 2, le relevé remontait sur la coque en bois de
   l'arche puis sur l'arc-en-ciel.
4. Vérifier visuellement : le script dessine les repères sur l'image.
5. Coller le tableau dans `sentier` du chapitre.

### Contraintes d'affichage à ne pas casser

- La carte est affichée **entière et sans recadrage** (`<img class="block
  w-full">`). Un `object-cover` recadrerait l'image et les coordonnées ne
  correspondraient plus.
- La dalle est positionnée par un conteneur qui porte **sa largeur en %**
  (21 % de la carte). Mettre la largeur en % sur le bouton à l'intérieur ne
  marche pas : le conteneur absolu n'a alors pas de largeur propre, il
  s'ajuste à son contenu, et les dalles finissent minuscules et hors du
  sentier.
- Le décalage `translate(-50%, -40%)` aligne le point du sentier sur le
  centre de la FACE de la dalle (à 40 % de la hauteur de son image).

## Rendu définitif d'après la référence de Jack (7e passe)

Cible : jungle dense et peinte, sentier de pierre sable, grandes dalles
plates de pierre craquelée avec le chiffre gravé en crème.

**Décors** : générés sans références de style cette fois — la DA « jouet
glossy » des jeux donnait une image trop propre et trop claire. Le prompt
demande explicitement une illustration peinte, dense, avec des bords
vignettés sombres et une lumière chaude en haut, pour retrouver la
profondeur de la référence.

**Dalles** : régénérées avec **la référence de Jack en image de
référence**, ce qui donne la bonne silhouette — disque large et plat, face
craquelée, rebord de blocs cassés. Gabarit 400×340, face de 340 px, centre
de face à 42 % de la hauteur.

Le calage de la face utilise l'ajustement de parabole décrit plus haut,
mais **la bande d'ajustement doit rester sur l'arc supérieur de la face**
(4 % à 34 % de la hauteur de l'objet). Plus bas, le rebord rocheux évase la
silhouette et tire le centre calculé vers le bas.

**Placement** : les dalles ne sont pas centrées sur l'axe du sentier mais
décalées alternativement à gauche et à droite (±7 % chapitre 1, ±5 %
chapitre 2 dont le sentier est plus étroit). Elles bordent le chemin tout
en le recouvrant encore, comme sur la référence. Un décalage plus large
(±13 %) envoyait les dalles dans la végétation, et dans l'eau au chapitre 2.

**Chiffre** : crème `#F6EEDC`, liseré sombre sur les quatre côtés plus une
ombre portée — il doit rester lisible aussi bien sur la dalle dorée que sur
la pierre grise — et `scaleY(.82)` pour épouser la perspective de la face.

## Écran d'accueil et classement (8e passe)

Le Chemin était le seul jeu qui démarrait directement dans la partie. Il a
maintenant son accueil, sur le modèle des autres jeux
(`CheminHub.tsx`) : coque `ArcadeShell`, `HubHeader`, héros, puis

- **Où j'en suis** : anneau de progression des chapitres terminés, plus
  étapes, cartes gagnées et XP ;
- **Les chapitres** : une ligne par chapitre avec sa carte de personnage en
  vignette (grisée tant qu'elle n'est pas gagnée), sa barre de progression
  et son état (terminé / en cours / verrouillé). Toucher une ligne ouvre
  directement ce chapitre ;
- **CONTINUER** qui emmène au premier chapitre non terminé ;
- **Classement · Le Chemin** (`ScoreBoard mode="chemin"`).

Le bouton « JEUX » de la carte devient « ACCUEIL » et revient au hub ; le
retour aux jeux se fait depuis le hub.

### Score

Le score du Chemin est l'**XP cumulée** (`getCheminXp()`), remontée par
`submitGameScore("chemin", …)` à l'ouverture du hub et après chaque étape
validée. Le serveur garde la valeur la plus haute, ce qui convient à un
score cumulatif.

**Nécessite une migration SQL** : `supabase/migration-chemin.sql` ajoute
`chemin` à la contrainte de `arcade_scores` et à la liste blanche de
`game_submit`. Sans elle, les scores sont rejetés en silence et le
classement reste vide.

À noter au passage : `berger` figure dans le type `GameId` côté app mais
**pas** dans la liste blanche SQL — ses scores sont donc rejetés
silencieusement depuis toujours. Non corrigé ici, c'est une décision
produit (ça ferait entrer le jeu caché dans le classement général).

## Genèse et Exode complets (9e passe)

Sept chapitres ajoutés, ce qui achève la Genèse et l'Exode :

| # | Chapitre | Livre | Étapes | Carte |
| --- | --- | --- | --- | --- |
| 3 | Abraham | Genèse 12-22 | 10 | Abraham |
| 4 | Jacob | Genèse 25-33 | 8 | Jacob |
| 5 | Joseph | Genèse 37-50 | 10 | Joseph |
| 6 | Moïse | Exode 1-4 | 8 | Moïse |
| 7 | La Pâque | Exode 5-13 | 8 | Aaron |
| 8 | La mer Rouge | Exode 13-17 | 8 | Marie |
| 9 | Le Sinaï | Exode 19-34 | 10 | Josué |

Soit 62 étapes et 186 exercices de plus, tous types confondus (questions,
vrai/faux, mot manquant, chronologie, qui suis-je, verset à reconstruire),
avec des niveaux moyen et expert répartis sur l'ensemble.

### Relevé des sentiers : deux détecteurs

Les nouvelles cartes n'ont pas toutes le même contraste. Un seul détecteur
ne suffit pas :

- **mode « clair »** — seuil à 26 sous le maximum de luminance de la ligne.
  Précis quand le sentier est nettement l'élément le plus lumineux
  (Abraham, Jacob, Joseph, la mer Rouge, le Sinaï).
- **mode « sombre »** — seuil au percentile (16 % les plus clairs). Seul
  capable de trouver le sentier sur les cartes de nuit (Moïse, la Pâque),
  où un seuil absolu ne renvoyait plus une seule ligne.

Le mode « sombre » appliqué au Sinaï, en revanche, perdait le sentier et
collait les dalles contre le bord gauche : **le mode se choisit par carte**,
et il faut toujours vérifier visuellement le relevé.

Borner le haut du parcours reste indispensable : sans cela le relevé monte
sur l'horizon (Abraham), les pyramides (Joseph), le buisson ardent (Moïse),
la lune (la Pâque) ou la lumière du sommet (le Sinaï).

### Piège d'écriture

Un guillemet droit imbriqué dans une chaîne TypeScript la referme et casse
la compilation — c'est arrivé sur « Celui qui s'appelle "je suis" ». Dans
les récits, toujours des guillemets typographiques.

## Références, paliers de badges, vitrine des trophées (10e passe)

### Le passage sous les yeux

Chaque exercice porte désormais son passage : `CheminExercice` gagne un
`ref?` facultatif (Base), et le répartiteur retombe sur le `ref` de l'étape
quand l'exercice n'en précise pas. Le cadre l'affiche en pastille à droite,
et l'écran de récit ouvre sur un bloc « Se référer au passage ». Ne
renseigner `ref` sur un exercice que s'il porte sur un AUTRE passage que le
récit qui le précède.

### Trois paliers de plus

`BadgeTier` passe de trois à six valeurs : bronze, argent, or, **platine,
diamant, élixir**. `BADGE_THRESHOLDS` passe de triplets à sextuplets — les
trois premiers seuils sont inchangés, personne ne perd un palier acquis.

Les nouveaux seuils sont dérivés de l'or (×2,5, ×6, ×15), **sauf pour les
badges de série et de rang**, calés à la main : 1400 jours d'affilée en
prière ou 780 semaines parfaites n'ont aucun sens. Voir les surcharges dans
`badges.ts` (coeur, fidele, enracine, etoile, invincible, enchaineur,
frondeur, tireur, millionnaire, missionnaire).

`tierFor` et `bestTier` parcourent maintenant `BADGE_TIERS` au lieu de
tester trois cas en dur : ajouter un palier ne demandera plus qu'une entrée
dans le tableau, un seuil de plus par badge et une couleur.

**Nécessite une migration SQL** : `supabase/migration-badge-paliers.sql`.
La contrainte de `profiles.badge_tier` n'acceptait que bronze / argent / or,
donc la synchro du meilleur métal échouait en silence dès qu'un membre
dépassait l'or.

### Vitrine des trophées

La rangée de médaillons du profil devenait illisible à mesure que les
badges s'ajoutaient. `ProfileBadgesRow` gagne une variante `bouton` : une
entrée « Mes trophées » avec le meilleur palier et le compte
(« 12 badges sur 38 »), qui ouvre la vitrine complète déjà existante.
