/**
 * Préfixe un chemin d'asset public (ex. image uploadée dans /uploads) avec le
 * base path du site (ex. /jackbrunet sur GitHub Pages). Laisse les URLs
 * absolues (http...) inchangées. Vide => chemin tel quel (dev local).
 */
export function asset(path?: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const clean = path.startsWith("/")? path: `/${path}`;
  return `${base}${clean}`;
}

/**
 * URL d'un média lourd (audio des dévotionnels, commentaires bibliques) servi
 * par le SITE (jackbrunet.com) au lieu d'être embarqué dans l'app. Ces fichiers
 * (~230 Mo au total) sont retirés du bundle OTA pour qu'il reste léger et se
 * télécharge vite ; l'app les charge en ligne (GitHub Pages, CORS ouvert).
 */
const MEDIA_BASE = "https://jackbrunet.com";
export function mediaUrl(path?: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${MEDIA_BASE}${clean}`;
}
