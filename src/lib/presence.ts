"use client";

import { getSupabase } from "./supabase";

/**
 * Présence : « En ligne » / « Actif il y a X ».
 * L'app signale régulièrement l'activité (profiles.last_seen_at) ; les profils
 * et conversations affichent l'état. Seuil « en ligne » : moins de 3 minutes.
 */

const PING_MS = 60_000; // au plus une mise à jour par minute
const ONLINE_MS = 3 * 60_000;

let lastPing = 0;

/** Signale que l'utilisateur est actif (throttlé, sans await nécessaire). */
export function pingPresence(userId: string | null | undefined): void {
  if (!userId) return;
  const now = Date.now();
  if (now - lastPing < PING_MS) return;
  lastPing = now;
  const sb = getSupabase();
  if (!sb) return;
  void sb
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", userId)
    .then(() => {});
}

/** Libellé de présence pour un profil (null = ne rien afficher). */
export function presenceLabel(lastSeenAt: string | null | undefined): { online: boolean; label: string } | null {
  if (!lastSeenAt) return null;
  const t = new Date(lastSeenAt).getTime();
  if (!Number.isFinite(t)) return null;
  const diff = Date.now() - t;
  if (diff < ONLINE_MS) return { online: true, label: "En ligne" };
  const min = Math.floor(diff / 60_000);
  if (min < 60) return { online: false, label: `Actif il y a ${min} min` };
  const h = Math.floor(min / 60);
  if (h < 24) return { online: false, label: `Actif il y a ${h} h` };
  const d = Math.floor(h / 24);
  if (d <= 7) return { online: false, label: d === 1 ? "Actif hier" : `Actif il y a ${d} j` };
  return null; // au-delà d'une semaine, on n'affiche rien
}
