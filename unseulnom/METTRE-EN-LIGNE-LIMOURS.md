# Mettre Limours en ligne — pas à pas

Sept étapes, une vérification après chacune. **Ne passe à la suivante que
si la vérification passe.**

> ## D'abord : ce qu'il y a sur ton écran en ce moment
>
> La page de Limours affiche **360 places restantes**. Ce nombre n'est
> pas celui de Limours : **c'est celui de Tarbes.**
>
> Voilà pourquoi. Le module cherche la ville que la page lui demande ;
> s'il ne la trouve pas, il sert l'événement du moment — c'est-à-dire
> Tarbes. Il le fait **sans rien dire**, dans la page comme dans
> l'administration. Donc, tant que « Limours 2027 » n'existe pas dans
> Réservations, **chaque réservation prise sur la page de Limours
> retire une place à Tarbes.** On ne s'en aperçoit que le jour de
> l'événement, en comptant les chaises.
>
> C'est corrigé des deux côtés, et c'est l'objet des étapes 1 et 2 :
>
> - **Le module (1.5.3)** ne remplace plus une ville nommée et
>   introuvable. Il répond : elle n'existe pas.
> - **La page** compare le nom que le serveur lui renvoie à celui
>   qu'elle a demandé. Au moindre écart, elle n'affiche pas de compteur
>   et son formulaire redevient un simple envoi vers Brevo.
>
> Le repli existe toujours, mais **seulement pour les pages qui ne
> nomment aucune ville** — les anciennes. Une page qui nomme sa ville
> est désormais servie, ou rien.

---

## Étape 1 — Le module, version 1.5.3

**Extensions → Ajouter → Téléverser une extension** → `un-seul-nom-reservations.zip`
→ **Installer maintenant** → **Remplacer par l'actuelle**.

Rien n'est perdu : les inscrits, les villes et les compteurs sont en
base de données, pas dans le fichier.

**Vérification.** Dans **Extensions**, sous « Un Seul Nom - Reservations »,
tu dois lire **Version 1.5.3**.

---

## Étape 2 — La page de Tarbes, puis le JavaScript

**Dans cet ordre, et c'est la seule étape où l'ordre compte.**

Le nouveau script lit le nom de la ville **dans la page**. Tant que la
page de Tarbes ne le porte pas, elle ne compterait plus rien.

1. **Pages → Tarbes → modifier.** Remplace le contenu du bloc « HTML
   personnalisé » par `tarbes-a-coller-dans-wordpress.html`. **Mettre à
   jour.**
2. **CSS et JS personnalisés → onglet JavaScript.** Efface tout, colle
   `wordpress-javascript-du-site.txt`. **Mettre à jour.**

Entre les deux, rien ne casse : l'ancien script ignore simplement le
nouvel attribut.

**Vérification.** Ouvre la page de Tarbes. Le compteur de places doit
s'afficher comme avant, avec le même nombre.

---

## Étape 3 — Ouvrir la ville dans Réservations

**C'est l'étape qui débloque tout le reste.**

**Réservations → ouvrir une nouvelle ville.** Le nom doit être
**exactement** :

```
Limours 2027
```

Au caractère près : une majuscule, un espace, quatre chiffres. C'est ce
nom qui est écrit dans la page et dans ce qui part vers Brevo ; s'ils
diffèrent d'un seul caractère, le compteur ne s'affichera pas.

Puis renseigne :

| Champ | Valeur |
|---|---|
| Capacité | le nombre de places que tu ouvres |
| Date de l'événement | `02/01/2027` |
| Clôture des inscriptions | `03/01/2027` |

La date de clôture n'est pas décorative : c'est elle qui **arme le
rappel automatique à J-2** et qui ferme les inscriptions toute seule.

**Vérification.** Ouvrir **Réservations** et lire « Limours 2027 » dans
la liste des villes, avec son compteur à **0**. Tarbes doit être
toujours là, avec **son** compteur inchangé.

---

## Étape 4 — Créer la page

**Pages → Ajouter une page**

1. Titre : **`Limours`**
2. À droite, **Attributs de page → Parent** : choisis **Événement**.

   **C'est ce qui donne son adresse à la page.** Sans parent, elle naît
   sur `unseulnom.org/limours/` et tous les liens du site, qui pointent
   sur `evenement/limours/`, répondront **404**.
3. Vérifie dans **Permalien** que tu lis bien
   `unseulnom.org/evenement/limours/` **avant** de publier.
4. Bloc **HTML personnalisé** → colle `limours-a-coller-dans-wordpress.html`
5. Modèle **pleine largeur** → **Publier**

**Vérification, et c'est la plus importante du document.**

Ouvre les deux pages côte à côte :

- `unseulnom.org/evenement/tarbes/`
- `unseulnom.org/evenement/limours/`

Descends jusqu'à « Réserve ta place » sur chacune.

> **Les deux nombres doivent être différents.** Limours vient d'ouvrir :
> son compteur affiche sa capacité pleine. Tarbes affiche le sien,
> entamé.
>
> **S'ils sont identiques, arrête-toi.** Les deux pages parlent de la
> même ville. Reprends l'étape 2 : le JavaScript n'a pas été remplacé.
>
> **Si Limours n'affiche aucun compteur**, le nom ne correspond pas.
> Reprends l'étape 3 et compare lettre à lettre.

---

## Étape 5 — La médiathèque

**Médias → Ajouter**, les trois fichiers d'un coup :

| Fichier | Ce que c'est |
|---|---|
| `teaser-limours.mp4` | le film de fond (4,9 Mo) |
| `affichelimourslarge.webp` | son image d'attente |
| `affichelimours.webp` | l'affiche verticale |

**Vérification.** Clique sur `affichelimours.webp` et lis le champ
« URL du fichier ». Tu dois y voir **`/uploads/2026/11/`**. Si c'est un
autre mois, ou si WordPress a renommé le fichier, **dis-le-moi** : je
change une ligne et je régénère.

La photo de Chriss Campion n'est pas dans la liste : la page pointe sur
celle de Tarbes, déjà en ligne. C'est le même homme.

---

## Étape 6 — Les trois autres pages

Elles ne dépendent de rien, et peuvent se faire dans n'importe quel
ordre.

| Page | Fichier |
|---|---|
| Événement | `evenement-a-coller-dans-wordpress.html` |
| Accueil | `accueil-a-coller-dans-wordpress.html` |
| Actualités | `actualites-a-coller-dans-wordpress.html` |

**Vérification.** Sur la page « événement », Limours apparaît deux fois :
dans le carrousel du haut **et** dans le calendrier plus bas. Les deux
doivent porter son affiche, ses trois intervenants et le bouton
**Réserver**. Et Madagascar ne doit plus y figurer nulle part.

---

## Étape 7 — Le menu du site

La barre du haut (ÉVÉNEMENT · À PROPOS) est un menu WordPress, pas du
code : **Apparence → Menus**, ajoute la page Limours et glisse-la sous
« Événement ».

À faire **après** l'étape 4 : tant que la page n'existe pas, elle
n'apparaît pas dans la liste des pages disponibles.

---

## Le test qui prouve que rien ne se mélange

À faire une fois, avec une vraie adresse à toi.

1. Sur la page de **Limours**, note le nombre de places restantes.
2. Ouvre la page de **Tarbes** dans un autre onglet, note le sien.
3. Réserve **1 place** sur Limours, avec `ton.adresse+limours@gmail.com`.
4. Recharge les deux pages.

> **Limours doit avoir perdu une place. Tarbes ne doit pas avoir
> bougé.** Si Tarbes a baissé aussi, le JavaScript de l'étape 2 n'est
> pas en place — reprends-la et refais ce test.

Puis dans **Réservations**, la ligne doit apparaître **sous Limours
2027**, et pas ailleurs. Et dans Brevo, le contact doit porter
`VILLE = Limours 2027`.

Supprime ensuite cette réservation de test depuis Réservations, pour ne
pas fausser le compte.

---

## Si quelque chose cloche

Deux adresses à ouvrir directement dans la barre du navigateur. Elles
répondent en texte brut et disent la vérité, sans passer par la page :

```
unseulnom.org/wp-json/usn/v1/places?v=Tarbes%202026
unseulnom.org/wp-json/usn/v1/places?v=Limours%202027
```

Chacune renvoie une ligne qui contient `"evenement":"…"`.

- Si `places?v=Limours%202027` répond `"evenement":"Tarbes 2026"`, le
  module n'est pas en 1.5.3 — reprends l'étape 1.
- Si elle répond `"evenement":"Edition precedente"` avec une capacité à
  zéro, la ville n'est pas ouverte — reprends l'étape 3.
- Si elle répond `"evenement":"Limours 2027"` avec la bonne capacité,
  **le serveur est bon** : ce qui reste est côté page, donc l'étape 2.
