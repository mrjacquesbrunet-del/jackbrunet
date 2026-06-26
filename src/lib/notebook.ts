"use client";

import { useSyncExternalStore } from "react";

/**
 * Carnet de notes personnel, 100 % sur l'appareil (localStorage) :
 * sujets de prière, paroles reçues, notes libres.
 */

export type NoteCategory = "Prière" | "Parole reçue" | "Note";

export type Note = {
  id: string;
  category: NoteCategory;
  title: string;
  body: string;
  ts: number; // création / dernière modif
  answered?: boolean; // pour les sujets de prière (exaucé)
};

export const NOTE_CATEGORIES: NoteCategory[] = ["Prière", "Parole reçue", "Note"];

const KEY = "jb.notebook.v1";
const empty: Note[] = [];

let notes: Note[] = empty;
let loaded = false;
const listeners = new Set<() => void>();

/** Branche la synchro cloud (optionnelle). */
export type NoteSink = { upsert: (n: Note) => void; remove: (id: string) => void };
let sink: NoteSink | null = null;
export function setNoteSink(s: NoteSink | null) {
  sink = s;
}
/** Lecture/écriture brutes pour la synchro (n'appellent pas le sink). */
export function snapshotNotes(): Note[] {
  load();
  return notes;
}
export function replaceNotes(next: Note[]) {
  commit(next);
}

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) notes = JSON.parse(raw) as Note[];
  } catch {
    /* indisponible */
  }
}

function commit(next: Note[]) {
  notes = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(notes));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function addNote(input: { category: NoteCategory; title: string; body: string }) {
  load();
  const note: Note = {
    id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    category: input.category,
    title: input.title.trim(),
    body: input.body.trim(),
    ts: Date.now(),
  };
  commit([note, ...notes]);
  sink?.upsert(note);
}

export function updateNote(id: string, patch: Partial<Omit<Note, "id">>) {
  load();
  const next = notes.map((n) => (n.id === id ? { ...n, ...patch, ts: Date.now() } : n));
  commit(next);
  const updated = next.find((n) => n.id === id);
  if (updated) sink?.upsert(updated);
}

export function removeNote(id: string) {
  load();
  commit(notes.filter((n) => n.id !== id));
  sink?.remove(id);
}

export function toggleAnswered(id: string) {
  load();
  const next = notes.map((n) => (n.id === id ? { ...n, answered: !n.answered } : n));
  commit(next);
  const updated = next.find((n) => n.id === id);
  if (updated) sink?.upsert(updated);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function getSnapshot(): Note[] {
  load();
  return notes;
}

export function useNotebook() {
  return useSyncExternalStore(subscribe, getSnapshot, () => empty);
}
