# Lexique grec / hébreu — chaîne de préparation (hors ligne)

Ces scripts ont produit `content/lexique/source/` et `public/lexique/conc/`.
Ils tournent une fois, sur un poste de travail (pas en CI).

Sources (à télécharger dans le dossier des scripts) :
- STEPBible-Data (Tyndale House, **CC BY 4.0**) : TAGNT, TAHOT (textes grec et
  hébreu balisés Strong), TBESG, TBESH (lexiques brefs).
  https://github.com/STEPBible/STEPBible-Data
- Open Scriptures, Strong 1890 (JSON, CC BY-SA) : dérivations et prononciation.
  https://github.com/openscriptures/strongs
- Outils Python : `pip install eflomal simplemma` (eflomal : alignement
  statistique ; simplemma : lemmes français).

Étapes :
1. `1-corpus.py` : textes balisés ramenés à la numérotation de la Segond de l'app,
   mots de la Segond découpés et lemmatisés → corpus.json.
2. `2-apriori-gloses.py` : alignement des gloses anglaises ↔ français, d'où des
   a priori Strong → français (aide les mots rares) → priors.txt.
3. `3-alignement.py` : 5 alignements Strong ↔ Segond (eflomal + grow-diag-final-and),
   vote à la majorité → liens.json.
4. `4-entrees.py` : entrées (lemme, translittération, prononciation, traductions
   de la Segond, parentés) + concordance, avec garde-fous (un mot ordinaire n'est
   relié ni à un nom propre ni à un mot outil).
5. `5-fichiers.py` : `content/lexique/source/<tranche>.json` et
   `public/lexique/conc/<tranche>.json`.

Ensuite : `scripts/translate-lexique.mjs` (CI, workflow « Lexique ») traduit les
définitions en français, et `scripts/build-lexique.mjs` produit `public/lexique/`.
