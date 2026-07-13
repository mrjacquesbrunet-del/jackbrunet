# Widgets iOS (écran d'accueil) — Verset & Punchline du jour

Le code SwiftUI est prêt : `ios/JackBrunetWidget/JackBrunetWidgets.swift`.
Il ne reste qu'à l'ajouter comme **extension Widget** dans Xcode (sur ton Mac).
Aucune donnée à configurer : le widget lit le flux `https://jackbrunet.com/widget/feed.json`.

## Étapes (Xcode, ~10 min)

1. `git pull` (branche `claude/great-hamilton-ieokug`), puis `npx cap sync ios`.
2. Ouvre `ios/App/App.xcworkspace` dans **Xcode**.
3. Menu **File → New → Target… → Widget Extension**.
   - Product Name : `JackBrunetWidget`
   - **Décoche** « Include Configuration Intent ».
   - Finish → « Activate » si demandé.
4. Xcode crée un dossier `JackBrunetWidget` avec un fichier `.swift` d'exemple.
   **Remplace** son contenu par celui de `ios/JackBrunetWidget/JackBrunetWidgets.swift`
   (copier-coller tout le fichier). Supprime les autres fichiers d'exemple du
   target (Assets/Intent) si présents — garde `Info.plist`.
5. Vérifie que le fichier appartient bien au target **JackBrunetWidget**
   (panneau de droite « Target Membership »).
6. Sélectionne le schéma **App** → **Product → Archive** →
   **Distribute App → App Store Connect**.

## Notes
- Les couleurs sont déjà dans la charte (nuit/lime/crème).
- Le widget se met à jour tout seul quelques fois par jour (le contenu du jour
  vient du flux). Pas besoin d'App Group : tout passe par le flux du site.
- Tailles proposées : petit et moyen.
- Si un jour tu veux que le widget reflète les dévotionnels modifiés dans
  l'admin (base Supabase), on fera évoluer le flux — pour l'instant il suit les
  60 dévotionnels intégrés.
