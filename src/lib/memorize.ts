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
