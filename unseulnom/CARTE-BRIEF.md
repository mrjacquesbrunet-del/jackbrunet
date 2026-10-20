# Carte de France animée — cahier des charges

Document à transmettre au monteur. Il décrit l'animation qui prendra
place sur la page d'accueil, entre la **vision** (bloc noir) et la
**frise** (les affiches qui défilent).

## Ce que la carte doit dire

Une seule chose, en un coup d'œil : **où Un Seul Nom est passé, et où
Un Seul Nom va**. Les affiches sont déjà montrées juste en dessous par
la frise — la carte ne doit donc **pas** les reprendre.

## Les trois états

| État | Couleur | Signification |
|---|---|---|
| **Passé** | vert `#2E9E5B` | l'édition a eu lieu |
| **Bientôt** | orange `#F7941D` | la prochaine date |
| **Plus loin** | rouge `#E4262B`, **clignotant** | les dates annoncées, plus lointaines |

## Les villes

Coordonnées relevées sur OpenStreetMap, en degrés décimaux.

| Ville | Dép. | Date | État | Latitude | Longitude |
|---|---|---|---|---|---|
| Paris | 75 | 4 mai 2024 | passé | 48,8589 | 2,3200 |
| Créteil | 94 | 2024 | passé | 48,7771 | 2,4531 |
| Angers | 49 | 2024 | passé | 47,4740 | −0,5516 |
| Pau | 64 | 5 octobre 2024 | passé | 43,2958 | −0,3686 |
| Paris (formation) | 75 | 12 avril 2025 | passé | 48,8589 | 2,3200 |
| Croissy-Beaubourg | 77 | 21 et 22 juin 2025 | passé | 48,8279 | 2,6584 |
| Wasquehal | 59 | 28 mars 2026 | passé | 50,6692 | 3,1312 |
| Perpignan | 66 | 9 mai 2026 | passé | 42,6985 | 2,8953 |
| Avignon | 84 | 17 octobre 2026 | passé | 43,9492 | 4,8059 |
| **Tarbes** | **65** | **12 décembre 2026** | **bientôt** | 43,2329 | 0,0781 |
| Marseille | 13 | 6 mars 2027 | plus loin | 43,2964 | 5,3778 |
| Bordeaux | 33 | 15 mai 2027 | plus loin | 44,8412 | −0,5800 |

**Hors carte** : Madagascar, le 14 novembre 2026 (Antananarivo). À
traiter comme un renvoi en marge, pas comme un point sur l'hexagone.

Paris reçoit deux dates au même endroit : un seul point suffit.

## La charte

- **Fond** : crème `#F0EEE7`. Un fond transparent convient aussi, la
  page le posera sur cette crème.
- **Encre** : `#111110` pour le tracé de la France et les textes.
- **Gris** : `#5C5B54` pour les mentions secondaires.
- **Polices** : *Archivo* en 900 pour les noms de villes, *Inter* pour
  les dates. Si elles manquent, n'importe quelle grotesque géométrique
  fera l'affaire — surtout pas d'empattements.
- Le dégradé de la marque (or → rouge → magenta → violet → bleu) est
  réservé aux boutons du site : **ne pas l'utiliser** sur la carte.

## Le format attendu

- **Ratio** 4/3 ou 16/9, au choix. Cadrage serré sur l'hexagone.
- **Définition** 1600 px de large au minimum.
- **Durée** 10 à 15 secondes, **bouclable sans raccord visible**.
- **Livrables** : un `.mp4` (H.264) **et** un `.webm`. Le `.webm`
  accepte la transparence, ce que le `.mp4` ne fait pas.
- **Sans son.** L'animation tourne en silence, en boucle, sans que le
  visiteur la lance.
- **Poids** : 3 Mo maximum. Au-delà, la page devient lourde sur mobile.
- Joindre une **image d'attente** (`.webp` ou `.jpg`, même cadrage) :
  elle s'affiche le temps que la vidéo charge.

## L'idée de mise en scène

À titre indicatif, le monteur reste libre :

1. le tracé de la France apparaît
2. les points verts s'allument un par un, du plus ancien au plus récent
3. le point orange de Tarbes arrive en dernier et reste
4. les points rouges se mettent à clignoter doucement
5. une légende discrète rappelle les trois couleurs

Un mouvement lent et tenu vaut mieux qu'une suite d'effets. Le reste de
la page est très calme, la carte doit s'y fondre.

## Où elle se pose

Dans `accueil.html`, un emplacement commenté attend l'animation, entre
le bloc de la vision et la frise. Il suffit d'y décommenter le bloc
`usn-carte-video` et d'y mettre l'adresse du fichier une fois celui-ci
envoyé dans la médiathèque WordPress.
