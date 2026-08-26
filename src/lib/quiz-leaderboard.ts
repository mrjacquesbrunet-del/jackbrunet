"use client";

import { getSupabase } from "./supabase";

/** Une ligne du classement mondial du Défi biblique (cumul à vie). */
export type QuizRow = {
  user_id: string;
  pseudo: string | null;
  avatar_url: string | null;
  verified?: boolean | null;
  coins: number;
  rank: number;
};

export type QuizMe = { coins: number; best: number; games: number; rank: number };

/** Ajoute les gains d'une partie au cumul mondial (utilisateur connecté). */
export async function submitQuizCoins(won: number, best: number): Promise<void> {
  const sb = getSupabase();
  if (!sb || won < 0) return;
  try {
    await sb.rpc("quiz_add", { p_coins: Math.round(won), p_best: Math.round(best) });
  } catch {
    /* hors-ligne / non connecté : le cumul local est conservé */
  }
}

/** Top du classement national (cumul de tous les temps, tous les joueurs). */
export async function fetchQuizLeaderboard(limit = 50): Promise<QuizRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data } = await sb.rpc("quiz_leaderboard", { p_limit: limit });
    return (data as QuizRow[]) || [];
  } catch {
    return [];
  }
}

/** Classement des amis (les membres que je suis + moi). Nécessite d'être
 * connecté ; renvoie [] sinon. */
export async function fetchQuizFriendsLeaderboard(limit = 100): Promise<QuizRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data } = await sb.rpc("quiz_leaderboard_friends", { p_limit: limit });
    return (data as QuizRow[]) || [];
  } catch {
    return [];
  }
}

/** Suis-je connecté ? (pour proposer l'onglet Amis ou inviter à se connecter). */
export async function isSignedIn(): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { data } = await sb.auth.getUser();
    return !!data.user;
  } catch {
    return false;
  }
}

/** Rang et cumul de l'utilisateur connecté (même s'il n'est pas dans le top). */
export async function fetchQuizMe(): Promise<QuizMe | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb.rpc("quiz_me");
    const row = Array.isArray(data) ? data[0] : data;
    return (row as QuizMe) || null;
  } catch {
    return null;
  }
}
