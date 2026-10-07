"use client";

import { asset } from "./asset";
import { baseBible, getVersionBible, type VersionBible } from "./bible-version";

type BookIndex = { id: number; name: string; chapters: number };
type Book = { id: number; name: string; chapters: string[][] };

const indexCache = new Map<VersionBible, Promise<BookIndex[]>>();
const bookCache = new Map<string, Promise<Book>>();

/** Livres de la version (par défaut celle choisie : langue de l'app). */
export function getIndex(v: VersionBible = getVersionBible()): Promise<BookIndex[]> {
  if (!indexCache.has(v)) {
    indexCache.set(
      v,
      fetch(asset(`${baseBible(v)}/index.json`))
        .then((r) => r.json())
        .catch(() => [] as BookIndex[]),
    );
  }
  return indexCache.get(v)!;
}

/** Un livre de la version (« lsg » pour ce qui est aligné sur la Segond). */
export function getBook(id: number, v: VersionBible = getVersionBible()): Promise<Book> {
  const k = `${v}/${id}`;
  if (!bookCache.has(k)) {
    bookCache.set(
      k,
      fetch(asset(`${baseBible(v)}/${id}.json`)).then((r) => r.json()),
    );
  }
  return bookCache.get(k)!;
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
  const vEnd = m[4]? Number(m[4]): vStart;

  // Référence en français, anglais ou portugais (« Jean », « John », « João ») ;
  // le nom rendu est celui de la version lue.
  const courante = getVersionBible();
  const ordre = [courante, ...(["lsg", "bsb", "blivre"] as VersionBible[]).filter((x) => x !== courante)];
  let found: BookIndex | undefined;
  for (const v of ordre) {
    const idx = await getIndex(v);
    found =
      idx.find((b) => norm(b.name) === name) ||
      idx.find((b) => norm(b.name).startsWith(name)) ||
      idx.find((b) => name.startsWith(norm(b.name)));
    if (found) break;
  }
  if (!found) return null;
  const nom = (await getIndex(courante)).find((b) => b.id === found!.id)?.name ?? found.name;

  return { bookId: found.id, bookName: nom, chapter, vStart, vEnd };
}
