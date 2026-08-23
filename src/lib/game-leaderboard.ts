"use client";

import { getSupabase } from "./supabase";

/** Une ligne de classement (profil + points de la semaine). */
export type LeaderRow = {
  user_id: string;
  pseudo: string | null;
  avatar_url: string | null;
  verified?: boolean | null;
  points: number;
};

export type PastChampion = LeaderRow & { week: string };

/** Ajoute les points d'une partie au total de la semaine (utilisateur connecté). */
export async function submitWeeklyPoints(points: number): Promise<void> {
  const sb = getSupabase();
  if (!sb || points <= 0) return;
  try {
    await sb.rpc("add_game_points", { p_points: Math.round(points) });
  } catch {
    /* hors-ligne / non connecté : le score local reste, on réessaiera plus tard */
  }
}

/** Classement de la semaine en cours (top joueurs). */
export async function fetchWeeklyLeaderboard(): Promise<LeaderRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data } = await sb.rpc("weekly_leaderboard");
    return (data as LeaderRow[]) || [];
  } catch {
    return [];
  }
}

/** Champions des semaines terminées (1er de chaque semaine). */
export async function fetchPastChampions(): Promise<PastChampion[]> {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data } = await sb.rpc("past_champions");
    return (data as PastChampion[]) || [];
  } catch {
    return [];
  }
}
