# Widget iOS RHEMA

La cible d'extension **RhemaWidgetExtension** est déclarée dans
`ios/App/App.xcodeproj` (identifiant `com.jackbrunet.app.RhemaWidget`) : l'app
en dépend et l'embarque (« Embed Foundation Extensions »). Xcode Cloud la
compile avec l'app, rien à faire à la main dans Xcode.

Deux widgets (petit et moyen format) : « Punchline du jour » et « Verset du
jour », lus depuis `widget-content.json` embarqué (jour de l'année modulo N,
comme l'app). Aucun App Group nécessaire.

## Version

`MARKETING_VERSION` de la cible du widget doit rester ÉGALE à celle de l'app
(Apple refuse sinon). Quand la version de l'app change (ex. 2.5 → 2.6),
changer aussi celle de RhemaWidgetExtension dans project.pbxproj. Le numéro de
build est aligné automatiquement par ci_post_clone.sh (agvtool -all).

## Mettre à jour le contenu du widget

`widget-content.json` est une copie figée du contenu (verset + punchline) au
moment du build. Pour rafraîchir la liste, régénère-le depuis
`content/devotions.json` puis refais un build store.
