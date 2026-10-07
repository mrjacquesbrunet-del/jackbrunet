"use client";

import { submitToBrevo } from "./brevo";
import { BREVO_ENDPOINTS } from "@/config/brevo";

/** Accord donné pour la newsletter (case de l'accueil de l'app). */
export const NEWSLETTER_OPTIN = "jb.newsletter.optin";

/**
 * Ajoute l'email d'un membre connecté à la liste NEWSLETTER de Brevo, côté
 * navigateur (aucune clé API exposée), SEULEMENT s'il a coché la case
 * d'accord (RGPD / LGPD : jamais de case pré-cochée ni d'inscription
 * marketing implicite). Tous les membres restent, eux, dans la liste
 * « membres » (useAuth). Envoyé une seule fois par email/appareil.
 */
export async function captureEmail(email?: string | null) {
  const e = (email?? "").trim().toLowerCase();
  if (!e ||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return;
  try {
    if (localStorage.getItem(NEWSLETTER_OPTIN) !== "1") return;
  } catch {
    return;
  }
  const key = `jb.brevo.captured.${e}`;
  try {
    if (localStorage.getItem(key)) return;
  } catch {
    /* stockage indisponible */
  }
  const endpoint = BREVO_ENDPOINTS.newsletter;
  if (!endpoint) return;
  try {
    await submitToBrevo(endpoint, { EMAIL: e });
    try {
      localStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
  } catch {
    /* on réessaiera à la prochaine connexion */
  }
}
