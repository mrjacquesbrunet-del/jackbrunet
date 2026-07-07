"use client";

import { getSupabase } from "./supabase";

/** Statistiques de collecte de la mission, lues en direct depuis Supabase. */
export type MissionStats = { raised: number; objective: number };

export async function getMissionStats(): Promise<MissionStats | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
.from("mission_stats")
.select("raised_eur, objective_eur")
.eq("id", 1)
.single();
  if (error ||!data) return null;
  return {
    raised: Number(data.raised_eur) || 0,
    objective: Number(data.objective_eur) || 0,
  };
}

/** Admin: définit le montant collecté (se met à jour en direct sur le site). */
export async function setMissionRaised(val: number): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.rpc("set_mission_raised", { val });
  return!error;
}
