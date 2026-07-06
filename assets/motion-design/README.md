# Motion design JACKBRUNET

Vidéo promo « motion design » de la plateforme (25 s, 16:9, 1080p, 30 fps),
fidèle à la charte graphique du site : Olive `#3A3F28`, Lime `#CAF000`,
Crème `#F3F3ED`, Encre `#1F2216`, Playfair Display + Archivo.

## Contenu du dossier

| Fichier | Rôle |
| --- | --- |
| `jackbrunet-motion.html` | La source de l'animation (ouvrable dans un navigateur ; timeline pilotable via `window.SEEK(ms)`) |
| `render.mjs` | Script de rendu : capture frame par frame (Playwright + Chromium) puis encodage H.264 (ffmpeg) |
| `fonts/` | Polices de la charte (Playfair Display, Archivo — Fontsource, licence OFL) |
| `jackbrunet-motion-1080p.mp4` | La vidéo finale |

## Déroulé (storyboard)

1. **0 – 3,9 s — Ouverture** : logotype « JACKBRUNET » révélé lettre à lettre sur fond crème, décor topographique, mention « Ministère chrétien ».
2. **3,9 – 8,6 s — Chaque jour** : « Une parole qui éclaire ta journée. » + carte « Pensée du jour » sur fond olive.
3. **8,6 – 13,4 s — Verset du jour** : Psaume 119:105 en Playfair Display, guillemet lime.
4. **13,4 – 18,2 s — Se nourrir** : Bible & plans de lecture, Shorts & prédications, avec mockup de téléphone au fil vertical défilant.
5. **18,2 – 21,9 s — Ensemble** : Mur de prière & Témoignages.
6. **21,9 – 25 s — Final** : logotype sur fond lime, « Grandir en Jésus, chaque jour. », jackbrunet.com, YouTube @Jack_brnt.

Les scènes s'enchaînent par des rideaux de couleur (olive, crème, encre, lime).

## Re-générer la vidéo

```bash
npm install playwright-core @ffmpeg-installer/ffmpeg
CHROMIUM_PATH=/chemin/vers/chrome \
FFMPEG_PATH=$(node -e "process.stdout.write(require('@ffmpeg-installer/ffmpeg').path)") \
node render.mjs
```

Options : `--fps 30`, `--out fichier.mp4`, `--workdir /tmp` (dossier des frames).

Pour modifier les textes ou le rythme, tout est dans `jackbrunet-motion.html`
(styles scène par scène + timeline commentée en bas de fichier).

## Variante IA (Magnific / Seedance)

Pour une version « générative » (images animées photoréalistes ou illustratives
en plus du motion design), les prompts ci-dessous sont prêts pour le modèle
**Seedance** via le connecteur Magnific (une fois la connexion autorisée dans
les paramètres de connecteurs claude.ai). Générer chaque clip en 16:9, puis
les assembler avec `video_concatenate`.

1. **Clip 1 (5 s)** — *Premium motion design intro: the word "JACKBRUNET" in bold black sans-serif letters sliding up from masked slots on a cream `#F3F3ED` background, thin olive topographic contour lines drifting, a vivid lime `#CAF000` vertical bar drops in above the wordmark, subtitle "MINISTÈRE CHRÉTIEN" fades up, flat vector style, smooth expo easing, 4K, no people.*
2. **Clip 2 (5 s)** — *Flat design scene on deep olive `#3A3F28`: elegant cream serif italic headline "Une parole qui éclaire ta journée." words rising one by one, a cream rounded card labelled "PENSÉE DU JOUR" slides up with soft shadow, lime pill button "Lire la pensée →", concentric lime circles breathing in background, kinetic typography, premium motion design.*
3. **Clip 3 (5 s)** — *Minimal cream background scene: dark olive pill badge "VERSET DU JOUR", giant lime French quotation mark drops with elastic ease, serif quote "Ta parole est une lampe à mes pieds, une lumière sur mon sentier." reveals line by line from masks, caption "PSAUME 119 : 105" with lime underline bar, editorial typography, flat design.*
4. **Clip 4 (5 s)** — *Dark ink `#1F2216` scene: white serif headline "Tout pour grandir.", three list items sliding in from the left with lime square bullets ("Bible & plans de lecture", "Shorts & prédications", "Temps avec Jésus"), on the right a flat smartphone mockup with a vertical feed of lime and cream video cards scrolling upward, motion design, no photorealism.*
5. **Clip 5 (5 s)** — *Finale: full lime `#CAF000` background, massive black wordmark "JACKBRUNET" letters rising from masks, italic serif tagline "Grandir en Jésus, chaque jour.", dark pill with "jackbrunet.com", small caption "YOUTUBE · @JACK_BRNT", clean flat premium brand outro.*
