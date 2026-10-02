# Images des fiches bibliques — lot 2 (462 images)

Les fiches « Personnages & Lieux » de la Bible (`content/bible-fiches.json`)
affichent un médaillon rond : `public/img/bible/fiches/<id>.jpg` s'il existe,
sinon un monogramme. Les 275 premières images ont été livrées le 1er octobre
2026 (commit `d6e84eb`). La campagne d'octobre a ajouté 462 fiches sans image.

## La liste

`docs/images-fiches-a-generer.json` : une entrée par image à produire.

| champ | rôle |
|---|---|
| `id` / `fichier` | nom exact du fichier à déposer |
| `type` | `personnage` ou `lieu` |
| `testament` | `AT` ou `NT` (ordre de production conseillé) |
| `nom`, `periode`, `tribu`, `bio` | contexte biblique |
| `visuel` | indication de rendu (origine, groupe, symbole, précautions) |

Total : 210 personnages AT, 85 personnages NT, 100 lieux AT, 67 lieux NT.
Régénérer la liste après livraison partielle :
`python3 scripts/build-images-manifest.py` (elle ne garde que les fiches
encore sans image).

## Style (identique aux 275 existantes)

- **Personnages** : rendu 3D stylisé chaleureux (type film d'animation),
  buste centré, regard proche de la caméra, fond uni sombre `#2A2822`,
  lumière chaude latérale. Physionomie selon l'origine (israélite, égyptienne,
  assyrienne, perse, grecque, romaine, koushite…) pour qu'on les distingue au
  premier coup d'œil dans le petit médaillon rond.
- **Lieux** : paysage emblématique dans une vignette ronde à bord sombre,
  lumière dorée (voir `jerusalem.jpg`).
- **Fiches de groupe** (Dathan et Abiram, les mages, les sept…) : 2 à 5
  personnages ensemble dans le même cadre.
- Interdits : texte, lettrage, filigrane, symbole occulte, violence ou gore,
  nudité. Pas d'auréole (les portraits existants n'en ont pas).
- Format : carré 1024×1024, JPG qualité 80 (70 à 130 Ko).

## Méthode Magnific

Un prompt seul repart vers le photoréalisme (voir `docs/CHEMIN-ASSETS.md`).
Téléverser des images existantes comme **références de style** (type
`image`) dans `images_generate` :

- personnages : `abigail.jpg`, `moise.jpg`, `betsaleel.jpg`, `paul.jpg` ;
- lieux : `jerusalem.jpg` et un second paysage existant.

Commencer par un lot test de 6 images (3 personnages, 3 lieux) à faire
valider par Jack, puis produire par lots de 20 à 30, AT puis NT.

**À faire valider par Jack avant génération** : `satan`, `baal`, `dagon`,
`moloc-kemosch`, `diane` (proposition : représentation symbolique sans visage
pour Satan, statues d'idoles sur leur autel pour les dieux païens).

## Livraison

1. Déposer chaque image sous son nom exact (`public/img/bible/fiches/<id>.jpg`).
2. Vérifier la correspondance (aucune fiche sans image, aucune image orpheline).
3. Ne pas modifier `content/bible-fiches.json`.
4. Livrer en OTA : `date +%s > .ota-release && npm run build:app`, puis commit
   et push.
