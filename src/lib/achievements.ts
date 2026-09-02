"use client";

/**
 * Compteurs locaux d'ACCOMPLISSEMENTS (cet appareil), synchronisés 1×/jour
 * dans profiles.stats (voir badges.ts) pour que les badges s'affichent aussi
 * sur le profil vu par les autres.
 *
 * - `bumpAchv` : incrémente un compteur (duels gagnés, partages, etc.)
 * - `markPlayDay` / `markPrayDay` : séries de jours (jeu / prière) — on garde
 *   le RECORD de la série, c'est lui qui compte pour le badge.
 * - `achvCounters` : lecture brute de tous les compteurs.
 */

const KEY = "jb.achv.v1";

export type AchvKey =
  | "duels_won" // duels en ligne remportés
  | "duel_streak" // série de victoires EN COURS
  | "duel_streak_best" // record de victoires d'affilée
  | "perfect_games" // parties parfaites
  | "fast_answers" // bonnes réponses en moins de 3 s
  | "hard_correct" // questions pièges (difficiles) réussies
  | "daily_challenges" // participations au Défi du jour
  | "early_meditations" // méditations faites avant 8 h
  | "shares" // partages faits depuis l'app
  | "listens" // méditations écoutées en audio
  | "pray_sessions" // sessions « Scrolle & prie » terminées
  | "voice_prayers" // prières vocales déposées
  | "first_prayers" // premier à prier pour un sujet
  | "missions_claimed" // missions de la semaine accomplies
  | "games_played" // parties jouées (tous jeux)
  | "quiz_millions" // LE MILLION décroché au Quiz
  | "vf_best_combo" // record de série au Vrai ou Faux
  | "first_clue" // personnages devinés au premier indice
  | "chrono_correct" // bonnes réponses à La Chronologie
  | "words_found" // mots retrouvés au Mot manquant
  | "duels_started" // duels en ligne lancés (salons créés)
  | "league_best"; // meilleure ligue atteinte (1 Bronze → 4 Élite)

function readAll(): Record<string, number> {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Record<string, number>;
  } catch {
    /* stockage indisponible */
  }
  return {};
}

function writeAll(c: Record<string, number>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* stockage indisponible */
  }
}

export function getAchv(key: AchvKey): number {
  const v = readAll()[key];
  return Number.isFinite(v) && v > 0 ? v : 0;
}

export function bumpAchv(key: AchvKey, n = 1): number {
  const all = readAll();
  const next = Math.max(0, (Number(all[key]) || 0) + n);
  all[key] = next;
  writeAll(all);
  return next;
}

export function setAchvMax(key: AchvKey, value: number): number {
  const all = readAll();
  const next = Math.max(Number(all[key]) || 0, value);
  all[key] = next;
  writeAll(all);
  return next;
}

/** Victoire/défaite en duel : met à jour la série en cours + le record. */
export function recordDuelResult(won: boolean): void {
  const all = readAll();
  if (won) {
    all.duels_won = (Number(all.duels_won) || 0) + 1;
    const s = (Number(all.duel_streak) || 0) + 1;
    all.duel_streak = s;
    all.duel_streak_best = Math.max(Number(all.duel_streak_best) || 0, s);
  } else {
    all.duel_streak = 0;
  }
  writeAll(all);
}

/* ---------- Séries de JOURS (jeu / prière) ---------- */

type DayStreak = { days: number; best: number; last: string };

function dayKey(kind: "play" | "pray"): string {
  return `jb.achv.days.${kind}.v1`;
}

function todayStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayStr(d);
}

function readStreak(kind: "play" | "pray"): DayStreak {
  try {
    const raw = localStorage.getItem(dayKey(kind));
    if (raw) return JSON.parse(raw) as DayStreak;
  } catch {
    /* */
  }
  return { days: 0, best: 0, last: "" };
}

/** Marque « aujourd'hui » pour la série (jouer / prier). Renvoie le record. */
export function markDayStreak(kind: "play" | "pray"): number {
  const s = readStreak(kind);
  const today = todayStr();
  if (s.last === today) return s.best;
  const days = s.last === yesterdayStr() ? s.days + 1 : 1;
  const best = Math.max(s.best, days);
  try {
    localStorage.setItem(dayKey(kind), JSON.stringify({ days, best, last: today }));
  } catch {
    /* */
  }
  return best;
}

export function bestDayStreak(kind: "play" | "pray"): number {
  return readStreak(kind).best;
}

/* ---------- Semaines parfaites (7 jours de méditation sur 7) ---------- */

/** Compte les semaines (lundi-dimanche) entièrement méditées. */
export function fullWeeksFromDates(dates: string[]): number {
  const byWeek = new Map<string, Set<string>>();
  for (const d of dates) {
    const dt = new Date(`${d}T12:00:00`);
    if (Number.isNaN(dt.getTime())) continue;
    const dow = (dt.getDay() + 6) % 7; // 0 = lundi
    const monday = new Date(dt);
    monday.setDate(dt.getDate() - dow);
    const wk = todayStr(monday);
    if (!byWeek.has(wk)) byWeek.set(wk, new Set());
    byWeek.get(wk)!.add(d);
  }
  let full = 0;
  for (const days of byWeek.values()) if (days.size >= 7) full += 1;
  return full;
}
