"use client";

import { getSupabase } from "./supabase";
import { QUIZ } from "./quiz";
import { VF_ITEMS } from "./vraifaux";

export type ChallengeGame = "quiz" | "vraifaux";

/** Une question de défi, format unifié (Quiz = 4 options, V/F = 2 options). */
export type ChallengeItem = {
  q: string;
  options: string[];
  correct: number;
  reference?: string;
};

export const CHALLENGE_LEN = 10;

/* RNG déterministe (même seed → même deck pour les deux joueurs). */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffled<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Construit le deck de 10 questions d'un défi, identique pour un même seed. */
export function buildChallengeDeck(game: ChallengeGame, seed: number): ChallengeItem[] {
  const rng = mulberry32(seed);
  if (game === "vraifaux") {
    return shuffled(VF_ITEMS, rng)
      .slice(0, CHALLENGE_LEN)
      .map((it) => ({
        q: it.text,
        options: ["Vrai", "Faux"],
        correct: it.answer ? 0 : 1,
        reference: it.reference,
      }));
  }
  // Quiz : 10 questions, options remélangées de façon déterministe.
  return shuffled(QUIZ, rng)
    .slice(0, CHALLENGE_LEN)
    .map((it) => {
      const idx = it.options.map((_, i) => i);
      const order = shuffled(idx, rng);
      const options = order.map((i) => it.options[i]);
      const correct = order.indexOf(it.correct);
      return { q: it.q, options, correct, reference: it.reference };
    });
}

/** Nouveau seed aléatoire (32 bits). */
export function newSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

/* ---------------- Accès Supabase ---------------- */

export type ChallengeRow = {
  id: string;
  game: ChallengeGame;
  seed: number;
  status: "pending" | "done";
  created_at: string;
  i_am_challenger: boolean;
  challenger_id: string;
  challenger_pseudo: string | null;
  challenger_avatar: string | null;
  challenger_score: number;
  opponent_id: string;
  opponent_pseudo: string | null;
  opponent_avatar: string | null;
  opponent_score: number | null;
};

/** Crée un défi (le défieur a déjà joué). Renvoie l'id, ou null. */
export async function createChallenge(
  game: ChallengeGame,
  seed: number,
  opponentId: string,
  score: number,
): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb.rpc("challenge_create", {
      p_game: game,
      p_seed: seed,
      p_opponent: opponentId,
      p_score: score,
    });
    return (data as string) ?? null;
  } catch {
    return null;
  }
}

/** L'ami répond au défi. */
export async function answerChallenge(id: string, score: number): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.rpc("challenge_answer", { p_id: id, p_score: score });
  } catch {
    /* hors ligne */
  }
}

/** Liste des défis (reçus + envoyés) de l'utilisateur. */
export async function listChallenges(): Promise<ChallengeRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data } = await sb.rpc("challenges_list");
    return (data as ChallengeRow[]) || [];
  } catch {
    return [];
  }
}

/** Nombre de défis reçus à relever (pour la pastille). */
export async function pendingChallenges(): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;
  try {
    const { data } = await sb.rpc("challenges_pending");
    return (data as number) || 0;
  } catch {
    return 0;
  }
}
