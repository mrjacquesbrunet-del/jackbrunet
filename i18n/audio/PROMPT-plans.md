# Audios anglais et portugais des 5 nouveaux plans de lecture (Magnific)

Tu génères avec Magnific les audios des 5 nouveaux plans de lecture de l'app
RHEMA (pasteur Jack Brunet), en anglais américain puis en portugais du Brésil,
et tu les importes dans l'app. 99 audios par langue.

## 1. Les listes

- Anglais : https://raw.githubusercontent.com/mrjacquesbrunet-del/jackbrunet/claude/great-hamilton-ieokug/i18n/audio/en-a-faire.json
- Portugais : https://raw.githubusercontent.com/mrjacquesbrunet-del/jackbrunet/claude/great-hamilton-ieokug/i18n/audio/pt-a-faire.json

Chaque élément : `{ "fichier", "type", "titre", "texte" }`, et parfois
`"parties": [texte1, texte2]` quand le texte est long.

- Le nom `fichier` est EXACTEMENT celui que l'app attend : ne le change pas.
- Le `texte` est le texte final à lire : ne le résume pas, ne le modifie pas.
- S'il y a `parties`, génère **un audio par partie, dans l'ordre** (ne génère
  pas le `texte` entier).

## 2. Réglages Magnific (les mêmes que pour les autres audios de l'app)

- Outil : `audio_tts`, modèle **eleven_v3**, stability **0.5**,
  similarityBoost 0.75, speed 1.0.
- Anglais : voix **Noah Reed** (voiceId **441**), dossier Magnific
  « RHEMA audios EN ».
- Portugais : voix **Marcelo Costa** (voiceId **71**), dossier Magnific
  « RHEMA audios PT ».
- Texte envoyé : `[warm, calm] ` suivi du texte (ou de la partie), rien
  d'autre. Laisse les sauts de ligne tels quels.

Commence par **1 audio** en anglais (`plan-les-7-je-suis-de-jesus-1.mp3`) et
fais-le valider par Jack avant de lancer le reste. Ensuite, avance par lots de
8 (`creations_wait` accepte 8 identifiants). Écoute rapidement chaque lot :
pas de coupure, pas de passage lu deux fois, noms bibliques bien prononcés.

## 3. Import dans l'app

Pour chaque audio terminé, garde une ligne :
- sans parties : `nom-du-fichier.mp3|URL`
- avec parties : `nom-du-fichier.mp3|URL_partie1,URL_partie2` (dans l'ordre,
  séparées par une virgule, sans espace) : l'import les met bout à bout.

Les URL (`results.url` de `creations_wait`) sont temporaires : importe vite.

Lance le workflow GitHub « Importer des audios (liens temporaires) » du dépôt
`mrjacquesbrunet-del/jackbrunet` (`.github/workflows/import-audio.yml`,
branche `claude/great-hamilton-ieokug`) avec :
- `dossier` : **plans-en** pour l'anglais, **plans-pt** pour le portugais
  (surtout pas `en` ni `pt` : ces dossiers-là sont pleins) ;
- `fichiers` : les lignes, **30 lignes maximum par lancement**.

Si tu ne peux pas lancer le workflow toi-même, envoie à Jack les lignes (par
lots de 30) : il les transmettra à la conversation de développement.
