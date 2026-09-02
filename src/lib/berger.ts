"use client";

import data from "../../content/berger-levels.json";

/**
 * « Le Berger » — puzzle de logique (façon Sokoban) : ramène les brebis
 * dans les enclos en les poussant case par case. Les 30 niveaux sont
 * générés par méthode inverse (donc GARANTIS résolubles) et le « par »
 * est le nombre de coups optimal calculé par solveur.
 */

export type BergerLevel = {
  walls: [number, number][];
  goals: [number, number][];
  sheep: [number, number][];
  player: [number, number];
  par: number;
};

const RAW = data as { w: number; h: number; levels: BergerLevel[] };
export const BERGER_W = RAW.w;
export const BERGER_H = RAW.h;
export const BERGER_LEVELS: BergerLevel[] = RAW.levels;

/* ---------- Progression locale ---------- */

const KEY = "jb.berger.v1"; // { best: { [niveau]: meilleurs coups } }
const XP_KEY = "jb.berger.xp.v1";

type Store = { best: Record<string, number> };

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {
    /* stockage indisponible */
  }
  return { best: {} };
}

function write(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* stockage indisponible */
  }
}

export function bergerBest(level: number): number | null {
  const v = read().best[String(level)];
  return Number.isFinite(v) && v > 0 ? v : null;
}

/** Niveaux terminés / réussis au par (pour les badges). */
export function bergerStats(): { done: number; perfect: number } {
  const s = read();
  let done = 0;
  let perfect = 0;
  for (const [k, v] of Object.entries(s.best)) {
    const lv = BERGER_LEVELS[Number(k)];
    if (!lv || !Number.isFinite(v)) continue;
    done += 1;
    if (v <= lv.par) perfect += 1;
  }
  return { done, perfect };
}

/**
 * Enregistre une réussite. Renvoie ce que la partie rapporte :
 * XP gagnés (première réussite / premier parfait uniquement).
 */
export function recordBerger(level: number, moves: number): { xpGained: number; perfect: boolean } {
  const s = read();
  const lv = BERGER_LEVELS[level];
  const key = String(level);
  const prev = s.best[key];
  const perfect = !!lv && moves <= lv.par;
  const wasDone = Number.isFinite(prev);
  const wasPerfect = wasDone && !!lv && (prev as number) <= lv.par;
  s.best[key] = wasDone ? Math.min(prev as number, moves) : moves;
  write(s);
  let xp = 0;
  if (!wasDone) xp += 20;
  if (perfect && !wasPerfect) xp += 15;
  if (xp > 0) {
    try {
      const cur = Number(localStorage.getItem(XP_KEY)) || 0;
      localStorage.setItem(XP_KEY, String(cur + xp));
    } catch {
      /* */
    }
  }
  return { xpGained: xp, perfect };
}

export function getBergerXp(): number {
  try {
    const v = Number(localStorage.getItem(XP_KEY));
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
}
