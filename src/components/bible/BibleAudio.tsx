"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { hasBibleNarration, bibleBookQueue, bibleFullQueue, type BibleBookMeta } from "@/lib/bible-audio";
import { playQueue, usePodcastPlayer } from "@/lib/podcast-player";
import {
  useAmbient,
  setVoiceActive,
  ambientKick,
  AMBIENT_VOL_MIN,
  AMBIENT_VOL_MAX,
} from "@/lib/ambient";

/**
 * Bible audio (service « Écouter la Bible »). Deux modes:
 *  1) NARRATION (préféré): si un fichier MP3 du chapitre est hébergé dans
 *     Supabase, on le joue via le lecteur global → arrière-plan, écran
 *     verrouillé, contrôles de veille et minuteur de veille.
 *  2) VOIX DE L'APPAREIL (repli): sinon, on lit le texte Louis Segond
 *     (domaine public) à voix haute (synthèse vocale), verset par verset avec
 *     surlignage. Fonctionne app ouverte uniquement, avec minuteur local.
 */
export function BibleAudio({
  bookId,
  verses,
  bookName,
  chapter,
  chapterCount,
  books = [],
  onVerse,
  variant = "inline",
}: {
  bookId: number;
  verses: string[];
  bookName: string;
  chapter: number;
  chapterCount: number;
  /** Index complet des livres (pour la lecture continue sur toute la Bible). */
  books?: BibleBookMeta[];
  /** Index (0-based) du verset lu, ou null quand la lecture s'arrête. */
  onVerse: (index: number | null) => void;
  /** "floating" = pilule centrée en bas (mode pleine lecture). */
  variant?: "inline" | "floating";
}) {
  const ambient = useAmbient();
  const pod = usePodcastPlayer();
  const floating = variant === "floating";
  const rootCls = floating
? "dark-ctx bg-topo-dark flex w-[58vw] max-w-[15rem] items-center gap-2 rounded-full border border-white/10 p-2 text-cream shadow-card"
: "dark-ctx bg-topo-dark flex items-center gap-3 rounded-2xl border border-white/10 p-3 text-cream shadow-card";

  // Narration hébergée disponible pour ce chapitre?
  const [hasNarr, setHasNarr] = useState(false);
  useEffect(() => {
    let active = true;
    hasBibleNarration(bookId, chapter).then((v) => {
      if (active) setHasNarr(v);
    });
    return () => {
      active = false;
    };
  }, [bookId, chapter]);
  const [supported, setSupported] = useState(true);
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const idxRef = useRef(0);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Réglage du fond musical (activation + volume).
  const [ambientMenu, setAmbientMenu] = useState(false);

  // Minuteur de veille (l'écoute s'arrête toute seule).
  const [sleepMin, setSleepMin] = useState<number | null>(null);
  const [sleepMenu, setSleepMenu] = useState(false);
  const sleepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Détecte le support + choisit une voix française.
  useEffect(() => {
    if (typeof window === "undefined" ||!("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current =
        voices.find((v) => /fr-FR/i.test(v.lang)) ??
        voices.find((v) => /^fr/i.test(v.lang)) ??
        null;
    };
    pick();
    window.speechSynthesis.addEventListener("voiceschanged", pick);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pick);
  }, []);

  const stop = useCallback(() => {
    if (typeof window!== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (sleepTimer.current) {
      clearTimeout(sleepTimer.current);
      sleepTimer.current = null;
    }
    setSleepMin(null);
    setVoiceActive(false);
    idxRef.current = 0;
    setState("idle");
    onVerse(null);
  }, [onVerse]);

  // Arme (ou annule) le minuteur de veille.
  const armSleep = useCallback(
    (min: number | null) => {
      if (sleepTimer.current) {
        clearTimeout(sleepTimer.current);
        sleepTimer.current = null;
      }
      setSleepMin(min);
      setSleepMenu(false);
      if (min!== null) {
        sleepTimer.current = setTimeout(() => {
          sleepTimer.current = null;
          stop();
        }, min * 60_000);
      }
    },
    [stop],
  );

  // Arrête la lecture si on change de chapitre / de livre ou si on quitte.
  useEffect(() => {
    stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookName, chapter]);
  useEffect(() => () => stop(), [stop]);

  const speakFrom = useCallback(
    (start: number) => {
      const synth = window.speechSynthesis;
      synth.cancel();
      const speakOne = (i: number) => {
        if (i >= verses.length) {
          stop();
          return;
        }
        idxRef.current = i;
        onVerse(i);
        const u = new SpeechSynthesisUtterance(verses[i]);
        u.lang = "fr-FR";
        if (voiceRef.current) u.voice = voiceRef.current;
        u.rate = 0.96;
        u.pitch = 1;
        u.onend = () => {
          // La reprise après pause ne rejoue pas onend; on avance seulement
          // quand la lecture s'est terminée normalement.
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) return;
          speakOne(i + 1);
        };
        synth.speak(u);
      };
      speakOne(start);
    },
    [verses, onVerse, stop],
  );

  function play() {
    if (!verses.length) return;
    track("play", `bible:${bookName} ${chapter}`);
    setState("playing");
    setVoiceActive(true);
    ambientKick();
    speakFrom(idxRef.current);
  }

  function pause() {
    window.speechSynthesis.pause();
    setState("paused");
    setVoiceActive(false);
  }

  function resume() {
    window.speechSynthesis.resume();
    setState("playing");
    setVoiceActive(true);
    ambientKick();
  }

  // Lance la narration hébergée via le lecteur global (arrière-plan + minuteur).
  function playNarration() {
    // Lecture continue sur TOUTE la Bible (livre après livre) si l'index est
    // disponible; sinon repli sur le livre courant.
    const q =
      books.length > 0
? bibleFullQueue(books, bookId, chapter)
: bibleBookQueue(bookId, bookName, chapterCount, chapter);
    if (q.length) {
      playQueue(q, 0);
      ambientKick();
    }
  }

  // Réglage « fond musical doux »: activer + doser le volume par rapport à la
  // voix (le fond était parfois trop fort pour certains chapitres narrés).
  const volPct = Math.round(
    ((ambient.volume - AMBIENT_VOL_MIN) / (AMBIENT_VOL_MAX - AMBIENT_VOL_MIN)) * 100,
  );
  const ambientToggle = (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setAmbientMenu((o) =>!o)}
        aria-expanded={ambientMenu}
        aria-label="Fond musical doux"
        title="Fond musical doux"
        className={`grid h-10 w-10 place-items-center rounded-full border ${
          ambient.enabled
? "border-dawn-400 bg-dawn-400/15 text-dawn-300"
: "border-white/15 bg-white/10 text-cream/70"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
          <path d="M9 18V6l10-2v12" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="16" r="2" />
        </svg>
      </button>
      {ambientMenu? (
        <div className="absolute right-0 top-full z-[60] mt-2 w-64 rounded-2xl border border-night-900/10 bg-white p-4 text-night-900 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <span className="font-display text-sm font-bold">Fond musical doux</span>
            <button
              type="button"
              onClick={() => ambient.setEnabled(!ambient.enabled)}
              aria-pressed={ambient.enabled}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                ambient.enabled? "bg-spirit-600": "bg-night-900/20"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  ambient.enabled? "left-[22px]": "left-0.5"
                }`}
              />
            </button>
          </div>
          <p className="mt-1 text-xs text-night-900/55">
            Une nappe instrumentale discrète sous la lecture.
          </p>

          <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-night-900/45">
            Volume du fond
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] text-night-900/45">Voix</span>
            <input
              type="range"
              min={AMBIENT_VOL_MIN}
              max={AMBIENT_VOL_MAX}
              step={0.01}
              value={ambient.volume}
              disabled={!ambient.enabled}
              onChange={(e) => ambient.setVolume(Number(e.target.value))}
              className="h-1 flex-1 accent-spirit-600 disabled:opacity-40"
              aria-label="Volume du fond musical"
            />
            <span className="text-[11px] text-night-900/45">Fond</span>
          </div>
          <p className="mt-1 text-center text-xs tabular-nums text-night-900/45">{volPct}%</p>
          <p className="mt-1 text-[11px] text-night-900/45">
            Baisse le fond si la voix est un peu couverte.
          </p>
        </div>
      ): null}
    </div>
  );

  // MODE NARRATION: fichier hébergé → lecteur global (arrière-plan, veille…).
  if (hasNarr) {
    // En pleine lecture, si la narration joue déjà, la barre du bas suffit.
    const isCurrent = pod.current?.id === `bible:${bookName} ${chapter}`;
    if (variant === "floating" && isCurrent) return null;
    return (
      <div className={rootCls}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-night-900 text-dawn-400">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
            <path
              d="M4 14v-2a8 8 0 0 1 16 0v2M4 14v3a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 1zM20 14v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 1z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold leading-tight">Écouter la Bible</p>
          {!floating? (
            <p className="text-[11px] text-cream/60">
              Narration, écran verrouillé, minuteur dans la barre du bas
              {ambient.enabled? " · fond musical": ""}
            </p>
          ): (
            <p className="text-[11px] text-cream/60">Narration</p>
          )}
        </div>
        {!floating? ambientToggle: null}
        <button
          type="button"
          onClick={playNarration}
          aria-label="Écouter"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-900"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
    );
  }

  if (!supported) return null;

  return (
    <div className={rootCls}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-night-900 text-dawn-400">
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
          <path
            d="M4 14v-2a8 8 0 0 1 16 0v2M4 14v3a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 1zM20 14v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 1z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-bold leading-tight">Écouter la Bible</p>
        {!floating? (
          <p className="text-[11px] text-cream/60">
            {state === "idle"
? "Lecture audio du chapitre (voix de l'appareil)"
: `En lecture, verset ${idxRef.current + 1}`}
            {sleepMin? ` · minuteur ${sleepMin} min`: ""}
            {ambient.enabled? " · fond musical": ""}
          </p>
        ): (
          <p className="text-[11px] text-cream/60">Voix de l'appareil</p>
        )}
      </div>

      {!floating? ambientToggle: null}

      {/* Minuteur de veille */}
      {!floating? (
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setSleepMenu((o) =>!o)}
          aria-label="Minuteur de veille"
          className={`grid h-10 w-10 place-items-center rounded-full border ${
            sleepMin
? "border-dawn-400 text-dawn-300"
: "border-white/15 bg-white/10 text-cream"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2.5 2M9 2h6" strokeLinecap="round" />
          </svg>
        </button>
        {sleepMenu? (
          <div className="absolute right-0 top-full z-[60] mt-2 w-40 overflow-hidden rounded-2xl border border-night-900/10 bg-white text-night-900 shadow-xl">
            <p className="px-4 pt-3 text-[11px] font-bold uppercase tracking-wide text-night-900/45">
              Minuteur
            </p>
            <ul className="py-1">
              {[10, 20, 30, 45, 60].map((m) => (
                <li key={m}>
                  <button
                    type="button"
                    onClick={() => armSleep(m)}
                    className="w-full px-4 py-2 text-left text-sm text-night-900/80 hover:bg-night-900/[0.04]"
                  >
                    {m} minutes
                  </button>
                </li>
              ))}
              {sleepMin? (
                <li className="border-t border-night-900/10">
                  <button
                    type="button"
                    onClick={() => armSleep(null)}
                    className="w-full px-4 py-2 text-left text-sm font-semibold text-red-500 hover:bg-red-50"
                  >
                    Désactiver
                  </button>
                </li>
              ): null}
            </ul>
          </div>
        ): null}
      </div>
      ): null}

      {state === "playing"? (
        <button
          type="button"
          onClick={pause}
          aria-label="Pause"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-900"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        </button>
      ): (
        <button
          type="button"
          onClick={state === "paused"? resume: play}
          aria-label="Écouter"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-900"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}

      {state!== "idle"? (
        <button
          type="button"
          onClick={stop}
          aria-label="Arrêter"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-cream"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <rect x="6" y="6" width="12" height="12" rx="1.5" />
          </svg>
        </button>
      ): null}
    </div>
  );
}
