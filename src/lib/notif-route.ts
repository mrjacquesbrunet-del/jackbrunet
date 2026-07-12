"use client";

import { asset } from "./asset";

/**
 * Ouvre l'app sur la route d'une notification (par défaut le dévotionnel,
 * « Mon temps avec Jésus »). Robuste au démarrage à froid :
 * - ne recharge pas si on est déjà sur la bonne page ;
 * - navigation « dure » (replace) pour ne pas empiler d'historique.
 */
export function openNotifRoute(route?: string): void {
  const target = route && route.trim() ? route : "/devotionnel/";
  try {
    const cur = window.location.pathname.replace(/\/+$/, "");
    const dst = ("/" + target.replace(/^\/+/, "")).replace(/\/+$/, "");
    if (cur === dst) return; // déjà au bon endroit
    window.location.replace(asset(target));
  } catch {
    /* navigation impossible */
  }
}
