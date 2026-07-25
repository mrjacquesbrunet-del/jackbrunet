"use client";

import { asset } from "./asset";

/** Clé où l'on mémorise la route d'une notification tapée, le temps que
 * l'app démarre/se recharge et puisse y naviguer (démarrage à froid). */
export const NOTIF_ROUTE_KEY = "jb.notifRoute";
/** Durée de validité du mémo (ms). Au-delà, on l'ignore : une notif tapée il y
 * a longtemps ne doit pas détourner une ouverture normale de l'app. */
const NOTIF_ROUTE_TTL = 120_000;

/** Normalise une route de notif en chemin absolu avec slash final
 * (ex. "communaute?prayer=1" → "/communaute/?prayer=1"). Défaut : dévotionnel. */
export function normalizeNotifRoute(route?: string): string {
  const raw = route && route.trim() ? route.trim() : "/devotionnel/";
  const [path, query] = raw.split("?");
  let p = "/" + path.replace(/^\/+/, "").replace(/\/+$/, "");
  if (p === "/") p = "/devotionnel";
  p = p + "/"; // slash final (l'export statique sert /route/index.html)
  return query ? `${p}?${query}` : p;
}

/** Chemin sans query ni slash final, pour comparer deux routes. */
function barePath(s: string): string {
  return s.split("?")[0].replace(/\/+$/, "");
}

/**
 * Ouvre l'app sur la route d'une notification (par défaut le dévotionnel,
 * « Mon temps avec Jésus »). Robuste au démarrage à froid :
 * - mémorise d'abord la cible (localStorage, horodatée) pour que la garde
 *   d'accueil l'honore même si une navigation est perdue pendant un
 *   rechargement ;
 * - navigation « dure » (replace) pour ne pas empiler d'historique ;
 * - ne recharge pas si on est déjà sur la bonne page.
 */
export function openNotifRoute(route?: string): void {
  const target = normalizeNotifRoute(route);
  try {
    try {
      localStorage.setItem(NOTIF_ROUTE_KEY, JSON.stringify({ route: target, t: Date.now() }));
    } catch {
      /* stockage indisponible */
    }
    if (barePath(window.location.pathname) === barePath(target)) {
      // Déjà sur la bonne page : rien à recharger, on nettoie le mémo.
      try {
        localStorage.removeItem(NOTIF_ROUTE_KEY);
      } catch {
        /* ignore */
      }
      return;
    }
    window.location.replace(asset(target));
  } catch {
    /* navigation impossible */
  }
}

/**
 * Consomme (lit puis efface) la route de notification mémorisée, si elle est
 * récente. Appelée par la garde d'accueil au tout début du chargement, pour
 * aller directement au bon contenu au lieu du dévotionnel. Renvoie null si
 * aucune (ou trop ancienne).
 */
export function consumeStashedNotifRoute(): string | null {
  try {
    const raw = localStorage.getItem(NOTIF_ROUTE_KEY);
    if (!raw) return null;
    localStorage.removeItem(NOTIF_ROUTE_KEY);
    const { route, t } = JSON.parse(raw) as { route?: string; t?: number };
    if (!route || !route.startsWith("/")) return null;
    if (typeof t === "number" && Date.now() - t > NOTIF_ROUTE_TTL) return null;
    return route;
  } catch {
    return null;
  }
}
