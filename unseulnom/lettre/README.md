# Lettre d'invitation aux pasteurs et responsables

Lettre A4, une page, à envoyer aux pasteurs, leaders et responsables d'églises.
Même charte que la page événement : bandeau tricolore, en-tête noir avec le
logo, titres Archivo, accents bleu et rouge, texte noir sur blanc.

| Fichier | À quoi ça sert |
|---|---|
| `lettre-un-seul-nom-avignon.pdf` | à envoyer par mail ou à imprimer |
| `lettre-un-seul-nom-avignon.png` | aperçu, pour un message ou les réseaux |
| `generer-lettre.py` | régénère les deux à partir du modèle |

Le QR code du pied de page mène à **https://unseulnom.org/evenement/**,
la page d'inscription. Vérifié à la lecture depuis le PDF imprimé.

## Modifier la lettre

Tout est dans `generer-lettre.py`, puis :

```
python3 generer-lettre.py
```

Les réglages courants sont en haut du fichier :

| Réglage | Ce que c'est |
|---|---|
| `DATE_LETTRE` | la date en haut à droite, à changer avant chaque envoi |
| `LIEN_QR` | l'adresse encodée dans le QR code |
| `COURRIEL` | l'adresse de contact du pied de page |

Le texte de la lettre se trouve plus bas, dans le bloc `HTML`.

> Le script refuse de produire un PDF de plus d'une page : si le texte
> déborde, il s'arrête avec un message plutôt que de laisser passer une
> deuxième page presque vide.

## Espace laissé sous la signature

L'espace entre « Toute l'équipe d'Un Seul Nom » et le pied de page est
volontaire : il permet d'imprimer la lettre et d'y apposer une signature
manuscrite avant de la scanner.
