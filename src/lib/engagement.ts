"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Engagement du visiteur, 100 % côté client (localStorage) — compatible avec
 * l'export statique : aucune donnée serveur.
 *
 * - série de jours consécutifs (streak) + record ;
 * - méditations marquées comme « méditées » (progression) ;
 * - favoris (par index de dévotionnel).
 */

const KEY = "jb.engagement.v1";

type State = {
  streak: number;
  best: number;
  lastVisit: string | null; // YYYY-MM-DD
  completedDates: string[];
  favorites: number[];
};

const empty: State = {
  streak: 0,
  best: 0,
  lastVisit: null,
  completedDates: [],
  favorites: [],
};

/** Date locale au format YYYY-MM-DD. */
function dayStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function read(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...(JSON.parse(raw) as Partial<State>) };
  } catch {
    return empty;
  }
}

function write(s: State) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* stockage indisponible (mode privé) */
  }
}

export function useEngagement() {
  const [state, setState] = useState<State>(empty);
  const [ready, setReady] = useState(false);

  // À l'arrivée : on met la série à jour (ouvrir le dévotionnel compte pour le jour).
  useEffect(() => {
    const s = read();
    const today = dayStr();
    if (s.lastVisit !== today) {
      const yesterday = dayStr(new Date(Date.now() - 86_400_000));
      const streak = s.lastVisit === yesterday ? s.streak + 1 : 1;
      const next: State = {
        ...s,
        streak,
        best: Math.max(s.best, streak),
        lastVisit: today,
      };
      write(next);
      setState(next);
    } else {
      setState(s);
    }
    setReady(true);
  }, []);

  const update = useCallback((fn: (s: State) => State) => {
    setState((prev) => {
      const next = fn(prev);
      write(next);
      return next;
    });
  }, []);

  const markCompletedToday = useCallback(() => {
    const today = dayStr();
    update((s) =>
      s.completedDates.includes(today)
        ? s
        : { ...s, completedDates: [...s.completedDates, today] },
    );
  }, [update]);

  const toggleFavorite = useCallback(
    (index: number) => {
      update((s) =>
        s.favorites.includes(index)
          ? { ...s, favorites: s.favorites.filter((x) => x !== index) }
          : { ...s, favorites: [...s.favorites, index] },
      );
    },
    [update],
  );

  return {
    ready,
    streak: state.streak,
    best: state.best,
    completedCount: state.completedDates.length,
    isCompletedToday: state.completedDates.includes(dayStr()),
    favorites: state.favorites,
    isFavorite: (index: number) => state.favorites.includes(index),
    markCompletedToday,
    toggleFavorite,
  };
}
