"use client";

import quizData from "../../content/quiz.json";

export type QuizQuestion = {
  id: number;
  difficulty: number; // 1 (très facile) → 6 (extrêmement dur)
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

/** Niveau de difficulté attendu pour un palier (1-indexé), sur 30 paliers,
 * réparti sur 6 tiers de 5 paliers : très facile → extrêmement dur.
 *  1-5 : très facile · 6-10 : facile · 11-15 : moyen ·
 *  16-20 : difficile · 21-25 : très difficile · 26-30 : extrêmement dur. */
export function tierForRung(rung: number): number {
  return Math.min(6, Math.floor((rung - 1) / 5) + 1);
}

/** Étiquette du niveau de difficulté (1-6). */
export const TIER_LABELS = [
  "Très facile",
  "Facile",
  "Moyen",
  "Difficile",
  "Très difficile",
  "Extrêmement dur",
];

/** Gain garanti si on se trompe : on garde le dernier palier franchi
 * (le montant de la dernière bonne réponse). */
export function guaranteedCoins(correctCount: number): number {
  if (correctCount <= 0) return 0;
  return LADDER[Math.min(correctCount, LADDER.length) - 1];
}

type Rng = () => number;

/** Mélange les 4 propositions d'une question et met à jour l'index correct,
 * pour que la bonne réponse ne soit jamais toujours à la même place. */
function shuffleOptions(q: QuizQuestion, rng: Rng = Math.random): QuizQuestion {
  const order = [0, 1, 2, 3];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
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

/* ---------------- Modes : Thèmes & Défi du jour ---------------- */

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Assemble une partie de 30 questions (difficulté croissante) avec un tirage
 * `rng` donné, en privilégiant éventuellement un sous-ensemble (`prefer`). */
function assembleGame(rng: Rng, prefer?: (q: QuizQuestion) => boolean): QuizQuestion[] {
  const used = new Set<number>();
  const pickFrom = (arr: QuizQuestion[]) => arr[Math.floor(rng() * arr.length)];
  const pick = (tier: number): QuizQuestion => {
    const free = (q: QuizQuestion) => !used.has(q.id);
    let pool = QUIZ.filter((q) => q.difficulty === tier && free(q) && (!prefer || prefer(q)));
    if (!pool.length) pool = QUIZ.filter((q) => q.difficulty === tier && free(q));
    if (!pool.length) pool = QUIZ.filter((q) => free(q) && (!prefer || prefer(q)));
    if (!pool.length) pool = QUIZ.filter(free);
    if (!pool.length) pool = QUIZ;
    const q = pickFrom(pool);
    used.add(q.id);
    return shuffleOptions(q, rng);
  };
  return Array.from({ length: LADDER.length }, (_, i) => pick(tierForRung(i + 1)));
}

/** Thèmes larges (regroupent plusieurs catégories) pour le mode « Thèmes ». */
export const THEMES: { id: string; label: string; cats: string[] }[] = [
  { id: "recits", label: "Récits & personnages", cats: ["Récits", "Personnages", "Familles", "Femmes", "Création", "Juges"] },
  { id: "jesus", label: "Jésus", cats: ["Jésus", "Vie de Jésus", "Paraboles"] },
  { id: "rois", label: "Rois & prophètes", cats: ["Rois", "Prophètes", "Rois & prophètes"] },
  { id: "eglise", label: "Église & apôtres", cats: ["Apôtres", "Église", "Épîtres", "Apocalypse"] },
  { id: "bible", label: "La Bible & la foi", cats: ["Bible", "Loi"] },
];

/** Partie sur un thème : privilégie les catégories du thème (complète au besoin). */
export function buildThemedGame(themeId: string): QuizQuestion[] {
  const cats = new Set(THEMES.find((t) => t.id === themeId)?.cats ?? []);
  const game = assembleGame(Math.random, (q) => cats.has(q.category));
  const merged = getSeenIds();
  for (const q of game) merged.add(q.id);
  saveSeen(merged);
  return game;
}

/** Clé du jour (année-mois-jour), pour un défi identique pour tous ce jour-là. */
function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function seedFromKey(k: string): number {
  let h = 2166136261;
  for (let i = 0; i < k.length; i++) {
    h ^= k.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Défi du jour : partie déterministe (mêmes questions pour tous aujourd'hui). */
export function buildDailyGame(): QuizQuestion[] {
  return assembleGame(mulberry32(seedFromKey(todayKey())));
}

/* ---- Série quotidienne (défi du jour) ---- */
const DAILY_KEY = "jb.quiz.daily.v1";
type DailyRec = { lastDate?: string; streak?: number };
function readDaily(): DailyRec {
  try {
    return JSON.parse(localStorage.getItem(DAILY_KEY) || "{}") as DailyRec;
  } catch {
    return {};
  }
}
/** { streak, doneToday } du défi du jour. */
export function getDailyState(): { streak: number; doneToday: boolean } {
  const r = readDaily();
  return { streak: r.streak || 0, doneToday: r.lastDate === todayKey() };
}
export function getQuizStreak(): number {
  return getDailyState().streak;
}
/** Marque le défi du jour comme fait ; prolonge ou réinitialise la série. */
export function markDailyDone(): { streak: number } {
  const r = readDaily();
  const t = todayKey();
  if (r.lastDate === t) return { streak: r.streak || 0 };
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const streak = r.lastDate === todayKey(y) ? (r.streak || 0) + 1 : 1;
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify({ lastDate: t, streak }));
  } catch {
    /* ignore */
  }
  return { streak };
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

/* -------- Reprise de partie (si on quitte sans finir) -------- */
const PROGRESS_KEY = "jb.quiz.progress.v1";
export type QuizProgress = {
  game: QuizQuestion[];
  step: number;
  usedJokers: { half: boolean; hint: boolean; poll: boolean };
  combo: number;
  source: "normal" | "daily" | "themed";
  savedAt: number;
};
/** Sauvegarde l'état de la partie en cours (pour pouvoir la reprendre). */
export function saveQuizProgress(p: QuizProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* stockage indisponible */
  }
}
/** Partie en cours à reprendre, ou null. */
export function getQuizProgress(): QuizProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as QuizProgress;
    if (!p || !Array.isArray(p.game) || p.game.length === 0) return null;
    if (typeof p.step !== "number" || p.step < 0 || p.step >= p.game.length) return null;
    return p;
  } catch {
    return null;
  }
}
/** Efface la partie en cours (fin de partie, ou nouvelle partie). */
export function clearQuizProgress(): void {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    /* ignore */
  }
}

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
