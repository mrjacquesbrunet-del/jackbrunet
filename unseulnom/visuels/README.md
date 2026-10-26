# La bannière du courriel

`banniere-mail-tarbes.jpg` — **2400 × 880**, le format demandé par Brevo
pour un en-tête. Le JPEG pèse 310 ko ; le PNG est là pour l'archive.

## L'affiche n'est pas recadrée

L'affiche fait 1600 × 900, la bannière 2400 × 880. Un recadrage n'en
gardait que la moitié de la hauteur, et il **coupait les têtes** de ceux
qui sont en haut. On ne coupe pas la tête des intervenants pour faire
tenir un format.

Elle est donc posée **entière**, à droite, et le texte prend la place à
gauche. Rien n'est écrit par-dessus : l'affiche dit déjà le nom de la
ville, en plus beau. La bannière ajoute ce qu'elle ne met pas en avant —
**quand** et **où**.

## Changer de ville

Tout est dans le bloc `VILLE`, en haut de `generer-banniere.py` :

```
python3.13 generer-banniere.py
```

> Le script tourne avec **`python3.13`**. Il s'arrête si la taille
> obtenue n'est pas exactement 2400 × 880, ou si un repère n'a pas été
> remplacé.
