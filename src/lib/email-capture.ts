"use client";

import { submitToBrevo } from "./brevo";
import { BREVO_ENDPOINTS } from "@/config/brevo";

/**
 * Ajoute automatiquement l'email d'un membre connecté (mur de prière, app…)
 * dans la liste de contacts Brevo — la même que la newsletter, côté navigateur
 * (aucune clé API exposée). Envoyé une seule fois par email/appareil.
 */
export async function captureEmail(email?: string | null) {
  const e = (email?? "").trim().toLowerCase();
  if (!e ||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return;
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
