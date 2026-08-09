"use client";

import { useSyncExternalStore } from "react";

/**
 * Préférences de lecture de la Bible (sur l'appareil): taille du texte et
 * police. Appliquées au corps des versets.
 */
export type ReadingFont = "serif" | "sans" | "confort";
export type ReadingTheme = "clair" | "olive" | "sombre";
export type ReadingState = { scale: number; font: ReadingFont; theme: ReadingTheme };

const KEY = "jb.reading.v1";
const DEFAULT: ReadingState = { scale: 1, font: "serif", theme: "clair" };

/**
 * Thèmes de lecture 100 % charte graphique:
 * - Clair: le blanc cassé « cream » du site.
 * - Doux: cream olive plus chaud (intermédiaire).
 * - Sombre: olive-noir profond (comme les cartes de l'app) + accents lime.
 * `swatch` = couleur montrée dans le sélecteur.
 */
export const THEME_STYLE: Record<
  ReadingTheme,
  { bg: string; text: string; num: string; swatch: string }
> = {
  clair: { bg: "transparent", text: "rgb(var(--n-900))", num: "rgb(var(--s-500))", swatch: "#F3F3ED" },
  olive: { bg: "#E7E4D2", text: "rgb(var(--s-700))", num: "rgb(var(--s-500))", swatch: "#E7E4D2" },
  sombre: { bg: "#1B1F14", text: "#F3F3ED", num: "#CAF000", swatch: "#23271A" },
};
export const THEME_LABEL: Record<ReadingTheme, string> = {
  clair: "Clair",
  olive: "Doux",
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
    // Migration de l'ancien thème « sepia » vers « olive ».
    if ((state.theme as string) === "sepia") state = {...state, theme: "olive" };
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
