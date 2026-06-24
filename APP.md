# Application mobile (iOS + Android) — Capacitor

Le site est emballé dans une vraie application native grâce à **Capacitor**.
Le contenu de l'app, c'est l'export statique du site (`out/`), copié dans les
projets natifs `android/` et `ios/`.

> Identité de l'app : **Jack Brunet** — identifiant `com.jackbrunet.app`.

---

## 1. Le principe (à comprendre une fois)

- On construit le site en version « hors-ligne » : `npm run build:app` → dossier `out/`.
- On copie ce dossier dans les apps natives : `cap sync`.
- On ouvre le projet natif dans l'outil d'Apple/Google pour générer le fichier
  à envoyer sur le store.

Le raccourci `npm run app:sync` fait les deux premières étapes d'un coup.

---

## 2. Ce qu'il te faut

| Pour... | Outils | Coût compte développeur |
|---|---|---|
| **Android** (Google Play) | [Android Studio](https://developer.android.com/studio) (Windows / Mac / Linux) | 25 $ **une seule fois** |
| **iOS** (App Store) | un **Mac** + [Xcode](https://developer.apple.com/xcode/) | 99 $ **par an** |

> Pas de Mac ? L'app Android est faisable seule. Pour iOS sans Mac, on pourra
> passer par un service de build cloud (ex. Ionic Appflow, Codemagic) plus tard.

---

## 3. Android — étapes

```bash
npm run app:android       # build + sync + ouvre Android Studio
```

Dans Android Studio :
1. Laisse Gradle finir de se synchroniser (barre en bas).
2. **Build > Generate Signed App Bundle / APK** → choisis **Android App Bundle (.aab)**.
3. Crée (la première fois) une **clé de signature** (garde-la précieusement, elle
   sert pour toutes les mises à jour).
4. Récupère le fichier `.aab` généré.
5. Sur [Google Play Console](https://play.google.com/console) : crée l'app, remplis
   la fiche, téléverse le `.aab`, envoie en révision.

---

## 4. iOS — étapes (sur Mac)

```bash
npm run app:ios           # build + sync + ouvre Xcode
```

Dans Xcode :
1. Sélectionne le projet **App** → onglet **Signing & Capabilities** → connecte
   ton **compte développeur Apple** (Team).
2. Vérifie l'identifiant `com.jackbrunet.app`.
3. **Product > Archive** → puis **Distribute App** → **App Store Connect**.
4. Sur [App Store Connect](https://appstoreconnect.apple.com) : crée l'app,
   remplis la fiche, attache le build, envoie en révision.

---

## 5. Icônes et écran de démarrage

Les icônes sont déjà générées (Android + iOS) à partir de ton logo.
Pour les **régénérer** après un changement de logo (sur ta machine, où l'outil
s'installe sans souci) :

```bash
# place le logo carré 1024px dans assets/icon.png et le splash 2732px dans assets/splash.png
npx @capacitor/assets generate
npm run app:sync
```

> Note : le générateur officiel n'a pas pu tourner dans l'environnement cloud
> (téléchargement bloqué) — les icônes ont donc été créées à la main. Sur ton
> Mac/PC, la commande ci-dessus fonctionnera normalement.

---

## 6. Mettre à jour l'app (après un changement sur le site)

```bash
git pull            # récupérer les dernières modifs du site
npm install         # si des dépendances ont changé
npm run app:sync    # reconstruire + recopier dans les apps
```
Puis re-générer le build dans Android Studio / Xcode et téléverser une nouvelle
version (pense à incrémenter le numéro de version).

---

## 7. Prochaine étape recommandée : notifications push

C'est le plus gros levier d'engagement (« pensée du jour » poussée chaque matin),
et Apple apprécie une app qui apporte une vraie valeur au-delà du site web.
À faire dans une prochaine session : `@capacitor/push-notifications` + Firebase
Cloud Messaging (gratuit), avec une petite fonction d'envoi programmé.

---

## Dépannage rapide

- **`out/` introuvable** → lance `npm run build:app` d'abord.
- **Gradle/Pods qui rament la 1ʳᵉ fois** → c'est normal, laisse finir.
- **Lien Stripe qui s'ouvre dans l'app** → fonctionne, mais on pourra l'ouvrir
  dans le navigateur système plus tard via `@capacitor/browser`.
