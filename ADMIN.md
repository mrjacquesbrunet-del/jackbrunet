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

Deux possibilités :

### A) À la main (rubrique « Shorts »)
Dans l'admin → **Shorts (vidéos courtes)** → ajoute une entrée :
- **ID YouTube** : la partie après `/shorts/` dans l'URL.
  Ex. `https://www.youtube.com/shorts/AbC123dEf45` → ID = `AbC123dEf45`
- **Titre** : ce qui s'affiche sous la vidéo
- **Catégorie** : crée des rayons type Netflix (ex. « Foi », « Encouragement »)

Les Shorts apparaissent alors en **catalogue** + **feed vertical** (on scrolle
pour passer au suivant), directement sur le site.

### B) Import automatique (recommandé)
Pour récupérer **tous tes Shorts automatiquement** (titres inclus) :
1. Crée une clé **YouTube Data API v3** sur https://console.cloud.google.com
   (API & Services → Identifiants → Créer une clé API).
2. Sur GitHub : dépôt → **Settings → Secrets and variables → Actions → New
   repository secret** → nom : `YOUTUBE_API_KEY`, valeur : ta clé.
3. C'est tout : à chaque déploiement (et une fois par jour), le site importe
   **tes Shorts (≤ 3 min) ET tes prédications (formats longs)**, classés
   automatiquement par thème. Tu peux toujours les **catégoriser** à la main
   dans les rubriques « Shorts » / « Prédications » (un ID renseigné à la main
   a priorité).

> 🎥 **Prédications (formats longs)** : même principe que les Shorts. Elles
> s'affichent en catalogue par thème et se jouent directement sur le site.
> Quand tu publies une nouvelle vidéo longue sur YouTube, elle apparaît toute
> seule (au prochain rafraîchissement quotidien, ou au prochain déploiement).

## Astuce

Évite de modifier les fichiers se terminant par `.ts` / `.tsx` (ce sont des
fichiers de code). Tout ce qui est éditable en toute sécurité est dans les
formulaires ci-dessus (dossier `content/`).
