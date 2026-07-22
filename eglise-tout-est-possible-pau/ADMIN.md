# Administrer le site sans coder

Tout le contenu du site — textes, photos, vidéos, témoignages, horaires,
équipe, pages, dons — se modifie via **Pages CMS**, un espace d'administration
visuel gratuit branché sur GitHub. Aucune ligne de code à toucher.

## Accès

1. Ouvre **https://app.pagescms.org**
2. Connecte-toi avec le compte **GitHub** propriétaire du dépôt.
3. Choisis le dépôt du site : les rubriques apparaissent dans le menu.

> ⚠️ Ce projet vit pour l'instant dans le sous-dossier
> `eglise-tout-est-possible-pau/` d'un dépôt existant. Pages CMS lit le fichier
> `.pages.yml` à la **racine** du dépôt. Deux options :
> - **Recommandé** : déplacer ce dossier dans son propre dépôt GitHub
>   (les chemins du `.pages.yml` fourni fonctionnent tels quels une fois le
>   fichier placé à la racine — retirer simplement le préfixe de dossier).
> - Sinon : copier les rubriques de ce `.pages.yml` dans celui de la racine.

## Ce que tu peux modifier

| Rubrique | Contenu |
| --- | --- |
| ⚙️ Paramètres | Nom, slogan, email, adresse, réseaux sociaux, chaîne YouTube, page HelloAsso, **vidéo du hero** |
| 🏠 Accueil | Mots animés du hero, textes de toutes les sections, verset |
| 👋 Première visite | Déroulé du dimanche, FAQ, points de réassurance |
| 📖 À propos | Histoire, valeurs, ce que nous croyons |
| 🎯 Vision | Les 4 verbes, versets, rêve pour Pau |
| 👥 Équipe | Membres : nom, rôle, **photo**, bio |
| 🗓️ Réunions | **Horaires**, descriptions, infos pratiques |
| 💚 Témoignages | Histoires : titre, texte, **photo ou vidéo YouTube** |
| 🤲 Dons | Textes de la page, transparence |
| ✉️ Contact | Textes de la page |
| ⚖️ Légal | Mentions légales, politique de confidentialité |

## Photos et vidéos

- **Photos** : bouton « image » dans le formulaire → téléverse le fichier, il
  est stocké dans `public/uploads/` et s'affiche automatiquement. Tant qu'une
  photo n'est pas fournie, le site affiche un visuel abstrait élégant dans la
  charte (jamais de cadre « image manquante »).
- **Vidéo du hero** : renseigner une URL `.mp4` hébergée (idéalement compressée,
  ≤ 8 Mo, muette, en boucle) dans Paramètres → Vidéo d'accueil.
- **Témoignages vidéo** : coller simplement l'URL YouTube dans le champ prévu.

## Publication

Chaque « Save » crée un commit GitHub : le site se reconstruit et se met à
jour automatiquement en quelques minutes (selon l'hébergement), avec un
historique complet des modifications (retour en arrière possible).
