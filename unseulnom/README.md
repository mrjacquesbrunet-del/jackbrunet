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
   **apparaissent** au scroll et **prennent leurs couleurs** en passant au
   centre de l'écran, puis redeviennent noir et blanc en sortant.
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
Prédication : Yannis Gautier, Chriss Campion
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
| **Logo** | ✅ intégré | Le logo est **vectoriel, embarqué dans le CSS** (repère `LOGO UN SEUL NOM`) : rien à envoyer dans la médiathèque, net à toutes les tailles, en blanc sur le héros et le pied de page, en noir sous le formulaire. |
| **Photos intervenants** | ✅ fournies (`images/`) | Les 5 portraits sont intégrés et optimisés. |
| **Photos programme** | ✅ 4/4 fournies (`images/`) | Les quatre panneaux ont leur photo. |
| **Infos événement** | `► ÉVÉNEMENT` | Ville (grand titre), sous-titre, date, heure, lieu. |
| **Compte à rebours** | `data-target` | Date + heure de début, ex. `2026-10-17T16:00:00`. |
| **Lien de don** | ✅ HelloAsso branché | « Faire un don » et « Devenir partenaire » pointent vers le formulaire HelloAsso. |
| **Formulaire** | ✅ Brevo branché | Champs `NOM` et `EMAIL`, envoi vers le formulaire Brevo sans quitter la page. |

## Notes

- La page est responsive (mobile, tablette, ordinateur) et respecte
  `prefers-reduced-motion`.
- Les emplacements photos sont facultatifs : tant qu'ils ne sont pas renseignés,
  un repli visuel propre s'affiche (icône ou initiales).

## Les deux pages

| Page | Fichier de travail | Sortie WordPress | Doc |
|---|---|---|---|
| Accueil | `accueil.html` | `wordpress-accueil/` | [`ACCUEIL.md`](./ACCUEIL.md) |
| Événement (Avignon) | `index.html` | `wordpress-3-parties/` | ce fichier |
| À venir (les dates) | `agenda.html` | `wordpress-agenda/` | [`AGENDA.md`](./AGENDA.md) |

## Régénérer les fichiers WordPress

Après toute modification d'un fichier de travail :

```
python3 generer-fichiers-wordpress.py            # les trois pages
python3 generer-fichiers-wordpress.py accueil    # une seule
```

Le script découpe la page en trois parties, remplace les chemins d'images par
les adresses de la médiathèque, retire les repères des fichiers non encore
fournis (vidéo, photos d'ambiance) et écrit le tout en **ASCII pur**, ce qui
évite les accents cassés au copier-coller.
