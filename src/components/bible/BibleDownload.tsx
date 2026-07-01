"use client";

import { useCallback, useEffect, useState } from "react";
import { offlineChapterCount, downloadBook, deleteBook } from "@/lib/bible-offline";

/**
 * Téléchargement hors-ligne du livre courant (audio). Stocké dans le navigateur
 * (IndexedDB): une fois téléchargé, la narration se joue sans connexion, avec
 * toutes les fonctionnalités (minuteur, fond musical, arrière-plan).
 */
export function BibleDownload({
  bookId,
  bookName,
  chapterCount,
}: {
  bookId: number;
  bookName: string;
  chapterCount: number;
}) {
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const refresh = useCallback(() => {
    offlineChapterCount(bookId, chapterCount).then(setCount);
  }, [bookId, chapterCount]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const complete = count >= chapterCount && chapterCount > 0;

  async function download() {
    setProgress({ done: 0, total: chapterCount });
    await downloadBook(bookId, chapterCount, (done, total) => setProgress({ done, total }));
    setProgress(null);
    refresh();
  }

  async function remove() {
    await deleteBook(bookId, chapterCount);
    refresh();
  }

  if (progress) {
    const pct = Math.round((progress.done / progress.total) * 100);
    return (
      <div className="rounded-2xl border border-night-900/10 bg-white p-3">
        <p className="text-xs font-semibold text-night-900/70">
          Téléchargement de {bookName}… {progress.done}/{progress.total}
        </p>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-night-900/10">
          <div className="h-full rounded-full bg-dawn-400 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  if (complete) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-dawn-400/40 bg-dawn-400/[0.08] px-3 py-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-spirit-700">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {bookName} disponible hors-ligne
        </span>
        <button
          type="button"
          onClick={remove}
          className="text-xs font-semibold text-night-900/45 hover:text-red-500"
        >
          Supprimer
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={download}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-night-900/15 bg-white px-3 py-2.5 text-sm font-semibold text-spirit-700 transition-colors hover:bg-night-900/[0.03]"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.9}>
        <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {count > 0
? `Reprendre le téléchargement (${count}/${chapterCount})`
: `Télécharger ${bookName} pour l'écouter hors-ligne`}
    </button>
  );
}
