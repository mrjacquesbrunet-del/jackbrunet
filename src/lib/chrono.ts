"use client";

import data from "../../content/chrono.json";

/**
 * « La Chronologie » : deux événements bibliques, lequel est arrivé en
 * premier ? L'ordre CANONIQUE (l'index dans content/chrono.json) fait foi ;
 * l'ère (« Vers 1450 av. J.-C. ») n'est montrée qu'à la révélation, pour
 * apprendre. Plus la partie avance, plus les paires sont rapprochées.
 */

export type ChronoEvent = {
  id: number;
  label: string;
  era: string;
  ref: string;
  /** Position canonique (0 = le plus ancien). */
  order: number;
};

const RAW = (data as { items: { id: number; label: string; era: string; ref: string }[] }).items;
export const CHRONO_EVENTS: ChronoEvent[] = RAW.map((e, i) => ({ ...e, order: i }));

export const CHRONO_ROUNDS = 10;
export const CHRONO_TIME = 12; // secondes par paire

export type ChronoPair = { a: ChronoEvent; b: ChronoEvent };

/**
 * Construit les paires d'une partie : écart d'ordre LARGE au début (facile),
 * de plus en plus serré (dur). Aucun événement réutilisé dans la partie.
 */
export function buildChronoDeck(rounds = CHRONO_ROUNDS): ChronoPair[] {
  // Écart minimal/maximal souhaité selon la manche (en positions d'ordre).
  const gapFor = (r: number): [number, number] => {
    if (r < 3) return [30, 999];
    if (r < 6) return [12, 30];
    if (r < 8) return [5, 12];
    return [1, 5];
  };
  const used = new Set<number>();
  const pairs: ChronoPair[] = [];
  const pool = CHRONO_EVENTS;
  for (let r = 0; r < rounds; r++) {
    const [lo, hi] = gapFor(r);
    let pair: ChronoPair | null = null;
    // Quelques tentatives dans la fenêtre voulue, puis on élargit.
    for (let attempt = 0; attempt < 120 && !pair; attempt++) {
      const widen = Math.floor(attempt / 40); // 0, 1, 2 → fenêtre de + en + large
      const a = pool[Math.floor(Math.random() * pool.length)];
      if (used.has(a.id)) continue;
      const lo2 = Math.max(1, lo - widen * 4);
      const hi2 = hi + widen * 30;
      const candidates = pool.filter(
        (b) =>
          !used.has(b.id) &&
          b.id !== a.id &&
          Math.abs(b.order - a.order) >= lo2 &&
          Math.abs(b.order - a.order) <= hi2,
      );
      if (candidates.length === 0) continue;
      const b = candidates[Math.floor(Math.random() * candidates.length)];
      pair = Math.random() < 0.5 ? { a, b } : { a: b, b: a };
    }
    if (!pair) break; // improbable (113 événements pour 20 tirages)
    used.add(pair.a.id);
    used.add(pair.b.id);
    pairs.push(pair);
  }
  return pairs;
}

/** L'événement le plus ancien de la paire (la bonne réponse). */
export function firstOf(p: ChronoPair): ChronoEvent {
  return p.a.order < p.b.order ? p.a : p.b;
}

/* ---------------- État local ---------------- */

const BEST_KEY = "jb.chrono.best.v1";
const GAMES_KEY = "jb.chrono.games.v1";
const XP_KEY = "jb.chrono.xp.v1";

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
    /* stockage indisponible */
  }
}

export function getChronoBest(): number {
  return read(BEST_KEY);
}
export function getChronoGames(): number {
  return read(GAMES_KEY);
}
/** XP cumulée du jeu (comparable aux autres jeux : ~points/10). */
export function getChronoXp(): number {
  return read(XP_KEY);
}

/** Enregistre une partie : meilleur score + XP cumulée. */
export function recordChrono(score: number, points: number): { best: number } {
  const best = Math.max(getChronoBest(), Math.max(0, points));
  write(BEST_KEY, best);
  write(GAMES_KEY, getChronoGames() + 1);
  write(XP_KEY, getChronoXp() + Math.max(0, Math.round(points / 10)));
  void score;
  return { best };
}
