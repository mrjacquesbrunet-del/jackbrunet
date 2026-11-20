# Limours — samedi 2 janvier 2027

La page de Limours est **la page de Tarbes**, à trois choses près : la charte,
les intervenants et le nom de l'événement pour les réservations. Tout le reste
— le film de fond, le compte à rebours, le programme, les animations au défilement,
le formulaire, le compteur de places, l'envoi vers Brevo — est le même code.

| | |
|---|---|
| Fichier de travail | [`limours.html`](./limours.html) |
| Sortie WordPress | `wordpress-limours/` |
| Page à coller d'un bloc | `limours-a-coller-dans-wordpress.html` |
| Adresse prévue | `unseulnom.org/evenement/limours/` |

## La charte, relevée sur l'affiche

Les couleurs ne sont pas choisies « dans le même esprit » : elles sont prélevées
au pixel sur l'affiche, de haut en bas.

| Rôle | Couleur | D'où elle vient |
|---|---|---|
| Accent principal | `#1546C8` | le bleu profond du ciel de scène |
| Survol / éclat | `#4A82F5` | le bleu pâle des projecteurs |
| Liaison | `#9B2480` | le prune de la salle |
| Boutons d'action | `#E4235A` | le magenta de la lueur sur la foule |
| Fond sombre | `#190419` | le bas de l'affiche, un noir tiré vers le prune |

C'est la même famille que Tarbes et ce n'est pas la même charte : Tarbes allait
du bleu roi au rouge, Limours va d'un bleu plus profond à un magenta. **Les deux
pages doivent se reconnaître sans se confondre.**

## Un seul script pour les deux villes

Le script des réservations est injecté sur **toutes** les pages du site par
l'extension « CSS et JS personnalisés ». Il ne peut donc pas savoir de quelle
ville il s'occupe, et il ne doit surtout pas le deviner.

Chaque page le lui dit, dans son formulaire :

```html
<form id="usn-signup-form" data-usn-evenement="Limours 2027" ...>
```

**Sans cet attribut, la page ne compte rien du tout** — le formulaire continue
de fonctionner comme un simple envoi vers Brevo et le compteur disparaît. C'est
voulu : retomber sur une ville par défaut ferait piocher, sans rien dire, dans
les places d'une autre ville. Une inscription perdue de vue vaut mieux qu'une
place prise à quelqu'un d'autre.

C'est aussi pourquoi le JavaScript de Limours **n'entre pas** dans
`wordpress-javascript-du-site.txt` : il est identique à celui de Tarbes, et
l'y ajouter le ferait tourner deux fois sur chaque page — deux écouteurs par
bouton, et une inscription envoyée en double.

## Ce qui reste à faire

### 1. Dans WordPress

1. Créer la page `evenement/limours/`.
2. Y mettre un bloc **HTML personnalisé** et y coller
   `wordpress-limours/1-HTML-limours.txt`.
3. Coller `wordpress-limours/2-CSS-limours.txt` dans l'onglet **CSS** du bloc.
4. **Ne rien coller dans l'onglet JavaScript** : le script du site, déjà en
   place, sert les deux villes.

### 2. Dans la médiathèque

| Fichier | Rôle |
|---|---|
| `video/teaser-limours.mp4` | le film de fond (78 s, 4,9 Mo, piste audio conservée pour le bouton « Activer le son ») |
| `images/affichelimourslarge.webp` | l'image d'attente du film |
| `images/affichelimours.webp` | l'affiche verticale |

Rien d'autre : la photo de Chriss Campion est déjà en ligne, et les deux
portraits manquants n'existent pas encore.

Les adresses attendues sont celles d'un envoi en **novembre 2026**
(`/wp-content/uploads/2026/11/…`). Si WordPress les range ailleurs, corriger
`URL_2026_11` dans `generer-fichiers-wordpress.py` et régénérer.

### 3. Dans Réservations

Ouvrir une ville nommée **exactement** `Limours 2027` — l'orthographe doit
correspondre au caractère près à l'attribut `data-usn-evenement` et au champ
`VILLE` envoyé à Brevo. Renseigner la capacité, la date du 02/01/2027 et la
clôture au 03/01/2027 pour armer le rappel automatique à J-2.

### 4. Dans Brevo

Créer la liste de Limours et l'automatisation de confirmation, sur le modèle de
Tarbes (voir [`BREVO.md`](./BREVO.md)).

## Ce qui est encore à confirmer

- **Le lieu et l'adresse.** La page affiche « Limours · Département de
  l'Essonne (91) » et le lien Google Maps pointe sur la commune. Dès que la
  salle est connue : le nom, l'adresse et le lien, dans le bloc *Infos
  pratiques*.
- **Les horaires.** La page reprend ceux de Tarbes — portes 15h, début 16h —
  et le compte à rebours est réglé sur `2027-01-02T16:00:00`.
- **Les rôles.** L'affiche donne quatre noms sans dire qui fait quoi. La page
  en retient **trois** : Chriss Campion et Noé Mallet à la prédication, Linoï
  Chabot à la louange. La Chorale de Limours reste sur l'affiche mais ne
  figure pas parmi les intervenants.
- **Les portraits.** Chriss Campion a déjà le sien : la page pointe sur
  `images/tarbes-chriss.webp`, déjà en ligne, parce que c'est le même homme
  — un envoi de moins à faire. Il en manque deux, et leurs cartes affichent
  les initiales en attendant : déposer dans `images/` **`limours-noe.webp`**
  et **`limours-linoi.webp`**.

  > **Qui est qui sur l'affiche.** Vérifié, pas supposé : l'homme de **droite**
  > (veste crème, tablette) est **Chriss Campion** — même visage que sur
  > l'affiche de Tarbes, où il est nommé, et c'est cette identification qui
  > autorise à réutiliser sa photo. La femme au centre est **Linoï Chabot** :
  > la bande-annonce affiche son nom sur ce plan. Reste l'homme de **gauche**
  > (t-shirt brun, barbe poivre et sel), **Noé Mallet**.

## Régénérer

```
python3 generer-fichiers-wordpress.py limours
```
