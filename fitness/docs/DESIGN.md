# Application Fitness — Principes UX & Design System

Règle centrale du produit : **complexité derrière, simplicité devant.**
Si une fonctionnalité complexe peut être rendue simple pour l'utilisateur
sans perdre sa puissance, choisir l'expérience la plus simple. Chaque écran
a UN objectif principal évident.

## 1. Design system (tokens — `src/lib/theme.ts`)

Tous les styles viennent des tokens centralisés. **Jamais** de valeur
définie arbitrairement dans un écran.

| Token | Contenu |
|---|---|
| `palette` / `lightTheme` / `darkTheme` | fond principal & secondaire (cartes), texte principal & secondaire, bordures, accent, succès/erreur, couleurs macros |
| `typography` | display, heading1, heading2, body, caption, **metricLarge**, **metricSmall** (les grandes valeurs chiffrées ont leur propre style, chiffres tabulaires) |
| `spacing` | xs 4 → xxl 32 |
| `radius` | md 12, lg 16, xl 24 |
| `durations` | fast 150 ms, base 250 ms, slow 400 ms |
| `cardShadow` | ombre douce unique des cartes |

- **Dark mode réel** : palette dédiée (surfaces, contrastes, tracks), pas une
  simple inversion — déjà en place dans `darkTheme`.
- **Icônes** : une seule famille, en trait (lucide). Jamais d'emojis dans
  l'interface.
- Palette limitée : l'accent sert aux boutons, progressions et sélections.
  Les trois couleurs macros (protéines/glucides/lipides) sont la seule
  exception, car elles aident la lecture.

## 2. Hiérarchie visuelle

Trois niveaux maximum par écran :

1. **L'essentiel** — `metricLarge` (ex. « 1 840 kcal »)
2. **Le contexte** — body (« sur 2 100 kcal »)
3. **Le détail** — caption (« 260 kcal restantes »)

Cartes épurées (`Card`) pour calories, macros, pas, séance, eau, poids,
progression. Ne pas encadrer chaque petit élément.

## 3. Interactions

- **Bouton « + » global** : ajout aliment / repas / eau / poids / mesure /
  photo / activité — actions adaptées au contexte de l'écran.
- **Bottom sheets** pour les petites actions (ajouter un poids, de l'eau,
  modifier une portion, valider une série) — on garde le contexte.
- **Gestes** : swipe droite = valider, swipe gauche = modifier/supprimer,
  appui long = actions supplémentaires — toujours avec une alternative
  visible (accessibilité).
- **Feedback immédiat** : mise à jour optimiste de l'UI (react-query),
  jamais de rechargement visible. Micro-animations discrètes
  (remplissage de jauge, validation de série, objectif de pas atteint) —
  jamais bloquantes.
- **Pas de formulaires longs** : étapes courtes + barre de progression
  (bilan de départ : « Étape 1 sur 5 »), sélecteurs, champs contextuels.

## 4. États

- **États vides soignés** : un message qui donne envie + un bouton d'action
  (ex. « Ton prochain bilan permettra de voir ta transformation autrement
  que sur la balance. » → Ajouter un bilan).
- **Chargement** : skeleton loaders, pas de gros spinners permanents.
- **Objectifs** : trois états visuels (non commencé / en cours / terminé —
  `goalState()`).
- Aucune culpabilisation : jamais de messages négatifs sur un jour manqué.

## 5. Une application qui anticipe

Le dashboard présente **la prochaine action logique** selon le moment :
matin → enregistrer le poids ; midi → repas prévu ; avant la séance →
séance du jour ; le soir → protéines restantes. Progressive disclosure :
le détail (historique, moyennes 7 jours, sources) s'affiche en appuyant
sur une carte, jamais d'office.

## 6. Personnalisation

Le dashboard doit devenir personnalisable (ordre/choix des cartes selon
l'objectif : perte de poids → poids, calories, pas ; muscle → protéines,
séance, performances). Prévu avec le profil (main_goal) comme préréglage.

## 7. Accessibilité

Contrastes suffisants, zones tactiles ≥ 44 pt, labels accessibles
(`accessibilityLabel` sur toute action sans texte), tailles de police
dynamiques, VoiceOver/TalkBack, retour haptique optionnel.

## 8. Bilan de départ & check-ins (UX)

- Bilan initial en **5 étapes courtes** avec barre de progression :
  1. poids & infos principales → référence jamais écrasée ;
  2. photos guidées (face, profil, dos) avec silhouette de cadrage et
     consignes (même éclairage, même distance, mêmes vêtements) ;
  3. mensurations avec illustration, aide de placement
     (`MEASUREMENT_HELP`), dernière valeur connue, taille ≠ ventre,
     relâché/contracté pour les bras ;
  4. objectifs de transformation (poids, ventre, bras, pas, séances,
     protéines — sans date obligatoire) ;
  5. récapitulatif visuel → « Commencer ma transformation ».
- **Check-in mensuel** : même protocole pour comparer correctement ;
  rappel un mois après le dernier bilan (`isCheckinDue`), reportable
  (`snoozeCheckinReminder`). Photo précédente en transparence pour
  reproduire le cadrage. Jamais de retouche du corps.
- Après chaque bilan : **comparaison automatique** (« Depuis ton dernier
  bilan : poids −3,2 kg, ventre −4 cm… ») puis « Voir mes photos ».
- Confidentialité : photos privées par défaut (bucket privé + URLs
  signées), option verrou biométrique (`photo_biometric_lock`).
