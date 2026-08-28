"use client";

import data from "../../content/whoami.json";

export type WhoItem = {
  id: number;
  difficulty: number; // 1 facile · 2 moyen · 3 difficile · 4 hard
  name: string;
  clues: string[]; // du plus cryptique (0) au plus évident (3)
};

export const WHO_ITEMS: WhoItem[] = (data as { items: WhoItem[] }).items;
export const WHO_LEVELS = ["Facile", "Moyen", "Difficile", "Hard"];
export const WHO_ROUND = 6; // personnages par partie
export const WHO_MAX_CLUES = 4;

/** Points selon le nombre d'indices utilisés (1 à 4). */
export function whoPoints(cluesUsed: number): number {
  return [100, 70, 40, 20][Math.min(WHO_MAX_CLUES, Math.max(1, cluesUsed)) - 1];
}

/* Fraîcheur : on évite de reproposer les mêmes personnages. */
const SEEN_KEY = "jb.whoami.seen.v1";
function getSeen(): Set<number> {
  try {
    const raw = JSON.parse(localStorage.getItem(SEEN_KEY) || "[]");
    return new Set(Array.isArray(raw) ? (raw as number[]) : []);
  } catch {
    return new Set();
  }
}
function markSeen(ids: number[]) {
  try {
    const merged = Array.from(new Set([...getSeen(), ...ids]));
    localStorage.setItem(SEEN_KEY, JSON.stringify(merged));
  } catch {
    /* ignore */
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type WhoRound = { item: WhoItem; options: string[] };

/** Construit une partie pour un niveau (1-4) : WHO_ROUND personnages frais. */
export function buildWhoRound(level: number): WhoRound[] {
  const pool = WHO_ITEMS.filter((w) => w.difficulty === level);
  const seen = getSeen();
  let fresh = pool.filter((w) => !seen.has(w.id));
  if (fresh.length < WHO_ROUND) {
    // Banque épuisée pour ce niveau : on repart à neuf.
    try {
      const rest = Array.from(seen).filter((id) => !pool.some((w) => w.id === id));
      localStorage.setItem(SEEN_KEY, JSON.stringify(rest));
    } catch {
      /* ignore */
    }
    fresh = pool;
  }
  const chosen = shuffle(fresh).slice(0, Math.min(WHO_ROUND, pool.length));
  markSeen(chosen.map((w) => w.id));

  const allNames = WHO_ITEMS.map((w) => w.name);
  return chosen.map((item) => {
    const others = shuffle(allNames.filter((n) => n !== item.name)).slice(0, 3);
    const options = shuffle([item.name, ...others]);
    return { item, options };
  });
}

/* ---------------- Records locaux ---------------- */
const BEST_KEY = "jb.whoami.best.v1";
const GAMES_KEY = "jb.whoami.games.v1";
const XP_KEY = "jb.whoami.xp.v1";
const CORRECT_KEY = "jb.whoami.correct.v1"; // total de bonnes réponses (cumulé)
const STREAK_KEY = "jb.whoami.streak.v1"; // meilleure série (consécutives)

function read(key: string): number {
  try {
    const v = Number(localStorage.getItem(key));
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
}
function write(key: string, v: number) {
  try {
    localStorage.setItem(key, String(v));
  } catch {
    /* ignore */
  }
}

export function getWhoBest(): number {
  return read(BEST_KEY);
}
export function getWhoGames(): number {
  return read(GAMES_KEY);
}
export function getWhoXp(): number {
  return read(XP_KEY);
}
export function getWhoCorrect(): number {
  return read(CORRECT_KEY);
}
export function getWhoStreak(): number {
  return read(STREAK_KEY);
}

/** Enregistre une partie : meilleur score + parties + XP + bonnes réponses + meilleure série. */
export function recordWho(score: number, correct = 0, streak = 0): { best: number } {
  const best = Math.max(getWhoBest(), Math.max(0, score));
  write(BEST_KEY, best);
  write(GAMES_KEY, getWhoGames() + 1);
  write(XP_KEY, getWhoXp() + Math.max(0, Math.round(score / 10)));
  write(CORRECT_KEY, getWhoCorrect() + Math.max(0, correct));
  write(STREAK_KEY, Math.max(getWhoStreak(), Math.max(0, streak)));
  return { best };
}
