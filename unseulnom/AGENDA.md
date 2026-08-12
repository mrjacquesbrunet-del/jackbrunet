# Page « À venir » — les dates Un Seul Nom

Deuxième page, dans la **même charte** que la page événement — mêmes
couleurs, mêmes polices, même logo, même moteur d'animation — mais avec une
**mise en page qui lui est propre**. Le sujet n'est pas un événement mais une
liste : la page est donc claire, et l'agenda tient la vedette.

- Fichier de travail : [`agenda.html`](./agenda.html)
- Style « scopé » sous `#usn-agenda` — les deux pages peuvent donc cohabiter
  sur le site sans se marcher dessus.

## Ce qui change par rapport à la page événement

| | Page événement | Page à venir |
|---|---|---|
| En-tête | plein écran, titre centré, compte à rebours géant | bande cinématique, titre calé en bas à gauche |
| Compte à rebours | quatre grands cadrans | une ligne, dans un bandeau sombre |
| Le contenu | panneaux bleu/rouge avec photo | agenda typographique groupé par année |
| Punchline | mots dispersés qui se rassemblent | bande bleue, lignes qui montent |
| Actions | deux cartes à cheval sur la bande | une seule bande bleue |
| Formulaire | grande section centrée + compteur de places | deux champs sur une ligne, sans compteur |

## Ce que contient la page

1. **Filet tricolore** et barre de navigation en verre dépoli, sombre sur clair.
2. **En-tête cinématique** — une photo (ou une vidéo) en plein cadre, deux
   voiles superposés pour la lisibilité, et le titre « À venir » calé en bas
   à gauche. La bande fait environ trois quarts d'écran, pas la totalité :
   l'agenda reste visible sans avoir à défiler.
3. **Bandeau défilant** bleu avec les villes et leurs dates, en boucle.
4. **Prochaine date** — bande sombre compacte : le compte à rebours tient sur
   une ligne, avec le bouton de réservation.
5. **L'agenda** — une ligne par date, groupée par année : le jour à gauche, la
   ville en très grand, les détails dessous, l'état des inscriptions à droite.
   Les lignes arrivent par la gauche au scroll.
6. **Bande bleue** — « La prochaine ville sera peut-être la vôtre », l'appel
   aux pasteurs et responsables.
7. **Déjà vécu** — les affiches des éditions passées défilent
   horizontalement et **reprennent leurs couleurs** en passant au centre de
   l'écran.
8. **Soyez prévenu** — formulaire Brevo compact. Cette page annonce, elle ne
   réserve pas : les réservations restent sur la page de chaque événement.

## Ajouter une date

Dans `agenda.html`, copiez une ligne `<div class="usn-ligne">` entière et
changez les textes. Pour une nouvelle année, ajoutez un séparateur
`<div class="usn-an"><b>2028</b></div>`.

Quand les inscriptions ouvrent, remplacez :

```html
<span class="usn-pastille usn-attente">Bientôt</span>
```

par la pastille active, suivie du lien :

```html
<span class="usn-pastille">Inscriptions ouvertes</span>
<a class="usn-reserver" href="…">Réserver <span aria-hidden="true">→</span></a>
```

**Deux choses à ne pas oublier :**

- Le **compte à rebours** : `data-target` doit toujours viser la **prochaine**
  date (format `2026-10-17T16:00:00`).
- Le **bandeau défilant** : la liste des villes y figure **deux fois**, pour
  que la boucle se referme sans saut. Ajoutez la nouvelle ville dans les deux
  listes, sinon le ruban saccade.

## Mettre une vidéo à la place de la photo

Dans `agenda.html`, cherchez `L'IMAGE DE FOND`. Il y a une balise `<video>`
avec une image `poster`. Pour passer à la vidéo, ajoutez une ligne :

```html
<source src="ADRESSE_DE_VOTRE_VIDEO.mp4" type="video/mp4" />
```

La photo reste affichée le temps du chargement et sur les téléphones en
économie de données. Format conseillé : `.mp4` muet, 10 à 15 secondes,
moins de 15 Mo.

Pour changer seulement la photo, remplacez l'adresse du `poster`.

## Régénérer les fichiers WordPress

```
python3 generer-fichiers-wordpress.py agenda
```

Produit `wordpress-agenda/1-HTML.txt`, `2-CSS.txt` et `3-JAVASCRIPT.txt`,
à coller dans les trois onglets comme pour la page événement.

Sans argument, le script régénère **les deux pages**.

## Images

Les affiches des éditions passées **sont déjà dans la médiathèque** : la page
pointe sur `conference-Un-seul-nom-1/3/4/5`, dans leur version 768 px générée
par WordPress (environ quatre fois plus légère que l'originale). **Il n'y a
donc aucun fichier à envoyer** pour cette page.

Les fichiers `images/edition-*.webp` du dépôt sont les mêmes affiches
recadrées, gardées pour travailler hors ligne.

## Attention : le style est dupliqué

`agenda.html` embarque **sa propre copie** du style et du moteur d'animation,
avec la portée `#usn-agenda`. C'est ce qui permet de coller les deux pages
indépendamment dans WordPress, mais cela veut dire qu'une modification de la
charte (couleurs, typographies, animations) faite sur `index.html` doit être
reportée ici — et inversement.
