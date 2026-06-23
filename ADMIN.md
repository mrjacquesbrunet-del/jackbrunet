# ✍️ Modifier le site sans coder

Ton site a un **espace d'administration visuel** (formulaires) grâce à
**Pages CMS** — gratuit, rien à installer.

## Connexion (une seule fois)

1. Va sur **https://app.pagescms.org**
2. Clique **« Sign in with GitHub »** et connecte ton compte GitHub
3. Autorise l'accès, puis choisis le dépôt **`mrjacquesbrunet-del/jackbrunet`**
4. Sélectionne la branche **`claude/great-hamilton-ieokug`** (la branche du site en ligne)

C'est tout : tu vois ensuite des rubriques avec des formulaires.

## Ce que tu peux modifier

| Rubrique | Contenu |
|---|---|
| **Paramètres du site** | Nom, description, email, réseaux sociaux, liens YouTube, **IDs des Shorts** |
| **Pensées du jour** | Les pensées affichées chaque matin (rotation automatique) |
| **Versets du jour** | Les versets bibliques |
| **Plan de lecture** | Les jours, thèmes, passages |
| **Témoignages** | Les témoignages affichés |
| **Boutique** | Titres, prix, badges des produits |
| **Niveaux de soutien** | Montants et avantages des dons |
| **Impact & transparence** | Statistiques et répartition des dons |

## Comment ça marche

1. Tu modifies un texte dans un champ → tu cliques **« Save »**
2. Pages CMS enregistre dans GitHub
3. Le site se **reconstruit et se met à jour tout seul** en 1–2 minutes ⏳

## Ajouter tes Shorts YouTube

Dans **Paramètres du site → YouTube → IDs des Shorts**, ajoute l'identifiant de
chaque Short : c'est la partie après `/shorts/` dans l'URL.
Exemple : pour `https://www.youtube.com/shorts/AbC123dEf45`, l'ID est `AbC123dEf45`.
Dès qu'il y en a, les Shorts s'affichent en lecture directe sur le site.

## Astuce

Évite de modifier les fichiers se terminant par `.ts` / `.tsx` (ce sont des
fichiers de code). Tout ce qui est éditable en toute sécurité est dans les
formulaires ci-dessus (dossier `content/`).
