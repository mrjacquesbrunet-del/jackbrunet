# Widget iOS RHEMA — à brancher une fois dans Xcode

Le code du widget est prêt (`RhemaWidget.swift`, `Info.plist`, `widget-content.json`).
Il ne reste qu'à **créer la cible d'extension** dans Xcode (2 minutes) — cette
étape ne peut pas se faire en dehors de Xcode.

## Étapes (dans Xcode, projet `ios/App/App.xcodeproj`)

1. **File → New → Target…**
2. Choisis **Widget Extension**, clique **Next**.
3. Product Name : **RhemaWidget** — **décoche** « Include Configuration
   Intent » (on n'en a pas besoin) — clique **Finish**.
   - Si Xcode propose « Activate scheme », clique **Activate**.
4. Xcode a créé un dossier `RhemaWidget` avec un fichier d'exemple
   (`RhemaWidget.swift`) et un `Info.plist`. **Remplace-les** par les fichiers
   de ce dossier :
   - supprime le `RhemaWidget.swift` généré, puis **glisse** notre
     `RhemaWidget.swift` dans la cible (coche « RhemaWidgetExtension » dans
     « Target Membership »).
   - fais pareil pour **`widget-content.json`** (coche bien la cible
     RhemaWidget dans « Target Membership » — c'est ce qui l'embarque).
   - tu peux garder le `Info.plist` généré, ou remplacer par le nôtre.
5. Sélectionne la cible **RhemaWidgetExtension → General** et mets
   **Minimum Deployments = iOS 16.0** (ou la même version que l'app).
6. Build : sélectionne le schéma de l'app, **Product → Build**. Puis lance
   l'app store build habituel (Xcode Cloud).

Aucun « App Group » n'est nécessaire : le widget lit son propre
`widget-content.json` embarqué et calcule le contenu du jour tout seul.

## Mettre à jour le contenu du widget

`widget-content.json` est une copie figée du contenu (verset + punchline) au
moment du build. Pour rafraîchir la liste, régénère-le depuis `content/devotions.json`
puis refais un build store. (Le contenu tourne chaque jour tout seul, mais
l'ajout de NOUVELLES entrées demande un nouveau build.)
