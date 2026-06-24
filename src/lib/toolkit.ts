"use client";

import { useSyncExternalStore } from "react";

/**
 * « Boîte à outils » dévotionnelle, 100 % sur l'appareil (localStorage) :
 * surlignages + extraits enregistrés (versets, méditations, punchlines…).
 *
 * Store externe partagé : tous les composants Markable et la bibliothèque
 * restent synchronisés instantanément.
 */

export type Snippet = {
  id: string;
  text: string;
  reference?: string;
  kind: string; // "verset" | "méditation" | "punchline" | "déclaration" | "texte"
  ts: number;
};

type State = { highlights: string[]; saved: Snippet[] };

const KEY = "jb.toolkit.v1";
const emptyState: State = { highlights: [], saved: [] };

let state: State = emptyState;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...emptyState, ...(JSON.parse(raw) as Partial<State>) };
  } catch {
    /* stockage indisponible */
  }
}

function commit(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function toggleHighlight(id: string) {
  load();
  const has = state.highlights.includes(id);
  commit({
    ...state,
    highlights: has
      ? state.highlights.filter((x) => x !== id)
      : [...state.highlights, id],
  });
}

export function toggleSnippet(s: Omit<Snippet, "ts">) {
  load();
  const has = state.saved.some((x) => x.id === s.id);
  commit({
    ...state,
    saved: has
      ? state.saved.filter((x) => x.id !== s.id)
      : [{ ...s, ts: Date.now() }, ...state.saved],
  });
}

export function removeSnippet(id: string) {
  load();
  commit({ ...state, saved: state.saved.filter((x) => x.id !== id) });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function getSnapshot(): State {
  load();
  return state;
}

export function useToolkit() {
  const s = useSyncExternalStore(subscribe, getSnapshot, () => emptyState);
  return {
    highlights: s.highlights,
    saved: s.saved,
    isHighlighted: (id: string) => s.highlights.includes(id),
    isSaved: (id: string) => s.saved.some((x) => x.id === id),
    toggleHighlight,
    toggleSnippet,
    removeSnippet,
  };
}
