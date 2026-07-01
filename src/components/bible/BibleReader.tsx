"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { Markable } from "@/components/ui/Markable";
import { HighlighterGlyph } from "@/components/ui/DevoIcons";
import { CommentaryPanel, type Commentary } from "@/components/bible/CommentaryPanel";
import { BibleAudio } from "@/components/bible/BibleAudio";
import { BibleDownload } from "@/components/bible/BibleDownload";
import { usePodcastPlayer, getPodcastAudio } from "@/lib/podcast-player";
import { ReadingSettings } from "@/components/bible/ReadingSettings";
import { useReading, FONT_STACK, THEME_STYLE } from "@/lib/reading-settings";

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

  // Verset lu à voix haute (surlignage pendant l'écoute)
  const [spokenVerse, setSpokenVerse] = useState<number | null>(null);

  // Mode pleine lecture (immersion)
  const [immersive, setImmersive] = useState(false);

  // « Reprendre où j'étais »: restaure le dernier livre/chapitre lu.
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("jb.bible.pos");
      if (raw) {
        const p = JSON.parse(raw) as { bookId?: number; chapter?: number };
        if (p.bookId) setBookId(p.bookId);
        if (p.chapter) setChapter(p.chapter);
      }
    } catch {
      /* stockage indisponible */
    }
    setRestored(true);
  }, []);

  // Mémorise la position à chaque changement (après restauration).
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem("jb.bible.pos", JSON.stringify({ bookId, chapter }));
    } catch {
      /* ignore */
    }
  }, [restored, bookId, chapter]);

  // Réinitialise les commentaires quand on change de livre/chapitre
  useEffect(() => {
    setComm({});
    setCommState("idle");
    setOpenVerses(new Set());
  }, [bookId, chapter]);

  function loadCommentary() {
    if (commState!== "idle") return;
    setCommState("loading");
    fetch(asset(`/commentary/${bookId}/${chapter}.json`))
.then((r) => (r.ok? r.json(): Promise.reject()))
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

  // Lien profond éventuel: /bible?livre=43&chap=3
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

  const chapterCount = book?.chapters?.length?? 0;
  const verses = book?.chapters?.[chapter - 1]?? [];

  // Surlignage du verset pendant la narration MP3 (estimé au prorata de la
  // longueur des versets, faute de repères temps dans le fichier audio).
  const reading = useReading();
  const pod = usePodcastPlayer();
  const narrId = book? `bible:${book.name} ${chapter}`: "";
  const narrating = pod.current?.id === narrId && narrId!== "";
  useEffect(() => {
    if (!narrating ||!verses.length) return;
    const a = getPodcastAudio();
    if (!a) return;
    const lens = verses.map((v) => Math.max(1, v.length));
    const total = lens.reduce((s, n) => s + n, 0);
    const cum: number[] = [];
    let acc = 0;
    for (const n of lens) {
      acc += n;
      cum.push(acc);
    }
    const onT = () => {
      const dur = a.duration;
      if (!dur ||!Number.isFinite(dur)) return;
      const target = Math.min(1, a.currentTime / dur) * total;
      let idx = cum.findIndex((c) => target <= c);
      if (idx < 0) idx = verses.length - 1;
      setSpokenVerse(idx);
    };
    a.addEventListener("timeupdate", onT);
    return () => {
      a.removeEventListener("timeupdate", onT);
      setSpokenVerse(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrating, book, chapter]);

  // Lecture continue: quand la narration passe au chapitre (ou au livre)
  // suivant, la lecture à l'écran suit automatiquement.
  useEffect(() => {
    const id = pod.current?.id;
    if (!id) return;
    const m = id.match(/^bible:(.+) (\d+)$/);
    if (!m) return;
    const name = m[1];
    const n = Number(m[2]);
    const target = index.find((b) => b.name === name);
    if (!target) return;
    if (target.id!== bookId) {
      setBookId(target.id);
      setChapter(n);
    } else if (n!== chapter) {
      setChapter(n);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pod.current?.id]);

  return (
    <section className="container-x py-10">
      {/* Barre fine du mode pleine lecture */}
      {immersive? (
        <div
          className="sticky top-0 z-40 mb-2 flex items-center justify-between gap-2 rounded-b-2xl px-1 py-2 backdrop-blur"
          style={{
            backgroundColor:
              reading.theme === "clair"? "rgba(243,243,237,0.95)": THEME_STYLE[reading.theme].bg,
            color: reading.theme === "clair"? undefined: THEME_STYLE[reading.theme].text,
          }}
        >
          <button
            type="button"
            onClick={() => setImmersive(false)}
            className="rounded-full border border-night-900/15 bg-white px-3 py-1.5 text-sm font-semibold text-night-900/70"
          >
            ✕ Quitter
          </button>
          <span className="font-display text-sm font-bold">
            {book?.name} {chapterCount? chapter: ""}
          </span>
          <ReadingSettings />
        </div>
      ): null}

      {!immersive? (
        <>
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

        {/* Téléchargement hors-ligne du livre (bouton discret) */}
        <BibleDownload bookId={bookId} bookName={book?.name?? ""} chapterCount={chapterCount} />

        {/* Accès au carnet (prise de notes pendant la lecture) */}
        <Link
          href="/carnet"
          aria-label="Mon carnet"
          className="ml-auto grid h-11 w-11 shrink-0 place-items-center rounded-full border border-night-900/15 bg-white text-spirit-700 transition-colors hover:bg-night-900/5"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
            <path d="M6 3.5h8.5L19 8v12.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1z" />
            <path d="M14 3.5V8h4.5M8.5 13h7M8.5 16.5h7" strokeLinecap="round" />
          </svg>
        </Link>

        {/* Recherche d'un mot/verset dans toute la Bible */}
        <Link
          href="/recherche"
          aria-label="Rechercher dans la Bible"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-night-900/15 bg-white text-spirit-700 transition-colors hover:bg-night-900/5"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
        </Link>

        {/* Confort de lecture: taille du texte + police */}
        <ReadingSettings />

        {/* Mode pleine lecture (immersion) */}
        <button
          type="button"
          onClick={() => setImmersive(true)}
          aria-label="Mode pleine lecture"
          title="Pleine lecture"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-night-900/15 bg-white text-spirit-700 transition-colors hover:bg-night-900/5"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
            <path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Accès rapides en haut (visibles): plans thématiques + Bible en 1 an */}
      <div className="mt-4 grid max-w-2xl gap-3 sm:grid-cols-2">
        <Link
          href="/plans"
          className="flex items-center justify-between gap-3 rounded-2xl border border-dawn-400/40 bg-gradient-to-br from-dawn-400/10 to-spirit-500/10 px-4 py-3 transition-shadow hover:shadow-md"
        >
          <span>
            <span className="block font-display text-sm font-bold text-spirit-700">
              Découvre nos plans
            </span>
            <span className="mt-0.5 block text-xs text-night-900/60">
              Thématiques, selon ce que tu traverses.
            </span>
          </span>
          <span className="shrink-0 text-spirit-700">→</span>
        </Link>

        <Link
          href="/bible-1-an"
          className="dark-ctx group flex items-center justify-between gap-3 overflow-hidden rounded-2xl border border-dawn-500/40 bg-night-900 px-4 py-3 text-cream transition-transform hover:-translate-y-0.5"
        >
          <span>
            <span className="eyebrow text-[10px]">Grand parcours</span>
            <span className="mt-0.5 block font-display text-sm font-extrabold">
              La Bible en <span className="text-gradient">1 an</span>
            </span>
          </span>
          <span className="shrink-0 transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <h2 className="mt-8 flex flex-wrap items-baseline gap-x-3 font-display text-3xl font-extrabold">
        <span>
          {book?.name} {chapterCount? chapter: ""}
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-spirit-500">
          Louis Segond
        </span>
      </h2>

      {/* Service audio: écouter le chapitre (voix de l'appareil, LSG libre) */}
      {!loading && verses.length? (
        <div className="mt-4 max-w-2xl">
          <BibleAudio
            bookId={bookId}
            verses={verses}
            bookName={book?.name?? ""}
            chapter={chapter}
            chapterCount={chapterCount}
            books={index}
            onVerse={setSpokenVerse}
          />
        </div>
      ): null}
        </>
      ): null}

      {loading? (
        <p className="mt-6 text-night-900/50">Chargement…</p>
      ): (
        <div
          className={`mt-6 max-w-2xl space-y-2 ${
            reading.theme === "clair"? "text-night-900/85": "rounded-2xl p-4"
          }`}
          style={{
            fontFamily: FONT_STACK[reading.font],
            fontSize: `${1.125 * reading.scale}rem`,
            lineHeight: 1.65,
            backgroundColor:
              reading.theme === "clair"? undefined: THEME_STYLE[reading.theme].bg,
            color: reading.theme === "clair"? undefined: THEME_STYLE[reading.theme].text,
          }}
        >
          {!immersive? (
            <p className="mb-2 flex items-center gap-1.5 text-xs text-night-900/45">
              <HighlighterGlyph className="h-3.5 w-3.5" />
              Touche un verset pour le surligner, le copier ou l'enregistrer.
            </p>
          ): null}
          {verses.map((v, i) => {
            const vn = i + 1;
            const open = openVerses.has(vn);
            const c = comm[vn];
            const speaking = spokenVerse === i;
            return (
              <div key={i}>
                <Markable
                  id={`bible:${bookId}:${chapter}:${vn}`}
                  text={v}
                  reference={`${book?.name} ${chapter}:${vn}`}
                  kind="verset"
                >
                  <p
                    className={
                      speaking
? "-mx-2 rounded-lg bg-dawn-400/25 px-2 py-0.5 transition-colors"
: "transition-colors"
                    }
                  >
                    <sup
                      className="mr-1 align-super text-xs font-bold text-spirit-600"
                      style={
                        reading.theme === "clair"? undefined: { color: THEME_STYLE[reading.theme].num }
                      }
                    >
                      {vn}
                    </sup>
                    {v}
                    {!immersive? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVerse(vn);
                        }}
                        aria-expanded={open}
                        aria-label="Commentaire & sens des mots"
                        className={`ml-1 inline-flex translate-y-[2px] align-baseline transition-opacity ${
                          open? "opacity-90": "opacity-35 hover:opacity-80"
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-[0.8em] w-[0.8em] fill-none stroke-current"
                          strokeWidth={2.2}
                        >
                          <path
                            d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    ): null}
                  </p>
                </Markable>

                {!immersive && open? (
                  <CommentaryPanel state={commState} data={c} />
                ): null}
              </div>
            );
          })}
        </div>
      )}

      {!immersive? (
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
            {chapterCount? `Chapitre ${chapter} / ${chapterCount}`: ""}
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
      ): null}

      {/* Pleine lecture: lecteur audio flottant centré + navigation chapitre */}
      {immersive &&!loading && verses.length? (
        <div className="fixed bottom-24 left-1/2 z-[56] flex -translate-x-1/2 items-center gap-2">
          <button
            type="button"
            disabled={chapter <= 1}
            onClick={() => setChapter((c) => Math.max(1, c - 1))}
            aria-label="Chapitre précédent"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-night-900/15 bg-white/95 text-spirit-700 shadow-card backdrop-blur disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2}>
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <BibleAudio
            bookId={bookId}
            verses={verses}
            bookName={book?.name?? ""}
            chapter={chapter}
            chapterCount={chapterCount}
            books={index}
            onVerse={setSpokenVerse}
            variant="floating"
          />
          <button
            type="button"
            disabled={chapter >= chapterCount}
            onClick={() => setChapter((c) => Math.min(chapterCount, c + 1))}
            aria-label="Chapitre suivant"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-night-900/15 bg-white/95 text-spirit-700 shadow-card backdrop-blur disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2}>
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      ): null}
    </section>
  );
}
