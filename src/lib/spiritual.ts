"use client";

/**
 * « X ans avec Jésus » — à partir de la date de conversion renseignée sur le
 * profil (profiles.converted_at). Renvoie null si la date est absente/invalide.
 */
export function withJesusLabel(convertedAt?: string | null): string | null {
  if (!convertedAt) return null;
  const t = new Date(convertedAt).getTime();
  if (!Number.isFinite(t) || t > Date.now()) return null;
  const days = Math.floor((Date.now() - t) / 86_400_000);
  if (days < 31) return "Nouveau en Christ";
  const months = Math.floor(days / 30.44);
  if (months < 12) return `${months} mois avec Jésus`;
  const years = Math.floor(days / 365.25);
  return `${years} an${years > 1 ? "s" : ""} avec Jésus`;
}

/** Seuil à partir duquel la série s'affiche publiquement (flamme). */
export const STREAK_BADGE_MIN = 7;
