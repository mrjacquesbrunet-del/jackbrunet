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
  backgroundColor: "#070512",
  ios: {
    backgroundColor: "#070512",
    contentInset: "always",
  },
  android: {
    backgroundColor: "#070512",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#070512",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
  },
};

export default config;
