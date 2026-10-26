# Lettre d'invitation aux pasteurs et responsables

Lettre A4, une page, à envoyer aux pasteurs, leaders et responsables d'églises.
Même charte que la page événement : bandeau tricolore, en-tête noir avec le
logo, titres Archivo, accents bleu et rouge, texte noir sur blanc.

| Fichier | À quoi ça sert |
|---|---|
| `lettre-un-seul-nom-tarbes.pdf` | à envoyer par mail ou à imprimer |
| `lettre-un-seul-nom-tarbes.png` | aperçu, pour un message ou les réseaux |
| `generer-lettre.py` | régénère les deux à partir du modèle |
| `lettre-un-seul-nom-avignon.*` | l'édition précédente, gardée en archive |

Elle est adressée aux églises de **Tarbes, Pau et toute la région** :
Hautes-Pyrénées, Béarn, Gers et Haute-Garonne.

Le QR code du pied de page mène à **https://unseulnom.org/evenement/tarbes/**,
la page de réservation.

## Modifier la lettre

Tout est dans `generer-lettre.py`, puis :

```
python3 generer-lettre.py
```

**Tout ce qui change d'une ville à l'autre est dans le bloc `VILLE`**, en
haut du fichier : le nom, les dates, le lieu, les intervenants, le nombre
de places, le lien du QR code et la date de l'en-tête. Le reste de la
lettre ne bouge pas — c'est la même invitation et la même charte.

Le script s'arrête si un repère n'a pas été remplacé : un `__LIEU__`
oublié se verrait sur la lettre imprimée.

Le texte de la lettre se trouve plus bas, dans le bloc `HTML`.

> **Les polices et le logo vivent dans `../charte/`**, dans le dépôt. La
> première version les cherchait dans un dossier de travail temporaire ;
> ce dossier a été nettoyé et le script ne savait plus produire une
> lettre.

> Le script tourne avec **`python3.13`** : c'est là qu'est installée la
> bibliothèque qui dessine le QR code.

> Le script refuse de produire un PDF de plus d'une page : si le texte
> déborde, il s'arrête avec un message plutôt que de laisser passer une
> deuxième page presque vide.

## L'espace sous la signature a disparu

La lettre d'Avignon laissait de la place sous « Toute l'équipe d'Un Seul
Nom », pour une signature manuscrite. Le paragraphe sur la réservation
des places l'a prise : à Tarbes, la place se réserve, et c'est l'essentiel
du message aux pasteurs.

Si tu tiens à la signature manuscrite, dis-le : on raccourcit le
paragraphe sur la mobilisation pour récupérer deux centimètres.
