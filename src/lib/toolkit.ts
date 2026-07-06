"use client";

import { useSyncExternalStore } from "react";

/**
 * « Boîte à outils » dévotionnelle, 100 % sur l'appareil (localStorage):
 * surlignages + extraits enregistrés (versets, méditations, punchlines…).
 *
 * Store externe partagé: tous les composants Markable et la bibliothèque
 * restent synchronisés instantanément.
 */

export type Snippet = {
  id: string;
  text: string;
  reference?: string;
  kind: string; // "verset" | "méditation" | "punchline" | "déclaration" | "texte"
  ts: number;
};

/** Palette de surlignage (les classes littérales sont vues par Tailwind). */
export const DEFAULT_HL = "lime";
export const HIGHLIGHT_COLORS: { key: string; label: string; bg: string; swatch: string }[] = [
  { key: "lime", label: "Vert", bg: "bg-dawn-300/50", swatch: "bg-dawn-400" },
  { key: "amber", label: "Jaune", bg: "bg-amber-200/70", swatch: "bg-amber-400" },
  { key: "rose", label: "Rose", bg: "bg-rose-200/70", swatch: "bg-rose-400" },
  { key: "sky", label: "Bleu", bg: "bg-sky-200/70", swatch: "bg-sky-400" },
  { key: "violet", label: "Violet", bg: "bg-violet-200/70", swatch: "bg-violet-400" },
];
export function highlightBg(color: string | undefined): string {
  return HIGHLIGHT_COLORS.find((c) => c.key === color)?.bg?? HIGHLIGHT_COLORS[0].bg;
}

/** Texte mémorisé pour un surlignage, afin de le retrouver dans le carnet. */
export type HlMeta = { text: string; reference?: string; kind?: string };

type State = {
  highlights: string[];
  colors: Record<string, string>; // id → couleur du surlignage
  hlmeta: Record<string, HlMeta>; // id → texte surligné (pour le carnet)
  noted: string[]; // ids ayant une note (petit marqueur)
  saved: Snippet[];
};

const KEY = "jb.toolkit.v1";
const emptyState: State = { highlights: [], colors: {}, hlmeta: {}, noted: [], saved: [] };

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
    if (raw) state = {...emptyState,...(JSON.parse(raw) as Partial<State>) };
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
  if (state.highlights.includes(id)) clearHighlight(id);
  else highlightWith(id, DEFAULT_HL);
}

/** Surligne avec une couleur; re-cliquer la même couleur retire le surlignage. */
export function highlightWith(id: string, color: string, meta?: HlMeta) {
  load();
  const colors = {...state.colors };
  if (state.highlights.includes(id) && colors[id] === color) {
    clearHighlight(id);
    return;
  }
  colors[id] = color;
  const hlmeta = {...state.hlmeta };
  if (meta) hlmeta[id] = meta;
  const highlights = state.highlights.includes(id)
? state.highlights
: [...state.highlights, id];
  commit({...state, highlights, colors, hlmeta });
  sink?.highlightAdd(id);
}

/** Retire tout surlignage d'un élément. */
export function clearHighlight(id: string) {
  load();
  const colors = {...state.colors };
  delete colors[id];
  const hlmeta = {...state.hlmeta };
  delete hlmeta[id];
  commit({...state, colors, hlmeta, highlights: state.highlights.filter((x) => x!== id) });
  sink?.highlightRemove(id);
}

/** Marque un élément comme « annoté » (petit marqueur dans la lecture). */
export function markNoted(id: string) {
  load();
  if (state.noted.includes(id)) return;
  commit({...state, noted: [...state.noted, id] });
}
export function unmarkNoted(id: string) {
  load();
  commit({...state, noted: state.noted.filter((x) => x!== id) });
}

export function toggleSnippet(s: Omit<Snippet, "ts">) {
  load();
  const has = state.saved.some((x) => x.id === s.id);
  if (has) {
    commit({...state, saved: state.saved.filter((x) => x.id!== s.id) });
    sink?.snippetRemove(s.id);
  } else {
    const snip: Snippet = {...s, ts: Date.now() };
    commit({...state, saved: [snip,...state.saved] });
    sink?.snippetUpsert(snip);
  }
}

export function removeSnippet(id: string) {
  load();
  commit({...state, saved: state.saved.filter((x) => x.id!== id) });
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
    // Surlignages avec leur texte, pour les lister dans le carnet / favoris.
    highlightItems: s.highlights
.map((id) => ({ id, color: s.colors[id]?? DEFAULT_HL,...s.hlmeta[id] }))
.filter((h): h is { id: string; color: string } & HlMeta => Boolean((h as HlMeta).text)),
    isHighlighted: (id: string) => s.highlights.includes(id),
    highlightColor: (id: string) => s.colors[id]?? DEFAULT_HL,
    isNoted: (id: string) => s.noted.includes(id),
    isSaved: (id: string) => s.saved.some((x) => x.id === id),
    toggleHighlight,
    highlightWith,
    clearHighlight,
    markNoted,
    unmarkNoted,
    toggleSnippet,
    removeSnippet,
  };
}
