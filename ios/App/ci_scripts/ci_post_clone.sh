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

# Les gros médias (audio des dévotionnels + commentaires, ~230 Mo) sont servis
# EN LIGNE par jackbrunet.com (mediaUrl) : on les retire de l'app pour qu'elle
# reste légère à télécharger.
rm -rf out/audio out/commentary

npx cap sync ios

# --- Numéro de build unique (évite les rejets TestFlight) --------------------
# TestFlight refuse un envoi dont le couple version+build existe déjà. On aligne
# le numéro de build (CFBundleVersion) sur le numéro de build Xcode Cloud, qui
# est unique et croissant à chaque compilation. « || true » : si agvtool échoue,
# on garde le numéro du projet plutôt que de casser le build.
if [ -n "$CI_BUILD_NUMBER" ]; then
  ( cd ios/App && agvtool new-version -all "$CI_BUILD_NUMBER" ) || true
fi

# --- Résolution des paquets Swift (OneSignal, cordova-ios, etc.) -------------
# Dans le cloud, `cap sync` ajoute OneSignal au graphe Swift (via le plugin
# onesignal-cordova-plugin, qui dépend de OneSignal-XCFramework + cordova-ios).
# Le Package.resolved committé devient alors périmé. Or Xcode Cloud DÉSACTIVE
# la résolution automatique, ce qui rend ce fichier périmé FATAL pour l'archive
# (« an out-of-date resolved file was detected... »).
#
# 1) On réactive la résolution automatique des paquets (au cas où xcodebuild
#    l'honore via les préférences du toolchain).
defaults write com.apple.dt.Xcode IDEDisableAutomaticPackageResolution -bool NO 2>/dev/null || true
defaults write com.apple.dt.Xcode IDEPackageOnlyUseVersionsFromResolvedFile -bool NO 2>/dev/null || true

# 2) On régénère EXPLICITEMENT le Package.resolved pour qu'il corresponde au
#    graphe produit par cap sync. NB : pas de « || true » ici — si la
#    résolution échoue, on veut que le build s'arrête avec un log clair plutôt
#    que de poursuivre avec un fichier périmé.
xcodebuild -resolvePackageDependencies \
  -project ios/App/App.xcodeproj \
  -scheme App

echo "ci_post_clone : node_modules + contenu web + Package.resolved synchronisés."
