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

/** Échelle des gains — 30 paliers, du plus facile au million. */
export const LADDER = [
  100, 200, 300, 500, 1000, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 30000, 40000, 50000,
  65000, 80000, 100000, 125000, 150000, 200000, 250000, 300000, 350000, 400000, 500000, 600000,
  750000, 850000, 1000000,
];
/** Paliers « sûrs » (1-indexés) : le gain est garanti une fois atteints.
 * En cas d'erreur, on retombe au dernier filet franchi (0, 10 ou 20). */
export const SAFE_RUNGS = [10, 20];
/** Durée d'une question (secondes). */
export const QUESTION_TIME = 45;

/** Niveau de difficulté attendu pour un palier (1-indexé), sur 30 paliers :
 * facile au départ, de plus en plus difficile. */
export function tierForRung(rung: number): number {
  if (rung <= 6) return 1;
  if (rung <= 12) return 2;
  if (rung <= 18) return 3;
  if (rung <= 24) return 4;
  return 5;
}

/** Gain garanti si on se trompe alors qu'on a validé `correctCount` questions. */
export function guaranteedCoins(correctCount: number): number {
  let g = 0;
  for (const s of SAFE_RUNGS) if (correctCount >= s) g = LADDER[s - 1];
  return g;
}

/** Mélange les 4 propositions d'une question et met à jour l'index correct,
 * pour que la bonne réponse ne soit jamais toujours à la même place. */
function shuffleOptions(q: QuizQuestion): QuizQuestion {
  const order = [0, 1, 2, 3];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const options = order.map((k) => q.options[k]);
  return { ...q, options, correct: order.indexOf(q.correct) };
}

const SEEN_KEY = "jb.quiz.seen.v1"; // ids déjà tombés (fraîcheur des questions)

function getSeenIds(): Set<number> {
  try {
    const raw = JSON.parse(localStorage.getItem(SEEN_KEY) || "[]");
    return new Set(Array.isArray(raw) ? (raw as number[]) : []);
  } catch {
    return new Set();
  }
}
function saveSeen(ids: Set<number>) {
  try {
    // Quand toute la banque a été vue, on repart pour un cycle neuf.
    const next = ids.size >= QUIZ.length ? [] : Array.from(ids);
    localStorage.setItem(SEEN_KEY, JSON.stringify(next));
  } catch {
    /* stockage indisponible */
  }
}

/** Construit une partie : une question par palier (30), difficulté croissante.
 * Les questions déjà vues sont évitées en priorité (renouvellement à chaque
 * partie), et les propositions sont remélangées (anti-« toujours A »). */
export function buildGame(): QuizQuestion[] {
  const seen = getSeenIds();
  const used = new Set<number>();
  const pick = (tier: number): QuizQuestion => {
    // Priorité : ce niveau, non joué dans cette partie ET jamais vu.
    let pool = QUIZ.filter((q) => q.difficulty === tier && !used.has(q.id) && !seen.has(q.id));
    if (!pool.length) pool = QUIZ.filter((q) => q.difficulty === tier && !used.has(q.id));
    if (!pool.length) pool = QUIZ.filter((q) => !used.has(q.id) && !seen.has(q.id));
    if (!pool.length) pool = QUIZ.filter((q) => !used.has(q.id));
    if (!pool.length) pool = QUIZ;
    const q = pool[Math.floor(Math.random() * pool.length)];
    used.add(q.id);
    return shuffleOptions(q);
  };
  const game = Array.from({ length: LADDER.length }, (_, i) => pick(tierForRung(i + 1)));
  // Mémorise les questions vues pour renouveler les prochaines parties.
  const merged = getSeenIds();
  for (const q of game) merged.add(q.id);
  saveSeen(merged);
  return game;
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

/* ---------------- Badges / trophées ---------------- */

export type Achievement = { id: string; name: string; desc: string };

/** Liste des trophées à débloquer (dans l'ordre d'affichage). */
export const ACHIEVEMENTS: Achievement[] = [
  { id: "first", name: "Premier pas", desc: "Jouer ta première partie" },
  { id: "streak5", name: "En forme", desc: "5 bonnes réponses d'affilée" },
  { id: "safe1", name: "Premier filet", desc: "Atteindre le palier 10" },
  { id: "nojoker10", name: "En autonomie", desc: "Atteindre le palier 10 sans joker" },
  { id: "streak10", name: "Série de 10", desc: "10 bonnes réponses d'affilée" },
  { id: "safe2", name: "Sang-froid", desc: "Atteindre le palier 20" },
  { id: "games10", name: "Fidèle", desc: "Jouer 10 parties" },
  { id: "coins100k", name: "Trésorier", desc: "Cumuler 100 000 pièces" },
  { id: "games50", name: "Passionné", desc: "Jouer 50 parties" },
  { id: "million", name: "Millionnaire", desc: "Atteindre le million (palier 30)" },
  { id: "coins1m", name: "Maître de la Parole", desc: "Cumuler 1 000 000 au total" },
];

const ACH_KEY = "jb.quiz.ach.v1";

/** Ids des trophées déjà débloqués. */
export function getUnlockedAchievements(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(ACH_KEY) || "[]");
    return new Set(Array.isArray(raw) ? (raw as string[]) : []);
  } catch {
    return new Set();
  }
}

/** Débloque des trophées ; renvoie la liste de ceux réellement nouveaux. */
export function unlockAchievements(ids: string[]): Achievement[] {
  const have = getUnlockedAchievements();
  const fresh = ids.filter((id) => !have.has(id));
  if (!fresh.length) return [];
  for (const id of fresh) have.add(id);
  try {
    localStorage.setItem(ACH_KEY, JSON.stringify(Array.from(have)));
  } catch {
    /* stockage indisponible */
  }
  return ACHIEVEMENTS.filter((a) => fresh.includes(a.id));
}

/** Évalue les trophées atteignables après une partie et les débloque.
 * Renvoie les nouveaux trophées (pour l'animation de fin). */
export function evaluateAchievements(stats: {
  rung: number;
  maxCombo: number;
  usedJoker: boolean;
  games: number;
  coins: number;
}): Achievement[] {
  const got: string[] = ["first"];
  if (stats.maxCombo >= 5) got.push("streak5");
  if (stats.maxCombo >= 10) got.push("streak10");
  if (stats.rung >= 10) got.push("safe1");
  if (stats.rung >= 10 && !stats.usedJoker) got.push("nojoker10");
  if (stats.rung >= 20) got.push("safe2");
  if (stats.rung >= LADDER.length) got.push("million");
  if (stats.games >= 10) got.push("games10");
  if (stats.games >= 50) got.push("games50");
  if (stats.coins >= 100000) got.push("coins100k");
  if (stats.coins >= 1000000) got.push("coins1m");
  return unlockAchievements(got);
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
