# Billet universel — Un Seul Nom · Tarbes 2026

`billet-un-seul-nom-tarbes.pdf` — format **A5 portrait** (148 × 210 mm),
à joindre au courriel de confirmation, à imprimer, ou à faire circuler.

| Fichier | Poids | Usage |
|---|---|---|
| `billet-un-seul-nom-tarbes.pdf` | **272 ko** | **la pièce jointe Brevo** |
| `billet-un-seul-nom-tarbes.png` | 1,4 Mo | 300 dpi, si un imprimeur en demande |
| `billet-un-seul-nom-tarbes-web.png` | 530 ko | 150 dpi, réseaux sociaux |
| `billet-un-seul-nom-avignon.*` | — | l'édition précédente, gardée en archive |

## Le poids compte autant que l'allure

Le billet part **en pièce jointe à chaque inscription**. Une pièce jointe
lourde met plus de temps à partir, se fait recaler par certaines boîtes,
et pèse sur une délivrabilité déjà fragile.

La première version faisait **2,8 Mo**, dont 2,6 pour la seule affiche :
le navigateur l'embarquait sans perte, dans sa définition d'origine —
1600 pixels pour une bande de 148 millimètres, dont il ne gardait qu'un
tiers en hauteur.

L'affiche est maintenant **découpée et réduite dans le script**, à ce que
le billet en montre vraiment, puis enregistrée en JPEG à 200 dpi. Le
navigateur reprend le JPEG tel quel.

**Résultat : 272 ko au lieu de 2,8 Mo**, soit dix fois moins, sans rien
changer à l'écran ni à l'impression.

Les deux réglages sont en haut de `generer-billet.py` : `DPI_AFFICHE` et
`QUALITE_JPEG`.

## Un billet universel

**Le même pour tout le monde.** Il vaut invitation, pas titre nominatif.
C'est ce qui permet de le joindre tel quel au courriel de confirmation,
de l'imprimer par paquets pour les églises, et de le faire suivre sans
rien casser.

L'entrée est libre. C'est la **réservation en ligne** qui compte les
places, pas ce papier : le QR code du bas mène directement à
`unseulnom.org/evenement/tarbes/`.

> **Si un jour tu veux un billet nominatif** — un par réservation, avec le
> nom, le nombre de places et un code-barres unique à scanner à
> l'entrée — c'est faisable : le module connaît déjà chaque réservation.
> Il faut une page « billet » sur le site et une référence par
> inscription. Demande-le, ce n'est pas le même objet.

## Le style suit la fiche de la ville

L'affiche occupe tout le haut du billet, comme en tête de la page de
l'événement. Celui qui le reçoit reconnaît du premier coup d'œil ce
qu'il a déjà vu sur le site et sur les réseaux.

Rien n'est écrit par-dessus l'affiche : une première version y posait
« UN SEUL NOM / TARBES » en grand, mais l'affiche le dit déjà, en plus
beau, et les deux se répétaient.

L'affiche garde toute sa largeur et n'est recadrée que du haut et du
bas : elle porte des visages et des noms qui touchent les bords
latéraux, les rogner en couperait des morceaux.

## Changer de ville

Tout ce qui bouge d'une édition à l'autre est dans le bloc `VILLE`, en
haut de `generer-billet.py` : le nom, l'affiche, la date, les horaires,
le lieu, les intervenants et le lien du QR code.

```
python3.13 generer-billet.py
```

> Le script tourne avec **`python3.13`** : c'est là qu'est installée la
> bibliothèque qui dessine le QR code.

> **Les polices vivent dans `../charte/`**, dans le dépôt. La première
> version les cherchait dans un dossier de travail temporaire ; ce
> dossier a été nettoyé et le script ne savait plus produire un billet.

> Le script s'arrête si le billet dépasse une page, ou si un repère
> n'a pas été remplacé : un `__LIEU__` oublié se verrait à l'impression.
