"use client";

import quizData from "../../content/quiz.json";

export type QuizQuestion = {
  id: number;
  difficulty: number; // 1 (facile) → 5 (très difficile)
  category: string;
  q: string;
  options: string[]; // 4 propositions
  correct: number; // index 0..3
  reference?: string;
  hint?: string;
};

export const QUIZ: QuizQuestion[] = (quizData as { items: QuizQuestion[] }).items;

/** Échelle des gains — 15 paliers. */
export const LADDER = [
  500, 1000, 2000, 3000, 5000, 7500, 10000, 12500, 15000, 25000, 50000, 100000, 250000, 500000,
  1000000,
];
/** Paliers « sûrs » (1-indexés) : le gain est garanti une fois atteints. */
export const SAFE_RUNGS = [5, 10];
/** Durée d'une question (secondes). */
export const QUESTION_TIME = 45;

/** Niveau de difficulté attendu pour un palier (1-indexé). */
export function tierForRung(rung: number): number {
  if (rung <= 3) return 1;
  if (rung <= 5) return 2;
  if (rung <= 8) return 3;
  if (rung <= 11) return 4;
  return 5;
}

/** Gain garanti si on se trompe alors qu'on a validé `correctCount` questions. */
export function guaranteedCoins(correctCount: number): number {
  let g = 0;
  for (const s of SAFE_RUNGS) if (correctCount >= s) g = LADDER[s - 1];
  return g;
}

/** Construit une partie : 15 questions, une par palier, difficulté croissante,
 * sans répétition (repli sur les autres niveaux si un niveau est épuisé). */
export function buildGame(): QuizQuestion[] {
  const used = new Set<number>();
  const pick = (tier: number): QuizQuestion => {
    let pool = QUIZ.filter((q) => q.difficulty === tier && !used.has(q.id));
    if (!pool.length) pool = QUIZ.filter((q) => !used.has(q.id));
    if (!pool.length) pool = QUIZ;
    const q = pool[Math.floor(Math.random() * pool.length)];
    used.add(q.id);
    return q;
  };
  return Array.from({ length: 15 }, (_, i) => pick(tierForRung(i + 1)));
}

/** Formatte un montant : 1 000 000 → « 1 000 000 ». */
export function formatCoins(n: number): string {
  return Math.round(n).toLocaleString("fr-FR").replace(/ /g, " ");
}

/* ---------------- État local (appareil) ---------------- */

const NAME_KEY = "jb.quiz.name.v1";
const COINS_KEY = "jb.quiz.coins.v1"; // cumul local (miroir du serveur)
const BEST_KEY = "jb.quiz.best.v1";
const GAMES_KEY = "jb.quiz.games.v1";
const BESTRUNG_KEY = "jb.quiz.bestrung.v1"; // meilleur palier atteint (1..15)

function read(key: string, def = 0): number {
  try {
    const v = Number(localStorage.getItem(key));
    return Number.isFinite(v) ? v : def;
  } catch {
    return def;
  }
}
function write(key: string, v: number | string) {
  try {
    localStorage.setItem(key, String(v));
  } catch {
    /* stockage indisponible */
  }
}

export function getQuizName(): string {
  try {
    return localStorage.getItem(NAME_KEY) || "";
  } catch {
    return "";
  }
}
export function setQuizName(name: string) {
  write(NAME_KEY, name.slice(0, 24));
}
export function getQuizCoins(): number {
  return read(COINS_KEY);
}
export function getQuizBest(): number {
  return read(BEST_KEY);
}
export function getQuizGames(): number {
  return read(GAMES_KEY);
}
/** Meilleur palier atteint (1..15), 0 si jamais joué. */
export function getQuizBestRung(): number {
  return read(BESTRUNG_KEY);
}

/** Enregistre le résultat d'une partie en local. Renvoie le nouveau cumul. */
export function recordQuizResult(
  won: number,
  rung = 0,
): { coins: number; best: number; bestRung: number } {
  const coins = getQuizCoins() + Math.max(0, won);
  const best = Math.max(getQuizBest(), Math.max(0, won));
  const bestRung = Math.max(getQuizBestRung(), Math.max(0, rung));
  write(COINS_KEY, coins);
  write(BEST_KEY, best);
  write(BESTRUNG_KEY, bestRung);
  write(GAMES_KEY, getQuizGames() + 1);
  return { coins, best, bestRung };
}
