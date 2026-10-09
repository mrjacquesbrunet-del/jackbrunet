"use client";

import { getSupabase } from "./supabase";
import { profilesByIds, type Profile } from "./community";

/** Avis / commentaire laissé sur un plan de lecture. */
export type PlanComment = {
  id: string;
  plan_slug: string;
  user_id: string;
  body: string;
  created_at: string;
  author?: Profile;
};

/** Commentaires d'un plan, les plus récents d'abord, avec leur auteur. */
export async function listPlanComments(slug: string): Promise<PlanComment[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("plan_comments")
    .select("*")
    .eq("plan_slug", slug)
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data as PlanComment[]) ?? [];
  const profs = await profilesByIds(rows.map((c) => c.user_id));
  return rows.map((c) => ({ ...c, author: profs[c.user_id] }));
}

/** Nombre de commentaires par plan, en un appel. */
export async function planCommentCounts(): Promise<Record<string, number>> {
  const sb = getSupabase();
  if (!sb) return {};
  const { data, error } = await sb.rpc("plan_comments_counts");
  if (error || !data) return {};
  const map: Record<string, number> = {};
  for (const r of data as { plan_slug: string; cnt: number }[]) map[r.plan_slug] = Number(r.cnt) || 0;
  return map;
}

/** Publie un commentaire ; renvoie la ligne créée, ou null en cas d'échec. */
export async function addPlanComment(slug: string, userId: string, body: string): Promise<PlanComment | null> {
  const sb = getSupabase();
  const texte = body.trim().slice(0, 1000);
  if (!sb || !texte) return null;
  const { data, error } = await sb
    .from("plan_comments")
    .insert({ plan_slug: slug, user_id: userId, body: texte })
    .select("*")
    .single();
  if (error || !data) return null;
  return data as PlanComment;
}

export async function deletePlanComment(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("plan_comments").delete().eq("id", id);
  return !error;
}
