# Créer la page « Actualités » — pas à pas

Une page neuve, codée comme les trois autres. L'ancienne page
« Newsletter » faite avec Elementor n'est pas modifiée : on la retire à
la fin, une fois la nouvelle en ligne et vérifiée.

> **Le formulaire part toujours dans Brevo.** C'est la même adresse
> d'envoi que le bloc d'inscription de la page d'accueil, celle qui
> fonctionne déjà. Rien à reconfigurer, et Fluent Forms n'est plus dans
> la boucle.

---

## Étape 1 — Créer la page

1. **Pages → Ajouter**
2. Titre : `Actualités`
3. À droite, dans **Permalien**, mettre l'identifiant : `actualites`
   (sans accent, c'est volontaire : une adresse ne prend pas d'accent)
4. Publier

L'adresse doit être exactement **`unseulnom.org/actualites/`**. C'est
celle que j'ai écrite dans le menu et les pieds de page des trois autres
pages ; si tu en choisis une autre, dis-le moi, je change les liens.

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

Ouvre `unseulnom.org/actualites/` et contrôle :

- [ ] Pas de barre orange en haut, pas de pied de page en double
- [ ] « RESTONS **en lien** » — *en lien* va de l'orange au magenta
- [ ] Le bandeau coloré défile tout seul
- [ ] Le bouton menu (les deux traits) ouvre le panneau et le referme
- [ ] Le formulaire : mets ton nom et ton adresse, envoie
- [ ] Le message « Merci ! » apparaît et la page ne bouge pas
- [ ] Ton adresse est bien arrivée dans **Brevo**

## Étape 6 — Le menu du site

**Apparence → Menus** :

1. Supprimer l'entrée **Newsletter**
2. Ajouter la page **Actualités**
3. Enregistrer

## Étape 7 — Retirer l'ancienne page

**Seulement une fois que l'étape 5 est entièrement cochée.**

**Pages** → `Newsletter` → **Mettre à la corbeille**.

> **Ce que ça change sur Google.** L'ancienne adresse
> `unseulnom.org/newsletter/` disparaîtra du moteur en quelques
> semaines, et `actualites` prendra sa place. Si tu préfères garder
> l'ancienne adresse vivante, dis-le moi : on met l'identifiant
> `newsletter` sur la nouvelle page à la place, et je change les liens
> dans les trois autres pages. C'est le seul point à décider.
