"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Engagement du visiteur, 100 % côté client (localStorage), compatible avec
 * l'export statique: aucune donnée serveur.
 *
 * - série de jours consécutifs (streak) + record — la série se gagne en
 *   MÉDITANT (bouton « J'ai médité »), pas seulement en ouvrant l'app ;
 * - « gel de série » automatique 1×/semaine : un jour manqué ne casse pas
 *   la série (grâce, pas de culpabilité) ;
 * - mémoire de la série perdue (pour proposer de la reprendre) ;
 * - méditations marquées comme « méditées » (progression) ;
 * - favoris (par index de dévotionnel).
 */

const KEY = "jb.engagement.v1";

type State = {
  streak: number;
  best: number;
  lastVisit: string | null; // YYYY-MM-DD
  /** Dernier jour où la série a compté (médité — ou visite, historique). */
  lastStreakDay: string | null;
  /** Semaine (lundi, YYYY-MM-DD) où le gel de série a déjà été utilisé. */
  freezeWeek: string | null;
  /** Série qu'on avait avant la dernière remise à zéro (pour « reprendre »). */
  previousStreak: number;
  completedDates: string[];
  favorites: number[];
};

const empty: State = {
  streak: 0,
  best: 0,
  lastVisit: null,
  lastStreakDay: null,
  freezeWeek: null,
  previousStreak: 0,
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

/** Jour calendaire décalé de `n` jours (fiable même au changement d'heure). */
function dayStrOffset(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return dayStr(d);
}

/** Lundi de la semaine courante (identifiant de semaine pour le gel). */
function weekStr(d = new Date()): string {
  const x = new Date(d);
  const dow = (x.getDay() + 6) % 7; // 0 = lundi
  x.setDate(x.getDate() - dow);
  return dayStr(x);
}

function read(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const s = { ...empty, ...(JSON.parse(raw) as Partial<State>) };
    // Migration depuis l'ancienne version (série basée sur l'ouverture) : la
    // dernière visite compte comme dernier jour de série, pour ne casser la
    // série de personne au passage à la nouvelle règle.
    if (!s.lastStreakDay && s.lastVisit && s.streak > 0) s.lastStreakDay = s.lastVisit;
    return s;
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

/** Fait avancer la série pour « aujourd'hui » (médité aujourd'hui). */
function advanceStreak(s: State): State {
  const today = dayStr();
  if (s.lastStreakDay === today) return s; // déjà compté aujourd'hui
  const yesterday = dayStrOffset(-1);
  const dayBefore = dayStrOffset(-2);
  let streak: number;
  let freezeWeek = s.freezeWeek;
  let previousStreak = s.previousStreak;
  if (s.lastStreakDay === yesterday) {
    streak = s.streak + 1;
  } else if (s.lastStreakDay === dayBefore && s.streak >= 2 && s.freezeWeek !== weekStr()) {
    // Gel de série : UN jour manqué par semaine ne casse pas la série.
    streak = s.streak + 1;
    freezeWeek = weekStr();
  } else {
    if (s.streak >= 3) previousStreak = s.streak; // pour « reprendre ta série »
    streak = 1;
  }
  if (streak >= 3) previousStreak = 0; // la série est repartie : plus besoin
  return {
    ...s,
    streak,
    best: Math.max(s.best, streak),
    lastStreakDay: today,
    freezeWeek,
    previousStreak,
  };
}

export function useEngagement() {
  const [state, setState] = useState<State>(empty);
  const [ready, setReady] = useState(false);

  // À l'arrivée : on note la visite (sans faire avancer la série — depuis la
  // 1.8, c'est MÉDITER qui la fait avancer, pas seulement ouvrir l'app).
  useEffect(() => {
    const s = read();
    const today = dayStr();
    if (s.lastVisit !== today) {
      const next: State = { ...s, lastVisit: today };
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
    update((s) => {
      const withDate = s.completedDates.includes(today)
        ? s
        : { ...s, completedDates: [...s.completedDates, today] };
      return advanceStreak(withDate);
    });
    // Médité aujourd'hui → le rappel du soir devient inutile : on le décale à
    // demain (app native uniquement ; sans effet sur le web).
    import("@/lib/notifications")
      .then((m) => m.deferEveningNudge())
      .catch(() => undefined);
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
    /** Série perdue récemment (≥3) à proposer de reprendre — 0 sinon. */
    previousStreak: state.previousStreak,
    completedCount: state.completedDates.length,
    completedDates: state.completedDates,
    isCompletedToday: state.completedDates.includes(dayStr()),
    favorites: state.favorites,
    isFavorite: (index: number) => state.favorites.includes(index),
    markCompletedToday,
    toggleFavorite,
  };
}
