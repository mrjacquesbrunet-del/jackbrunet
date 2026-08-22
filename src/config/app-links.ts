/** Liens officiels de téléchargement de l'application mobile. */
export const APP_STORE_URL = "https://apps.apple.com/fr/app/id6784931618";
export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.jackbrunet.app";
/** Page de téléchargement sur le site (landing à partager). */
export const APP_LANDING_PATH = "/app";

/** Schéma d'URL de l'application native (rhema://plans/xxx). */
export const APP_SCHEME = "rhema";

/**
 * Lien intelligent à partager : la page relais /lien ouvre l'application
 * directement sur le contenu (`to`) si elle est installée, sinon elle
 * envoie vers l'App Store / le Play Store.
 */
export function appShareUrl(to?: string): string {
  const base = "https://jackbrunet.com/lien";
  if (!to || to === "/") return base;
  return `${base}?to=${encodeURIComponent(to)}`;
}
