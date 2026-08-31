# Page d'accueil

Troisième page du site, dans la charte d'Un Seul Nom mais avec une direction
éditoriale inspirée de **landonorris.com** : fond ivoire, titres énormes en
capitales serrées, bandeaux défilants, déclaration dont les mots-clés passent
en couleur, galerie légendée « Ville, année ».

- Fichier de travail : [`accueil.html`](./accueil.html)
- Style « scopé » sous `#usn-accueil` — les trois pages cohabitent sans se
  marcher dessus.

## Ce que la page doit faire

Un visiteur qui arrive doit, **en quelques secondes** :

1. voir de quoi il s'agit — le nom, en très grand, sur la vidéo du teaser ;
2. savoir où est le prochain rendez-vous — Avignon, en lien direct dès le
   héros et repris en grand plus bas ;
3. comprendre le mouvement — une déclaration de trois lignes, puis trois
   mots : **Unir**, **Évangéliser**, **Former**.

Tout le reste (histoire, fondateurs, églises partenaires, newsletter) vient
après.

## Le fond ivoire

`#F0EEE7`, et non du blanc. C'est ce qui donne à la page son aspect de papier
d'affiche et ce qui réchauffe le bleu-blanc-rouge : sur du blanc pur, les
mêmes couleurs paraissent plus froides et plus administratives.

## Ce qui remplace le bandeau du thème

La page a **sa propre barre de navigation**, collante, avec le logo, les
sections, le don et surtout un bouton **« Je m'inscris »** qui pointe
directement sur la page de l'événement. C'est le chemin qui manquait : le
bandeau du thème n'en offrait aucun.

Pour que cette barre remplace celle du thème plutôt que de s'y ajouter, il
faut masquer l'en-tête du thème sur cette page (même méthode que sur la page
événement).

## À mettre à jour à chaque événement

| Quoi | Où |
|---|---|
| Ville, date, lieu | bloc `usn-rdv`, et le lien du héros |
| Compte à rebours | `data-target` du bloc `usn-rdv`, format `2026-10-17T16:00:00` |
| Bandeau défilant du bas | la liste des villes y figure **deux fois** — modifiez les deux, sinon le ruban saccade |
| Chiffres | bloc `usn-chiffres` |
| Galerie | un bloc `<figure class="usn-vue">` par ville |

## Images et vidéo

Rien à envoyer : la page pointe sur des fichiers déjà présents dans la
médiathèque — les quatre affiches d'éditions passées (taille 768 px générée
par WordPress) et le teaser. Le logo est vectoriel, embarqué dans le CSS.

## Régénérer les fichiers WordPress

```
python3 generer-fichiers-wordpress.py accueil
```

Produit `wordpress-accueil/1-HTML.txt`, `2-CSS.txt` et `3-JAVASCRIPT.txt`,
à coller dans les trois onglets comme pour les deux autres pages.
