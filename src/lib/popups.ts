"use client";

/**
 * Fenêtres automatiques de l'app (rappel du matin, note, appel au don, astuce
 * du menu…) : UNE SEULE par ouverture de l'app, jamais par-dessus une autre
 * fenêtre, et rien d'autre le jour de l'accueil (sauf le rappel du matin, qui
 * suit l'accueil). La variable vit le temps d'un lancement : à la prochaine
 * ouverture, la suivante pourra passer.
 */

let prise: string | null = null;

/** Une fenêtre est-elle déjà ouverte à l'écran ? */
function fenetreOuverte(): boolean {
  try {
    return !!document.querySelector('[aria-modal="true"], [role="dialog"]');
  } catch {
    return false;
  }
}

/** Le premier lancement (jour de l'accueil) : on laisse la personne découvrir. */
function jourDeLAccueil(): boolean {
  try {
    const premiere = parseInt(localStorage.getItem("jb.usage.first") || "0", 10);
    return !premiere || Date.now() - premiere < 20 * 3600 * 1000;
  } catch {
    return false;
  }
}

/**
 * Réserve la place de la fenêtre automatique de ce lancement. Renvoie false
 * si une autre l'a déjà prise, si une fenêtre est ouverte, ou (sauf
 * `memeLeJourDeLAccueil`) pendant les premières heures d'utilisation.
 */
export function prendreFenetreAuto(nom: string, memeLeJourDeLAccueil = false): boolean {
  if (prise && prise !== nom) return false;
  // Jamais par-dessus le choix d'un nouveau mot de passe.
  try {
    if (window.location.pathname.startsWith("/reinitialiser-mot-de-passe")) return false;
  } catch {
    /* ignore */
  }
  if (fenetreOuverte()) return false;
  if (!memeLeJourDeLAccueil && jourDeLAccueil()) return false;
  prise = nom;
  return true;
}
