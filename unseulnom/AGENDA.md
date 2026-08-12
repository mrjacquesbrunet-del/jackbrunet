# Page « À venir » — les dates Un Seul Nom

Deuxième page, dans la même charte et avec les mêmes modules que la page
événement : héros plein écran, compte à rebours, panneaux qui glissent depuis
la gauche, punchline qui se rassemble au scroll, cartes d'action à cheval,
formulaire Brevo.

- Fichier de travail : [`agenda.html`](./agenda.html)
- Style « scopé » sous `#usn-agenda` — les deux pages peuvent donc cohabiter
  sur le site sans se marcher dessus.

## Ce que contient la page

1. **Héros** — logo, grand titre « À venir », et le **compte à rebours réglé
   sur la prochaine date** (Avignon).
2. **Pill de date** rappelant la prochaine échéance.
3. **Les dates** — un panneau par événement, qui glisse depuis la gauche,
   bleu et rouge en alternance, avec la photo, la salle, les intervenants et
   un bouton. Une pastille indique si les inscriptions sont ouvertes.
4. **Punchline animée** — « Ville après ville, l'Église se lève sous un seul
   nom. »
5. **Deux cartes d'action** — « Invitez-nous » (pour les pasteurs qui veulent
   accueillir l'événement) et « Soutiens la mission » (HelloAsso).
6. **Sois prévenu** — formulaire Brevo, sans compteur de places : cette page
   annonce, elle ne réserve pas. Les réservations restent sur la page de
   chaque événement.
7. **Déjà vécu** — les affiches des éditions passées, en noir et blanc, qui
   **reprennent leurs couleurs** en passant au centre de l'écran.

## Ajouter une date

Dans `agenda.html`, cherchez `EXEMPLE À DUPLIQUER` : un panneau complet vous
attend en commentaire. Retirez les balises de commentaire autour, changez les
textes, et régénérez.

Pour une date dont les inscriptions ne sont pas encore ouvertes :

```html
<span class="usn-badge usn-bientot">Bientôt</span>
...
<span class="usn-attente">Inscriptions bientôt</span>
```

**Pensez au compte à rebours** : `data-target` dans le héros doit toujours
viser la **prochaine** date (format `2026-10-17T16:00:00`).

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
