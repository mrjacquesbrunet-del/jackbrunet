"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

/**
 * Bible audio (service « Écouter la Bible ») — lit le chapitre à voix haute
 * avec la voix française de l'appareil (Web Speech API). Aucune licence ni
 * fichier requis: on lit le texte Louis Segond (domaine public) déjà présent
 * dans l'app. Lecture verset par verset, avec surlignage du verset en cours,
 * lecture / pause / reprise / arrêt.
 */
export function BibleAudio({
  verses,
  bookName,
  chapter,
  onVerse,
}: {
  verses: string[];
  bookName: string;
  chapter: number;
  /** Index (0-based) du verset lu, ou null quand la lecture s'arrête. */
  onVerse: (index: number | null) => void;
}) {
  const [supported, setSupported] = useState(true);
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const idxRef = useRef(0);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

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
    idxRef.current = 0;
    setState("idle");
    onVerse(null);
  }, [onVerse]);

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
    speakFrom(idxRef.current);
  }

  function pause() {
    window.speechSynthesis.pause();
    setState("paused");
  }

  function resume() {
    window.speechSynthesis.resume();
    setState("playing");
  }

  if (!supported) return null;

  return (
    <div className="dark-ctx bg-topo-dark flex items-center gap-3 rounded-2xl border border-white/10 p-3 text-cream shadow-card">
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
        </p>
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
