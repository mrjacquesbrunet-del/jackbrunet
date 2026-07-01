"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { hasBibleNarration, bibleTrack } from "@/lib/bible-audio";
import { playQueue, usePodcastPlayer } from "@/lib/podcast-player";
import { useAmbient, setVoiceActive, ambientKick } from "@/lib/ambient";

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
  onVerse,
  variant = "inline",
}: {
  bookId: number;
  verses: string[];
  bookName: string;
  chapter: number;
  /** Index (0-based) du verset lu, ou null quand la lecture s'arrête. */
  onVerse: (index: number | null) => void;
  /** "floating" = pilule centrée en bas (mode pleine lecture). */
  variant?: "inline" | "floating";
}) {
  const ambient = useAmbient();
  const pod = usePodcastPlayer();
  const rootCls =
    variant === "floating"
? "dark-ctx bg-topo-dark flex w-[min(78vw,22rem)] items-center gap-2.5 rounded-full border border-white/10 p-2.5 text-cream shadow-card"
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
    const t = bibleTrack(bookId, bookName, chapter);
    if (t) {
      playQueue([t], 0);
      ambientKick();
    }
  }

  // Petit interrupteur « fond musical doux ».
  const ambientToggle = (
    <button
      type="button"
      onClick={() => {
        ambient.setEnabled(!ambient.enabled);
      }}
      aria-pressed={ambient.enabled}
      aria-label="Fond musical doux"
      title="Fond musical doux"
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border ${
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
          <p className="text-[11px] text-cream/60">
            Narration — écran verrouillé, minuteur dans la barre du bas
            {ambient.enabled? " · fond musical": ""}
          </p>
        </div>
        {ambientToggle}
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
        <p className="text-[11px] text-cream/60">
          {state === "idle"
? "Lecture audio du chapitre (voix de l'appareil)"
: `En lecture — verset ${idxRef.current + 1}`}
          {sleepMin? ` · minuteur ${sleepMin} min`: ""}
          {ambient.enabled? " · fond musical": ""}
        </p>
      </div>

      {ambientToggle}

      {/* Minuteur de veille */}
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
