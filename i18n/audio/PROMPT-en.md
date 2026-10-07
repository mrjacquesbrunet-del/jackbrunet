# Audios anglais (États-Unis) de l'app RHEMA : génération avec Magnific

Tu génères les 295 audios en anglais américain de l'app RHEMA (pasteur Jack Brunet)
avec Magnific, puis tu les importes dans l'app.

## 1. La liste à enregistrer

Fichier JSON (public) :
https://raw.githubusercontent.com/mrjacquesbrunet-del/jackbrunet/claude/great-hamilton-ieokug/i18n/audio/en.json

C'est un tableau de 295 éléments `{ "fichier", "type", "titre", "texte" }` :
- 205 méditations (`devotion-0.mp3` … `devotion-204.mp3`)
- 35 jours de plans thématiques (`plan-<slug>-<jour>.mp3`)
- 45 parties de la formation (`formation-<leçon>-<partie>.mp3`)
- 10 parties de l'étude biblique sur David (`etude-david-1-1.mp3` … `-10.mp3`)

Le nom `fichier` est EXACTEMENT celui que l'app attend : ne le change pas.
Le `texte` est déjà le texte final à lire : ne le résume pas, ne le modifie pas.

## 2. Réglages Magnific (identiques pour tous les audios)

- Outil : `audio_tts`
- Voix : **Noah Reed** (catalogue, voiceId **441**)
- Modèle : **eleven_v3**
- stability **0.5**, similarityBoost 0.75, speed 1.0
- Texte envoyé : `[warm, calm] ` suivi du `texte` de l'élément (rien d'autre).
  Laisse les sauts de ligne tels quels.
- Dossier Magnific : crée (ou réutilise) un dossier « RHEMA audios EN » et range-y tout.

Coût prévu : environ 0,2 crédit par caractère, soit environ 110 000 crédits pour les 295 audios.
Commence par **2 audios** (`devotion-0.mp3` et `plan-peur-1.mp3`) et fais-les valider par Jack
avant de lancer le reste. Ensuite, avance par lots de 8 (`creations_wait` accepte 8 identifiants).

Écoute rapidement chaque lot : pas de coupure, pas de passage lu deux fois, noms bibliques bien prononcés. Régénère ce qui ne va pas.

## 3. Import dans l'app

Pour chaque audio terminé, garde une ligne :  `nom-du-fichier.mp3|URL du MP3`
(l'URL `results.url` donnée par `creations_wait`, qui est temporaire : importe vite).

Puis lance le workflow GitHub « Importer des audios (liens temporaires) » du dépôt
`mrjacquesbrunet-del/jackbrunet` (fichier `.github/workflows/import-audio.yml`,
branche `claude/great-hamilton-ieokug`) avec :
- `dossier` : **en**
- `fichiers` : les lignes `nom.mp3|url`, **50 lignes maximum par lancement**

Le workflow télécharge les MP3 dans `public/audio/en/` et met à jour `public/audio/en/index.json` :
l'app affiche alors le lecteur audio de chaque contenu enregistré, en anglais.

Si tu ne peux pas lancer le workflow toi-même, envoie à Jack la liste des lignes
`nom.mp3|url` (par lots de 50), il la transmettra à la conversation de développement.
