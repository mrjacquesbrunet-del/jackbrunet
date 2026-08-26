"use client";

import data from "../../content/vraifaux.json";

export type VFItem = {
  id: number;
  text: string;
  answer: boolean;
  reference?: string;
  note?: string;
};

export const VF_ITEMS: VFItem[] = (data as { items: VFItem[] }).items;
export const VF_LIVES = 3;
export const VF_TIME = 9; // secondes par affirmation

/** Deck mélangé (Fisher-Yates) pour une partie. */
export function buildDeck(): VFItem[] {
  const a = [...VF_ITEMS];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------------- État local ---------------- */
const BEST_KEY = "jb.vf.best.v1";
const GAMES_KEY = "jb.vf.games.v1";
const XP_KEY = "jb.vf.xp.v1";

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

export function getVfBest(): number {
  return read(BEST_KEY);
}
export function getVfGames(): number {
  return read(GAMES_KEY);
}
/** XP cumulée du jeu (pour le niveau joueur de la page Jeux). */
export function getVfXp(): number {
  return read(XP_KEY);
}

/** Enregistre une partie : meilleur score (bonnes réponses) + XP cumulée. */
export function recordVf(score: number, points: number): { best: number } {
  const best = Math.max(getVfBest(), Math.max(0, score));
  write(BEST_KEY, best);
  write(GAMES_KEY, getVfGames() + 1);
  write(XP_KEY, getVfXp() + Math.max(0, points));
  return { best };
}
