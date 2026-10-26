# Créer la page « Actualités » — pas à pas

Une page neuve, codée comme les trois autres. Elle prendra **l'adresse
de l'ancienne page Newsletter** : `unseulnom.org/newsletter/`.

C'est le choix le plus simple, et c'est aussi le meilleur pour Google.
Pas d'extension à installer, pas de redirection à entretenir : il n'y a
qu'une adresse, et c'est celle que Google connaît déjà. Seul le nom
affiché dans le menu change, et il devient « Actualités ».

> **Le formulaire part toujours dans Brevo.** C'est la même adresse
> d'envoi que le bloc d'inscription de la page d'accueil et que la
> réservation de Tarbes — les trois visent la même liste. Rien à
> reconfigurer, et Fluent Forms n'est plus dans la boucle.

---

## Étape 1 — Créer la page

1. **Pages → Ajouter**
2. Titre : `Actualités`
3. Publier

Ne t'occupe pas encore du permalien : l'adresse `newsletter` n'est pas
libre tant que l'ancienne page existe. On s'en occupe à l'étape 6.

## Étape 2 — Vider la page de son modèle

Si WordPress a posé un modèle Elementor sur la page neuve :

1. Ouvrir la page
2. En haut à droite, les trois points verticaux → **Options du modèle**
3. Choisir **Pleine largeur** (ou **Elementor pleine largeur**)

La page doit être vide, sans barre orange ni colonne.

## Étape 3 — Coller les deux onglets

1. Dans la page, cliquer **+** → chercher **HTML personnalisé**
2. Coller `1-HTML-actualites.txt` dans l'onglet **HTML**
3. Coller `2-CSS-actualites.txt` dans l'onglet **CSS**
4. **Mettre à jour**

> ⚠ **Un onglet, un fichier.** Le HTML dans HTML, le CSS dans CSS.
> C'est l'erreur qui nous a coûté le plus de temps sur les autres pages.

## Étape 4 — Ajouter le JavaScript

Le JavaScript ne va **pas** dans la page : WordPress remplace les
`&` par `&#038;` et casse le code. Il va dans **Apparence → CSS et JS
personnalisés**, dans le fichier commun à tout le site.

1. Ouvrir le JavaScript du site
2. Coller `3-JAVASCRIPT-actualites.txt` **à la suite** de ce qui s'y
   trouve déjà, sans rien effacer
3. Enregistrer

> Si tu préfères, `wordpress-javascript-du-site.txt` contient le
> JavaScript des **quatre** pages d'un seul tenant : tu remplaces tout
> le contenu par ce fichier et c'est réglé.

## Étape 5 — Vérifier

Ouvre la page (son adresse provisoire, du genre
`unseulnom.org/actualites/`) et contrôle :

- [ ] Pas de barre orange en haut, pas de pied de page en double
- [ ] « RESTONS **connectés** » — *connectés* va de l'orange au magenta,
      accent compris
- [ ] Le bandeau coloré défile tout seul
- [ ] Le bouton menu (les deux traits) ouvre le panneau et le referme
- [ ] Le formulaire : mets ton nom et ton adresse, envoie
- [ ] Le message « Merci ! » apparaît et la page ne bouge pas
- [ ] Ton adresse est bien arrivée dans **Brevo**

**Ne passe à l'étape 6 que si tout est coché.** Tant que l'ancienne page
existe, rien n'est perdu.

## Étape 6 — Donner l'adresse newsletter à la nouvelle page

C'est l'étape qui relie les deux. Dans cet ordre, sans en sauter :

1. **Pages** → survoler `Newsletter` → **Corbeille**
2. En haut de la liste des pages, cliquer **Corbeille** → **Vider la
   corbeille**

   > Cette seconde étape n'est pas facultative : tant que l'ancienne
   > page est dans la corbeille, WordPress lui garde son adresse et
   > refusera de la donner à la nouvelle. Il écrirait `newsletter-2`.

3. **Pages** → ouvrir `Actualités`
4. À droite, dans **Permalien**, remplacer l'identifiant par :
   `newsletter`
5. **Mettre à jour**

Ouvre `unseulnom.org/newsletter/` : c'est la nouvelle page qui doit
s'afficher.

## Étape 7 — Le menu du site

**Apparence → Menus** :

1. L'entrée **Newsletter** pointe maintenant dans le vide : la
   supprimer
2. Ajouter la page **Actualités**
3. Enregistrer

Le menu affichera « Actualités », l'adresse restera
`unseulnom.org/newsletter/`. C'est normal, et c'est voulu.

---

## Si quelque chose se passe mal

**L'adresse devient `newsletter-2`.** La corbeille n'a pas été vidée.
Vide-la (**Pages → Corbeille → Vider la corbeille**), puis remets
l'identifiant `newsletter` sur la page Actualités.

**La page s'affiche sans aucun style.** Le CSS n'est pas arrivé dans son
onglet. Rouvre le bloc, onglet **CSS**, recolle
`2-CSS-actualites.txt` en entier — il fait plus de 50 000 caractères,
vérifie que tout est passé.

**Le menu ne s'ouvre pas, rien ne bouge.** Le JavaScript n'est pas en
place. Reprends l'étape 4.
