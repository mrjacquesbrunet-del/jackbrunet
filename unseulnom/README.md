# Un Seul Nom — Page événement (HTML pour WordPress)

Page **autonome** (HTML + CSS + JS, sans dépendance externe hormis la police
Google Poppins) à intégrer dans le site WordPress **unseulnom.org**.

- Fichier : [`index.html`](./index.html)
- Style « scopé » sous `#usn-event` → n'affecte pas le thème WordPress.
- Charte : orange terracotta `#DA4A26`, crème `#F1EDE5`, noir `#0C0B0A`, police **Poppins**.
- Contenu : héros plein écran **avec vidéo de fond**, **compte à rebours**,
  présentation de l'événement, bande « mouvement », **formulaire d'inscription /
  newsletter**, prochaines dates, footer.

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
| **Infos événement** | `► ÉVÉNEMENT` | Ville (grand titre), sous-titre, date, heure, lieu. |
| **Compte à rebours** | `data-target` | Date + heure de fin du décompte, ex. `2026-03-28T18:00:00`. |
| **Formulaire** | `► FORMULAIRE` | 3 options : plugin newsletter WordPress (MailPoet/Brevo/Mailchimp), Google Form, ou e-mail (par défaut). |

## Notes

- Les deux dates actuellement présentes sur unseulnom.org (28 mars 2026 et
  9 mai 2026) sont **déjà passées** : pensez à mettre à jour la date de
  l'événement mis en avant et le `data-target` du compte à rebours.
- La page est responsive (mobile, tablette, ordinateur) et respecte
  `prefers-reduced-motion`.
