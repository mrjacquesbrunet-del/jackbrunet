"use client";

import { bibleNarrationKey, bibleNarrationUrl } from "./bible-audio";

/**
 * Téléchargement hors-ligne de l'audio de la Bible, livre par livre, stocké
 * dans le navigateur (IndexedDB), aucun rebuild natif requis. Le lecteur
 * global joue en priorité la copie locale quand elle existe (voir podcast-player).
 */
const DB = "jb-bible-audio";
const STORE = "audio";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putBlob(path: string, blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, path);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function getBlob(path: string): Promise<Blob | null> {
  const db = await openDb();
  const blob = await new Promise<Blob | null>((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const rq = tx.objectStore(STORE).get(path);
    rq.onsuccess = () => resolve((rq.result as Blob)?? null);
    rq.onerror = () => resolve(null);
  });
  db.close();
  return blob;
}

async function allKeys(): Promise<Set<string>> {
  try {
    const db = await openDb();
    const keys = await new Promise<string[]>((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const rq = tx.objectStore(STORE).getAllKeys();
      rq.onsuccess = () => resolve((rq.result as string[])?? []);
      rq.onerror = () => resolve([]);
    });
    db.close();
    return new Set(keys);
  } catch {
    return new Set();
  }
}

async function deleteKeys(paths: string[]): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    paths.forEach((p) => store.delete(p));
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
  db.close();
}

/** URL locale (blob) d'un fichier si présent hors-ligne, sinon null. */
export async function getOfflineObjectUrl(path?: string): Promise<string | null> {
  if (!path || typeof indexedDB === "undefined") return null;
  const blob = await getBlob(path);
  return blob? URL.createObjectURL(blob): null;
}

/** Nombre de chapitres d'un livre déjà présents hors-ligne. */
export async function offlineChapterCount(bookId: number, chapterCount: number): Promise<number> {
  const keys = await allKeys();
  let n = 0;
  for (let c = 1; c <= chapterCount; c++) if (keys.has(bibleNarrationKey(bookId, c))) n++;
  return n;
}

/** Télécharge tout un livre (chapitres manquants uniquement). */
export async function downloadBook(
  bookId: number,
  chapterCount: number,
  onProgress: (done: number, total: number) => void,
): Promise<number> {
  const keys = await allKeys();
  let done = 0;
  for (let c = 1; c <= chapterCount; c++) {
    const path = bibleNarrationKey(bookId, c);
    if (!keys.has(path)) {
      try {
        const url = bibleNarrationUrl(bookId, c);
        if (url) {
          const r = await fetch(url);
          if (r.ok) await putBlob(path, await r.blob());
        }
      } catch {
        /* chapitre ignoré (réseau) */
      }
    }
    done++;
    onProgress(done, chapterCount);
  }
  return done;
}

/** Supprime l'audio hors-ligne d'un livre. */
export async function deleteBook(bookId: number, chapterCount: number): Promise<void> {
  const paths: string[] = [];
  for (let c = 1; c <= chapterCount; c++) paths.push(bibleNarrationKey(bookId, c));
  await deleteKeys(paths);
}
