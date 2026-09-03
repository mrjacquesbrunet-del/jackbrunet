"use client";

import { getSupabase } from "./supabase";

/** Un jeu de la section Jeux. */
export type GameId = "quiz" | "vraifaux" | "memoriser" | "quisuisje" | "chrono" | "fronde" | "berger" | "chemin";

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

/* ---------- Ligue à DIVISIONS (Élite · Or · Argent · Bronze) ---------- */

export type LeagueRow = ScoreRow & { division: number };

export const LEAGUE_DIVISIONS: { n: number; name: string; color: string }[] = [
  { n: 1, name: "Élite", color: "#CAF000" },
  { n: 2, name: "Or", color: "#FCD34D" },
  { n: 3, name: "Argent", color: "#E5E7EB" },
  { n: 4, name: "Bronze", color: "#E0A56B" },
];

export function leagueDivisionMeta(n: number) {
  return LEAGUE_DIVISIONS.find((d) => d.n === n) ?? LEAGUE_DIVISIONS[3];
}

/**
 * Classement de MA division pour la semaine en cours (ou d'une division
 * donnée). Chaque dimanche soir : phase de remplissage (moitié haute)
 * tant que la ligue du dessus a peu de joueurs, puis 3 montent /
 * 3 descendent.
 */
export async function fetchLeagueStandings(division?: number): Promise<LeagueRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data } = await sb.rpc("league_standings", {
      p_division: division ?? null,
    });
    return (data as LeagueRow[]) || [];
  } catch {
    return [];
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
