"use client";

import { useSyncExternalStore } from "react";

/**
 * Progression des plans thématiques, sur l'appareil (localStorage).
 * Clé = slug du plan → liste des numéros de jours terminés.
 */

type State = Record<string, number[]>;

const KEY = "jb.planprogress.v1";
const empty: State = {};

let state: State = empty;
let loaded = false;
const listeners = new Set<() => void>();

/** Branche la synchro cloud (optionnelle). */
export type PlanSink = { set: (slug: string, days: number[]) => void };
let sink: PlanSink | null = null;
export function setPlanSink(s: PlanSink | null) {
  sink = s;
}
export function snapshotPlans(): State {
  load();
  return state;
}
export function replacePlans(next: State) {
  commit(next);
}

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw) as State;
  } catch {
    /* indisponible */
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

export function toggleDay(slug: string, day: number) {
  load();
  const done = state[slug]?? [];
  const next = done.includes(day)? done.filter((d) => d!== day): [...done, day];
  commit({...state, [slug]: next });
  sink?.set(slug, next);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function getSnapshot(): State {
  load();
  return state;
}

/** Toute la progression (pour agréger sur le profil). */
export function useAllPlanProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, () => empty);
}

export function usePlanProgress(slug: string) {
  const s = useSyncExternalStore(subscribe, getSnapshot, () => empty);
  const done = s[slug]?? [];
  return {
    done,
    isDone: (day: number) => done.includes(day),
    toggleDay: (day: number) => toggleDay(slug, day),
  };
}
