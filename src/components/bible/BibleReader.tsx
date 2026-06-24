"use client";

import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";

type BookIndex = { id: number; name: string; chapters: number };
type Book = { id: number; name: string; chapters: string[][] };

export function BibleReader() {
  const [index, setIndex] = useState<BookIndex[]>([]);
  const [bookId, setBookId] = useState(43); // Jean par défaut
  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState(1);
  const [loading, setLoading] = useState(true);

  // Liste des livres
  useEffect(() => {
    fetch(asset("/bible/index.json"))
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => {});
  }, []);

  // Lien profond éventuel : /bible?livre=43&chap=3
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const l = Number(params.get("livre"));
    const c = Number(params.get("chap"));
    if (l >= 1 && l <= 66) setBookId(l);
    if (c >= 1) setChapter(c);
  }, []);

  // Charge le livre sélectionné
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(asset(`/bible/${bookId}.json`))
      .then((r) => r.json())
      .then((b: Book) => {
        if (!active) return;
        setBook(b);
        setChapter((c) => Math.min(Math.max(1, c), b.chapters.length));
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [bookId]);

  const chapterCount = book?.chapters?.length ?? 0;
  const verses = book?.chapters?.[chapter - 1] ?? [];

  return (
    <section className="container-x py-10">
      {/* Sélecteurs livre + chapitre */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          aria-label="Livre"
          value={bookId}
          onChange={(e) => {
            setBookId(Number(e.target.value));
            setChapter(1);
          }}
          className="field max-w-[15rem]"
        >
          {index.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Chapitre"
          value={chapter}
          onChange={(e) => setChapter(Number(e.target.value))}
          className="field max-w-[9rem]"
        >
          {Array.from({ length: chapterCount }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              Chapitre {n}
            </option>
          ))}
        </select>
      </div>

      <h2 className="mt-8 font-display text-3xl font-extrabold">
        {book?.name} {chapterCount ? chapter : ""}
      </h2>

      {loading ? (
        <p className="mt-6 text-night-900/50">Chargement…</p>
      ) : (
        <div className="mt-6 max-w-2xl space-y-3 text-lg leading-relaxed text-night-900/85">
          {verses.map((v, i) => (
            <p key={i}>
              <sup className="mr-1 align-super text-xs font-bold text-spirit-600">
                {i + 1}
              </sup>
              {v}
            </p>
          ))}
        </div>
      )}

      <div className="mt-10 flex max-w-2xl items-center justify-between gap-3">
        <button
          type="button"
          disabled={chapter <= 1}
          onClick={() => setChapter((c) => Math.max(1, c - 1))}
          className="btn-ghost disabled:opacity-40"
        >
          ← Précédent
        </button>
        <span className="text-sm text-night-900/50">
          {chapterCount ? `Chapitre ${chapter} / ${chapterCount}` : ""}
        </span>
        <button
          type="button"
          disabled={chapter >= chapterCount}
          onClick={() => setChapter((c) => Math.min(chapterCount, c + 1))}
          className="btn-ghost disabled:opacity-40"
        >
          Suivant →
        </button>
      </div>
    </section>
  );
}
