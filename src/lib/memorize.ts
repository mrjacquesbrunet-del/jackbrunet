"use client";

import { useSyncExternalStore } from "react";

/**
 * Mémorisation de versets, 100 % côté client (localStorage), compatible
 * export statique. Chaque verset progresse par étapes : plus l'étape est
 * haute, plus de mots sont masqués à l'entraînement, jusqu'au « par cœur ».
 */

export type MemorizeItem = {
  id: string;
  reference: string;
  text: string;
  addedAt: number;
  /** Étape atteinte : 0 (découverte) → 4 (mémorisé). */
  level: number;
  lastAt?: number;
};

const KEY = "jb.memorize.v1";
export const MEMORIZE_MAX_LEVEL = 4;

let items: MemorizeItem[] = [];
let loaded = false;
const listeners = new Set<() => void>();
let snapshot: MemorizeItem[] = items;

function load() {
  if (loaded || typeof localStorage === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) items = JSON.parse(raw) as MemorizeItem[];
  } catch {
    items = [];
  }
  snapshot = items;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* stockage indisponible */
  }
  snapshot = [...items];
  listeners.forEach((l) => l());
}

function normId(reference: string): string {
  return reference.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Ajoute un verset à mémoriser (sans doublon). Renvoie true si ajouté. */
export function addMemorizeVerse(reference: string, text: string): boolean {
  load();
  const id = normId(reference);
  if (items.some((it) => it.id === id)) return false;
  items = [
    { id, reference: reference.trim(), text: text.trim(), addedAt: Date.now(), level: 0 },
    ...items,
  ];
  persist();
  return true;
}

export function removeMemorizeVerse(id: string) {
  load();
  items = items.filter((it) => it.id !== id);
  persist();
}

/** Valide une récitation : passe à l'étape suivante (plafonnée). */
export function advanceMemorize(id: string) {
  load();
  items = items.map((it) =>
    it.id === id
      ? { ...it, level: Math.min(MEMORIZE_MAX_LEVEL, it.level + 1), lastAt: Date.now() }
      : it,
  );
  persist();
}

export function isMemorizing(reference: string): boolean {
  load();
  return items.some((it) => it.id === normId(reference));
}

/* ---------- Niveau du joueur (XP gagnés au jeu) ---------- */

const XP_KEY = "jb.memorize.xp.v1";
export const GAME_BEST_KEY = "jb.memorize.game.best.v1";

export function getMemorizeXp(): number {
  try {
    const v = Number(localStorage.getItem(XP_KEY));
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
}

export function addMemorizeXp(n: number): number {
  const total = getMemorizeXp() + Math.max(0, Math.round(n));
  try {
    localStorage.setItem(XP_KEY, String(total));
  } catch {
    /* ignore */
  }
  return total;
}

/**
 * Niveau à partir des XP : le palier grandit à chaque niveau
 * (niveau 1 → 100 XP, puis +40 par niveau). Renvoie aussi la progression
 * dans le niveau courant pour la jauge.
 */
export function levelFromXp(xp: number): { level: number; into: number; span: number } {
  let level = 1;
  let rest = xp;
  let span = 100;
  while (rest >= span) {
    rest -= span;
    level += 1;
    span += 40;
  }
  return { level, into: rest, span };
}

/** Un verset appris redevient « à réviser » après quelques jours. */
const REVIEW_AFTER_MS = 3 * 24 * 3600 * 1000;

export function isReviewDue(it: MemorizeItem, now = Date.now()): boolean {
  return it.level >= MEMORIZE_MAX_LEVEL && (!it.lastAt || now - it.lastAt > REVIEW_AFTER_MS);
}

/** Révision réussie : le verset repart pour quelques jours. */
export function markReviewed(id: string) {
  load();
  items = items.map((it) => (it.id === id ? { ...it, lastAt: Date.now() } : it));
  persist();
}

/** Révision ratée : on redescend d'une étape pour retravailler le verset. */
export function regressMemorize(id: string) {
  load();
  items = items.map((it) =>
    it.id === id
      ? { ...it, level: Math.max(0, MEMORIZE_MAX_LEVEL - 1), lastAt: Date.now() }
      : it,
  );
  persist();
}

/* ---------- Série de jours + objectif quotidien ---------- */

const STREAK_KEY = "jb.memorize.streak.v1"; // { days, last: "YYYY-MM-DD" }
const DAILY_KEY = "jb.memorize.daily.v1"; // { day, xp }
export const DAILY_GOAL = 50;

function todayStr(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayStr(d);
}

export function getStreak(): { days: number; last: string } {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* */
  }
  return { days: 0, last: "" };
}

/** Série « active » : 0 si on n'a pas joué aujourd'hui ni hier. */
export function currentStreak(): number {
  const s = getStreak();
  if (s.last === todayStr() || s.last === yesterdayStr()) return s.days;
  return 0;
}

export function getDailyXp(): number {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (raw) {
      const d = JSON.parse(raw) as { day: string; xp: number };
      if (d.day === todayStr()) return d.xp;
    }
  } catch {
    /* */
  }
  return 0;
}

/** À appeler à la fin d'une partie : met à jour la série et l'XP du jour. */
export function recordPlaySession(gainedXp: number): void {
  const today = todayStr();
  // Série
  const s = getStreak();
  let days = s.days;
  if (s.last === today) {
    // déjà compté aujourd'hui
    days = Math.max(1, days);
  } else if (s.last === yesterdayStr()) {
    days = s.days + 1;
  } else {
    days = 1;
  }
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify({ days, last: today }));
  } catch {
    /* */
  }
  // XP du jour
  const prev = getDailyXp();
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify({ day: today, xp: prev + Math.max(0, gainedXp) }));
  } catch {
    /* */
  }
}

/* ---------- Trophées ---------- */

export type Badge = {
  id: string;
  title: string;
  desc: string;
  color: string;
  reached: (s: BadgeStats) => boolean;
};
export type BadgeStats = { xp: number; streak: number; learned: number; best: number };

export const BADGES: Badge[] = [
  { id: "first", title: "Premiers pas", desc: "Ta première partie jouée.", color: "#CAF000", reached: (s) => s.xp > 0 },
  { id: "parcoeur", title: "Par cœur", desc: "Un premier verset mémorisé.", color: "#38BDF8", reached: (s) => s.learned >= 1 },
  { id: "studieux", title: "Studieux", desc: "100 XP au total.", color: "#F472B6", reached: (s) => s.xp >= 100 },
  { id: "regulier", title: "Régulier", desc: "3 jours d'affilée.", color: "#FB923C", reached: (s) => s.streak >= 3 },
  { id: "biblio", title: "Bibliothèque", desc: "5 versets mémorisés.", color: "#A78BFA", reached: (s) => s.learned >= 5 },
  { id: "fidele", title: "Fidèle", desc: "7 jours d'affilée.", color: "#F59E0B", reached: (s) => s.streak >= 7 },
  { id: "erudit", title: "Érudit", desc: "500 XP au total.", color: "#2DD4BF", reached: (s) => s.xp >= 500 },
  { id: "champion", title: "Champion", desc: "500 points en une partie.", color: "#FBBF24", reached: (s) => s.best >= 500 },
];

const SEEN_BADGES_KEY = "jb.memorize.badges.seen.v1";
export function getSeenBadges(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEEN_BADGES_KEY) || "[]");
  } catch {
    return [];
  }
}
export function markBadgesSeen(ids: string[]): void {
  try {
    localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify(ids));
  } catch {
    /* */
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useMemorize(): MemorizeItem[] {
  load();
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );
}

/**
 * Indices des mots masqués pour une étape donnée (déterministe pour un même
 * verset, pour que les trous ne « sautent » pas entre deux affichages).
 * Étape 1 ≈ 25 %, 2 ≈ 50 %, 3 ≈ 75 %, 4 = tout.
 */
export function maskedIndices(words: string[], level: number): Set<number> {
  const ratio = [0, 0.25, 0.5, 0.75, 1][Math.min(4, Math.max(0, level))];
  const n = words.length;
  const target = Math.round(n * ratio);
  const out = new Set<number>();
  if (target <= 0) return out;
  if (target >= n) {
    for (let i = 0; i < n; i++) out.add(i);
    return out;
  }
  // Répartition régulière avec un décalage stable dérivé du texte.
  let seed = 0;
  for (const w of words) seed = (seed * 31 + w.length) % 997;
  const step = n / target;
  for (let k = 0; k < target; k++) {
    out.add(Math.floor((k + (seed % 100) / 100) * step) % n);
  }
  return out;
}
