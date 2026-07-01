"use client";

import { useCallback, useEffect, useState } from "react";
import { offlineChapterCount, downloadBook, deleteBook } from "@/lib/bible-offline";

/**
 * Petit bouton discret (icône) de téléchargement hors-ligne du livre courant,
 * à côté du sélecteur de chapitre. États: à télécharger (flèche) · en cours
 * (anneau de progression) · disponible (coche lime, retap = supprimer).
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
  const busy = progress!== null;

  async function onClick() {
    if (busy) return;
    if (complete) {
      if (confirm(`Supprimer « ${bookName} » hors-ligne ?`)) {
        await deleteBook(bookId, chapterCount);
        refresh();
      }
      return;
    }
    setProgress({ done: 0, total: chapterCount });
    await downloadBook(bookId, chapterCount, (done, total) => setProgress({ done, total }));
    setProgress(null);
    refresh();
  }

  const pct = progress? progress.done / progress.total: 0;
  const C = 2 * Math.PI * 9; // circonférence de l'anneau (r=9)

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        complete
? `${bookName} disponible hors-ligne`
: busy
? "Téléchargement…"
: `Télécharger ${bookName} hors-ligne`
      }
      title={
        complete? "Disponible hors-ligne · toucher pour supprimer": "Télécharger hors-ligne"
      }
      className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors ${
        complete
? "border-dawn-400 bg-dawn-400/15 text-spirit-700"
: "border-night-900/15 bg-white text-spirit-700 hover:bg-night-900/5"
      }`}
    >
      {busy? (
        <>
          <svg viewBox="0 0 24 24" className="absolute h-8 w-8 -rotate-90">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - pct)}
            />
          </svg>
          <span className="text-[9px] font-bold tabular-nums">{Math.round(pct * 100)}</span>
        </>
      ): complete? (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2}>
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ): (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9}>
          <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
