"use client";

import { getSupabase } from "./supabase";
import type { AudioTrack } from "./audio-library";
import { compressToMonoMp3 } from "./audio-compress";

/**
 * Narration audio de la Bible (Louis Segond 1910, domaine public), hébergée
 * dans Supabase Storage. Jouée via le lecteur global → arrière-plan, écran
 * verrouillé, contrôles de l'écran de veille et minuteur de veille.
 *
 * Convention de nommage dans le bucket public « audiovf »:
 *   bible/{bookId}/{chapter}.mp3
 * (bookId = 1..66, chapter = 1..n). Si le fichier n'existe pas encore, on
 * retombe automatiquement sur la voix de l'appareil (synthèse vocale).
 */
const AUDIO_BUCKET = "audiovf";

export function bibleNarrationKey(bookId: number, chapter: number): string {
  return `bible/${bookId}/${chapter}.mp3`;
}

export function bibleNarrationUrl(bookId: number, chapter: number): string | null {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = sb.storage.from(AUDIO_BUCKET).getPublicUrl(bibleNarrationKey(bookId, chapter));
  return data.publicUrl?? null;
}

// Cache des existences déjà vérifiées (évite de re-tester à chaque lecture).
const existsCache = new Map<string, boolean>();

/** Vérifie (une fois) si la narration d'un chapitre est disponible. */
export async function hasBibleNarration(bookId: number, chapter: number): Promise<boolean> {
  const url = bibleNarrationUrl(bookId, chapter);
  if (!url) return false;
  if (existsCache.has(url)) return existsCache.get(url)!;
  try {
    const r = await fetch(url, { method: "HEAD" });
    const ok = r.ok;
    existsCache.set(url, ok);
    return ok;
  } catch {
    existsCache.set(url, false);
    return false;
  }
}

/** Compte les chapitres (fichiers .mp3) réellement présents pour un livre. */
export async function countBibleChapters(bookId: number): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;
  const { data, error } = await sb.storage
.from(AUDIO_BUCKET)
.list(`bible/${bookId}`, { limit: 1000 });
  if (error ||!data) return 0;
  return data.filter((f) => /\.mp3$/i.test(f.name)).length;
}

/** Admin: envoie le MP3 d'un chapitre (écrase si déjà présent). */
export async function uploadBibleChapter(
  bookId: number,
  chapter: number,
  file: File,
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const key = bibleNarrationKey(bookId, chapter);
  const out = await compressToMonoMp3(file); // 48 kbps mono → moins de bande passante
  const { error } = await sb.storage
.from(AUDIO_BUCKET)
.upload(key, out, { contentType: "audio/mpeg", upsert: true });
  const url = bibleNarrationUrl(bookId, chapter);
  if (url) existsCache.delete(url); // force une nouvelle vérification
  return!error;
}

/** File d'attente d'un livre entier (à partir de `from`) pour la lecture continue. */
export function bibleBookQueue(
  bookId: number,
  bookName: string,
  chapterCount: number,
  from = 1,
): AudioTrack[] {
  const out: AudioTrack[] = [];
  for (let c = from; c <= chapterCount; c++) {
    const t = bibleTrack(bookId, bookName, c);
    if (t) out.push(t);
  }
  return out;
}

/** Construit un « morceau » lisible par le lecteur global à partir d'un chapitre. */
export function bibleTrack(bookId: number, bookName: string, chapter: number): AudioTrack | null {
  const url = bibleNarrationUrl(bookId, chapter);
  if (!url) return null;
  return {
    id: `bible:${bookName} ${chapter}`,
    title: `${bookName} ${chapter}`,
    description: "Bible Louis Segond — narration",
    url,
    path: bibleNarrationKey(bookId, chapter),
  };
}
