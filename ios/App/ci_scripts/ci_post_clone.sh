#!/bin/sh

# Xcode Cloud — préparation du contenu web AVANT la compilation iOS.
#
# Cette app est une app Capacitor : le contenu affiché (dossier out/) et les
# dépendances natives (node_modules/@capacitor/*, référencées en Swift Package)
# proviennent de npm. Ces dossiers ne sont PAS versionnés dans Git. Sans ce
# script, la résolution des paquets Swift échoue (« @capacitor/... doesn't
# exist in file system ») et le build s'arrête.
#
# Xcode Cloud exécute automatiquement ci_scripts/ci_post_clone.sh (situé à côté
# du projet Xcode) juste après avoir cloné le dépôt.

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

# Dépendances npm (dont node_modules/@capacitor/* requis par Swift Package
# Manager), export statique Next.js, puis synchronisation vers iOS.
npm ci
npm run build:app
npx cap sync ios

echo "ci_post_clone : node_modules + contenu web générés et synchronisés."
