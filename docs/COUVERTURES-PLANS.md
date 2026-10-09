# Couvertures des nouveaux plans de lecture

Les plans affichent `cover` (ex. `/img/plans/peur.webp`) en grand sur la fiche
du plan et dans la liste ; sans couverture, un dégradé sombre s'affiche.

## Style (identique aux 7 couvertures existantes)

- Photo cinématographique réaliste, lumière dorée (lever ou coucher du soleil),
  ambiance chaude et émotionnelle, grain léger de pellicule.
- Format **portrait 3:4**, livré en **900 × 1200**, `.webp` qualité 80.
- Le **tiers du bas reste sombre et calme** : le titre du plan s'y affiche
  par-dessus dans l'app.
- Personnages vus de dos, de profil ou à contre-jour : jamais le visage de
  Jésus.
- Interdits : texte, lettrage, filigrane, logo, auréole.

Références de style à téléverser dans Magnific (type `image`) :
`public/img/plans/identite.webp`, `public/img/plans/saint-esprit.webp`,
`public/img/plans/peur.webp`.

## Les 5 images

| fichier à déposer | plan |
|---|---|
| `public/img/plans/les-7-je-suis-de-jesus.webp` | Les 7 « Je suis » de Jésus (7 jours) |
| `public/img/plans/apprendre-a-prier.webp` | Apprendre à prier (10 jours) |
| `public/img/plans/je-ne-suis-pas-n-importe-qui.webp` | Je ne suis pas n'importe qui (21 jours) |
| `public/img/plans/40-jours-avec-jesus.webp` | 40 jours avec Jésus (40 jours) |
| `public/img/plans/annoncer-liberer-guerir.webp` | Annoncer, libérer et guérir (21 jours) |

### 1. Les 7 « Je suis » de Jésus

> Cinematic still life on an old rustic wooden table near a window at golden
> hour: a round loaf of freshly broken bread, a small lit clay oil lamp, a
> cluster of dark grapes still on the vine, a shepherd's wooden staff leaning
> against a half-open wooden door through which warm sunlight pours in.
> Biblical Middle-Eastern atmosphere, warm amber light, deep soft shadows,
> shallow depth of field, subtle film grain, photorealistic, portrait 3:4,
> lower third dark and uncluttered, no text, no people.

### 2. Apprendre à prier

> Cinematic photo of a young adult kneeling beside a bed in a simple bedroom
> at dawn, seen from the side and slightly behind, hands folded on an open
> Bible resting on the bed, head bowed, soft golden morning light streaming
> through a window with thin curtains, dust particles floating in the light
> beam, peaceful and intimate atmosphere, warm tones, shallow depth of field,
> subtle film grain, photorealistic, portrait 3:4, lower third dark and calm,
> no text.

### 3. Je ne suis pas n'importe qui

> Cinematic photo of a person standing barefoot at the edge of a perfectly
> still lake at sunrise, seen from behind, looking at their own reflection in
> the water; the reflection is bathed in bright golden light as if renewed,
> mist rising from the water, mountains in the distance, rays of sun breaking
> through clouds, hopeful and majestic atmosphere, warm golden tones, subtle
> film grain, photorealistic, portrait 3:4, lower third dark water, no text.

### 4. 40 jours avec Jésus

> Cinematic photo of two travellers in simple first-century robes walking side
> by side on a dusty path through the hills of Galilee at golden hour, seen
> from behind, one with his hand on the other's shoulder as they talk, olive
> trees along the path, the Sea of Galilee shimmering in the distance, long
> shadows, warm sunset light, sense of friendship and journey, subtle film
> grain, photorealistic, portrait 3:4, lower third dark path, no faces
> visible, no text, no halo.

### 5. Annoncer, libérer et guérir

> Cinematic photo of a small group of ordinary people in modern casual
> clothes on a city street at golden hour, seen from behind and from the
> side: one gently lays a hand on the shoulder of an elderly woman sitting on
> a bench as he prays for her, another kneels to talk with a young man,
> warm sunlight flaring between buildings, sense of compassion, courage and
> mission, warm golden tones, subtle film grain, photorealistic, portrait
> 3:4, lower third dark street, no faces clearly visible, no text.

## Après la génération

Déposer les 5 fichiers `.webp` dans `public/img/plans/` (ou les envoyer à
Claude dans la conversation du code) : Claude ajoute le champ `cover` dans
`content/plans-sources/<slug>.json` puis relance
`node scripts/plans/construire-plans.mjs`.
