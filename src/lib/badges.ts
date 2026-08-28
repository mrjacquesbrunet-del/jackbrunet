"use client";

import { getSupabase } from "./supabase";
import { topIntercessors } from "./community";
import { fetchGameLeaderboard } from "./game-scores";

/**
 * Badges de profil — attribués AUTOMATIQUEMENT à partir de l'activité :
 *  - Intercesseur : nombre de « Je prie » donnés sur le mur
 *  - Encourageur : nombre de commentaires laissés sous les sujets
 *  - Fidèle : série de jours d'affilée (profiles.streak_days)
 *  - Expert de la Parole : points cumulés au Quiz biblique
 *  - Intercesseur de la semaine : n°1 du classement 7 jours (tourne chaque
 *    semaine, anneau doré animé)
 */

export type BadgeTier = "bronze" | "argent" | "or";
export type BadgeKind = "intercesseur" | "encourageur" | "fidele" | "expert";

export type BadgeState = {
  kind: BadgeKind;
  label: string;
  /** Palier atteint (null = pas encore gagné). */
  tier: BadgeTier | null;
  /** Compteur actuel. */
  count: number;
  /** Prochain seuil à atteindre (null = or déjà atteint). */
  next: number | null;
  /** Ce que mesure le badge (pour la vitrine). */
  detail: string;
};

export type ProfileBadges = {
  states: BadgeState[];
  /** Meilleur intercesseur de la semaine en cours. */
  weeklyTop: boolean;
};

export const BADGE_LABELS: Record<BadgeKind, string> = {
  intercesseur: "Intercesseur",
  encourageur: "Encourageur",
  fidele: "Fidèle",
  expert: "Expert de la Parole",
};

const THRESHOLDS: Record<BadgeKind, [number, number, number]> = {
  intercesseur: [50, 200, 500],
  encourageur: [25, 100, 300],
  fidele: [7, 30, 100],
  expert: [1500, 4000, 10000],
};

const DETAILS: Record<BadgeKind, string> = {
  intercesseur: "« Je prie » donnés sur le mur",
  encourageur: "encouragements laissés",
  fidele: "jours d'affilée avec Jésus",
  expert: "points au Quiz biblique",
};

function tierFor(kind: BadgeKind, count: number): { tier: BadgeTier | null; next: number | null } {
  const [b, a, o] = THRESHOLDS[kind];
  if (count >= o) return { tier: "or", next: null };
  if (count >= a) return { tier: "argent", next: o };
  if (count >= b) return { tier: "bronze", next: a };
  return { tier: null, next: b };
}

function state(kind: BadgeKind, count: number): BadgeState {
  const { tier, next } = tierFor(kind, count);
  return { kind, label: BADGE_LABELS[kind], tier, count, next, detail: DETAILS[kind] };
}

/** Calcule les badges d'un membre (streakDays vient du profil déjà chargé). */
export async function fetchProfileBadges(
  userId: string,
  streakDays?: number | null,
): Promise<ProfileBadges | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const [prays, comments, quizBoard, tops] = await Promise.all([
    sb
      .from("prayer_reactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("type", "pray"),
    sb
      .from("prayer_comments")
      .select("*", { count: "exact", head: true })
      .eq("author_id", userId),
    fetchGameLeaderboard("quiz", 200),
    topIntercessors(7, 1),
  ]);

  const praysN = prays.count ?? 0;
  const commentsN = comments.count ?? 0;
  const quizN = quizBoard.find((r) => r.user_id === userId)?.points ?? 0;
  const streakN = Math.max(0, Math.floor(streakDays ?? 0));

  return {
    states: [
      state("intercesseur", praysN),
      state("fidele", streakN),
      state("encourageur", commentsN),
      state("expert", quizN),
    ],
    weeklyTop: tops.length > 0 && tops[0].profile.id === userId && tops[0].score > 0,
  };
}
