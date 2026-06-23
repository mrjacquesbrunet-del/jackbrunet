/**
 * Préfixe un chemin d'asset public (ex. image uploadée dans /uploads) avec le
 * base path du site (ex. /jackbrunet sur GitHub Pages). Laisse les URLs
 * absolues (http...) inchangées. Vide => chemin tel quel (dev local).
 */
export function asset(path?: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}
