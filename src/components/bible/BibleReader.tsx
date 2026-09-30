"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { asset, mediaUrl } from "@/lib/asset";
import { Markable } from "@/components/ui/Markable";
import { HighlighterGlyph } from "@/components/ui/DevoIcons";
import type { Commentary } from "@/components/bible/CommentaryPanel";
import { VersetOutils } from "@/components/bible/VersetOutils";
import { BibleHero } from "@/components/bible/BibleHero";
import { FichesChapitre } from "@/components/bible/FichesChapitre";
import { BibleAudio } from "@/components/bible/BibleAudio";
import { BibleAudioPlayer } from "@/components/bible/BibleAudioPlayer";
import { BibleDownload } from "@/components/bible/BibleDownload";
import { usePodcastPlayer, getPodcastAudio } from "@/lib/podcast-player";
import { ReadingSettings } from "@/components/bible/ReadingSettings";
import { useReading, FONT_STACK, THEME_STYLE } from "@/lib/reading-settings";
import { useAppMode } from "@/lib/app-mode";

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
  // Feuille d'étude du verset (grille d'outils : grec/hébreu, contexte…)
  const [sheetVerse, setSheetVerse] = useState<number | null>(null);

  // Verset lu à voix haute (surlignage pendant l'écoute)
  const [spokenVerse, setSpokenVerse] = useState<number | null>(null);

  // Mode pleine lecture (immersion) : c'est l'entrée PAR DÉFAUT — on ouvre
  // la Bible directement en plein écran, comme un vrai lecteur. Le choix
  // (vue classique/immersive) est mémorisé.
  const [immersive, setImmersiveState] = useState(true);
  useEffect(() => {
    try {
      const v = localStorage.getItem("jb.bible.immersive");
      if (v !== null) setImmersiveState(v === "1");
    } catch {
      /* stockage indisponible */
    }
  }, []);
  function setImmersive(v: boolean) {
    setImmersiveState(v);
    try {
      localStorage.setItem("jb.bible.immersive", v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  // Sélecteur livre/chapitre en feuille (tap sur la pastille « Jean 3 »).
  const [selOpen, setSelOpen] = useState(false);
  const [selBook, setSelBook] = useState<number | null>(null);
  // Menu ⋮ du mode pleine lecture (carnet, recherche, téléchargement…).
  const [menuOpen, setMenuOpen] = useState(false);

  // « Reprendre où j'étais »: restaure le dernier livre/chapitre lu ET la
  // position de défilement, pour revenir EXACTEMENT au passage (ex. après un
  // aller-retour vers le carnet).
  const [restored, setRestored] = useState(false);
  const restoreScrollRef = useRef<number | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("jb.bible.pos");
      if (raw) {
        const p = JSON.parse(raw) as { bookId?: number; chapter?: number; scrollY?: number };
        if (p.bookId) setBookId(p.bookId);
        if (p.chapter) setChapter(p.chapter);
        if (typeof p.scrollY === "number") restoreScrollRef.current = p.scrollY;
      }
    } catch {
      /* stockage indisponible */
    }
    setRestored(true);
  }, []);

  // Mémorise la position (livre + chapitre + défilement) au fil de la lecture.
  useEffect(() => {
    if (!restored) return;
    const savePos = () => {
      try {
        localStorage.setItem(
          "jb.bible.pos",
          JSON.stringify({ bookId, chapter, scrollY: window.scrollY }),
        );
      } catch {
        /* ignore */
      }
    };
    savePos();
    let t: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (t) return;
      t = setTimeout(() => {
        t = null;
        savePos();
      }, 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (t) clearTimeout(t);
    };
  }, [restored, bookId, chapter]);

  // Une fois le chapitre restauré affiché, on retourne à la position mémorisée.
  useEffect(() => {
    if (loading || restoreScrollRef.current === null) return;
    if (!book?.chapters?.[chapter - 1]?.length) return;
    const y = restoreScrollRef.current;
    restoreScrollRef.current = null;
    requestAnimationFrame(() => window.scrollTo(0, y));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, book]);

  // Réinitialise les commentaires quand on change de livre/chapitre
  useEffect(() => {
    setComm({});
    setCommState("idle");
    setSheetVerse(null);
  }, [bookId, chapter]);

  function loadCommentary() {
    if (commState!== "idle") return;
    setCommState("loading");
    fetch(mediaUrl(`/commentary/${bookId}/${chapter}.json`))
.then((r) => (r.ok? r.json(): Promise.reject()))
.then((data: Record<number, Commentary>) => {
        setComm(data);
        setCommState("loaded");
      })
.catch(() => setCommState("none"));
  }

  function openStudy(vn: number) {
    loadCommentary();
    setSheetVerse(vn);
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

  const bookNames = useMemo(() => {
    const m: Record<number, string> = {};
    for (const b of index) m[b.id] = b.name;
    return m;
  }, [index]);

  const chapterCount = book?.chapters?.length?? 0;
  const verses = book?.chapters?.[chapter - 1]?? [];

  // Ancre du haut du chapitre: on y ramène la lecture quand on change de
  // chapitre (Précédent / Suivant / sélecteur), pour repartir du verset 1.
  const topRef = useRef<HTMLDivElement>(null);
  function scrollToChapterTop() {
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  function goToChapter(n: number) {
    setChapter(n);
    scrollToChapterTop();
  }

  // Surlignage du verset pendant la narration MP3 (estimé au prorata de la
  // longueur des versets, faute de repères temps dans le fichier audio).
  const reading = useReading();
  const isApp = useAppMode();

  // Pleine lecture : html et body prennent la couleur du thème de lecture —
  // la zone de la barre de statut et le rebond du défilement restent dans la
  // même teinte (plus de bandeau noir en haut).
  useEffect(() => {
    if (!immersive) return;
    const bg = reading.theme === "clair" ? "#F3F3ED" : THEME_STYLE[reading.theme].bg;
    const els = [document.documentElement, document.body];
    for (const el of els) {
      el.style.setProperty("background-color", bg, "important");
      // Le body porte aussi des dégradés décoratifs (background-image) : on
      // les coupe pour un fond UNIFORME de haut en bas, dans la teinte du
      // thème de lecture.
      el.style.setProperty("background-image", "none", "important");
    }
    return () => {
      for (const el of els) {
        el.style.removeProperty("background-color");
        el.style.removeProperty("background-image");
      }
    };
  }, [immersive, reading.theme]);

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
    <>
    {/* En vue classique, la présentation de la Bible reste en tête de page */}
    {!immersive ? <BibleHero /> : null}
    <section className={`container-x pb-10 ${immersive ? "pt-[calc(0.75rem+env(safe-area-inset-top))]" : "pt-[calc(2.5rem+env(safe-area-inset-top))]"}`}>
      {/* Barre fine du mode pleine lecture */}
      {immersive? (
        <div
          className="sticky z-40 mb-2 flex items-center justify-between gap-2 px-1 py-2"
          style={{
            // Dans l'app : sous la barre de statut du téléphone ; sur le site :
            // sous l'en-tête fixe. Pas de fond : les pastilles flottent sur le
            // texte, qui défile dessous.
            top: isApp ? "env(safe-area-inset-top)" : "4.25rem",
            color: reading.theme === "clair"? undefined: THEME_STYLE[reading.theme].text,
          }}
        >
          {/* Pastille livre + chapitre + version : ouvre le sélecteur */}
          <button
            type="button"
            onClick={() => {
              setSelBook(bookId);
              setSelOpen(true);
            }}
            aria-label="Choisir le livre et le chapitre"
            className="flex min-w-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold shadow-card backdrop-blur"
            style={{ backgroundColor: reading.theme === "sombre" ? "rgba(12,12,11,.62)" : "rgba(255,255,255,.92)" }}
          >
            <span className="truncate font-display">
              {book?.name} {chapterCount? chapter: ""}
            </span>
            <span className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-black tracking-wide opacity-70" style={{ backgroundColor: reading.theme === "sombre" ? "rgba(255,255,255,.12)" : "rgba(23,23,22,.08)" }}>
              LSG
            </span>
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-none stroke-current opacity-60" strokeWidth={2.4}>
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="relative ml-auto flex shrink-0 items-center gap-1.5">
            <ReadingSettings />
            {/* Menu : carnet, recherche, téléchargement, vue classique */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Plus d'options"
              aria-expanded={menuOpen}
              className="grid h-10 w-10 place-items-center rounded-full shadow-card backdrop-blur"
              style={{ backgroundColor: reading.theme === "sombre" ? "rgba(12,12,11,.62)" : "rgba(255,255,255,.92)" }}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <circle cx="12" cy="5.5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="18.5" r="1.7" />
              </svg>
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-white/10 bg-night-900 py-1.5 text-cream shadow-card">
                <Link href="/carnet" className="block px-4 py-2.5 text-sm font-semibold hover:bg-white/5" onClick={() => setMenuOpen(false)}>
                  Mon carnet
                </Link>
                <Link href="/recherche" className="block px-4 py-2.5 text-sm font-semibold hover:bg-white/5" onClick={() => setMenuOpen(false)}>
                  Rechercher dans la Bible
                </Link>
                <div className="px-4 py-2.5">
                  <BibleDownload bookId={bookId} bookName={book?.name?? ""} chapterCount={chapterCount} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setImmersive(false);
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-cream/70 hover:bg-white/5"
                >
                  Vue classique (plans, outils…)
                </button>
              </div>
            ) : null}
          </div>

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
            scrollToChapterTop();
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
          onChange={(e) => goToChapter(Number(e.target.value))}
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
          className="flex items-center justify-between gap-3 rounded-2xl border border-dawn-500/50 bg-gradient-to-br from-dawn-300 to-dawn-500 px-4 py-3 shadow-glow transition-transform hover:-translate-y-0.5"
        >
          <span>
            <span className="block font-display text-sm font-extrabold text-night-950">
              Découvre nos plans
            </span>
            <span className="mt-0.5 block text-xs font-medium text-night-900/70">
              Thématiques, selon ce que tu traverses.
            </span>
          </span>
          <span className="shrink-0 text-night-950">→</span>
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
          ref={topRef}
          className={`mt-6 max-w-2xl scroll-mt-4 space-y-2 ${
            reading.theme === "clair"? "text-night-900/85": immersive? "": "rounded-2xl p-4"
          }`}
          style={{
            fontFamily: FONT_STACK[reading.font],
            fontSize: `${1.125 * reading.scale}rem`,
            lineHeight: 1.65,
            // En pleine lecture, le fond de la PAGE porte déjà la couleur du
            // thème : le texte se pose directement dessus (fond uniforme,
            // pas de carte).
            backgroundColor:
              reading.theme === "clair" || immersive? undefined: THEME_STYLE[reading.theme].bg,
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
            const open = sheetVerse === vn;
            const speaking = spokenVerse === i;
            return (
              // La clé inclut livre + chapitre: en changeant de chapitre, les
              // versets se remontent, ce qui referme tout menu resté ouvert.
              <div key={`${bookId}-${chapter}-${i}`}>
                <Markable
                  id={`bible:${bookId}:${chapter}:${vn}`}
                  text={v}
                  reference={`${book?.name} ${chapter}:${vn}`}
                  kind="verset"
                >
                  <p
                    className={`transition-colors ${
                      speaking ? "-mx-2 rounded-lg bg-dawn-400/25 px-2 py-0.5" : ""
                    } ${open ? "underline decoration-dashed decoration-1 underline-offset-[6px] opacity-100" : ""}`}
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
                    {(
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openStudy(vn);
                        }}
                        aria-expanded={open}
                        aria-label="Étudier ce verset"
                        title="Étudier ce verset"
                        className={`ml-1.5 inline-grid h-6 w-6 translate-y-[4px] shrink-0 place-items-center rounded-full align-baseline transition-colors ${
                          open
? "bg-dawn-400 text-night-950"
: "bg-dawn-400/25 text-dawn-600 hover:bg-dawn-400/45 hover:text-night-900"
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5 fill-none stroke-current"
                          strokeWidth={2}
                        >
                          <path
                            d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </p>
                </Markable>

              </div>
            );
          })}
        </div>
      )}

      {/* Fin de chapitre : personnages & lieux du passage (fiches d'étude) */}
      {!loading && verses.length ? (
        <FichesChapitre
          bookId={bookId}
          chapter={chapter}
          dark={immersive && reading.theme === "sombre"}
          bookNames={bookNames}
          onNavigate={(l, c) => {
            if (l !== bookId) {
              setBookId(l);
              setChapter(c);
              scrollToChapterTop();
            } else {
              goToChapter(c);
            }
          }}
        />
      ) : null}

      {/* Pleine lecture : gros bouton de fin de chapitre */}
      {immersive && !loading && verses.length ? (
        <div className="mx-auto mt-8 max-w-2xl pb-24">
          {chapter < chapterCount ? (
            <button
              type="button"
              onClick={() => goToChapter(chapter + 1)}
              className="w-full rounded-full bg-dawn-400 py-3.5 text-center font-display text-base font-extrabold text-night-950 shadow-glow"
            >
              Chapitre suivant : {book?.name} {chapter + 1}
            </button>
          ) : bookId < 66 ? (
            <button
              type="button"
              onClick={() => {
                setBookId(bookId + 1);
                setChapter(1);
                scrollToChapterTop();
              }}
              className="w-full rounded-full bg-dawn-400 py-3.5 text-center font-display text-base font-extrabold text-night-950 shadow-glow"
            >
              Livre suivant : {index.find((b) => b.id === bookId + 1)?.name ?? ""}
            </button>
          ) : null}
        </div>
      ) : null}

      {!immersive? (
        <div className="mt-10 flex max-w-2xl items-center justify-between gap-3">
          <button
            type="button"
            disabled={chapter <= 1}
            onClick={() => goToChapter(Math.max(1, chapter - 1))}
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
            onClick={() => goToChapter(Math.min(chapterCount, chapter + 1))}
            className="btn-ghost disabled:opacity-40"
          >
            Suivant →
          </button>
        </div>
      ): null}

      {/* Pleine lecture : flèches de chapitre aux coins (comme un liseur) et
          bouton audio rond au centre, qui ouvre le lecteur en feuille */}
      {immersive &&!loading && verses.length? (
        <>
          <BibleAudioPlayer
            bookId={bookId}
            verses={verses}
            bookName={book?.name?? ""}
            chapter={chapter}
            chapterCount={chapterCount}
            books={index}
            onVerse={setSpokenVerse}
            onPrevChapter={() => goToChapter(Math.max(1, chapter - 1))}
            onNextChapter={() => {
              if (chapter < chapterCount) goToChapter(chapter + 1);
              else if (bookId < 66) {
                setBookId(bookId + 1);
                setChapter(1);
                scrollToChapterTop();
              }
            }}
            canPrev={chapter > 1}
            canNext={chapter < chapterCount || bookId < 66}
          />
          <button
            type="button"
            disabled={chapter <= 1}
            onClick={() => goToChapter(Math.max(1, chapter - 1))}
            aria-label="Chapitre précédent"
            className="fixed left-4 z-[56] grid h-12 w-12 place-items-center rounded-full border border-night-900/10 bg-white/95 text-night-900/75 shadow-card backdrop-blur disabled:opacity-0"
            style={{ bottom: "calc(var(--bottom-nav-h, 0px) + var(--audio-bar-h, 0px) + 1.75rem)" }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2}>
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            disabled={chapter >= chapterCount && bookId >= 66}
            onClick={() => {
              if (chapter < chapterCount) goToChapter(chapter + 1);
              else if (bookId < 66) {
                setBookId(bookId + 1);
                setChapter(1);
                scrollToChapterTop();
              }
            }}
            aria-label="Chapitre suivant"
            className="fixed right-4 z-[56] grid h-12 w-12 place-items-center rounded-full border border-night-900/10 bg-white/95 text-night-900/75 shadow-card backdrop-blur disabled:opacity-0"
            style={{ bottom: "calc(var(--bottom-nav-h, 0px) + var(--audio-bar-h, 0px) + 1.75rem)" }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2}>
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      ): null}

      {/* Feuille d'étude du verset touché */}
      {sheetVerse !== null && verses[sheetVerse - 1] ? (
        <VersetOutils
          bookId={bookId}
          chapter={chapter}
          verse={sheetVerse}
          verseText={verses[sheetVerse - 1]}
          reference={`${book?.name} ${chapter}:${sheetVerse}`}
          commentary={comm[sheetVerse]}
          commentaryState={commState}
          bookNames={bookNames}
          onNavigate={(l, c) => {
            if (l !== bookId) {
              setBookId(l);
              setChapter(c);
              scrollToChapterTop();
            } else {
              goToChapter(c);
            }
          }}
          onClose={() => setSheetVerse(null)}
        />
      ) : null}

      {/* Sélecteur livre/chapitre : feuille qui monte du bas de l'écran */}
      {selOpen ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setSelOpen(false)}
            className="absolute inset-0 bg-night-950/70 backdrop-blur-sm"
          />
          <div className="dark-ctx relative flex max-h-[82vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-night-900 text-cream sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
              <p className="font-display text-base font-extrabold">
                {selBook !== null && selBook !== -1
                  ? index.find((b) => b.id === selBook)?.name
                  : "Choisis un livre"}
              </p>
              <div className="flex items-center gap-2">
                {selBook !== null && selBook !== -1 ? (
                  <button
                    type="button"
                    onClick={() => setSelBook(-1)}
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-cream/75"
                  >
                    Tous les livres
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setSelOpen(false)}
                  aria-label="Fermer"
                  className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-cream/70"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {selBook === null || selBook === -1 ? (
                <>
                  {[{ t: "Ancien Testament", from: 1, to: 39 }, { t: "Nouveau Testament", from: 40, to: 66 }].map((g) => (
                    <div key={g.t} className="mb-4">
                      <p className="mb-2 px-1 text-[11px] font-black uppercase tracking-[0.18em] text-dawn-400">{g.t}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {index.filter((b) => b.id >= g.from && b.id <= g.to).map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setSelBook(b.id)}
                            className={`truncate rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${
                              b.id === bookId ? "bg-dawn-400 text-night-950" : "bg-white/[0.06] text-cream/85 hover:bg-white/10"
                            }`}
                          >
                            {b.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from(
                    { length: index.find((b) => b.id === selBook)?.chapters ?? 0 },
                    (_, i) => i + 1,
                  ).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        const target = selBook;
                        setSelOpen(false);
                        if (target !== bookId) {
                          setBookId(target);
                          setChapter(n);
                          scrollToChapterTop();
                        } else {
                          goToChapter(n);
                        }
                      }}
                      className={`grid aspect-square place-items-center rounded-xl font-display text-base font-bold ${
                        selBook === bookId && n === chapter
                          ? "bg-dawn-400 text-night-950"
                          : "bg-white/[0.06] text-cream/85 hover:bg-white/10"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
    </>
  );
}
