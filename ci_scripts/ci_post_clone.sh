#!/bin/sh

# Xcode Cloud — préparation du contenu web AVANT la compilation iOS.
#
# Cette app est une app Capacitor : le contenu affiché (dossier out/) est
# généré par Next.js puis copié dans ios/App/App/public par « cap sync ».
# Ce contenu n'est volontairement PAS versionné dans Git. Sans ce script,
# Xcode Cloud compilerait une app vide (écran blanc) / échouerait.
#
# Xcode Cloud exécute automatiquement ci_scripts/ci_post_clone.sh juste
# après avoir cloné le dépôt.

set -e
set -x

# Se placer à la racine du dépôt cloné par Xcode Cloud.
cd "$CI_PRIMARY_REPOSITORY_PATH"

# Node via Homebrew (présent dans l'environnement Xcode Cloud, Apple Silicon).
# Capacitor 8 exige Node >= 22.
brew install node@22
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"

node --version
npm --version

# Dépendances + export statique Next.js + synchronisation vers iOS.
npm ci
npm run build:app
npx cap sync ios

echo "ci_post_clone : contenu web généré et synchronisé dans iOS."
