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

/** Branche la synchro cloud (optionnelle). */
export type ToolkitSink = {
  highlightAdd: (id: string) => void;
  highlightRemove: (id: string) => void;
  snippetUpsert: (s: Snippet) => void;
  snippetRemove: (id: string) => void;
};
let sink: ToolkitSink | null = null;
export function setToolkitSink(s: ToolkitSink | null) {
  sink = s;
}
export function snapshotToolkit(): State {
  load();
  return state;
}
export function replaceToolkit(next: State) {
  commit(next);
}

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
  if (has) sink?.highlightRemove(id);
  else sink?.highlightAdd(id);
}

export function toggleSnippet(s: Omit<Snippet, "ts">) {
  load();
  const has = state.saved.some((x) => x.id === s.id);
  if (has) {
    commit({ ...state, saved: state.saved.filter((x) => x.id !== s.id) });
    sink?.snippetRemove(s.id);
  } else {
    const snip: Snippet = { ...s, ts: Date.now() };
    commit({ ...state, saved: [snip, ...state.saved] });
    sink?.snippetUpsert(snip);
  }
}

export function removeSnippet(id: string) {
  load();
  commit({ ...state, saved: state.saved.filter((x) => x.id !== id) });
  sink?.snippetRemove(id);
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
