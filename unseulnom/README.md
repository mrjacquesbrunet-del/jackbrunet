# Un Seul Nom — Page événement (HTML pour WordPress)

Page **autonome** (HTML + CSS + JS, sans dépendance externe hormis la police
Google Poppins) à intégrer dans le site WordPress **unseulnom.org**.

- Fichier : [`index.html`](./index.html)
- Style « scopé » sous `#usn-event` → n'affecte pas le thème WordPress.
- Charte : **bleu-blanc-rouge** — bleu `#1B2FC4`, rouge `#E4262B`, blanc `#FFFFFF`,
  textes en noir `#0C0B0A`. Panneaux du programme en alternance bleu / rouge.
- Typographies : **Archivo** (gros titres, larges et massifs — équivalent libre
  de « Druk Wide » utilisé par vouscon.com), **Inter** (sous-titres),
  **Poppins** (texte courant).

## Contenu de la page

1. **Héros plein écran** avec vidéo de fond, logo, ville, date et **compte à rebours**.
2. **Programme** : panneaux qui **glissent depuis la gauche** au scroll (ouverture,
   louange, prédication, évangélisation & guérison).
3. **Infos pratiques** + bouton « Voir l'itinéraire » (Google Maps).
4. **Pill de date** + **intervenants** : portraits en **noir et blanc** qui
   **apparaissent** au scroll (retirer `filter: grayscale(1)` pour la couleur).
5. **Punchline animée** : les mots se **rassemblent** au scroll (effet vouscon),
   sur le thème de l'unité de l'Église pour évangéliser.
6. **Deux cartes d'action à cheval** sur la bande : « Inscris-toi » et
   « Soutiens la mission ».
7. **Formulaire d'inscription / newsletter**, prochaines dates, footer.

Toutes les animations se dégradent proprement : sans JavaScript ou avec
`prefers-reduced-motion`, le contenu s'affiche normalement.

## Événement actuellement configuré

**Un Seul Nom · Avignon** — Samedi 17 octobre 2026
Parc des expos d'Avignon, 800 chemin des Félons, 84140 Montfavet
Portes 15h00 · Conférence 16h00
Prédication : Yanis Gautier, Chriss Campion
Louange : Patchaï Reyes, Nikita Heugebaert, Ruben Debard

## Intégration dans WordPress

**Option A — Bloc « HTML personnalisé » (recommandé)**
1. Éditez la page WordPress voulue.
2. Ajoutez un bloc **HTML personnalisé**.
3. Copiez tout ce qui se trouve entre `<!-- ►►► DÉBUT -->` et `<!-- ◄◄◄ FIN -->`
   dans `index.html` (le `<style>`, le `<section>` et le `<script>`), puis collez-le.
4. Publiez.

**Option B — Page complète**
Utilisez `index.html` tel quel comme modèle de page HTML.

> Astuce : pour un rendu plein écran sans marges, utilisez un modèle de page
> « pleine largeur » et masquez éventuellement l'en-tête du thème sur cette page.

## Les 4 réglages à faire (tout est commenté dans `index.html`)

| Réglage | Où | Quoi mettre |
|---|---|---|
| **Vidéo de fond** | `► VIDÉO DE FOND` | URL d'une vidéo `.mp4` uploadée dans la médiathèque (muette, en boucle). Sans vidéo, un fond dégradé sombre s'affiche. |
| **Logo** | `► LOGO` | URL du logo (version **blanche** conseillée sur le héros sombre). S'il n'est pas défini, il disparaît proprement. |
| **Photos intervenants** | ✅ fournies (`images/`) | Les 5 portraits sont intégrés et optimisés. |
| **Photos programme** | 2/4 fournies | Restent `VOTRE_PHOTO_PREDICATION.jpg` et `VOTRE_PHOTO_GUERISON.jpg`. |
| **Infos événement** | `► ÉVÉNEMENT` | Ville (grand titre), sous-titre, date, heure, lieu. |
| **Compte à rebours** | `data-target` | Date + heure de début, ex. `2026-10-17T16:00:00`. |
| **Lien de don** | carte « Soutiens la mission » | URL de la page de don (HelloAsso…). |
| **Formulaire** | `► FORMULAIRE` | 3 options : plugin newsletter WordPress (MailPoet/Brevo/Mailchimp), Google Form, ou e-mail (par défaut). |

## Notes

- La page est responsive (mobile, tablette, ordinateur) et respecte
  `prefers-reduced-motion`.
- Les emplacements photos sont facultatifs : tant qu'ils ne sont pas renseignés,
  un repli visuel propre s'affiche (icône ou initiales).
