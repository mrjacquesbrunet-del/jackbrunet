"use client";

import { asset } from "./asset";

type BookIndex = { id: number; name: string; chapters: number };
type Book = { id: number; name: string; chapters: string[][] };

let indexPromise: Promise<BookIndex[]> | null = null;
const bookCache = new Map<number, Promise<Book>>();

export function getIndex(): Promise<BookIndex[]> {
  if (!indexPromise) {
    indexPromise = fetch(asset("/bible/index.json"))
      .then((r) => r.json())
      .catch(() => [] as BookIndex[]);
  }
  return indexPromise;
}

export function getBook(id: number): Promise<Book> {
  if (!bookCache.has(id)) {
    bookCache.set(
      id,
      fetch(asset(`/bible/${id}.json`)).then((r) => r.json()),
    );
  }
  return bookCache.get(id)!;
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Quelques noms écrits différemment des noms de l'index.
const ALIAS: Record<string, string> = {
  psaume: "psaumes",
  cantique: "cantique des cantiques",
  "cantique des cantique": "cantique des cantiques",
  apocalypse: "apocalypse",
};

export type Ref = {
  bookId: number;
  bookName: string;
  chapter: number;
  vStart: number;
  vEnd: number;
};

/** Transforme « Philippiens 4:6-7 » → { bookId, chapter, vStart, vEnd }. */
export async function resolveRef(reference: string): Promise<Ref | null> {
  const m = reference.match(/^(.*?)\s+(\d+)\s*:\s*(\d+)(?:\s*[-–]\s*(\d+))?\s*$/);
  if (!m) return null;
  let name = norm(m[1]);
  name = ALIAS[name] || name;
  const chapter = Number(m[2]);
  const vStart = Number(m[3]);
  const vEnd = m[4] ? Number(m[4]) : vStart;

  const idx = await getIndex();
  const found =
    idx.find((b) => norm(b.name) === name) ||
    idx.find((b) => norm(b.name).startsWith(name)) ||
    idx.find((b) => name.startsWith(norm(b.name)));
  if (!found) return null;

  return { bookId: found.id, bookName: found.name, chapter, vStart, vEnd };
}
