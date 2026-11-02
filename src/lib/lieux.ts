"use client";

import { getSupabase } from "./supabase";
import type { Profile } from "./community";

/** Église ou ville : on retrouve les membres qui y sont rattachés. */
export type TypeLieu = "eglise" | "ville";

/** Membres d'une église ou d'une ville (la ville respecte la confidentialité
 * de chacun). `null` si la fonction SQL n'est pas encore installée. */
export async function membresDuLieu(type: TypeLieu, valeur: string): Promise<Profile[] | null> {
  const sb = getSupabase();
  if (!sb || !valeur.trim()) return [];
  const { data, error } = await sb.rpc("membres_du_lieu", { p_type: type, p_valeur: valeur.trim(), p_limite: 300 });
  if (error) return null;
  return (data as Profile[]) ?? [];
}

/** Églises déjà renseignées par des membres (même orthographe pour tous). */
export async function eglisesExistantes(q: string): Promise<{ nom: string; membres: number }[]> {
  const sb = getSupabase();
  if (!sb || q.trim().length < 2) return [];
  const { data, error } = await sb.rpc("eglises_existantes", { q: q.trim() });
  if (error || !data) return [];
  return (data as { nom: string; membres: number }[]).map((r) => ({ nom: r.nom, membres: Number(r.membres) || 0 }));
}
