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
  appName: "RHEMA",
  webDir: "out",
  backgroundColor: "#17181A",
  ios: {
    // Noir de l'app (et non gris) : fond visible au lancement, effectif au
    // prochain build natif. La bande de l'heure est peinte par l'app (OTA).
    backgroundColor: "#0C0C0B",
    // La page va d'un bord à l'autre (sous l'heure et la barre du bas) ; les
    // marges viennent du CSS (env(safe-area-inset-*)). Avant 2.4 : « always »,
    // qui laissait une bande sous l'heure.
    contentInset: "never",
  },
  android: {
    backgroundColor: "#17181A",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#17181A",
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
    // Connexion native : seulement Google et Apple (le SDK Facebook n'est pas
    // embarqué → app plus légère, rien à déclarer côté confidentialité).
    SocialLogin: {
      providers: { google: true, apple: true, facebook: false, twitter: false },
      logLevel: 1,
    },
  },
};

export default config;
