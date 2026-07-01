"use client";

import { useSyncExternalStore } from "react";

/**
 * Préférences de lecture de la Bible (sur l'appareil): taille du texte et
 * police. Appliquées au corps des versets.
 */
export type ReadingFont = "serif" | "sans" | "confort";
export type ReadingTheme = "clair" | "sepia" | "sombre";
export type ReadingState = { scale: number; font: ReadingFont; theme: ReadingTheme };

const KEY = "jb.reading.v1";
const DEFAULT: ReadingState = { scale: 1, font: "serif", theme: "clair" };

/** Couleurs de fond / texte / accent par thème de lecture. */
export const THEME_STYLE: Record<ReadingTheme, { bg: string; text: string; num: string }> = {
  clair: { bg: "transparent", text: "#1A1B14", num: "#5E6A3A" },
  sepia: { bg: "#F3E8CE", text: "#4A3A26", num: "#8A6A3A" },
  sombre: { bg: "#16180F", text: "#E7E6DB", num: "#CAF000" },
};
export const THEME_LABEL: Record<ReadingTheme, string> = {
  clair: "Clair",
  sepia: "Sépia",
  sombre: "Sombre",
};

export const SCALE_MIN = 0.85;
export const SCALE_MAX = 1.6;
export const SCALE_STEP = 0.05;

export const FONT_STACK: Record<ReadingFont, string> = {
  serif: "Georgia, 'Times New Roman', serif",
  sans: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  confort: "Verdana, 'Trebuchet MS', system-ui, sans-serif",
};
export const FONT_LABEL: Record<ReadingFont, string> = {
  serif: "Classique",
  sans: "Moderne",
  confort: "Confort",
};

let state: ReadingState = DEFAULT;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = {...DEFAULT,...(JSON.parse(raw) as Partial<ReadingState>) };
  } catch {
    /* stockage indisponible */
  }
}

function commit(next: ReadingState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function setScale(scale: number) {
  load();
  commit({...state, scale: Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(scale * 100) / 100)) });
}
export function setFont(font: ReadingFont) {
  load();
  commit({...state, font });
}
export function setTheme(theme: ReadingTheme) {
  load();
  commit({...state, theme });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function snap() {
  load();
  return state;
}

export function useReading() {
  const s = useSyncExternalStore(subscribe, snap, () => DEFAULT);
  return { scale: s.scale, font: s.font, theme: s.theme, setScale, setFont, setTheme };
}
