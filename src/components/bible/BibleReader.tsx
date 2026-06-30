"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { Markable } from "@/components/ui/Markable";
import { HighlighterGlyph } from "@/components/ui/DevoIcons";
import { CommentaryPanel, type Commentary } from "@/components/bible/CommentaryPanel";

type BookIndex = { id: number; name: string; chapters: number };
type Book = { id: number; name: string; chapters: string[][] };

export function BibleReader() {
  const [index, setIndex] = useState<BookIndex[]>([]);
  const [bookId, setBookId] = useState(43); // Jean par défaut
  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState(1);
  const [loading, setLoading] = useState(true);

  // Commentaires d'étude (chargés à la demande, une fois par chapitre)
  const [comm, setComm] = useState<Record<number, Commentary>>({});
  const [commState, setCommState] = useState<"idle" | "loading" | "loaded" | "none">("idle");
  const [openVerses, setOpenVerses] = useState<Set<number>>(new Set());

  // Réinitialise les commentaires quand on change de livre/chapitre
  useEffect(() => {
    setComm({});
    setCommState("idle");
    setOpenVerses(new Set());
  }, [bookId, chapter]);

  function loadCommentary() {
    if (commState !== "idle") return;
    setCommState("loading");
    fetch(asset(`/commentary/${bookId}/${chapter}.json`))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Record<number, Commentary>) => {
        setComm(data);
        setCommState("loaded");
      })
      .catch(() => setCommState("none"));
  }

  function toggleVerse(vn: number) {
    loadCommentary();
    setOpenVerses((prev) => {
      const next = new Set(prev);
      if (next.has(vn)) next.delete(vn);
      else next.add(vn);
      return next;
    });
  }

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

      {/* Invitation à découvrir les plans de lecture */}
      <Link
        href="/plans"
        className="mt-4 flex max-w-2xl items-center justify-between gap-3 rounded-2xl border border-dawn-400/40 bg-gradient-to-br from-dawn-400/10 to-spirit-500/10 px-4 py-3 transition-shadow hover:shadow-md"
      >
        <span>
          <span className="block font-display font-bold text-spirit-700">
            Découvre nos plans de lecture
          </span>
          <span className="mt-0.5 block text-sm text-night-900/60">
            La Bible en 1 an, ou un thème selon ce que tu traverses.
          </span>
        </span>
        <span className="shrink-0 text-spirit-700">→</span>
      </Link>

      <h2 className="mt-8 font-display text-3xl font-extrabold">
        {book?.name} {chapterCount ? chapter : ""}
      </h2>

      {loading ? (
        <p className="mt-6 text-night-900/50">Chargement…</p>
      ) : (
        <div className="mt-6 max-w-2xl space-y-2 text-lg leading-relaxed text-night-900/85">
          <p className="mb-2 flex items-center gap-1.5 text-xs text-night-900/45">
            <HighlighterGlyph className="h-3.5 w-3.5" />
            Touche un verset pour le surligner, le copier ou l'enregistrer.
          </p>
          {verses.map((v, i) => {
            const vn = i + 1;
            const open = openVerses.has(vn);
            const c = comm[vn];
            return (
              <div key={i}>
                <Markable
                  id={`bible:${bookId}:${chapter}:${vn}`}
                  text={v}
                  reference={`${book?.name} ${chapter}:${vn}`}
                  kind="verset"
                >
                  <p>
                    <sup className="mr-1 align-super text-xs font-bold text-spirit-600">
                      {vn}
                    </sup>
                    {v}
                  </p>
                </Markable>

                <button
                  type="button"
                  onClick={() => toggleVerse(vn)}
                  aria-expanded={open}
                  className="mt-1 text-xs font-semibold text-spirit-600 hover:underline"
                >
                  {open ? "Masquer le commentaire" : "Commentaire & sens des mots"}
                </button>

                {open ? (
                  <CommentaryPanel state={commState} data={c} />
                ) : null}
              </div>
            );
          })}
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
