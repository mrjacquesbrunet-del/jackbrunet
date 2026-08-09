"use client";

import { useSyncExternalStore } from "react";

/**
 * Couleur d'accent personnalisable, partagée entre le profil et le carnet
 * (même choix, mémorisé sur l'appareil). Changer la couleur met à jour les
 * deux écrans en direct.
 */
export const ACCENTS = {
  lime: { from: "#CAF000", to: "rgb(var(--s-500))", label: "Lime" },
  ocean: { from: "#38BDF8", to: "#1E3A8A", label: "Océan" },
  sunset: { from: "#FB923C", to: "#BE123C", label: "Coucher" },
  violet: { from: "#A78BFA", to: "#5B21B6", label: "Violet" },
  rose: { from: "#FB7185", to: "#9D174D", label: "Rose" },
  gold: { from: "#FBBF24", to: "#B45309", label: "Or" },
} as const;
export type AccentKey = keyof typeof ACCENTS;

const KEY = "jb.profile.accent";

let current: AccentKey = "lime";
try {
  const a = typeof localStorage!== "undefined"? localStorage.getItem(KEY): null;
  if (a && a in ACCENTS) current = a as AccentKey;
} catch {
  /* SSR / indisponible */
}

const listeners = new Set<() => void>();

export function setProfileAccent(k: AccentKey) {
  current = k;
  try {
    localStorage.setItem(KEY, k);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useProfileAccent() {
  const accent = useSyncExternalStore(
    subscribe,
    () => current,
    () => current,
  );
  return { accent, colors: ACCENTS[accent], setAccent: setProfileAccent };
}
