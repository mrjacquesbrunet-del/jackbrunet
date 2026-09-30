"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import {
  hasBibleNarration,
  bibleBookQueue,
  bibleFullQueue,
  type BibleBookMeta,
} from "@/lib/bible-audio";
import { playQueue, usePodcastPlayer, getPodcastAudio } from "@/lib/podcast-player";
import {
  useAmbient,
  setVoiceActive,
  ambientKick,
  AMBIENT_VOL_MIN,
  AMBIENT_VOL_MAX,
} from "@/lib/ambient";

/**
 * Lecteur audio de la pleine lecture : un simple bouton rond en bas au centre
 * de l'écran ; un tap ouvre un vrai lecteur en feuille — source (narration ou
 * voix de l'appareil), barre de progression, chapitre précédent/suivant,
 * vitesse, soaking (fond musical), répétition du chapitre et minuteur de
 * veille. Tout se pilote depuis cette feuille, comme un lecteur de musique.
 */

const RATES = [0.8, 1, 1.25, 1.5];

function fmt(s: number) {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function BibleAudioPlayer({
  bookId,
  verses,
  bookName,
  chapter,
  chapterCount,
  books = [],
  onVerse,
  onPrevChapter,
  onNextChapter,
  canPrev,
  canNext,
}: {
  bookId: number;
  verses: string[];
  bookName: string;
  chapter: number;
  chapterCount: number;
  books?: BibleBookMeta[];
  /** Index (0-based) du verset lu par la voix de l'appareil, ou null. */
  onVerse: (index: number | null) => void;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<null | "soaking" | "minuteur">(null);
  const ambient = useAmbient();
  const pod = usePodcastPlayer();

  // ————— Sources: narration hébergée (si dispo) ou voix de l'appareil —————
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
  const [mode, setMode] = useState<"narration" | "voix">("voix");
  useEffect(() => {
    setMode(hasNarr ? "narration" : "voix");
  }, [hasNarr]);

  // La narration (n'importe quel chapitre biblique) joue dans le lecteur global.
  const narrActive = Boolean(pod.current?.id?.startsWith("bible:"));

  // ————— Voix de l'appareil (synthèse vocale, verset par verset) —————
  const [supported, setSupported] = useState(true);
  const [tts, setTts] = useState<"idle" | "playing" | "paused">("idle");
  const [ttsIdx, setTtsIdx] = useState(0);
  const idxRef = useRef(0);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const repeatRef = useRef(false);
  const [repeat, setRepeatState] = useState(false);
  const [sleepMin, setSleepMin] = useState<number | null>(null);
  const sleepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
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

  const stopTts = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (sleepTimer.current) {
      clearTimeout(sleepTimer.current);
      sleepTimer.current = null;
    }
    setSleepMin(null);
    setVoiceActive(false);
    idxRef.current = 0;
    setTtsIdx(0);
    setTts("idle");
    onVerse(null);
  }, [onVerse]);

  const armLocalSleep = useCallback((min: number | null) => {
    if (sleepTimer.current) {
      clearTimeout(sleepTimer.current);
      sleepTimer.current = null;
    }
    setSleepMin(min);
    if (min !== null) {
      sleepTimer.current = setTimeout(() => {
        sleepTimer.current = null;
        stopTts();
      }, min * 60_000);
    }
  }, [stopTts]);

  // Changement de chapitre / démontage: la voix de l'appareil s'arrête.
  useEffect(() => {
    stopTts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookName, chapter]);
  useEffect(() => () => stopTts(), [stopTts]);

  const speakFrom = useCallback(
    (start: number) => {
      const synth = window.speechSynthesis;
      synth.cancel();
      const speakOne = (i: number) => {
        if (i >= verses.length) {
          if (repeatRef.current) {
            speakOne(0);
            return;
          }
          stopTts();
          return;
        }
        idxRef.current = i;
        setTtsIdx(i);
        onVerse(i);
        const u = new SpeechSynthesisUtterance(verses[i]);
        u.lang = "fr-FR";
        if (voiceRef.current) u.voice = voiceRef.current;
        u.rate = 0.96 * pod.rate;
        u.pitch = 1;
        u.onend = () => {
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) return;
          speakOne(i + 1);
        };
        synth.speak(u);
      };
      speakOne(start);
    },
    [verses, onVerse, stopTts, pod.rate],
  );

  function playTts() {
    if (!verses.length) return;
    track("play", `bible:${bookName} ${chapter}`);
    setTts("playing");
    setVoiceActive(true);
    ambientKick();
    speakFrom(idxRef.current);
  }
  function pauseTts() {
    window.speechSynthesis.pause();
    setTts("paused");
    setVoiceActive(false);
  }
  function resumeTts() {
    window.speechSynthesis.resume();
    setTts("playing");
    setVoiceActive(true);
    ambientKick();
  }

  // ————— Progression de la narration (temps + durée) —————
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);
  useEffect(() => {
    if (!open || !narrActive) return;
    const a = getPodcastAudio();
    if (!a) return;
    const onT = () => {
      setPos(a.currentTime || 0);
      setDur(Number.isFinite(a.duration) ? a.duration : 0);
    };
    onT();
    a.addEventListener("timeupdate", onT);
    a.addEventListener("durationchange", onT);
    return () => {
      a.removeEventListener("timeupdate", onT);
      a.removeEventListener("durationchange", onT);
    };
  }, [open, narrActive, pod.current?.id]);

  // Compte à rebours du minuteur (rafraîchi doucement quand la feuille est ouverte).
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, [open]);

  // ————— Actions du transport —————
  const isPlaying = mode === "narration" ? narrActive && pod.playing : tts === "playing";

  function mainAction() {
    if (mode === "narration") {
      if (narrActive) {
        pod.toggle();
        return;
      }
      stopTts();
      const q =
        books.length > 0
          ? bibleFullQueue(books, bookId, chapter)
          : bibleBookQueue(bookId, bookName, chapterCount, chapter);
      if (q.length) {
        playQueue(q, 0);
        pod.setRepeat(repeatRef.current);
        ambientKick();
      }
    } else {
      if (tts === "playing") pauseTts();
      else if (tts === "paused") resumeTts();
      else {
        if (narrActive) pod.stop();
        playTts();
      }
    }
  }

  function seekBack() {
    if (mode === "narration") {
      const a = getPodcastAudio();
      if (a && narrActive) pod.seek(Math.max(0, a.currentTime - 15));
    } else {
      const i = Math.max(0, idxRef.current - 1);
      if (tts === "playing") speakFrom(i);
      else {
        idxRef.current = i;
        setTtsIdx(i);
      }
    }
  }
  function seekFwd() {
    if (mode === "narration") {
      const a = getPodcastAudio();
      if (a && narrActive) pod.seek(Math.min(a.duration || Infinity, a.currentTime + 15));
    } else {
      const i = Math.min(verses.length - 1, idxRef.current + 1);
      if (tts === "playing") speakFrom(i);
      else {
        idxRef.current = i;
        setTtsIdx(i);
      }
    }
  }

  function prevAction() {
    if (mode === "narration" && narrActive) pod.prev();
    else onPrevChapter();
  }
  function nextAction() {
    if (mode === "narration" && narrActive) pod.next();
    else onNextChapter();
  }

  function cycleRate() {
    const i = RATES.indexOf(pod.rate);
    pod.setRate(RATES[(i + 1) % RATES.length]);
  }

  function toggleRepeat() {
    const v = !repeat;
    setRepeatState(v);
    repeatRef.current = v;
    pod.setRepeat(v);
  }

  function armTimer(min: number | null) {
    if (mode === "narration") {
      if (min === null) pod.cancelSleep();
      else pod.setSleepTimer(min);
      armLocalSleep(null);
    } else {
      pod.cancelSleep();
      armLocalSleep(min);
    }
    setPanel(null);
  }

  // Libellé du minuteur en cours (narration globale ou minuteur local).
  const timerLabel = pod.sleepEpisodeEnd
    ? "fin du chapitre"
    : pod.sleepEndsAt
      ? `${Math.max(1, Math.ceil((pod.sleepEndsAt - now) / 60_000))} min`
      : sleepMin
        ? `${sleepMin} min`
        : null;

  const chipOn = "border-dawn-400 bg-dawn-400/15 text-dawn-300";
  const chipOff = "border-white/15 text-cream/75";

  const volPct = Math.round(
    ((ambient.volume - AMBIENT_VOL_MIN) / (AMBIENT_VOL_MAX - AMBIENT_VOL_MIN)) * 100,
  );

  return (
    <>
      {/* Le bouton rond, en bas au centre, entre les flèches de chapitre */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Lecteur audio"
        aria-expanded={open}
        className="fixed bottom-[5.75rem] left-1/2 z-[56] grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-dawn-400 text-night-950 shadow-glow"
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
            <rect x="6.5" y="5" width="4" height="14" rx="1.2" />
            <rect x="13.5" y="5" width="4" height="14" rx="1.2" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={1.9}>
            <path d="M11 5L6.5 9H3.5v6h3L11 19z" strokeLinejoin="round" />
            <path d="M15 9.2a4.2 4.2 0 0 1 0 5.6M17.8 6.6a8 8 0 0 1 0 10.8" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* La feuille du lecteur */}
      {open ? (
        <div className="fixed inset-0 z-[110]">
          <button type="button" aria-label="Fermer le lecteur" onClick={() => setOpen(false)} className="absolute inset-0" />
          <div
            className="dark-ctx absolute inset-x-2 mx-auto max-w-md rounded-3xl border border-white/10 bg-night-950/90 p-4 pb-5 text-cream shadow-card backdrop-blur-xl"
            style={{ bottom: "calc(var(--bottom-nav-h, env(safe-area-inset-bottom)) + 0.75rem)" }}
          >
            {/* Fermer + sources */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Replier le lecteur"
                className="grid h-9 w-9 place-items-center rounded-full text-cream/60"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2}>
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="flex items-center gap-1.5">
                {hasNarr ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (tts !== "idle") stopTts();
                      setMode("narration");
                    }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${mode === "narration" ? chipOn : chipOff}`}
                  >
                    Narration
                  </button>
                ) : null}
                {supported ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (narrActive) pod.stop();
                      setMode("voix");
                    }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${mode === "voix" ? chipOn : chipOff}`}
                  >
                    Voix
                  </button>
                ) : null}
              </div>
            </div>

            {/* Progression */}
            {mode === "narration" ? (
              <div className="mt-2">
                <input
                  type="range"
                  min={0}
                  max={Math.max(1, dur)}
                  step={1}
                  value={Math.min(pos, dur || 0)}
                  disabled={!narrActive || !dur}
                  onChange={(e) => pod.seek(Number(e.target.value))}
                  aria-label="Position de lecture"
                  className="h-1 w-full accent-dawn-400 disabled:opacity-40"
                />
                <div className="mt-0.5 flex items-center justify-between text-xs tabular-nums text-cream/55">
                  <span>{narrActive ? fmt(pos) : "0:00"}</span>
                  <span className="truncate px-2 font-semibold text-cream/70">
                    {narrActive ? pod.current?.title : `${bookName} ${chapter}`}
                  </span>
                  <span>{narrActive && dur ? fmt(dur) : "–:––"}</span>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-dawn-400 transition-all"
                    style={{ width: `${verses.length ? ((ttsIdx + (tts === "idle" ? 0 : 1)) / verses.length) * 100 : 0}%` }}
                  />
                </div>
                <div className="mt-0.5 flex items-center justify-between text-xs tabular-nums text-cream/55">
                  <span>Verset {Math.min(ttsIdx + 1, verses.length)} / {verses.length}</span>
                  <span className="truncate px-2 font-semibold text-cream/70">{bookName} {chapter}</span>
                  <span>Voix de l'appareil</span>
                </div>
              </div>
            )}

            {/* Transport */}
            <div className="mt-3 flex items-center justify-between px-2">
              <button
                type="button"
                onClick={prevAction}
                disabled={!canPrev && !narrActive}
                aria-label="Chapitre précédent"
                className="grid h-11 w-11 place-items-center rounded-full text-cream/80 disabled:opacity-30"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                  <path d="M7 5h2v14H7zM19 5l-9 7 9 7z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={seekBack}
                aria-label={mode === "narration" ? "Reculer de 15 secondes" : "Verset précédent"}
                className="grid h-11 w-11 place-items-center rounded-full text-cream/80"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={1.9}>
                  <path d="M4.5 8.5A8 8 0 1 1 4 13.5" strokeLinecap="round" />
                  <path d="M4.5 4v4.5H9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={mainAction}
                aria-label={isPlaying ? "Pause" : "Écouter"}
                className="grid h-16 w-16 place-items-center rounded-full bg-dawn-400 text-night-950 shadow-glow"
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current">
                    <rect x="6.5" y="5" width="4" height="14" rx="1.2" />
                    <rect x="13.5" y="5" width="4" height="14" rx="1.2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={seekFwd}
                aria-label={mode === "narration" ? "Avancer de 15 secondes" : "Verset suivant"}
                className="grid h-11 w-11 place-items-center rounded-full text-cream/80"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={1.9}>
                  <path d="M19.5 8.5A8 8 0 1 0 20 13.5" strokeLinecap="round" />
                  <path d="M19.5 4v4.5H15" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={nextAction}
                disabled={!canNext && !narrActive}
                aria-label="Chapitre suivant"
                className="grid h-11 w-11 place-items-center rounded-full text-cream/80 disabled:opacity-30"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                  <path d="M15 5h2v14h-2zM5 5l9 7-9 7z" />
                </svg>
              </button>
            </div>

            {/* Options : vitesse, soaking, répéter, minuteur */}
            <div className="mt-4 grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={cycleRate}
                aria-label="Vitesse de lecture"
                className={`flex flex-col items-center gap-1 rounded-2xl border px-1 py-2 ${pod.rate !== 1 ? chipOn : chipOff}`}
              >
                <span className="grid h-5 place-items-center text-[15px] font-black leading-none tabular-nums">{pod.rate}x</span>
                <span className="text-[11px] font-bold leading-none">Vitesse</span>
              </button>
              <button
                type="button"
                onClick={() => setPanel(panel === "soaking" ? null : "soaking")}
                aria-expanded={panel === "soaking"}
                className={`flex flex-col items-center gap-1 rounded-2xl border px-1 py-2 ${ambient.enabled ? chipOn : chipOff}`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9}>
                  <path d="M9 18V6l10-2v12" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="7" cy="18" r="2" />
                  <circle cx="17" cy="16" r="2" />
                </svg>
                <span className="text-[11px] font-bold leading-none">Soaking</span>
              </button>
              <button
                type="button"
                onClick={toggleRepeat}
                aria-pressed={repeat}
                className={`flex flex-col items-center gap-1 rounded-2xl border px-1 py-2 ${repeat ? chipOn : chipOff}`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9}>
                  <path d="M17 2l4 4-4 4M21 6H8a5 5 0 0 0-5 5M7 22l-4-4 4-4M3 18h13a5 5 0 0 0 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[11px] font-bold leading-none">Répéter</span>
              </button>
              <button
                type="button"
                onClick={() => setPanel(panel === "minuteur" ? null : "minuteur")}
                aria-expanded={panel === "minuteur"}
                className={`flex flex-col items-center gap-1 rounded-2xl border px-1 py-2 ${timerLabel ? chipOn : chipOff}`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9}>
                  <circle cx="12" cy="13" r="8" />
                  <path d="M12 9v4l2.5 2M9 2h6" strokeLinecap="round" />
                </svg>
                <span className="text-[11px] font-bold leading-none">{timerLabel ?? "Minuteur"}</span>
              </button>
            </div>

            {/* Réglage du soaking (fond musical sous la voix) */}
            {panel === "soaking" ? (
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-sm font-bold">Soaking sous la voix</span>
                  <button
                    type="button"
                    onClick={() => ambient.setEnabled(!ambient.enabled)}
                    aria-pressed={ambient.enabled}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${ambient.enabled ? "bg-dawn-400" : "bg-white/15"}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${ambient.enabled ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-cream/55">
                  Une nappe instrumentale douce joue en boucle sous la lecture.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[11px] text-cream/45">Voix</span>
                  <input
                    type="range"
                    min={AMBIENT_VOL_MIN}
                    max={AMBIENT_VOL_MAX}
                    step={0.01}
                    value={ambient.volume}
                    disabled={!ambient.enabled}
                    onChange={(e) => ambient.setVolume(Number(e.target.value))}
                    className="h-1 flex-1 accent-dawn-400 disabled:opacity-40"
                    aria-label="Volume du soaking"
                  />
                  <span className="text-[11px] text-cream/45">Fond</span>
                  <span className="w-9 text-right text-xs tabular-nums text-cream/55">{volPct}%</span>
                </div>
              </div>
            ) : null}

            {/* Choix du minuteur de veille */}
            {panel === "minuteur" ? (
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-cream/45">
                  L'écoute s'arrête toute seule après…
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[10, 20, 30, 45, 60].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => armTimer(m)}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-sm font-bold text-cream/80"
                    >
                      {m} min
                    </button>
                  ))}
                  {mode === "narration" ? (
                    <button
                      type="button"
                      onClick={() => {
                        pod.setSleepEpisodeEnd(true);
                        setPanel(null);
                      }}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-sm font-bold text-cream/80"
                    >
                      Fin du chapitre
                    </button>
                  ) : null}
                  {timerLabel ? (
                    <button
                      type="button"
                      onClick={() => armTimer(null)}
                      className="rounded-full border border-red-400/40 px-3 py-1.5 text-sm font-bold text-red-300"
                    >
                      Désactiver
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
