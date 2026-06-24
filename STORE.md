# Fiche App Store — Jack Brunet

Tout le contenu prêt à copier-coller dans **App Store Connect**, plus la
checklist des captures d'écran et la déclaration de confidentialité.

> Respecte les limites de caractères indiquées (App Store les impose).

---

## 1. Informations de base

- **Nom de l'app** (max 30) :
  `Jack Brunet : foi au quotidien`
- **Sous-titre** (max 30) :
  `Dévotionnel, Bible & prière`
- **Catégorie principale** : Mode de vie
- **Catégorie secondaire** : Références
- **Classification par âge** : 4+ (aucun contenu sensible)
- **Langue principale** : Français (France)

---

## 2. Texte promotionnel (max 170, modifiable à tout moment)

```
Chaque jour, un dévotionnel pour t'enraciner en Jésus : un verset, une méditation, une déclaration, la Bible et un rappel quotidien. Une foi vivante, simple et profonde.
```

---

## 3. Description (max 4000)

```
Jack Brunet, c'est une foi vivante, simple et profonde — au creux de ta main, chaque jour.

Pasteur et créateur de contenu suivi par plus d'un million de personnes, Jack t'accompagne pour t'enraciner en Jésus et grandir dans une relation réelle avec Dieu, jour après jour.

CE QUE TU TROUVERAS DANS L'APP

• Le dévotionnel du jour
Un verset (rhéma), une méditation développée, une déclaration à proclamer sur ta vie et des questions d'application. Du contenu nouveau chaque jour.

• Écoute la méditation
Une version audio pour méditer la Parole où que tu sois, même en marchant ou en voiture.

• La Bible (Louis Segond)
Lis la Bible directement dans l'app, avec le passage du jour relié à ton plan de lecture.

• Un rappel quotidien
Active une notification douce chaque matin pour ne plus oublier ton temps avec Dieu.

• Reste motivé
Suis ta série de jours consécutifs, marque tes méditations et garde tes favoris.

• Des cartes à partager
Partage une parole percutante en une belle image, pour encourager autour de toi.

• Vidéos et enseignements
Retrouve les prédications et les formats courts, recherche et regarde sans quitter l'app.

• Missions
Suis les missions d'évangélisation (comme Madagascar) et porte-les dans la prière.

NOTRE VISION

Présenter une foi enracinée, biblique et accessible. Pas une religion distante ou compliquée, mais une rencontre vivante avec Jésus qui transforme, relève et restaure.

« Tout part de Lui, tout tient par Lui, et tout revient à Lui. »

Télécharge l'app, et fais de ton temps avec Dieu un rendez-vous quotidien.
```

---

## 4. Mots-clés (max 100 caractères, séparés par des virgules, SANS espaces inutiles)

```
chrétien,Jésus,Bible,dévotion,prière,foi,verset,méditation,évangile,Dieu,culte,LSG,protestant
```
> Si App Store dit « trop long », enlève les derniers mots jusqu'à passer sous 100.

---

## 5. URLs

- **URL d'assistance (Support URL)** : `https://jackbrunet.com`
- **URL marketing (facultatif)** : `https://jackbrunet.com`
- **Politique de confidentialité (obligatoire)** : `https://jackbrunet.com/confidentialite`

---

## 6. Captures d'écran (obligatoires)

Format requis : **iPhone 6,7"** — **1290 × 2796 px** (portrait). 3 à 10 images.

Le plus simple : lance l'app dans le simulateur **iPhone 16 Pro Max** (dans Xcode :
choisis ce simulateur en haut, ▶ Run), puis **Cmd+S** pour enregistrer chaque écran.

Écrans suggérés (dans cet ordre) :
1. **Le dévotionnel du jour** (verset + méditation) — l'écran le plus important
2. **La carte à partager** (punchline)
3. **La Bible (Louis Segond)**
4. **Le rappel quotidien activé** + série de jours
5. **Les vidéos / enseignements**

> Astuce : tu peux ajouter un court titre sur chaque capture (ex. « Ta pensée du
> jour »), mais ce n'est pas obligatoire. Des captures brutes sont acceptées.

---

## 7. Confidentialité des données (App Privacy)

Dans App Store Connect → **App Privacy**, déclare :

- **Coordonnées → Adresse e-mail**
  - Collectée : Oui (via les formulaires newsletter / prière / etc.)
  - Utilisation : Marketing/communications + Fonctionnalité de l'app
  - Liée à l'utilisateur : Oui · Suivi publicitaire : Non
- **Coordonnées → Nom**
  - Collecté : Oui · Usage : Fonctionnalité · Lié : Oui · Suivi : Non
- **Coordonnées → Numéro de téléphone** (si tu le demandes dans un formulaire)
  - Collecté : Oui · Usage : Fonctionnalité · Lié : Oui · Suivi : Non

Tout le reste (série de jours, favoris) reste **sur l'appareil** → **non collecté**.

---

## 8. Notes pour l'examen Apple (App Review Information → Notes)

```
Application de dévotion chrétienne. Fonctions natives au-delà d'un simple site web :
contenu quotidien consultable hors-ligne, rappel quotidien par notification locale,
lecteur Bible intégré, lecture audio des méditations, favoris et suivi de progression
stockés sur l'appareil. Aucune connexion / compte requis pour utiliser l'app.
```

Compte de test : **non requis** (l'app s'utilise sans connexion).

---

## ⚠️ 9. Deux points à régler AVANT d'envoyer (anti-refus)

1. **Les dons (page « Soutenir »)**
   Apple peut refuser une collecte de dons faite *dans* l'app. La règle : les dons
   doivent s'ouvrir dans le **navigateur Safari** (hors de l'app), ce que permettent
   déjà nos liens Stripe. Recommandation : je peux faire en sorte que les boutons de
   don et de paiement **ouvrent Safari** dans l'app native (plugin Browser). Dis « oui »
   et je le mets en place.

2. **iPhone uniquement (pour éviter les captures iPad)**
   Par défaut l'app peut être proposée aussi sur iPad → Apple demanderait alors des
   captures iPad en plus. Si tu veux **iPhone seulement** au lancement (plus simple),
   je te donne le réglage à changer dans Xcode (1 clic).
```
```
