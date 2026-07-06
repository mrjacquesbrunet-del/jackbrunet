"use client";

/**
 * Petit compteur d'utilisation (100 % local): nombre d'ouvertures de l'app et
 * date de première ouverture. Sert à déclencher, au bon moment, la proposition
 * d'activer les notifications et la demande de note.
 */

const OPENS = "jb.usage.opens";
const FIRST = "jb.usage.first";
let counted = false;

/** À appeler une fois au lancement: incrémente et renvoie le nombre d'ouvertures. */
export function recordOpen(): number {
  try {
    if (counted) return getOpens();
    counted = true;
    const n = getOpens() + 1;
    localStorage.setItem(OPENS, String(n));
    if (!localStorage.getItem(FIRST)) localStorage.setItem(FIRST, String(Date.now()));
    return n;
  } catch {
    return 0;
  }
}

export function getOpens(): number {
  try {
    return parseInt(localStorage.getItem(OPENS) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

/** Minutes écoulées depuis la première ouverture. */
export function minutesSinceFirst(): number {
  try {
    const first = parseInt(localStorage.getItem(FIRST) || "0", 10) || Date.now();
    return Math.floor((Date.now() - first) / 60000);
  } catch {
    return 0;
  }
}
