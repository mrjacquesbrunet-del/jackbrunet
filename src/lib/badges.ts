"use client";

import { getSupabase } from "./supabase";
import { topIntercessors } from "./community";
import { fetchGameLeaderboard } from "./game-scores";

/**
 * Badges d'ACCOMPLISSEMENT — attribués automatiquement, avec paliers
 * bronze / argent / or, à partir de l'activité :
 *  - Intercesseur : « Je prie » donnés sur le mur (serveur)
 *  - Fidèle : série de jours d'affilée (profiles.streak_days)
 *  - Encourageur : commentaires laissés (serveur)
 *  - Expert de la Parole : points au Quiz biblique (serveur)
 *  - Méditant : méditations du jour complétées (compteur local, synchronisé)
 *  - Mémorisateur : versets appris PAR CŒUR (local, synchronisé)
 *  - Lecteur : jours de plans de lecture cochés (local, synchronisé)
 *  + Intercesseur de la semaine : n°1 des 7 jours (anneau doré, tourne).
 *
 * Les compteurs locaux sont envoyés 1×/jour dans profiles.stats pour que
 * les badges s'affichent aussi sur le profil vu par les autres.
 */

export type BadgeTier = "bronze" | "argent" | "or";
export type BadgeKind =
  | "intercesseur"
  | "fidele"
  | "encourageur"
  | "expert"
  | "meditant"
  | "memorisateur"
  | "lecteur";

export type BadgeState = {
  kind: BadgeKind;
  label: string;
  tier: BadgeTier | null;
  count: number;
  next: number | null;
  detail: string;
};

/** Titres à répétition (« ×N ») remportés au fil des semaines/mois. */
export type HonorKind = "champion_semaine" | "intercesseur_semaine" | "intercesseur_mois";
export type HonorCounts = Partial<Record<HonorKind, number>>;

export const HONOR_LABELS: Record<HonorKind, string> = {
  champion_semaine: "Champion de la semaine",
  intercesseur_semaine: "Intercesseur de la semaine",
  intercesseur_mois: "Intercesseur du mois",
};

export type ProfileBadges = {
  states: BadgeState[];
  weeklyTop: boolean;
  honors: HonorCounts;
};

export const BADGE_LABELS: Record<BadgeKind, string> = {
  intercesseur: "Intercesseur",
  fidele: "Fidèle",
  encourageur: "Encourageur",
  expert: "Expert de la Parole",
  meditant: "Méditant",
  memorisateur: "Mémorisateur",
  lecteur: "Lecteur",
};

export const BADGE_THRESHOLDS: Record<BadgeKind, [number, number, number]> = {
  intercesseur: [50, 200, 500],
  fidele: [7, 30, 100],
  encourageur: [25, 100, 300],
  expert: [1500, 4000, 10000],
  meditant: [10, 50, 200],
  memorisateur: [5, 20, 60],
  lecteur: [15, 60, 250],
};

const DETAILS: Record<BadgeKind, string> = {
  intercesseur: "« Je prie » donnés sur le mur",
  fidele: "jours d'affilée avec Jésus",
  encourageur: "encouragements laissés",
  expert: "points au Quiz biblique",
  meditant: "méditations complétées",
  memorisateur: "versets appris par cœur",
  lecteur: "jours de lecture cochés",
};

function tierFor(kind: BadgeKind, count: number): { tier: BadgeTier | null; next: number | null } {
  const [b, a, o] = BADGE_THRESHOLDS[kind];
  if (count >= o) return { tier: "or", next: null };
  if (count >= a) return { tier: "argent", next: o };
  if (count >= b) return { tier: "bronze", next: a };
  return { tier: null, next: b };
}

function state(kind: BadgeKind, count: number): BadgeState {
  const { tier, next } = tierFor(kind, count);
  return { kind, label: BADGE_LABELS[kind], tier, count, next, detail: DETAILS[kind] };
}

/* ---------- Compteurs spirituels LOCAUX (cet appareil) ---------- */

export type SpiritualStats = { meditations: number; memorized: number; reading: number };

export function localSpiritualStats(): SpiritualStats {
  const out: SpiritualStats = { meditations: 0, memorized: 0, reading: 0 };
  try {
    const eng = JSON.parse(localStorage.getItem("jb.engagement.v1") || "null") as {
      completedDates?: string[];
    } | null;
    out.meditations = eng?.completedDates?.length ?? 0;
  } catch {
    /* indisponible */
  }
  try {
    const mem = JSON.parse(localStorage.getItem("jb.memorize.v1") || "null") as
      | { level?: number }[]
      | null;
    out.memorized = (mem ?? []).filter((m) => (m.level ?? 0) >= 4).length;
  } catch {
    /* indisponible */
  }
  try {
    const plans = JSON.parse(localStorage.getItem("jb.planprogress.v1") || "null") as Record<
      string,
      number[]
    > | null;
    out.reading = Object.values(plans ?? {}).reduce((n, days) => n + (days?.length ?? 0), 0);
  } catch {
    /* indisponible */
  }
  return out;
}

/** Meilleur métal porté (pour l'anneau d'or autour de la photo). */
export function bestTier(pb: ProfileBadges): BadgeTier | null {
  if (pb.weeklyTop) return "or";
  if (Object.values(pb.honors ?? {}).some((n) => (n ?? 0) > 0)) return "or";
  const tiers = pb.states.map((s) => s.tier).filter(Boolean) as BadgeTier[];
  if (tiers.includes("or")) return "or";
  if (tiers.includes("argent")) return "argent";
  if (tiers.includes("bronze")) return "bronze";
  return null;
}

const TIER_SYNC_KEY = "jb.badgetier.sync.v2";

/**
 * Synchronise 1×/jour vers profiles : le meilleur métal (anneau doré de
 * l'avatar) ET les compteurs spirituels locaux (stats) pour que les badges
 * Méditant / Mémorisateur / Lecteur s'affichent chez les autres.
 */
export async function syncMyBadgeTier(userId: string, streakDays?: number | null): Promise<void> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(TIER_SYNC_KEY) === today) return;
    localStorage.setItem(TIER_SYNC_KEY, today);
  } catch {
    /* stockage indisponible : on synchronise quand même */
  }
  const sb = getSupabase();
  if (!sb) return;
  const stats = localSpiritualStats();
  const pb = await fetchProfileBadges(userId, streakDays, stats);
  if (!pb) return;
  await sb.from("profiles").update({ badge_tier: bestTier(pb), stats }).eq("id", userId);
}

/**
 * Calcule les badges d'un membre. `localStats` (facultatif) : compteurs
 * frais de CET appareil (pour soi-même) ; sinon on lit profiles.stats
 * (synchronisés) — c'est le cas quand on regarde le profil d'un autre.
 */
export async function fetchProfileBadges(
  userId: string,
  streakDays?: number | null,
  localStats?: SpiritualStats,
): Promise<ProfileBadges | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const [prays, comments, quizBoard, tops, prof, honorRows] = await Promise.all([
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
    localStats
      ? Promise.resolve(null)
      : sb.from("profiles").select("stats").eq("id", userId).maybeSingle(),
    sb.from("honors").select("kind").eq("user_id", userId),
  ]);

  const honors: HonorCounts = {};
  for (const r of ((honorRows?.data as { kind: HonorKind }[]) ?? [])) {
    honors[r.kind] = (honors[r.kind] ?? 0) + 1;
  }

  const remote = ((prof?.data?.stats as Partial<SpiritualStats>) ?? {}) || {};
  const stats: SpiritualStats = localStats ?? {
    meditations: Number(remote.meditations) || 0,
    memorized: Number(remote.memorized) || 0,
    reading: Number(remote.reading) || 0,
  };

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
      state("meditant", stats.meditations),
      state("memorisateur", stats.memorized),
      state("lecteur", stats.reading),
    ],
    weeklyTop: tops.length > 0 && tops[0].profile.id === userId && tops[0].score > 0,
    honors,
  };
}
