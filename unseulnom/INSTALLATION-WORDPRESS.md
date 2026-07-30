# Mettre la page en ligne sur WordPress — pas à pas

Temps estimé : **15 à 20 minutes**. Aucune compétence technique requise.

Fichier à utiliser : **`index-wordpress.html`** (et non `index.html`, qui est la
version de travail).

---

## Étape 1 — Uploader les 9 images

1. Dans WordPress : **Médias → Ajouter un fichier média**
2. Envoie les **9 fichiers** du dossier `images/` :

   | Fichier | Ce que c'est |
   |---|---|
   | `yannis.webp` | portrait Yannis Gautier |
   | `chriss.webp` | portrait Chriss Campion |
   | `patchai.webp` | portrait Patchaï Reyes |
   | `nikita.webp` | portrait Nikita Heugebaert |
   | `ruben.webp` | portrait Ruben Debard |
   | `programme-1.webp` | panneau Ouverture des portes |
   | `programme-2.webp` | panneau Louange |
   | `programme-3.webp` | panneau Prédication |
   | `programme-4.webp` | panneau Évangélisation & Guérison |

> ⚠️ **Envoie-les toutes le même jour.** WordPress range les fichiers par
> mois (`/uploads/2026/07/`) : si tu étales les envois sur deux mois, les
> adresses ne seront plus toutes identiques et l'étape 2 ne marchera pas d'un
> seul coup.

---

## Étape 2 — Récupérer l'adresse du dossier

1. Clique sur **n'importe laquelle** des images que tu viens d'envoyer.
2. À droite, copie le champ **« URL du fichier »**. Tu obtiens par exemple :

   ```
   https://unseulnom.org/wp-content/uploads/2026/07/yannis.webp
   ```

3. **Enlève le nom du fichier** à la fin. Il te reste l'adresse du dossier :

   ```
   https://unseulnom.org/wp-content/uploads/2026/07
   ```

   👉 **Sans barre oblique `/` à la fin.**

---

## Étape 3 — Préparer le code

1. Ouvre `index-wordpress.html` dans un éditeur de texte (Bloc-notes,
   TextEdit, VS Code…).
2. Fais un **Rechercher / Remplacer** (`Ctrl+H` sur Windows, `Cmd+Maj+H` sur Mac) :
   - Rechercher : `__URL_IMAGES__`
   - Remplacer par : l'adresse copiée à l'étape 2
   - **Remplacer tout** → il doit y avoir **9 remplacements**
3. **Sélectionne tout** (`Ctrl+A` / `Cmd+A`) et **copie** (`Ctrl+C` / `Cmd+C`).

---

## Étape 4 — Créer la page

1. **Pages → Ajouter une page**
2. Titre : `Avignon` (ou `Événement Avignon`)
3. Dans le corps de la page, ajoute un bloc **« HTML personnalisé »** :
   clique sur le **+**, tape `html`, choisis **HTML personnalisé**
4. **Colle** le code dans ce bloc
5. À droite, dans les réglages de la page, choisis un modèle
   **pleine largeur** si ton thème en propose un (« Full width », « Pleine
   largeur », « Sans barre latérale »). La page est conçue pour occuper tout
   l'écran.
6. Clique sur **Prévisualiser** pour vérifier, puis **Publier**.

---

## Étape 5 — Vérifier

Sur la page publiée, contrôle :

- [ ] Les **9 photos** s'affichent (5 portraits + 4 panneaux du programme)
- [ ] Le **compte à rebours** défile
- [ ] Les **animations au scroll** fonctionnent
- [ ] Le **formulaire d'inscription** : fais un test avec ta propre adresse,
      puis vérifie que le contact arrive dans Brevo (**pense à le supprimer
      ensuite**)
- [ ] Les boutons **« Faire un don »** et **« Devenir partenaire »** ouvrent
      HelloAsso
- [ ] Le rendu **sur téléphone**

---

## Ajouter plus tard le logo, la vidéo et les photos d'ambiance

Ces éléments ne sont pas encore fournis : ils ont été **retirés du code**
plutôt que laissés en liens morts, qui auraient provoqué une erreur à chaque
visite. Pour les ajouter :

| Élément | Où chercher dans le fichier | Quoi faire |
|---|---|---|
| **Logo** | `► LOGO` (2 endroits : héros et pied de page) | Uploader le logo (version **blanche** pour le héros sombre), puis remplacer le commentaire par la ligne `<img …>` indiquée |
| **Vidéo de fond** | `► VIDEO` | Uploader un `.mp4` **muet, en boucle, 5 à 15 Mo**, puis remplacer le commentaire par la ligne `<source …>` indiquée |
| **Photos d'ambiance** | section `usn-punch` | Me les envoyer : je régénère le bloc avec les 4 photos latérales |

---

## Problèmes courants

**Les photos ne s'affichent pas**
L'adresse de l'étape 2 est fausse. Ouvre l'adresse d'une image dans ton
navigateur : si elle ne s'affiche pas, c'est bien le chemin qui est en cause.
Vérifie aussi qu'il n'y a **pas de `/` en trop** à la fin.

**La page est étroite / centrée dans une colonne**
Le modèle de page n'est pas en pleine largeur (étape 4, point 5).

**Le style déborde sur le reste du site**
Ça ne devrait pas arriver : tout le CSS est « scopé » sous `#usn-event`. Si
tu constates un problème, c'est probablement l'inverse — le thème qui impose
son style à la page. Dis-le moi, j'ajusterai.

**Le formulaire ne renvoie rien dans Brevo**
Vérifie dans Brevo que la liste liée au formulaire est la bonne. Le
formulaire envoie les champs `NOM` et `EMAIL`.

---

## Mettre à jour la page ensuite

Modifie `index-wordpress.html`, refais le remplacement de `__URL_IMAGES__`,
puis recolle tout le bloc dans le bloc HTML de la page WordPress. Il n'y a
pas besoin de renvoyer les images.
