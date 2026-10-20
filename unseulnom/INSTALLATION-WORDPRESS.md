# Mettre le site en ligne sur WordPress — pas à pas

Trois pages à poser, plus **un seul fichier JavaScript** pour tout le site :

| Ordre | Page | Adresse visée | Fichier à coller |
|---|---|---|---|
| 1 | **Accueil** | `unseulnom.org` | `accueil-a-coller-dans-wordpress.html` |
| 2 | **À venir** (page parente) | `unseulnom.org/evenement/` | `agenda-a-coller-dans-wordpress.html` |
| 3 | **Tarbes** (page fille) | `unseulnom.org/evenement/tarbes/` | `a-coller-dans-wordpress.html` |
| 4 | *(tout le site)* | — | `wordpress-javascript-du-site.txt` |

Compte **une bonne heure** la première fois. Aucune compétence technique
n'est nécessaire : tout se fait par copier-coller.

## Pourquoi le JavaScript est à part

C'est le point à ne pas rater. **WordPress retouche la typographie du
contenu des pages.** Sur du texte c'est utile ; sur du code c'est
destructeur. Collé dans le bloc HTML d'une page, un `&&` du script
ressort en `&#038;&#038;` : le navigateur s'arrête sur une erreur de
syntaxe et **tout le script meurt**, pas seulement la ligne.

Constaté en ligne le 20 octobre 2026 sur la page « À venir » : trois `&&`
sur six abîmés, le carrousel des villes restait vide.

Le même code posé dans l'extension **« CSS et JS personnalisés »** en
sort intact, onze `&&` compris : il ne passe pas par le contenu de la
page. C'est donc là qu'il va, et nulle part ailleurs.

Les trois scripts tiennent dans **un seul fichier**, à coller une fois
pour toutes. Chacun commence par une garde : s'il ne trouve pas la page
qu'il sert, il s'arrête aussitôt et ne touche à rien. Le fichier peut
donc être injecté sur tout le site sans risque.

---

## Étape 0 — Envoyer les 14 fichiers dans la médiathèque

**À faire en premier, et en une seule fois.** Tant que les fichiers ne sont
pas en ligne, les pages s'afficheront avec des images manquantes.

### Pourquoi en une seule fois

WordPress range ce qu'il reçoit dans le **dossier du mois de l'envoi** :
un fichier envoyé en octobre 2026 atterrit dans `/uploads/2026/10/`, le même
envoyé en novembre dans `/uploads/2026/11/`. Le code pointe sur **2026/10**.

> **Les 14 fichiers doivent donc partir avant la fin octobre 2026.**
> Si tu t'y prends plus tard, ce n'est pas grave — dis-le moi, je change
> une ligne et je régénère. Mais ne les étale pas sur deux mois.

### Comment faire

**Médias → Ajouter un fichier média**, puis dépose les 14 fichiers d'un coup.

Ils sont dans le dépôt, dossiers `unseulnom/images/` et `unseulnom/video/` :

| Fichier | Poids | Ce que c'est |
|---|---|---|
| `cartefrance.mp4` | 2,8 Mo | le film de la carte, en tête de « À venir » |
| `carteposter.webp` | 80 ko | son image d'attente |
| `teaserv4.mp4` | 9,6 Mo | la bande-annonce, en ouverture de l'accueil |
| `teaserposter.webp` | 20 ko | son image d'attente |
| `affichetarbes.webp` | 120 ko | affiche de Tarbes (format portrait) |
| `affichetarbeslarge.webp` | 136 ko | affiche de Tarbes (format large, page Tarbes) |
| `affichemadagascar.webp` | 108 ko | affiche de Madagascar |
| `affichepau.webp` | 96 ko | affiche de Pau |
| `afficheformation.webp` | 56 ko | affiche de la journée de formation |
| `afficheavignon.webp` | 84 ko | affiche d'Avignon |
| `jack.webp` | 44 ko | portrait Jack Brunet |
| `chrisstarbes.webp` | 44 ko | portrait Chriss Campion |
| `briman.webp` | 32 ko | portrait Briman Heugebaert |
| `juan.webp` | 28 ko | portrait Juan Anthonio |

### Vérifier tout de suite

Clique sur `cartefrance.mp4` dans la médiathèque et regarde le champ
**« URL du fichier »**. Tu dois lire **exactement** :

```
https://unseulnom.org/wp-content/uploads/2026/10/cartefrance.mp4
```

Deux pièges, tous les deux déjà rencontrés sur ce site :

- **WordPress renomme parfois.** Un fichier déjà présent sous le même nom
  devient `cartefrance-1.mp4`. Les tirets peuvent aussi sauter : `teaser-web.mp4`
  était devenu `teaserweb.mp4`.
- **Le mois peut être différent** si l'envoi tombe après le 31 octobre.

Dans les deux cas, l'adresse ne correspond plus au code. Envoie-moi une
capture du champ « URL du fichier » : je corrige et je régénère.

> **Si la vidéo est refusée à l'envoi**, c'est la taille maximale autorisée
> par l'hébergeur qui bloque (souvent 2 Mo par défaut). Le réglage est chez
> l'hébergeur, rubrique PHP, `upload_max_filesize`. Dis-le moi, je peux aussi
> réduire encore le fichier.

---

## Étape 1 — Créer la page « À venir »

C'est la **page parente** : celle qui liste toutes les dates. Les pages de
ville viendront se ranger dessous.

1. **Pages → Ajouter une page**
2. Titre : **`Événement`**
3. À droite, dans **Permalien**, l'identifiant doit être **`evenement`**.
   L'adresse finale doit donc être `unseulnom.org/evenement/`.
   Si ce permalien est déjà pris par une ancienne page, supprime l'ancienne
   d'abord — ou dis-le moi, j'adapte le code à une autre adresse.
4. Dans le corps de la page : clique sur **+**, tape `html`,
   choisis **HTML personnalisé**
5. Ouvre `agenda-a-coller-dans-wordpress.html` dans le Bloc-notes
   (Windows) ou TextEdit (Mac), **tout sélectionner** (`Ctrl+A` / `Cmd+A`),
   **copier** (`Ctrl+C` / `Cmd+C`), puis **coller** dans le bloc
6. À droite, choisis un modèle de page **pleine largeur** si ton thème en
   propose un (« Full width », « Pleine largeur », « Sans barre latérale »)
7. **Prévisualiser**, puis **Publier**

---

## Étape 2 — Créer la page « Tarbes »

C'est la **page fille**. Après Tarbes, chaque nouvelle ville se créera de
la même façon.

1. **Pages → Ajouter une page**
2. Titre : **`Tarbes`**
3. À droite, section **Attributs de page → Parent** : choisis **Événement**.
   L'adresse devient alors `unseulnom.org/evenement/tarbes/`.
   Vérifie-la dans **Permalien** avant de publier.
4. Bloc **HTML personnalisé**, et colle `a-coller-dans-wordpress.html`
5. Modèle **pleine largeur**, **Prévisualiser**, **Publier**

---

## Étape 2 bis — Poser le JavaScript, une fois pour tout le site

1. Menu de gauche : **CSS et JS personnalisés**
2. Onglet **JavaScript**
3. Efface ce qui s'y trouve et colle `wordpress-javascript-du-site.txt`
4. Onglet **CSS** : efface ce qui s'y trouve. Les styles voyagent
   désormais avec chaque page, cette case n'a plus à rien contenir.
5. Onglet **HTML** : laisse-le vide. Ce qui y serait s'afficherait sur
   **toutes** les pages du site.
6. **Mettre à jour**

À refaire à chaque fois que je te renvoie une version du site : le
fichier est régénéré avec le reste.

---

## Étape 3 — Mettre à jour l'accueil

1. **Pages → Accueil** (ou la page réglée comme page d'accueil dans
   **Réglages → Lecture**)
2. Remplace le contenu du bloc **HTML personnalisé** par
   `accueil-a-coller-dans-wordpress.html`

   Si la page contient encore l'ancienne version : sélectionne tout le
   contenu du bloc et écrase-le. Ne crée pas un second bloc, les deux
   styles se marcheraient dessus.
3. **Prévisualiser**, puis **Mettre à jour**

---

## Étape 4 — Vérifier

Sur chaque page publiée, et **aussi sur ton téléphone** :

**Accueil**
- [ ] la bande-annonce démarre toute seule, en boucle, sans le son
- [ ] le bouton « Activer le son » rend bien le son
- [ ] la carte de Tarbes et le compte à rebours s'affichent
- [ ] les affiches de la frise défilent quand on descend
- [ ] « Prochain événement » mène bien à **/evenement/tarbes/**

**À venir**
- [ ] le film de la carte tourne en boucle
- [ ] le bouton « Activer le son » rend la musique
- [ ] les six villes défilent toutes seules, Tarbes restant la plus longue
- [ ] les flèches et les barres changent de ville
- [ ] les boutons « Réserver » mènent à **/evenement/tarbes/**
- [ ] le formulaire « Et votre ville, c'est pour quand ? » : fais un essai
      avec ta propre adresse, vérifie qu'elle arrive dans Brevo, **puis
      supprime-la**

**Tarbes**
- [ ] les quatre portraits s'affichent
- [ ] le compte à rebours descend vers le 12 décembre
- [ ] « Toutes les dates » en pied de page mène à **/evenement/**

---

## Ajouter une ville plus tard

1. Je duplique la page Tarbes dans le dépôt, avec les couleurs de la
   nouvelle affiche, les bons visages et la bonne date.
2. Dans WordPress : nouvelle page, **parent = Événement**, bloc HTML,
   coller.
3. Je change **une seule ligne** dans le générateur
   (`URL_VILLE = "https://unseulnom.org/evenement/marseille/"`) et je
   régénère : tous les boutons « Réserver » des trois pages suivent.
4. Tu recolles les trois pages.

---

## Problèmes courants

**Les images ne s'affichent pas**
L'adresse réelle d'un fichier ne correspond pas à celle du code (étape 0).
Ouvre l'adresse d'une image dans ton navigateur : si elle ne s'affiche pas,
c'est bien le chemin qui est en cause.

**La vidéo ne démarre pas**
Regarde d'abord si l'image d'attente, elle, s'affiche. Si oui, le `.mp4`
n'est pas en ligne ou son nom a changé. Si non, les deux fichiers manquent.

**La page est étroite, enfermée dans une colonne**
Le modèle de page n'est pas en pleine largeur (étape 1, point 6).

**Le style déborde sur le reste du site**
Ça ne devrait pas arriver : chaque page a son style enfermé sous son propre
identifiant (`#usn-accueil`, `#usn-agenda`, `#usn-event`), les trois ne
peuvent pas se mélanger. Si quelque chose cloche, c'est plutôt l'inverse —
le thème qui impose son style aux pages. Dis-le moi, j'ajuste.

**Le formulaire ne renvoie rien dans Brevo**
Vérifie dans Brevo que la liste liée au formulaire est la bonne. Les
formulaires envoient deux champs : `NOM` et `EMAIL`.

**Le compte à rebours affiche zéro**
La date visée est passée. Elle se règle dans l'attribut `data-target`
(`2026-12-12T16:00:00`), mais préviens-moi plutôt : il y a aussi les textes,
les visages et l'affiche à changer en même temps.

---

**Le carrousel des villes reste vide, rien ne s'anime**
Le JavaScript n'est pas en place, ou il a été collé dans la page au lieu
de l'extension. Reprends l'étape 2 bis.

---

## Et les fichiers en trois morceaux ?

Les dossiers `wordpress-accueil/`, `wordpress-agenda/` et
`wordpress-3-parties/` contiennent la même chose, découpée :

- `1-HTML.txt` — le contenu seul
- `2-CSS.txt` — le style seul
- `3-JAVASCRIPT.txt` — les animations d'une seule page

Ils ne servent que si tu dois traiter une page séparément des autres.
**Dans le cas normal, ignore-les** : le fichier
`...-a-coller-dans-wordpress.html` porte le contenu et le style d'une
page, et `wordpress-javascript-du-site.txt` porte le code des trois.
