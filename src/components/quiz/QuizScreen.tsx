"use client";

import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import Link from "next/link";
import {
  buildGame,
  guaranteedCoins,
  formatCoins,
  LADDER,
  SAFE_RUNGS,
  QUESTION_TIME,
  getQuizName,
  setQuizName,
  getQuizCoins,
  getQuizBest,
  getQuizBestRung,
  recordQuizResult,
  type QuizQuestion,
} from "@/lib/quiz";
import {
  submitQuizCoins,
  fetchQuizLeaderboard,
  fetchQuizFriendsLeaderboard,
  isSignedIn,
  type QuizRow,
} from "@/lib/quiz-leaderboard";

type IconCmp = (p: { className?: string }) => ReactElement;

/* ---------------- Petits sons (Web Audio, sans fichier) ---------------- */
let audioCtx: AudioContext | null = null;
function tone(freqs: number[], dur = 0.16, type: OscillatorType = "sine") {
  try {
    if (typeof window === "undefined") return;
    audioCtx =
      audioCtx ||
      new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const ctx = audioCtx;
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = f;
      const t0 = ctx.currentTime + i * dur;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(ctx.destination);
      o.start(t0);
      o.stop(t0 + dur);
    });
  } catch {
    /* audio indisponible */
  }
}

/* ---------------- Icônes (trait) ---------------- */
const S = (d: string) => (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconClose = S("M6 6l12 12M18 6L6 18");
const IconTrophy = S("M8 4h8v3a4 4 0 0 1-8 0zM8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1-3 3M9 20h6M12 12v4");
const IconBulb = S("M12 3a6 6 0 0 0-3.5 10.9c.7.5 1 1.3 1 2.1h5c0-.8.3-1.6 1-2.1A6 6 0 0 0 12 3zM10 19h4");
const IconPeople = S("M17 20v-1a4 4 0 0 0-3-3.9M7 20v-1a4 4 0 0 1 3-3.9M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6");
const IconHalf = S("M12 3v18M3 12h18M4 4h16v16H4z");
const IconEdit = S("M4 20h4L18 10l-4-4L4 16zM14 6l4 4");

const LETTERS = ["A", "B", "C", "D"];

/** Répartition « communauté » simulée, pondérée vers la bonne réponse. */
function fakePoll(correct: number, removed: number[]): number[] {
  const base = [0, 0, 0, 0].map((_, i) => (removed.includes(i) ? 0 : 5 + Math.random() * 10));
  base[correct] += 45 + Math.random() * 25;
  const sum = base.reduce((a, b) => a + b, 0) || 1;
  const pct = base.map((v) => Math.round((v / sum) * 100));
  // ajuste pour totaliser 100
  const diff = 100 - pct.reduce((a, b) => a + b, 0);
  pct[correct] += diff;
  return pct;
}

type Phase = "hub" | "play" | "over";

export function QuizScreen() {
  const [phase, setPhase] = useState<Phase>("hub");
  const [name, setName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [coins, setCoins] = useState(0);
  const [best, setBest] = useState(0);
  const [bestRung, setBestRung] = useState(0);
  const [showBoard, setShowBoard] = useState(false);
  const [showLadder, setShowLadder] = useState(false);
  const [sound, setSound] = useState(true);

  useEffect(() => {
    setName(getQuizName());
    setCoins(getQuizCoins());
    setBest(getQuizBest());
    setBestRung(getQuizBestRung());
  }, []);

  const play = (freqs: number[], dur?: number, type?: OscillatorType) => {
    if (sound) tone(freqs, dur, type);
  };

  /* -------- État de la partie -------- */
  const [game, setGame] = useState<QuizQuestion[]>([]);
  const [step, setStep] = useState(0); // 0..14
  const [picked, setPicked] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [removed, setRemoved] = useState<number[]>([]);
  const [poll, setPoll] = useState<number[] | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [usedJokers, setUsedJokers] = useState<{ half: boolean; hint: boolean; poll: boolean }>({
    half: false,
    hint: false,
    poll: false,
  });
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [won, setWon] = useState(0);
  const [reason, setReason] = useState<"win" | "wrong" | "timeout" | "walk">("win");
  const [reachedRung, setReachedRung] = useState(0);

  // Effets / dynamisme
  const [combo, setCombo] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [cardShake, setCardShake] = useState(false);
  const [flash, setFlash] = useState<null | "good" | "bad">(null);
  const flashT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doFlash = (k: "good" | "bad") => {
    setFlash(null);
    requestAnimationFrame(() => setFlash(k));
    if (flashT.current) clearTimeout(flashT.current);
    flashT.current = setTimeout(() => setFlash(null), 520);
  };
  const [fly, setFly] = useState<string | null>(null);
  const [milestone, setMilestone] = useState<string | null>(null);
  const milestoneT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showMilestone = (t: string) => {
    setMilestone(null);
    requestAnimationFrame(() => setMilestone(t));
    if (milestoneT.current) clearTimeout(milestoneT.current);
    milestoneT.current = setTimeout(() => setMilestone(null), 1900);
  };
  const [countWon, setCountWon] = useState(0);
  const toastT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popToast = (t: string) => {
    setToast(null);
    requestAnimationFrame(() => setToast(t));
    if (toastT.current) clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 1400);
  };
  const burst = () => {
    setConfetti(false);
    requestAnimationFrame(() => setConfetti(true));
    setTimeout(() => setConfetti(false), 1400);
  };

  const q = game[step];

  const startGame = () => {
    // Plein écran immersif (best-effort ; sans effet dans l'app native déjà plein écran).
    try {
      const el = document.documentElement as HTMLElement & { requestFullscreen?: () => Promise<void> };
      if (el.requestFullscreen && !document.fullscreenElement) el.requestFullscreen().catch(() => {});
    } catch {
      /* API indisponible */
    }
    setGame(buildGame());
    setStep(0);
    resetQuestion();
    setUsedJokers({ half: false, hint: false, poll: false });
    setCombo(0);
    setPhase("play");
    play([523, 659, 784], 0.12);
  };

  // Sortie du plein écran quand on revient à l'accueil.
  useEffect(() => {
    if (phase !== "hub") return;
    try {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    } catch {
      /* ignore */
    }
  }, [phase]);

  // Compteur des gains qui monte sur l'écran de fin.
  useEffect(() => {
    if (phase !== "over") return;
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setCountWon(Math.round(won * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, won]);

  const resetQuestion = () => {
    setPicked(null);
    setLocked(false);
    setReveal(false);
    setRemoved([]);
    setPoll(null);
    setHint(null);
    setTimeLeft(QUESTION_TIME);
  };

  /* -------- Minuteur -------- */
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (phase !== "play" || locked) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, locked, step]);

  const endGame = useCallback(
    (amount: number, why: "win" | "wrong" | "timeout" | "walk", rung: number) => {
      setWon(amount);
      setReason(why);
      setReachedRung(rung);
      setPhase("over");
      const res = recordQuizResult(amount, rung);
      setCoins(res.coins);
      setBest(res.best);
      setBestRung(res.bestRung);
      submitQuizCoins(amount, res.best);
    },
    [],
  );

  // Temps écoulé → mauvaise réponse.
  useEffect(() => {
    if (phase === "play" && timeLeft === 0 && !locked) {
      setLocked(true);
      setReveal(true);
      play([220, 160], 0.3, "sawtooth");
      setTimeout(() => endGame(guaranteedCoins(step), "timeout", step), 1600);
    }
  }, [timeLeft, phase, locked, step, endGame]);

  const answer = (idx: number) => {
    if (locked) return;
    setPicked(idx);
    setLocked(true);
    if (timerRef.current) clearInterval(timerRef.current);
    // petit suspense
    setTimeout(() => {
      setReveal(true);
      const correct = idx === q.correct;
      if (correct) {
        play([659, 784, 988], 0.14);
        burst();
        doFlash("good");
        setFly(`+ ${formatCoins(LADDER[step])}`);
        setTimeout(() => setFly(null), 950);
        const rung = step + 1;
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (rung === LADDER.length) {
          popToast("LE MILLION !");
          showMilestone("LE MILLION !");
        } else if (SAFE_RUNGS.includes(rung)) {
          popToast("Palier sûr atteint !");
          showMilestone(`FILET ASSURÉ · ${formatCoins(LADDER[step])}`);
          play([659, 784, 988, 1319], 0.14);
        } else if (newCombo >= 3) popToast(`Série de ${newCombo} !`);
        else popToast("Bonne réponse !");
        if (step === LADDER.length - 1) {
          setTimeout(() => endGame(LADDER[step], "win", LADDER.length), 1400);
        }
      } else {
        play([233, 175], 0.32, "sawtooth");
        doFlash("bad");
        setCombo(0);
        setCardShake(true);
        setTimeout(() => setCardShake(false), 550);
        setTimeout(() => endGame(guaranteedCoins(step), "wrong", step), 1800);
      }
    }, 900);
  };

  const nextQuestion = () => {
    setStep((s) => s + 1);
    resetQuestion();
  };
  const walkAway = () => {
    const secured = step > 0 ? LADDER[step - 1] : 0;
    endGame(secured, "walk", step);
  };

  /* -------- Jokers -------- */
  const useHalf = () => {
    if (usedJokers.half || locked) return;
    const wrongs = [0, 1, 2, 3].filter((i) => i !== q.correct);
    // garde 1 mauvaise au hasard, retire les 2 autres
    const keep = wrongs[Math.floor(Math.random() * wrongs.length)];
    setRemoved(wrongs.filter((i) => i !== keep));
    setUsedJokers((j) => ({ ...j, half: true }));
    play([440, 330], 0.12);
  };
  const useHint = () => {
    if (usedJokers.hint || locked) return;
    setHint(q.hint || (q.reference ? `Indice : cherche du côté de ${q.reference}.` : "Fie-toi à ce que tu connais le mieux."));
    setUsedJokers((j) => ({ ...j, hint: true }));
    play([587, 440], 0.12);
  };
  const usePoll = () => {
    if (usedJokers.poll || locked) return;
    setPoll(fakePoll(q.correct, removed));
    setUsedJokers((j) => ({ ...j, poll: true }));
    play([392, 523], 0.12);
  };

  /* -------- Classement -------- */
  const openBoard = () => setShowBoard(true);

  const saveName = (v: string) => {
    setName(v);
    setQuizName(v);
  };

  const timePct = (timeLeft / QUESTION_TIME) * 100;

  /* =========================================================== HUB */
  if (phase === "hub") {
    return (
      <div className="mx-auto max-w-md px-4 py-6 text-cream">
        <QzFx />
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-indigo-900 via-violet-900 to-fuchsia-900/80 p-6 text-center shadow-2xl">
          <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(circle_at_50%_0,rgba(255,255,255,.5),transparent_60%)]" />
          <div className="relative">
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-amber-500 px-6 py-2 font-game text-xl font-extrabold text-night-950 shadow-lg">
              {formatCoins(coins)}
            </div>
            <h1 className="mt-6 font-game text-4xl font-extrabold leading-none drop-shadow">
              Le Défi
              <br />
              Biblique
            </h1>
            <p className="mt-2 text-sm text-cream/70">Grimpe les {LADDER.length} paliers jusqu&apos;au million.</p>

            {/* Pseudo */}
            <div className="mt-6 flex items-center gap-2 rounded-2xl bg-white/10 p-2 pl-4">
              {editingName ? (
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => saveName(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                  placeholder="Ton pseudo"
                  className="w-full bg-transparent text-center font-game text-lg font-bold text-cream placeholder:text-cream/40 focus:outline-none"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingName(true)}
                  className="flex w-full items-center justify-center gap-2 font-game text-lg font-bold"
                >
                  {name || "Choisis ton pseudo"}
                  <IconEdit className="h-4 w-4 text-cream/60" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={startGame}
              className="qz-glow mt-4 w-full rounded-2xl bg-[#8FE23C] py-4 font-game text-xl font-extrabold text-night-950 shadow-[0_6px_0_#5b9e1f] active:translate-y-1 active:shadow-[0_2px_0_#5b9e1f]"
            >
              NOUVELLE PARTIE
            </button>
            <button
              type="button"
              onClick={openBoard}
              className="mt-3 flex w-full items-center justify-center gap-3 rounded-2xl bg-white/10 py-3.5 font-game text-lg font-bold"
            >
              <IconTrophy className="h-6 w-6 text-amber-300" />
              Classement
            </button>

            <div className="mt-4 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-cream/50">Ton cumul</p>
                <p className="font-game text-lg font-extrabold text-amber-300">{formatCoins(coins)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-cream/50">Meilleure partie</p>
                <p className="font-game text-lg font-extrabold text-[#8FE23C]">{formatCoins(best)}</p>
              </div>
            </div>

            {/* Objectif : monter le plus haut possible */}
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-wide text-cream/50">
                  Ton meilleur palier
                </p>
                <p className="font-game text-lg font-extrabold text-amber-300">
                  {bestRung > 0 ? `${bestRung}/${LADDER.length}` : "—"}
                  {bestRung > 0 ? (
                    <span className="ml-2 text-sm text-cream/70">{formatCoins(LADDER[bestRung - 1])}</span>
                  ) : null}
                </p>
              </div>
              <p className="max-w-[9rem] text-right font-game text-[11px] text-cream/60">
                Monte le plus haut possible !
              </p>
            </div>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSound((s) => !s)}
                aria-label={sound ? "Couper le son" : "Activer le son"}
                className="grid h-11 w-11 place-items-center rounded-full bg-white/10"
              >
                {sound ? <SoundOn className="h-5 w-5" /> : <SoundOff className="h-5 w-5" />}
              </button>
              <Link
                href="/devotionnel"
                className="grid h-11 w-11 place-items-center rounded-full bg-white/10"
                aria-label="Retour"
              >
                <IconClose className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {showBoard ? <Leaderboard onClose={() => setShowBoard(false)} /> : null}
      </div>
    );
  }

  /* =========================================================== FIN */
  if (phase === "over") {
    const isWin = reason === "win";
    return (
      <div className="qz-immersive fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto px-4 py-10 text-center text-cream">
        <QzFx />
        <div className="qz-bg-orb qz-bg-1" />
        <div className="qz-bg-orb qz-bg-2" />
        <div className="qz-bg-orb qz-bg-3" />
        <Particles />
        {won > 0 ? <Confetti /> : null}
        <div className="qz-pop relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-md">
          <p className="font-game text-lg text-cream/70">
            {isWin ? "Incroyable !" : reason === "walk" ? "Tu t'arrêtes là" : "Partie terminée"}
          </p>
          <div className="my-5 flex items-center justify-center">
            <span className="rounded-full bg-amber-500 px-8 py-3 font-game text-3xl font-extrabold text-night-950 shadow-lg">
              {formatCoins(countWon)}
            </span>
          </div>
          <p className="text-sm text-cream/70">
            {isWin
              ? "Tu as atteint le million ! Un maître de la Parole."
              : reason === "walk"
                ? "Sagesse : tu repars avec tes gains assurés."
                : "Tu gardes ton palier sûr. Rejoue pour aller plus loin."}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3 font-game text-sm">
            <span className="rounded-full bg-white/10 px-4 py-2">
              Palier atteint <span className="font-extrabold text-amber-300">{reachedRung}/{LADDER.length}</span>
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2">
              Record <span className="font-extrabold text-[#8FE23C]">{bestRung}/{LADDER.length}</span>
            </span>
          </div>
          <p className="mt-4 text-sm">
            Cumul : <span className="font-game font-bold text-amber-300">{formatCoins(coins)}</span>
          </p>

          <button
            type="button"
            onClick={startGame}
            className="qz-glow mt-6 w-full rounded-2xl bg-[#8FE23C] py-4 font-game text-xl font-extrabold text-night-950 shadow-[0_6px_0_#5b9e1f] active:translate-y-1 active:shadow-[0_2px_0_#5b9e1f]"
          >
            REJOUER
          </button>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={openBoard}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/10 py-3 font-game font-bold"
            >
              <IconTrophy className="h-5 w-5 text-amber-300" />
              Classement
            </button>
            <button
              type="button"
              onClick={() => setPhase("hub")}
              className="flex-1 rounded-2xl bg-white/10 py-3 font-game font-bold"
            >
              Accueil
            </button>
          </div>
        </div>
        {showBoard ? <Leaderboard onClose={() => setShowBoard(false)} /> : null}
      </div>
    );
  }

  /* =========================================================== JEU */
  const correctIdx = q.correct;
  const bgs = [
    "from-sky-800 to-indigo-950",
    "from-amber-900 to-indigo-950",
    "from-indigo-900 to-fuchsia-950",
  ];
  const bg = bgs[step % bgs.length];

  return (
    <div className="qz-immersive fixed inset-0 z-[100] overflow-y-auto text-cream">
      <QzFx />
      <div className="qz-bg-orb qz-bg-1" />
      <div className="qz-bg-orb qz-bg-2" />
      <div className="qz-bg-orb qz-bg-3" />
      <Particles />
      {flash ? <Flash kind={flash} /> : null}
      {confetti ? <Confetti /> : null}
      {toast ? <Toast text={toast} /> : null}
      {milestone ? <Milestone text={milestone} /> : null}
      <div className="relative mx-auto max-w-md px-4 pb-10 pt-[calc(0.75rem+env(safe-area-inset-top))]">
      {/* Entête : quitter / minuteur / palier */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setPhase("hub")}
          aria-label="Quitter"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10"
        >
          <IconClose className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setShowLadder(true)}
          className="rounded-full bg-white/10 px-4 py-2 font-game text-sm font-bold"
        >
          Palier {step + 1}/{LADDER.length}
        </button>
        {/* Minuteur */}
        <div className={`relative grid h-12 w-12 place-items-center ${timeLeft <= 10 && !locked ? "qz-tick" : ""}`}>
          <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
            <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="4" />
            <circle
              cx="20"
              cy="20"
              r="17"
              fill="none"
              stroke={timeLeft <= 10 ? "#f87171" : "#8FE23C"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 17}
              strokeDashoffset={2 * Math.PI * 17 * (1 - timePct / 100)}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span className="font-game text-sm font-extrabold">{timeLeft}</span>
        </div>
      </div>

      {/* Montant du palier */}
      <div className="relative mx-auto mb-3 w-fit">
        <div className="rounded-full bg-amber-400 px-6 py-1.5 font-game text-lg font-extrabold text-night-950 shadow">
          {formatCoins(LADDER[step])}
        </div>
        {fly ? (
          <span
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 font-game text-lg font-extrabold text-[#8FE23C]"
            style={{ animation: "qz-float .95s ease-out forwards" }}
          >
            {fly}
          </span>
        ) : null}
      </div>

      {/* Échelle des paliers — toujours visible : on voit sa progression et
          les paliers « sûrs » (gardés même en cas d'erreur). */}
      <div className="mb-4">
        <div className="flex items-end gap-[2px]">
          {LADDER.map((_, li) => {
            const rung = li + 1;
            const done = rung <= step;
            const current = rung === step + 1;
            const safe = SAFE_RUNGS.includes(rung);
            return (
              <div
                key={rung}
                className={`flex-1 rounded-full transition-all ${
                  current
                    ? "h-3 bg-amber-400 qz-tick"
                    : done
                      ? "h-2.5 bg-[#8FE23C]"
                      : safe
                        ? "h-3 bg-amber-400/50"
                        : "h-2 bg-white/25"
                }`}
                title={safe ? `Palier sûr : ${formatCoins(LADDER[li])}` : formatCoins(LADDER[li])}
              />
            );
          })}
        </div>
        <div className="mt-1.5 flex items-center justify-between font-game text-[11px]">
          <span className="text-cream/60">
            Filet : <span className="font-bold text-amber-300">{formatCoins(guaranteedCoins(step))}</span>
          </span>
          <span className="text-cream/50">Palier {step + 1}/{LADDER.length}</span>
          <span className="text-cream/60">
            Sommet : <span className="font-bold text-[#8FE23C]">{formatCoins(LADDER[LADDER.length - 1])}</span>
          </span>
        </div>
      </div>

      {/* Question */}
      <div
        key={`q-${step}`}
        className={`rounded-3xl bg-gradient-to-b ${bg} p-5 shadow-xl ${cardShake ? "qz-shake" : ""}`}
        style={{ animation: cardShake ? undefined : "qz-optin .4s ease-out" }}
      >
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500 font-game text-sm font-extrabold text-night-950">
            {String(step + 1).padStart(2, "0")}
          </span>
          <p className="font-game text-lg font-bold leading-snug">{q.q}</p>
        </div>
        {hint ? (
          <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm text-amber-100">{hint}</p>
        ) : null}
      </div>

      {/* Réponses */}
      <div className="mt-4 space-y-2.5">
        {q.options.map((opt, i) => {
          if (removed.includes(i)) {
            return <div key={i} className="h-[52px] rounded-2xl border border-white/5 bg-white/[0.02]" />;
          }
          const isPicked = picked === i;
          const showCorrect = reveal && i === correctIdx;
          const showWrong = reveal && isPicked && i !== correctIdx;
          const cls = showCorrect
            ? "bg-[#8FE23C] text-night-950 border-[#8FE23C]"
            : showWrong
              ? "bg-red-500 text-white border-red-500"
              : isPicked
                ? "bg-amber-400 text-night-950 border-amber-400"
                : "bg-night-900/60 text-cream border-white/15";
          return (
            <button
              key={`${step}-${i}`}
              type="button"
              disabled={locked}
              onClick={() => answer(i)}
              style={reveal ? undefined : { animation: `qz-optin .4s ease-out ${0.08 * i + 0.1}s both` }}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-game text-base font-bold transition-colors ${cls} ${
                showCorrect ? "qz-pop" : ""
              }`}
            >
              <span className="font-extrabold text-amber-400">{LETTERS[i]}:</span>
              <span className="flex-1">{opt}</span>
              {poll && !reveal ? (
                <span className="text-xs font-bold text-cream/70">{poll[i]}%</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Jokers */}
      {!reveal ? (
        <div className="mt-4 flex items-center justify-center gap-4">
          <Joker label="50:50" used={usedJokers.half} onClick={useHalf} Icon={IconHalf} />
          <Joker label="Indice" used={usedJokers.hint} onClick={useHint} Icon={IconBulb} />
          <Joker label="Communauté" used={usedJokers.poll} onClick={usePoll} Icon={IconPeople} />
        </div>
      ) : null}

      {/* Après réponse : bandeau + continuer / se retirer */}
      {reveal && picked === correctIdx && step < LADDER.length - 1 ? (
        <div className="mt-4 space-y-2.5">
          <div className="rounded-2xl bg-[#8FE23C]/15 px-4 py-2 text-center font-game font-bold text-[#a8f05a]">
            Bonne réponse !
          </div>
          <button
            type="button"
            onClick={nextQuestion}
            className="qz-glow w-full rounded-2xl bg-[#8FE23C] py-3.5 font-game text-lg font-extrabold text-night-950 shadow-[0_5px_0_#5b9e1f] active:translate-y-1 active:shadow-[0_1px_0_#5b9e1f]"
          >
            CONTINUER · {formatCoins(LADDER[step + 1])}
          </button>
          <button
            type="button"
            onClick={walkAway}
            className="w-full rounded-2xl bg-white/10 py-3 font-game font-bold"
          >
            Se retirer avec {formatCoins(LADDER[step])}
          </button>
        </div>
      ) : null}

      {/* Se retirer (avant de répondre) */}
      {!locked && step > 0 ? (
        <button
          type="button"
          onClick={walkAway}
          className="mt-4 w-full rounded-2xl border border-white/15 py-2.5 text-sm font-semibold text-cream/70"
        >
          Se retirer avec {formatCoins(LADDER[step - 1])}
        </button>
      ) : null}

      </div>
      {showLadder ? (
        <LadderView step={step} onClose={() => setShowLadder(false)} />
      ) : null}
    </div>
  );
}

/* ---------------- Sous-composants ---------------- */
function Joker({
  label,
  used,
  onClick,
  Icon,
}: {
  label: string;
  used: boolean;
  onClick: () => void;
  Icon: IconCmp;
}) {
  return (
    <button
      type="button"
      disabled={used}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 ${used ? "opacity-30" : ""}`}
    >
      <span className="relative grid h-14 w-14 place-items-center rounded-full border-2 border-white/25 bg-night-900/60">
        <Icon className="h-6 w-6 text-cream" />
        {used ? (
          <span className="absolute inset-0 grid place-items-center">
            <span className="h-[2px] w-12 rotate-45 rounded bg-red-500" />
          </span>
        ) : null}
      </span>
      <span className="text-[11px] font-bold text-cream/70">{label}</span>
    </button>
  );
}

function LadderView({ step, onClose }: { step: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-6" role="dialog" aria-modal="true">
      <button aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-xs rounded-3xl bg-gradient-to-b from-indigo-900 to-violet-950 p-4 text-cream shadow-2xl">
        <div className="max-h-[64vh] overflow-y-auto pr-1">
          {LADDER.map((v, i) => {
            const rung = LADDER.length - i; // affichage du haut (sommet) vers le bas (1)
            const idx = rung - 1;
            const isCurrent = idx === step;
            const isSafe = SAFE_RUNGS.includes(rung);
            return (
              <div
                key={rung}
                className={`flex items-center justify-between rounded-xl px-4 py-1 font-game ${
                  isCurrent ? "bg-[#8FE23C] text-night-950" : isSafe ? "text-white" : "text-amber-300/90"
                }`}
              >
                <span className={`text-sm ${isSafe ? "font-extrabold" : ""}`}>
                  {rung}
                  {isSafe ? " ·" : ""}
                </span>
                <span className={`text-sm ${isSafe || isCurrent ? "font-extrabold" : ""}`}>
                  {formatCoins(LADDER[idx])}
                </span>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-xl bg-amber-500 py-2.5 font-game font-bold text-night-950"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}

function Leaderboard({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"national" | "amis">("national");
  const [rows, setRows] = useState<QuizRow[] | null>(null);
  const [signed, setSigned] = useState<boolean | null>(null);

  useEffect(() => {
    isSignedIn().then(setSigned);
  }, []);
  useEffect(() => {
    let alive = true;
    setRows(null);
    const p = tab === "amis" ? fetchQuizFriendsLeaderboard(100) : fetchQuizLeaderboard(50);
    p.then((r) => {
      if (alive) setRows(r);
    });
    return () => {
      alive = false;
    };
  }, [tab]);

  const medal = (rank: number) =>
    rank === 1 ? "bg-amber-400" : rank === 2 ? "bg-slate-300" : rank === 3 ? "bg-orange-400" : "bg-amber-500";

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-gradient-to-b from-indigo-900 to-violet-950 p-5 text-cream shadow-2xl sm:rounded-3xl">
        <h2 className="text-center font-game text-2xl font-extrabold">Classement</h2>

        {/* Onglets National / Amis */}
        <div className="mx-auto mt-3 flex w-full max-w-xs rounded-full bg-white/10 p-1">
          {(["national", "amis"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full py-2 font-game text-sm font-bold transition-colors ${
                tab === t ? "bg-amber-500 text-night-950" : "text-cream/70"
              }`}
            >
              {t === "national" ? "National" : "Amis"}
            </button>
          ))}
        </div>

        <div className="mt-4 max-h-[56vh] space-y-2 overflow-y-auto">
          {tab === "amis" && signed === false ? (
            <p className="py-8 text-center text-sm text-cream/60">
              Connecte-toi et suis des membres pour voir le classement de tes amis.
            </p>
          ) : rows === null ? (
            <p className="py-8 text-center text-sm text-cream/60">Chargement…</p>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-cream/60">
              {tab === "amis"
                ? "Aucun ami classé pour l'instant — suis des membres et défie-les !"
                : "Sois le premier ! Connecte-toi pour apparaître au classement."}
            </p>
          ) : (
            rows.map((r) => (
              <div
                key={r.user_id}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2"
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-game text-xs font-extrabold text-night-950 ${medal(
                    r.rank,
                  )}`}
                >
                  {r.rank}
                </span>
                {r.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 font-game text-sm font-bold">
                    {(r.pseudo || "?").slice(0, 1)}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate font-game font-bold">{r.pseudo || "Anonyme"}</span>
                <span className="shrink-0 font-game text-sm font-extrabold text-amber-300">
                  {formatCoins(r.coins)}
                </span>
              </div>
            ))
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-2xl bg-amber-500 py-3 font-game text-lg font-bold text-night-950"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

/* ---- Particules ambiantes (immersion) ---- */
function Particles() {
  const bits = Array.from({ length: 16 }, (_, i) => ({
    left: (i * 61) % 100,
    size: 3 + ((i * 7) % 5),
    dur: 6 + ((i * 5) % 7),
    delay: (i * 0.7) % 6,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((b, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${b.left}%`,
            bottom: "-6%",
            width: b.size,
            height: b.size,
            borderRadius: "9999px",
            background: "rgba(202,240,0,.5)",
            filter: "blur(1px)",
            animation: `qz-rise ${b.dur}s linear ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ---- Flash plein écran (bonne / mauvaise réponse) ---- */
function Flash({ kind }: { kind: "good" | "bad" }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[95]"
      style={{
        animation: "qz-flash .5s ease-out forwards",
        background:
          kind === "good"
            ? "radial-gradient(circle at 50% 60%, rgba(143,226,60,.45), transparent 70%)"
            : "radial-gradient(circle at 50% 60%, rgba(239,68,68,.45), transparent 70%)",
      }}
    />
  );
}

const SoundOn = S("M4 9v6h4l5 4V5L8 9zM16 8a4 4 0 0 1 0 8M18.5 6a7 7 0 0 1 0 12");
const SoundOff = S("M4 9v6h4l5 4V5L8 9zM17 9l4 6M21 9l-4 6");

/* ---------------- Effets (animations) ---------------- */
const FX = `
@keyframes qz-pop{0%{transform:scale(.6);opacity:0}55%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
@keyframes qz-optin{0%{transform:translateY(14px);opacity:0}100%{transform:translateY(0);opacity:1}}
@keyframes qz-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
@keyframes qz-float{0%{transform:translate(-50%,0) scale(1);opacity:1}100%{transform:translate(-50%,-58px) scale(1.5);opacity:0}}
@keyframes qz-fall{0%{transform:translateY(-12vh) rotate(0);opacity:1}100%{transform:translateY(112vh) rotate(720deg);opacity:.9}}
@keyframes qz-toast{0%{transform:scale(.5) translateY(12px);opacity:0}18%{transform:scale(1.14) translateY(0);opacity:1}82%{transform:scale(1);opacity:1}100%{transform:scale(.92) translateY(-16px);opacity:0}}
@keyframes qz-glow{0%,100%{box-shadow:0 6px 0 #5b9e1f,0 0 0 rgba(143,226,60,0)}50%{box-shadow:0 6px 0 #5b9e1f,0 0 30px rgba(143,226,60,.6)}}
@keyframes qz-tick{0%,100%{transform:scale(1)}50%{transform:scale(1.16)}}
@keyframes qz-sweep{0%{transform:translateX(-100%) skewX(-8deg);opacity:0}20%{opacity:1}50%{transform:translateX(0) skewX(-8deg)}80%{opacity:1}100%{transform:translateX(100%) skewX(-8deg);opacity:0}}
.qz-pop{animation:qz-pop .3s ease-out}
.qz-shake{animation:qz-shake .5s ease-in-out}
.qz-tick{animation:qz-tick .5s ease-in-out infinite}
.qz-glow{animation:qz-glow 1.8s ease-in-out infinite}
@keyframes qz-rise{0%{transform:translateY(0);opacity:0}12%{opacity:.9}100%{transform:translateY(-108vh);opacity:0}}
@keyframes qz-flash{0%{opacity:0}22%{opacity:1}100%{opacity:0}}
@keyframes qz-drift{0%,100%{transform:translate(0,0)}50%{transform:translate(24px,-20px)}}
.qz-immersive{background:radial-gradient(circle at 18% 8%,#3b0764 0%,transparent 42%),radial-gradient(circle at 82% 14%,#831843 0%,transparent 42%),radial-gradient(circle at 50% 96%,#1e1b4b 0%,transparent 55%),#0b0713;}
.qz-bg-orb{position:absolute;border-radius:9999px;filter:blur(60px);pointer-events:none;opacity:.5;}
.qz-bg-1{width:300px;height:300px;background:#7c3aed;top:-80px;right:-60px;animation:qz-drift 14s ease-in-out infinite;}
.qz-bg-2{width:260px;height:260px;background:#db2777;bottom:-70px;left:-50px;animation:qz-drift 18s ease-in-out infinite reverse;}
.qz-bg-3{width:200px;height:200px;background:#8FE23C;top:40%;left:44%;opacity:.16;animation:qz-drift 20s ease-in-out infinite;}
`;
function QzFx() {
  return <style dangerouslySetInnerHTML={{ __html: FX }} />;
}

function Confetti() {
  const colors = ["#8FE23C", "#FBBF24", "#F472B6", "#38BDF8", "#FDE68A"];
  const bits = Array.from({ length: 80 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    dur: 1.5 + Math.random() * 1.3,
    color: colors[i % colors.length],
    size: 6 + Math.random() * 8,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-[85] overflow-hidden">
      {bits.map((b, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${b.left}%`,
            top: 0,
            width: b.size,
            height: b.size * 0.5,
            background: b.color,
            borderRadius: 2,
            animation: `qz-fall ${b.dur}s linear ${b.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

function Toast({ text }: { text: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[86] flex items-center justify-center">
      <div
        style={{ animation: "qz-toast 1.4s ease-out forwards" }}
        className="rounded-2xl bg-night-950/90 px-7 py-3.5 font-game text-2xl font-extrabold text-[#8FE23C] shadow-2xl ring-2 ring-[#8FE23C]/40"
      >
        {text}
      </div>
    </div>
  );
}

/** Bannière « palier franchi » : un bandeau doré qui balaie l'écran. */
function Milestone({ text }: { text: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-1/3 z-[87] flex justify-center overflow-hidden">
      <div
        style={{ animation: "qz-sweep 1.9s cubic-bezier(.2,.7,.2,1) forwards" }}
        className="w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent py-3 text-center font-game text-xl font-extrabold uppercase tracking-wide text-night-950 shadow-2xl"
      >
        {text}
      </div>
    </div>
  );
}
