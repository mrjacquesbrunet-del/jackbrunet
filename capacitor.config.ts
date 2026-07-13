import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Configuration Capacitor — emballe l'export statique Next.js (`out/`) dans des
 * applications natives iOS et Android.
 *
 * Le webDir pointe vers le dossier généré par `npm run build:app`
 * (export Next.js sans basePath, pour un chargement depuis la racine native).
 */
const config: CapacitorConfig = {
  appId: "com.jackbrunet.app",
  appName: "Jack Brunet",
  webDir: "out",
  backgroundColor: "#292E21",
  ios: {
    backgroundColor: "#292E21",
    contentInset: "always",
  },
  android: {
    backgroundColor: "#292E21",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#292E21",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
    // Mises à jour « à chaud » (OTA) via Capgo: l'app télécharge et applique
    // les nouvelles versions web au démarrage, sans repasser par les stores.
    // Sécurité: si l'app n'appelle pas notifyAppReady() au lancement, Capgo
    // annule la mise à jour et revient à la version stable précédente.
    CapacitorUpdater: {
      autoUpdate: true,
    },
  },
};

export default config;
