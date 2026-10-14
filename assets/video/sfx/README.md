# Sound design — vidéo de présentation RHEMA

Effets sonores générés avec Magnific (ElevenLabs SFX), pour accompagner
`../musique-presentation.mp3` (Google Lyria, 67,7 s).

Les repères ci-dessous sont **mesurés sur la piste réelle** (analyse de
l'énergie, des graves et des attaques), pas tirés du prompt : la musique
générée ne suit pas le découpage demandé (le drop tombe à 8,9 s, pas à 4 s).
Version machine : `reperes.json` (millisecondes).

## Grille musicale

- Tempo mesuré : **120 BPM** → un temps = 0,5 s, une mesure = 2 s.
- **Temps** : 0,40 s puis toutes les 0,50 s (0,40 · 0,90 · 1,40 …).
- **Débuts de mesure** : 0,90 s puis toutes les 2 s
  (0,9 · 2,9 · 4,9 · 6,9 · 8,9 · 10,9 … 64,9).
- Règle : chaque changement de scène tombe sur un début de mesure ;
  chaque mot ou carte qui apparaît tombe sur un temps.

## Structure de la musique

| De | À | Section | Caractère |
| --- | --- | --- | --- |
| 0,0 | 0,9 | Silence de départ | — |
| 0,9 | 8,9 | Intro (4 mesures) | Coup d'ouverture à 0,9, nappe calme, montée dans les aigus à 7–8,9 |
| 8,9 | 32,9 | Partie A (12 mesures) | Drop, batterie, basse : énergie stable |
| 32,9 | 40,9 | Pause (4 mesures) | Plus de basse, ambiance aérée |
| 40,9 | 48,9 | Relance (4 mesures) | Retour des graves, montée ; trou de silence 47,9–48,9 |
| 48,9 | 64,9 | Final (8 mesures) | Partie la plus forte de la piste |
| 64,2 | 67,4 | Coup final + queue | Dernier coup vers 64,2, réverbération jusqu'à 67,4 |

## Repères sound design

| Temps (s) | Son | Niveau | Rôle |
| --- | --- | --- | --- |
| 0,90 | `09-scintillement.mp3` | -16 dB | Apparition du logo sur le coup d'ouverture |
| 4,80 | `01-riser-ouverture.mp3` | -14 dB | Montée, finit pile sur le drop |
| 8,90 | `02-impact-drop.mp3` | -10 dB | **Drop** : première grande révélation |
| 8,9 → 32,9 | `03-whoosh-rapide-1/2/3.mp3` | -16 dB | À chaque coupe sur un début de mesure, démarrer 0,3 s avant (ex. 10,6 pour une coupe à 10,9) |
| 8,9 → 32,9 | `05-pop-texte-1/2.mp3` | -18 dB | Mots, cartes, badges qui apparaissent, sur les temps |
| 8,9 → 32,9 | `06-tap-ecran.mp3` / `07-swipe-ecran.mp3` | -18 dB | Démo de l'app : tap sur l'icône ou un bouton, défilement |
| 32,60 | `04-whoosh-ample.mp3` | -14 dB | Passage vers la pause (coupe à 32,9) |
| 34,90 | `09-scintillement.mp3` | -18 dB | Moment lumière : verset, parole du jour |
| 36,90 | `08-notification.mp3` | -16 dB | Mur de prière / notification (la pause laisse la place) |
| 38,80 | `10-reverse-montee.mp3` | -14 dB | Aspiration, finit sur la relance |
| 40,90 | `02-impact-drop.mp3` | -12 dB | **Relance** |
| 44,60 | `04-whoosh-ample.mp3` | -16 dB | Changement de section au milieu de la relance (coupe à 44,9) |
| 46,80 | `10-reverse-montee.mp3` | -12 dB | Aspiration dans le trou de silence, finit sur le grand drop |
| 48,60 | `04-whoosh-ample.mp3` | -12 dB | Entrée dans le final (coupe à 48,9) |
| 48,90 | `02-impact-drop.mp3` | -8 dB | **Grand drop final** |
| 48,9 → 64,9 | `03-whoosh-rapide-1/2/3.mp3` | -16 dB | Coupes du final, sur les mesures ou toutes les secondes |
| 64,20 | `11-impact-final.mp3` | -10 dB | **Coup final** sur le logo de fin |
| 65,00 | `09-scintillement.mp3` | -20 dB | Brillance sur le logo pendant la queue |

Les sons fixés à un temps précis sont calés sur la musique. Ceux des parties
A et du final dépendent du montage : les placer selon les coupes réelles,
avec les règles de la grille.

## Si la vidéo doit faire environ 50 s

Couper les mesures **16,9 → 32,9** (8 mesures dans la partie A) : la
musique passe à **51,7 s** et le raccord est invisible, car les deux bords
sont des débuts de mesure de la même section. Tous les repères après 32,9
avancent alors de 16 s (ex. coup final à 48,2 au lieu de 64,2).

## Conseils de mixage

- Effets entre -8 et -20 dB sous la musique (voir colonne Niveau) : ils
  soulignent, ils ne couvrent pas.
- Whoosh : démarrer environ 0,3 s avant la coupe pour que le pic tombe sur
  le changement d'image.
- Varier les whooshs rapides (1, 2, 3) pour éviter l'effet répétitif.
