"use client";

import { getSupabase } from "./supabase";

/** Un jeu de la section Jeux. */
export type GameId = "quiz" | "vraifaux" | "memoriser" | "quisuisje" | "chrono";

/** Une ligne de classement (score = points/XP du jeu, ou cumul des trois). */
export type ScoreRow = {
  user_id: string;
  pseudo: string | null;
  avatar_url: string | null;
  points: number;
  rank: number;
};

/**
 * Envoie le score (points cumulés) de l'utilisateur pour un jeu.
 * Le serveur garde le meilleur (les points sont cumulatifs).
 * Sans effet si non connecté / Supabase indisponible.
 */
export async function submitGameScore(game: GameId, points: number): Promise<void> {
  const sb = getSupabase();
  if (!sb || !Number.isFinite(points) || points <= 0) return;
  try {
    await sb.rpc("game_submit", { p_game: game, p_points: Math.round(points) });
  } catch {
    /* hors ligne : on réessaiera à la prochaine partie */
  }
}

/** Classement d'un jeu (top joueurs, avec pseudo + photo). */
export async function fetchGameLeaderboard(game: GameId, limit = 50): Promise<ScoreRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data } = await sb.rpc("game_leaderboard", { p_game: game, p_limit: limit });
    return (data as ScoreRow[]) || [];
  } catch {
    return [];
  }
}

/** Classement général : cumul des points des trois jeux. */
export async function fetchTotalLeaderboard(limit = 50): Promise<ScoreRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data } = await sb.rpc("game_leaderboard_total", { p_limit: limit });
    return (data as ScoreRow[]) || [];
  } catch {
    return [];
  }
}

/**
 * Ligue de la semaine : ajoute les points d'une partie au pot de la semaine
 * en cours (repart chaque lundi). Sans effet si non connecté.
 */
export async function submitWeeklyPoints(points: number): Promise<void> {
  const sb = getSupabase();
  if (!sb || !Number.isFinite(points) || points <= 0) return;
  try {
    await sb.rpc("arcade_week_add", { p_points: Math.round(points) });
  } catch {
    /* hors ligne */
  }
}

/** Classement de la semaine en cours (tous jeux confondus). */
export async function fetchWeeklyLeague(limit = 50): Promise<ScoreRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data } = await sb.rpc("arcade_week_leaderboard", { p_limit: limit });
    return (data as ScoreRow[]) || [];
  } catch {
    return [];
  }
}

/**
 * Prévient MES ABONNÉS de mon score au Défi du jour (« Natchouu a marqué
 * 12 548 points au Défi du jour ! ») — au plus une fois par jour, via la
 * RPC notify_friends_score (notification + push, famille « Défis & duels »).
 */
export async function notifyFriendsScore(points: number): Promise<void> {
  const sb = getSupabase();
  if (!sb || !Number.isFinite(points) || points <= 0) return;
  try {
    const day = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem("jb.friendscore.sent") === day) return;
    localStorage.setItem("jb.friendscore.sent", day);
  } catch {
    /* stockage indisponible : le garde-fou serveur prend le relais */
  }
  try {
    await sb.rpc("notify_friends_score", { points: Math.round(points) });
  } catch {
    /* RPC pas encore installée */
  }
}

/** Id de l'utilisateur connecté (pour surligner sa ligne), ou null. */
export async function currentUserId(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}
