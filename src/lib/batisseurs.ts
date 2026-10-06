"use client";

import { getSupabase } from "./supabase";

/**
 * Les Bâtisseurs : les membres qui soutiennent l'app (achat intégré).
 * Avantages : badge exclusif sur le profil et la communauté, et invitation
 * au Zoom mensuel avec Pasteur Jack (envoyée par Jack). Le statut est posé côté Supabase par un
 * trigger à l'enregistrement d'un soutien (profiles.batisseur_depuis).
 */

/** Date du premier soutien de la personne, ou null. */
export async function batisseurDepuis(userId?: string | null): Promise<string | null> {
  const sb = getSupabase();
  if (!sb || !userId) return null;
  const { data, error } = await sb.from("profiles").select("batisseur_depuis").eq("id", userId).maybeSingle();
  if (error || !data) return null;
  return (data as { batisseur_depuis?: string | null }).batisseur_depuis ?? null;
}

export type SoutienAdmin = {
  id: number;
  user_id: string | null;
  produit: string;
  montant: number | null;
  devise: string | null;
  plateforme: string | null;
  created_at: string;
  pseudo?: string | null;
};

/** Liste des soutiens (admin), avec le pseudo de chacun. */
export async function listSoutiens(): Promise<SoutienAdmin[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("soutiens")
    .select("id,user_id,produit,montant,devise,plateforme,created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return null;
  const rows = (data ?? []) as SoutienAdmin[];
  const ids = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean))) as string[];
  if (ids.length) {
    const { data: profs } = await sb.from("profiles").select("id,pseudo").in("id", ids);
    const map = new Map(((profs ?? []) as { id: string; pseudo: string }[]).map((p) => [p.id, p.pseudo]));
    rows.forEach((r) => (r.pseudo = r.user_id ? map.get(r.user_id) ?? null : null));
  }
  return rows;
}
