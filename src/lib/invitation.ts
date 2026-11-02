"use client";

import { getSupabase } from "./supabase";
import { appShareUrl } from "@/config/app-links";
import { shareText } from "./share";

/**
 * Inviter ses amis : un lien personnel qui ouvre mon profil dans l'app.
 * Quand un nouveau membre arrive par ce lien et crée son compte, il me suit
 * et je le suis (fonction SQL accepter_invitation), et je suis prévenu.
 */
const CLE = "jb.parrain";
const VALIDITE_MS = 30 * 86_400_000;

export function lienInvitation(userId: string): string {
  return appShareUrl(`/membre?u=${userId}&invite=${userId}`);
}

/** Ouvre la feuille de partage avec le lien d'invitation. */
export async function inviterDesAmis(userId: string, pseudo?: string | null): Promise<boolean> {
  const texte =
    `Rejoins-moi sur RHEMA, l'app pour prier, lire la Bible et avancer ensemble avec Jésus.` +
    (pseudo ? ` Retrouve-moi : ${pseudo}.` : "") +
    ` Une fois l'app installée, rouvre ce lien pour qu'on soit amis directement.`;
  const ok = await shareText(texte, lienInvitation(userId));
  if (!ok) {
    try {
      await navigator.clipboard?.writeText(`${texte} ${lienInvitation(userId)}`);
    } catch {
      /* presse-papiers indisponible */
    }
  }
  return ok;
}

/** Garde de côté qui m'a invité (avant même la création du compte). */
export function memoriserParrain(id: string) {
  try {
    localStorage.setItem(CLE, JSON.stringify({ id, t: Date.now() }));
  } catch {
    /* stockage indisponible */
  }
}

let enCours: Promise<boolean> | null = null;

/** Une fois connecté : on valide l'invitation (une seule fois, compte récent). */
export function validerInvitationEnAttente(meId: string): Promise<boolean> {
  // Plusieurs écrans peuvent le demander en même temps : un seul appel.
  if (!enCours) enCours = valider(meId).finally(() => (enCours = null));
  return enCours;
}

async function valider(meId: string): Promise<boolean> {
  let parrain: { id?: string; t?: number } | null = null;
  try {
    parrain = JSON.parse(localStorage.getItem(CLE) ?? "null");
  } catch {
    parrain = null;
  }
  if (!parrain?.id) return false;
  const sb = getSupabase();
  if (!sb) return false;
  if (parrain.id === meId || Date.now() - (parrain.t ?? 0) > VALIDITE_MS) {
    localStorage.removeItem(CLE);
    return false;
  }
  const { data, error } = await sb.rpc("accepter_invitation", { p_parrain: parrain.id });
  // Erreur réseau : on réessaiera au prochain lancement ; sinon c'est réglé.
  if (!error) localStorage.removeItem(CLE);
  return !error && data === true;
}
