# Le courriel de confirmation

`confirmation-tarbes.html` — à importer dans Brevo, dans
l'automatisation déclenchée par *« un contact est ajouté à la liste »*.

## Avant de le coller : deux adresses à remplacer

Les deux fichiers doivent d'abord être dans la médiathèque de WordPress
(**Médias → Ajouter**), puis on copie leur adresse
(**le fichier → « Copier l'URL dans le presse-papiers »**).

| Repère dans le fichier | Combien de fois | Ce qu'on met à la place |
|---|---|---|
| `__ADRESSE_DE_LA_BANNIERE__` | 1 | l'adresse de `banniere-mail-tarbes.jpg` |
| `__ADRESSE_DU_BILLET__` | 2 | l'adresse de `billet-un-seul-nom-tarbes.pdf` |

> **Les deux fois pour le billet, c'est voulu** : le gros bouton, et le
> lien discret du pied de page.

## Pourquoi un lien et pas une pièce jointe

272 ko × 400 inscrits, c'est 109 Mo qui sortent du compte Brevo pour un
seul événement. Et une pièce jointe **augmente le score de spam** de
n'importe quel message — or la délivrabilité est exactement le point
faible, celui qui a coûté les 850 absents d'Avignon.

Un bouton ne pèse rien, et le destinataire a la même chose au bout du
doigt.

## Les champs que Brevo remplit

Le module dépose ces attributs sur le contact à chaque réservation :

```
{{ contact.NOM }}      le nom
{{ contact.PLACES }}   le nombre de places
{{ contact.VILLE }}    « Tarbes 2026 »
```

## Le réglage à ne pas rater

Dans l'automatisation, activez **« Autoriser les contacts à entrer
plusieurs fois dans ce scénario »**.

Sans cela, quelqu'un qui n'a jamais reçu sa confirmation et qui se
réinscrit ne recevrait **toujours** rien : le module le remet bien dans
la liste, mais l'automatisation l'ignorerait. C'est précisément le trou
d'Avignon.

## Pourquoi c'est écrit en tableaux

C'est laid à lire, et c'est la seule façon qu'un courriel s'affiche
pareil dans Gmail, Outlook et sur un téléphone. Le bouton lui-même est
un tableau : Outlook ne sait pas arrondir un lien autrement.

## Les aperçus

`mail-ordi.png` et `mail-tel.png` montrent le rendu à 700 et 400 pixels
de large. Ils sont régénérés par le script du dossier `visuels`.
