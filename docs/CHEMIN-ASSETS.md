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

## À produire (Seedream 5 Pro, resolution 2k)

1. **Décor chapitre 1 — Éden** : réutiliser/retélécharger `cpItXZv0eP`
   (9:16). Installer en `public/img/chemin/decor-1.jpg` (recompresser
   ~1080×1920, qualité 82, < 350 Ko).
2. **Décor chapitre 2 — Le déluge / l'arche** : même style (référence
   image `cpItXZv0eP`), ambiance pluie qui se lève, arche au loin,
   arc-en-ciel naissant → `public/img/chemin/decor-2.jpg`.
3. **Carte Création** (2:3, cadre doré, style de `5jw7lHMKxe`) : cosmos,
   lumière, jardin → `public/img/chemin/cartes/creation.jpg` (~600×900).
4. **Carte Noé** : retélécharger `5jw7lHMKxe` →
   `public/img/chemin/cartes/noe.jpg`.

Important : les médaillons/coffres/UI sont dessinés par l'app par-dessus
le décor — demander des décors SANS médaillons ni éléments d'interface
(les maquettes en contiennent ; pour les décors finaux, préciser
« no level nodes, no UI » dans le prompt).

## Intégration

- Les chemins d'images sont déjà branchés dans les données
  (`src/config/chemin/*.ts` : champs `decor` et `carte.image`).
- Vérifier le rendu (contraste des médaillons sur le décor, l'overlay
  sombre est déjà en place) via Playwright sur `out/` (port local).
- Activer ensuite la carte du hub : ajouter dans
  `src/components/games/GamesHub.tsx` une carte `chemin` (titre
  « LE CHEMIN », desc « De la Genèse à l'Apocalypse — apprends toute
  l'histoire ! », href `/chemin`), illustration hub à générer aussi
  (style des autres cartes : objet sur rocher violet, fond violet).
- Build `npm run build:app`, captures, `date +%s > .ota-release`,
  commit + push (branche `claude/great-hamilton-ieokug`).

## Suite du contenu (après validation de Jack sur les 2 chapitres)

Chapitres suivants : Abraham, Joseph, Moïse et l'Exode, Josué, David,
Salomon, Élie, Daniel, Jonas, Esther, Jésus (plusieurs chapitres),
Actes, Paul, Apocalypse. À chaque chapitre : contenu (récits + exercices
dans `src/config/chemin/`), décor 2K, carte de personnage.
