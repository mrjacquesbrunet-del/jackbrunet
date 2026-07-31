"use client";

import { asset } from "./asset";
import { trace } from "./boot-trace";

/** Clé où l'on mémorise la route d'une notification tapée, le temps que
 * l'app démarre/se recharge et puisse y naviguer (démarrage à froid). */
export const NOTIF_ROUTE_KEY = "jb.notifRoute";
/** Durée de validité du mémo (ms). Au-delà, on l'ignore : une notif tapée il y
 * a longtemps ne doit pas détourner une ouverture normale de l'app. */
const NOTIF_ROUTE_TTL = 120_000;

/**
 * Navigateur « doux » (routeur Next) enregistré par un composant React monté.
 * INDISPENSABLE dans l'app native : une navigation dure (window.location) vers
 * un chemin de dossier « /devotionnel/ » ne se résout pas toujours en
 * index.html dans la WebView iOS → écran vide (olive). La navigation douce,
 * elle, reste dans le bundle déjà chargé et fonctionne comme le reste de l'app.
 */
let _softNavigate: ((path: string) => void) | null = null;
export function setNotifNavigator(fn: ((path: string) => void) | null): void {
  _softNavigate = fn;
}

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

function stash(target: string): void {
  try {
    localStorage.setItem(NOTIF_ROUTE_KEY, JSON.stringify({ route: target, t: Date.now() }));
  } catch {
    /* stockage indisponible */
  }
}
function clearStash(): void {
  try {
    localStorage.removeItem(NOTIF_ROUTE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Ouvre l'app sur la route d'une notification (par défaut le dévotionnel).
 * Stratégie fiable dans la WebView :
 *  1) on mémorise la cible (filet, pour le démarrage à froid) ;
 *  2) si déjà sur la bonne page → rien ;
 *  3) navigation DOUCE via le routeur Next si disponible (fonctionne comme la
 *     navigation normale de l'app) ;
 *  4) sinon, on recharge la RACINE « / » (index.html se résout toujours) et la
 *     garde d'accueil consommera le mémo pour faire la navigation douce.
 *     On évite ainsi la navigation dure vers « /devotionnel/ » qui échoue
 *     (écran olive vide) dans la WebView iOS.
 */
export function openNotifRoute(route?: string): void {
  const target = normalizeNotifRoute(route);
  try {
    if (barePath(window.location.pathname) === barePath(target)) {
      trace("notif:deja-sur-place", target);
      clearStash();
      return; // déjà au bon endroit
    }
    stash(target);
    if (_softNavigate) {
      try {
        _softNavigate(target);
        trace("notif:nav-douce", target);
        return;
      } catch {
        trace("notif:nav-douce-erreur", target);
      }
    }
    // Filet : recharge index.html (racine), qui se résout toujours ; la garde
    // d'accueil lira le mémo et fera la navigation douce vers la cible.
    trace("notif:nav-dure-racine", target);
    window.location.replace(asset("/"));
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
