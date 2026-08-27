"use client";

import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import Link from "next/link";
import {
  buildGame,
  guaranteedCoins,
  formatCoins,
  LADDER,
  tierForRung,
  TIER_LABELS,
  SAFE_RUNGS,
  QUESTION_TIME,
  getQuizName,
  setQuizName,
  getQuizCoins,
  getQuizBest,
  getQuizBestRung,
  getQuizGames,
  recordQuizResult,
  ACHIEVEMENTS,
  getUnlockedAchievements,
  evaluateAchievements,
  buildDailyGame,
  buildThemedGame,
  THEMES,
  getDailyState,
  markDailyDone,
  saveQuizProgress,
  getQuizProgress,
  clearQuizProgress,
  type Achievement,
  type QuizQuestion,
  type QuizProgress,
} from "@/lib/quiz";
import {
  submitQuizCoins,
  fetchQuizLeaderboard,
  fetchQuizFriendsLeaderboard,
  isSignedIn,
  type QuizRow,
} from "@/lib/quiz-leaderboard";
import { getMemorizeXp, levelFromXp } from "@/lib/memorize";
import { getVfXp } from "@/lib/vraifaux";
import { asset } from "@/lib/asset";
import { getSupabase } from "@/lib/supabase";
import { getProfile } from "@/lib/community";
import { submitGameScore, submitWeeklyPoints } from "@/lib/game-scores";
import { ScoreBoard } from "@/components/games/ScoreBoard";

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

/** Vibration best-effort (Android WebView ; sans effet sur iOS/desktop). */
function buzz(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
  } catch {
    /* non supporté */
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
const IconUser = S("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0");
const IconHalf = S("M12 3v18M3 12h18M4 4h16v16H4z");
const IconEdit = S("M4 20h4L18 10l-4-4L4 16zM14 6l4 4");
const IconFlame = S("M12 3c1.5 3 4.5 4 4.5 8.5A4.5 4.5 0 0 1 7.5 11.5c0-1 .4-2 1-2.7C9.5 10.5 10 7 12 3z");
const IconCheck = S("M5 12l4.5 4.5L19 7");
const IconPlay = S("M8 5l11 7-11 7z");
const IconArrowR = S("M5 12h14M13 6l6 6-6 6");
const IconScroll = S("M7 4h9v13a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2zM16 4a2 2 0 0 1 2 2v2M9 8h5M9 12h5");
const IconCalendar = S("M4 7h16v13H4zM4 7V5h16v2M8 3v4M16 3v4M8 12h3");
const IconCoin = S("M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.6 14c0 1 1 1.6 2.4 1.6s2.4-.6 2.4-1.6c0-2.3-4.5-1.2-4.5-3.3 0-1 1-1.5 2.1-1.5s2.2.5 2.2 1.4M12 8v1.2M12 15v1.2");
const IconGem = S("M6 3h12l3 5-9 13L3 8zM3 8h18M9 3l-1 5M15 3l1 5");
const IconCrown = S("M4 8l4 3.5L12 5l4 6.5L20 8l-1.4 10H5.4z");
const IconMedal = S("M8 3l2 6M16 3l-2 6M12 21a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 14.5l1 2 2 .2-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L9 16.7l2-.2z");
const IconGames = S("M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z");
const IconLock = S("M6 10V8a6 6 0 0 1 12 0v2M5 10h14v10H5zM12 14v3");

const LETTERS = ["A", "B", "C", "D"];
/** Couleur du badge de difficulté (très facile → extrêmement dur). */
const TIER_COLORS = ["#8FE23C", "#CAF000", "#FCD34D", "#FB923C", "#F87171", "#EF4444"];

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [coins, setCoins] = useState(0);
  const [best, setBest] = useState(0);
  const [bestRung, setBestRung] = useState(0);
  const [showBoard, setShowBoard] = useState(false);
  const [showLadder, setShowLadder] = useState(false);
  const [showTrophies, setShowTrophies] = useState(false);
  const [sound, setSound] = useState(true);
  const [newBadges, setNewBadges] = useState<Achievement[]>([]);
  const maxComboRef = useRef(0);
  const sourceRef = useRef<"normal" | "daily" | "themed">("normal");
  const [daily, setDaily] = useState<{ streak: number; doneToday: boolean }>({ streak: 0, doneToday: false });
  const [top3, setTop3] = useState<QuizRow[] | null>(null);
  const [showThemes, setShowThemes] = useState(false);
  const [memoXp, setMemoXp] = useState(0);

  useEffect(() => {
    setName(getQuizName());
    setCoins(getQuizCoins());
    setBest(getQuizBest());
    setBestRung(getQuizBestRung());
    setMemoXp(getMemorizeXp());
    setDaily(getDailyState());
    setResumable(getQuizProgress());

    // Profil réel : photo + prénom (pseudo) de l'utilisateur connecté.
    (async () => {
      const sb = getSupabase();
      if (!sb) return;
      try {
        const { data } = await sb.auth.getUser();
        const uid = data.user?.id;
        if (!uid) return;
        const prof = await getProfile(uid);
        const first =
          (prof?.pseudo && prof.pseudo.trim()) ||
          (data.user?.user_metadata?.first_name as string | undefined) ||
          "";
        if (first) setName(first);
        setAvatarUrl(prof?.avatar_url || null);
      } catch {
        /* pas connecté : avatar neutre */
      }
    })();
  }, []);

  // Écran plein écran : on fige le défilement de la page derrière pour que
  // l'affichage reste stable (pas de « rebond » du corps de page).
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevBody = body.style.overflow;
    const prevHtml = html.style.overflow;
    const prevOver = body.style.overscrollBehavior;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    return () => {
      body.style.overflow = prevBody;
      html.style.overflow = prevHtml;
      body.style.overscrollBehavior = prevOver;
    };
  }, []);

  // Rafraîchit le hub (série du jour + podium) à chaque retour à l'accueil.
  useEffect(() => {
    if (phase !== "hub") return;
    setDaily(getDailyState());
    setMemoXp(getMemorizeXp());
    setResumable(getQuizProgress());
    let alive = true;
    fetchQuizLeaderboard(3).then((r) => alive && setTop3(r));
    return () => {
      alive = false;
    };
  }, [phase]);

  const play = (freqs: number[], dur?: number, type?: OscillatorType) => {
    if (sound) tone(freqs, dur, type);
  };

  /* -------- État de la partie -------- */
  const [game, setGame] = useState<QuizQuestion[]>([]);
  const [step, setStep] = useState(0); // 0..14
  const [resumable, setResumable] = useState<QuizProgress | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
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

  const startGame = (source: "normal" | "daily" | "themed" = "normal", themeId?: string) => {
    // Note : on n'appelle PAS l'API requestFullscreen — l'écran est déjà en plein
    // écran via l'overlay, et l'API déclenche sur iOS le bandeau natif
    // « … is in full screen. Swipe down to exit. » au défilement.
    sourceRef.current = source;
    setShowThemes(false);
    clearQuizProgress();
    setResumable(null);
    const g =
      source === "daily" ? buildDailyGame() : source === "themed" && themeId ? buildThemedGame(themeId) : buildGame();
    setGame(g);
    setStep(0);
    resetQuestion();
    setUsedJokers({ half: false, hint: false, poll: false });
    setCombo(0);
    maxComboRef.current = 0;
    setNewBadges([]);
    setPhase("play");
    play([523, 659, 784], 0.12);
    buzz(20);
  };

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

  // Trophées débloqués à la fin d'une partie.
  useEffect(() => {
    if (phase !== "over") return;
    const usedJoker = usedJokers.half || usedJokers.hint || usedJokers.poll;
    const fresh = evaluateAchievements({
      rung: reachedRung,
      maxCombo: maxComboRef.current,
      usedJoker,
      games: getQuizGames(),
      coins: getQuizCoins(),
    });
    setNewBadges(fresh);
    if (fresh.length) buzz([20, 40, 20, 40]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const resetQuestion = () => {
    setPicked(null);
    setSelected(null);
    setLocked(false);
    setReveal(false);
    setRemoved([]);
    setPoll(null);
    setHint(null);
    setTimeLeft(QUESTION_TIME);
  };

  // Sauvegarde continue de la partie en cours (pour la reprendre si on quitte
  // sans finir). On enregistre au début de chaque question (état propre).
  useEffect(() => {
    if (phase !== "play" || game.length === 0) return;
    saveQuizProgress({ game, step, usedJokers, combo, source: sourceRef.current, savedAt: Date.now() });
  }, [phase, game, step, usedJokers, combo]);

  // Reprend la partie sauvegardée là où elle s'était arrêtée.
  const resumeGame = () => {
    const p = resumable;
    if (!p) return;
    sourceRef.current = p.source;
    setShowThemes(false);
    setGame(p.game);
    setStep(p.step);
    setUsedJokers(p.usedJokers);
    setCombo(p.combo);
    maxComboRef.current = p.combo;
    setNewBadges([]);
    resetQuestion();
    setPhase("play");
    buzz(15);
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
        if (t <= 6) {
          play([880], 0.05);
          buzz(12);
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
      clearQuizProgress();
      setResumable(null);
      const res = recordQuizResult(amount, rung);
      setCoins(res.coins);
      setBest(res.best);
      setBestRung(res.bestRung);
      submitQuizCoins(amount, res.best);
      submitGameScore("quiz", Math.floor(res.coins / 500));
      submitWeeklyPoints(rung); // palier atteint -> ligue de la semaine (comparable aux autres jeux)
      if (sourceRef.current === "daily") {
        const d = markDailyDone();
        setDaily({ streak: d.streak, doneToday: true });
      }
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
        buzz(25);
        setFly(`+ ${formatCoins(LADDER[step])}`);
        setTimeout(() => setFly(null), 950);
        const rung = step + 1;
        const newCombo = combo + 1;
        setCombo(newCombo);
        maxComboRef.current = Math.max(maxComboRef.current, newCombo);
        if (rung === LADDER.length) {
          popToast("LE MILLION !");
          showMilestone("LE MILLION !");
        } else if (SAFE_RUNGS.includes(rung)) {
          popToast("Palier sûr atteint !");
          showMilestone(`FILET ASSURÉ · ${formatCoins(LADDER[step])}`);
          play([659, 784, 988, 1319], 0.14);
          buzz([20, 40, 80]);
        } else if (newCombo >= 3) popToast(`Série de ${newCombo} !`);
        else popToast("Bonne réponse !");
        if (step === LADDER.length - 1) {
          setTimeout(() => endGame(LADDER[step], "win", LADDER.length), 1400);
        }
      } else {
        play([233, 175], 0.32, "sawtooth");
        doFlash("bad");
        buzz([40, 60, 40]);
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
    const totalXp = memoXp + getVfXp() + Math.floor(coins / 500);
    const lvl = levelFromXp(totalXp);
    const unlockedSet = getUnlockedAchievements();
    const trophyCount = ACHIEVEMENTS.filter((a) => unlockedSet.has(a.id)).length;
    const reached = bestRung;
    const tierColor = (t: number) =>
      t === 1 ? "#34d399" : t === 2 ? "#2dd4bf" : t === 3 ? "#38bdf8" : t === 4 ? "#a78bfa" : "#fbbf24";
    const nodes = LADDER.map((coinVal, idx2) => {
      const rung = idx2 + 1;
      return {
        rung,
        coinVal,
        color: tierColor(tierForRung(rung)),
        final: rung === LADDER.length,
        done: rung <= reached,
        current: rung === reached + 1,
      };
    });

    return (
      <div className="qzp fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden bg-night-950 text-cream [overscroll-behavior:contain] [-webkit-overflow-scrolling:touch]">
        <style dangerouslySetInnerHTML={{ __html: PREMIUM_CSS }} />
        <img src={asset("/img/quiz/bg.jpg")} alt="" className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-25" />
        <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-night-900/80 via-night-800/90 to-night-950/97" />

        <div className="relative mx-auto w-full max-w-md px-4 pb-10 pt-[calc(0.75rem+env(safe-area-inset-top))]">
          {/* HUD */}
          <div className="flex items-center gap-3">
            <Link href="/jeux" aria-label="Profil" className="shrink-0">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover shadow-lg ring-2 ring-amber-300/70" />
              ) : (
                <span className="grid h-14 w-14 place-items-center rounded-full bg-white/10 text-cream/70 shadow-lg ring-2 ring-white/15">
                  <IconUser className="h-8 w-8" />
                </span>
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate font-game text-base font-extrabold leading-tight">{name || "Joueur"}</p>
              <p className="font-game text-[11px] font-bold tracking-wide text-amber-300">NIVEAU {lvl.level}</p>
              <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-black/40 ring-1 ring-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500" style={{ width: `${Math.round((lvl.into / lvl.span) * 100)}%` }} />
              </div>
              <p className="mt-0.5 font-game text-[11px] text-cream/60">
                {lvl.into} / {lvl.span} <span className="text-amber-300">XP</span>
              </p>
            </div>
            <span className="qzp-pill">
              <IconCoin className="h-4 w-4 text-amber-300" /> {formatCoins(coins)}
            </span>
            <span className="qzp-pill">
              <IconGem className="h-4 w-4 text-dawn-300" /> {trophyCount}
            </span>
          </div>

          {/* Héros */}
          <div className="relative mt-4 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/img/quiz/hero.jpg")} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-night-950/90 via-night-950/40 to-transparent" />
            <div className="relative p-5">
              <span className="qzp-ribbon font-game text-3xl font-black text-white drop-shadow">QUIZ</span>
              <br />
              <span className="qzp-ribbon2 mt-1 font-game text-3xl font-black text-night-950 drop-shadow">BIBLIQUE</span>
              <p className="mt-3 max-w-[10rem] font-game text-sm font-bold text-cream/90 drop-shadow">
                Teste tes connaissances et va jusqu&apos;au bout&nbsp;!
              </p>
            </div>
          </div>

          {/* Objectif + Récompense */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="qzp-card flex items-center gap-2.5 p-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 text-night-950 shadow">
                <IconCrown className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-game text-xs font-extrabold text-amber-300">OBJECTIF</p>
                <p className="text-[11px] leading-tight text-cream/70">Atteins le palier final et remporte le million&nbsp;!</p>
              </div>
            </div>
            <div className="qzp-card qzp-gold-ring flex items-center gap-2.5 p-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset("/img/quiz/trophy.jpg")} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0">
                <p className="font-game text-[10px] font-extrabold text-amber-300">RÉCOMPENSE</p>
                <p className="font-game text-base font-black leading-tight text-amber-300">{formatCoins(LADDER[LADDER.length - 1])}</p>
                <p className="text-[10px] text-cream/60">Tu peux le faire&nbsp;!</p>
              </div>
            </div>
          </div>

          {/* Jokers */}
          <div className="qzp-card mt-3 p-3">
            <p className="mb-2 font-game text-sm font-extrabold text-cream/80">TES JOKERS</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="qzp-joker qzp-joker-blue">
                <span className="qzp-joker-ic">50</span>
                <p className="mt-1 font-game text-[11px] font-bold">50/50</p>
                <p className="text-[9px] leading-tight text-cream/70">Élimine 2 mauvaises réponses</p>
              </div>
              <div className="qzp-joker qzp-joker-green">
                <span className="qzp-joker-ic"><IconBulb className="h-5 w-5" /></span>
                <p className="mt-1 font-game text-[11px] font-bold">Indice</p>
                <p className="text-[9px] leading-tight text-cream/70">Une aide pour t&apos;orienter</p>
              </div>
              <div className="qzp-joker qzp-joker-purple">
                <span className="qzp-joker-ic"><IconPeople className="h-5 w-5" /></span>
                <p className="mt-1 font-game text-[11px] font-bold">Communauté</p>
                <p className="text-[9px] leading-tight text-cream/70">Demande conseil</p>
              </div>
            </div>
          </div>

          {/* Progression */}
          <div className="qzp-card mt-3 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-game text-sm font-extrabold text-cream/80">TA PROGRESSION</p>
              <span className="rounded-full bg-black/30 px-2.5 py-0.5 font-game text-[11px] font-bold text-amber-300">
                Palier {Math.max(reached, 1)}/{LADDER.length}
              </span>
            </div>
            <div className="qzp-trail flex gap-2 overflow-x-auto pb-2">
              {nodes.map((n) => (
                <div key={n.rung} className="flex shrink-0 flex-col items-center">
                  <span
                    className={`qzp-hex grid place-items-center font-game text-sm font-black text-night-950 ${n.current ? "qzp-hex-cur" : ""}`}
                    style={{
                      background: n.final ? "linear-gradient(180deg,#fde68a,#f59e0b)" : `linear-gradient(180deg,#ffffff66,${n.color})`,
                      opacity: n.done || n.current ? 1 : 0.5,
                    }}
                  >
                    {n.final ? <IconCrown className="h-5 w-5" /> : n.rung}
                  </span>
                  <span className="mt-1 font-game text-[10px] font-bold text-amber-300">{formatCoins(n.coinVal)}</span>
                </div>
              ))}
            </div>
            <p className="mt-1 text-center font-game text-[10px] text-cream/45">
              Tu gardes le dernier palier franchi · Sommet {formatCoins(LADDER[LADDER.length - 1])}
            </p>
          </div>

          {/* JOUER */}
          {/* Reprise : si une partie a été quittée sans être finie */}
          {resumable ? (
            <button
              type="button"
              onClick={resumeGame}
              className="qzp-play mt-4 flex w-full items-center justify-center gap-4 font-game text-night-950"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-night-950/15">
                <IconPlay className="h-6 w-6" />
              </span>
              <span className="text-left leading-tight">
                <span className="block text-2xl font-black">REPRENDRE</span>
                <span className="block text-xs font-bold text-night-950/70">
                  Palier {resumable.step + 1}/{LADDER.length} · tu reprends où tu t&apos;es arrêté
                </span>
              </span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => startGame("normal")}
            className={
              resumable
                ? "mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] py-3 font-game text-sm font-bold text-cream active:bg-white/10"
                : "qzp-play mt-4 flex w-full items-center justify-center gap-4 font-game text-night-950"
            }
          >
            {resumable ? (
              <>Nouvelle partie</>
            ) : (
              <>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-night-950/15">
                  <IconPlay className="h-6 w-6" />
                </span>
                <span className="text-left leading-tight">
                  <span className="block text-2xl font-black">JOUER</span>
                  <span className="block text-xs font-bold text-night-950/70">Continuer l&apos;aventure</span>
                </span>
              </>
            )}
          </button>

          {/* Accès secondaires */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button type="button" onClick={openBoard} className="qzp-mini">
              <IconTrophy className="h-4 w-4 text-amber-300" /> Classement
            </button>
            <button type="button" onClick={() => setShowThemes(true)} className="qzp-mini">
              <IconScroll className="h-4 w-4 text-teal-300" /> Thèmes
            </button>
            <button type="button" onClick={() => startGame("daily")} className="qzp-mini">
              <IconCalendar className="h-4 w-4 text-dawn-300" /> {daily.doneToday ? "Fait" : "Défi jour"}
            </button>
          </div>
          {/* Retour à l'accueil des jeux */}
          <Link
            href="/jeux"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] py-3 font-game text-sm font-bold text-cream active:bg-white/10"
          >
            <IconGames className="h-4 w-4 text-dawn-300" /> Accueil des jeux
          </Link>
          <div className="mt-3 flex items-center justify-center gap-3">
            <button type="button" onClick={() => setShowTrophies(true)} className="qzp-mini2">
              <IconMedal className="h-4 w-4 text-amber-300" /> Trophées
            </button>
            <button type="button" onClick={() => setSound((v) => !v)} aria-label="Son" className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
              {sound ? <SoundOn className="h-4 w-4" /> : <SoundOff className="h-4 w-4" />}
            </button>
            <Link href="/devotionnel" aria-label="Accueil de l'app" className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
              <IconClose className="h-4 w-4" />
            </Link>
          </div>

          {/* Classement de ce jeu */}
          <div className="mt-5">
            <ScoreBoard mode="quiz" accent="#CAF000" title="Classement · Connaissances" />
          </div>
        </div>

        {showBoard ? <Leaderboard onClose={() => setShowBoard(false)} /> : null}
        {showTrophies ? <Trophies onClose={() => setShowTrophies(false)} /> : null}
        {showThemes ? <ThemesPicker onPick={(id) => startGame("themed", id)} onClose={() => setShowThemes(false)} /> : null}
      </div>
    );
  }

  /* =========================================================== FIN */
  if (phase === "over") {
    const isWin = reason === "win";
    return (
      <div className="qz-immersive fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-night-950 px-4 py-10 text-center text-cream [overscroll-behavior:contain] [-webkit-overflow-scrolling:touch]">
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

          {newBadges.length ? (
            <div className="mt-4 rounded-2xl bg-white/10 p-3 text-left">
              <p className="text-center font-game text-xs font-bold uppercase tracking-wide text-amber-300">
                Nouveau{newBadges.length > 1 ? "x" : ""} trophée{newBadges.length > 1 ? "s" : ""} !
              </p>
              <div className="mt-2 space-y-1.5">
                {newBadges.map((b) => (
                  <div key={b.id} className="qz-pop flex items-center gap-2">
                    <IconTrophy className="h-5 w-5 shrink-0 text-amber-300" />
                    <span className="font-game text-sm font-bold">{b.name}</span>
                    <span className="ml-auto text-xs text-cream/50">{b.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => startGame("normal")}
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
  const shortCoin = (n: number) => (n >= 1000000 ? `${n / 1000000}M` : n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));
  const canValidate = selected !== null && !reveal && !locked;

  return (
    <div className="qzp fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden bg-night-950 text-cream [overscroll-behavior:contain] [-webkit-overflow-scrolling:touch]">
      <style dangerouslySetInnerHTML={{ __html: PREMIUM_CSS }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset("/img/quiz/bg.jpg")} alt="" className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-20" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-night-900/85 via-night-800/92 to-night-950/97" />
      {flash ? <Flash kind={flash} /> : null}
      {confetti ? <Confetti /> : null}
      {toast ? <Toast text={toast} /> : null}
      {milestone ? <Milestone text={milestone} /> : null}

      <div className="relative mx-auto w-full max-w-md px-3 pb-5 pt-[calc(0.6rem+env(safe-area-inset-top))]">
        {/* HUD */}
        <div className="flex items-center gap-2.5">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-amber-300/70" />
          ) : (
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-cream/70 ring-2 ring-white/15">
              <IconUser className="h-6 w-6" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-game text-xs font-extrabold">{name || "Joueur"} · NIVEAU {levelFromXp(memoXp + getVfXp() + Math.floor(coins / 500)).level}</p>
            <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full bg-black/40">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500" style={{ width: "45%" }} />
            </div>
          </div>
          <span className="qzp-pill"><IconCoin className="h-4 w-4 text-amber-300" /> {formatCoins(coins)}</span>
        </div>

        {/* Objectif (escalier) */}
        <div className="relative mt-3 overflow-hidden rounded-2xl ring-1 ring-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/img/quiz/stairway.jpg")} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-r from-night-950/92 via-night-950/45 to-transparent" />
          <div className="relative flex items-center gap-2 p-3">
            <span className="rounded-lg bg-dawn-400 text-night-950 px-2 py-0.5 font-game text-[10px] font-extrabold">OBJECTIF</span>
            <p className="max-w-[14.5rem] text-[11px] font-semibold leading-tight text-cream/90">
              Atteins le palier final pour remporter <span className="whitespace-nowrap font-black text-amber-300">1&nbsp;000&nbsp;000</span>
            </p>
          </div>
        </div>

        {/* Question + échelle */}
        <div className="mt-3 flex gap-2">
          <div className="min-w-0 flex-1">
            <div key={`q-${step}`} className={`qzp-card p-3.5 ${cardShake ? "qz-shake" : ""}`} style={{ animation: cardShake ? undefined : "qz-optin .35s ease-out" }}>
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-dawn-400 text-night-950 px-3 py-1 font-game text-[11px] font-extrabold">QUESTION {step + 1}/{LADDER.length}</span>
                <span
                  className="truncate rounded-full px-2.5 py-1 font-game text-[10px] font-extrabold uppercase tracking-wide"
                  style={{ background: `${TIER_COLORS[tierForRung(step + 1) - 1]}22`, color: TIER_COLORS[tierForRung(step + 1) - 1] }}
                >
                  {TIER_LABELS[tierForRung(step + 1) - 1]}
                </span>
                <span className={`ml-auto font-game text-sm font-extrabold ${timeLeft <= 10 ? "text-rose-300" : "text-cream/80"}`}>{timeLeft}s</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                <div className={`h-full rounded-full ${timeLeft <= 10 ? "bg-rose-400" : "bg-amber-400"}`} style={{ width: `${timePct}%`, transition: "width 1s linear" }} />
              </div>
              <p className="mt-3 font-game text-base font-bold leading-snug">{q.q}</p>
              {hint ? <p className="mt-2 rounded-xl bg-amber-400/15 px-3 py-2 text-xs text-amber-100">{hint}</p> : null}

              <div className="mt-3 space-y-2">
                {q.options.map((opt, i) => {
                  if (removed.includes(i)) return <div key={i} className="h-[46px] rounded-xl border border-white/5 bg-white/[0.02]" />;
                  const isSel = selected === i;
                  const showCorrect = reveal && i === correctIdx;
                  const showWrong = reveal && picked === i && i !== correctIdx;
                  const state = showCorrect ? "correct" : showWrong ? "wrong" : isSel ? "sel" : "idle";
                  return (
                    <button key={`${step}-${i}`} type="button" disabled={reveal || locked} onClick={() => setSelected(i)} className={`qzp-opt qzp-opt-${state}`}>
                      <span className={`qzp-opt-badge qzp-opt-badge-${state}`}>{LETTERS[i]}</span>
                      <span className="flex-1 text-left">{opt}</span>
                      {poll && !reveal ? <span className="text-xs font-bold text-cream/60">{poll[i]}%</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Échelle verticale des paliers */}
          <div className="w-[76px] shrink-0">
            <div className="qzp-card max-h-[54vh] overflow-y-auto p-1.5 [scrollbar-width:none]">
              <p className="py-1 text-center font-game text-[10px] font-extrabold text-amber-300">PALIERS</p>
              {LADDER.slice().reverse().map((coinVal, ri) => {
                const rung = LADDER.length - ri;
                const cur = rung === step + 1;
                const done = rung <= step;
                const safe = SAFE_RUNGS.includes(rung);
                return (
                  <div key={rung} className={`my-0.5 flex items-center gap-1 rounded-full px-1 py-1 font-game text-[10px] font-bold ${cur ? "bg-dawn-400 text-night-950 ring-2 ring-dawn-200" : done ? "text-[#8FE23C]" : safe ? "text-amber-300" : "text-cream/45"}`}>
                    <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] ${cur ? "bg-night-950 text-dawn-400" : "bg-white/15"}`}>{rung}</span>
                    <span className="truncate">{shortCoin(coinVal)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Jokers */}
        {!reveal ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <JokerCard label="50/50" tip="Élimine 2" used={usedJokers.half} onClick={useHalf} tone="blue" ic={<span className="font-game text-sm font-extrabold">50</span>} />
            <JokerCard label="Indice" tip="Coup de pouce" used={usedJokers.hint} onClick={useHint} tone="green" ic={<IconBulb className="h-5 w-5" />} />
            <JokerCard label="Communauté" tip="Demande" used={usedJokers.poll} onClick={usePoll} tone="purple" ic={<IconPeople className="h-5 w-5" />} />
          </div>
        ) : null}

        {/* Action */}
        <div className="mt-3 flex items-center gap-2">
          {reveal && picked === correctIdx && step < LADDER.length - 1 ? (
            <>
              <button type="button" onClick={walkAway} className="qzp-mini2 whitespace-nowrap">Se retirer · {shortCoin(LADDER[step])}</button>
              <button type="button" onClick={nextQuestion} className="qzp-play flex flex-1 items-center justify-center gap-2 py-3 font-game text-lg font-black text-night-950">
                CONTINUER · {shortCoin(LADDER[step + 1])}
              </button>
            </>
          ) : reveal ? (
            <div className="flex-1 rounded-2xl bg-white/10 py-3 text-center font-game font-bold text-cream/80">
              {picked === correctIdx ? "Bravo !" : "Mauvaise réponse…"}
            </div>
          ) : (
            <>
              <button type="button" onClick={() => setPhase("hub")} className="qzp-mini2 whitespace-nowrap">
                <IconClose className="h-4 w-4" /> Quitter
              </button>
              <button type="button" disabled={!canValidate} onClick={() => selected !== null && answer(selected)}
                className={`flex flex-1 items-center justify-center py-3.5 font-game text-lg font-black ${canValidate ? "qzp-play text-night-950" : "rounded-2xl bg-white/10 text-cream/40"}`}>
                VALIDER LA RÉPONSE
              </button>
            </>
          )}
        </div>
      </div>

      {showLadder ? <LadderView step={step} onClose={() => setShowLadder(false)} /> : null}
    </div>
  );
}

function JokerCard({ label, tip, used, onClick, tone, ic }: { label: string; tip: string; used: boolean; onClick: () => void; tone: "blue" | "green" | "purple"; ic: ReactElement }) {
  return (
    <button type="button" disabled={used} onClick={onClick} className={`qzp-joker qzp-joker-${tone} ${used ? "opacity-40" : ""}`}>
      <span className="qzp-joker-ic">{ic}</span>
      <p className="mt-1 font-game text-[11px] font-bold">{label}</p>
      <p className="text-[9px] leading-tight text-cream/75">{used ? "Utilisé" : tip}</p>
    </button>
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
      <div className="relative z-10 w-full max-w-xs rounded-3xl bg-gradient-to-b from-night-900 to-night-950 p-4 text-cream shadow-2xl">
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
      <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-gradient-to-b from-night-900 to-night-950 p-5 text-cream shadow-2xl sm:rounded-3xl">
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

/* ---- Vitrine des trophées ---- */
function Trophies({ onClose }: { onClose: () => void }) {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  useEffect(() => {
    setUnlocked(getUnlockedAchievements());
  }, []);
  const count = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-gradient-to-b from-night-900 to-night-950 p-5 text-cream shadow-2xl sm:rounded-3xl">
        <h2 className="text-center font-game text-2xl font-extrabold">Trophées</h2>
        <p className="mt-1 text-center font-game text-sm text-amber-300">
          {count}/{ACHIEVEMENTS.length} débloqués
        </p>
        <div className="mt-4 max-h-[58vh] space-y-2 overflow-y-auto">
          {ACHIEVEMENTS.map((a) => {
            const has = unlocked.has(a.id);
            return (
              <div
                key={a.id}
                className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 ${
                  has ? "border-amber-400/40 bg-amber-400/10" : "border-white/10 bg-white/[0.04] opacity-60"
                }`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                    has ? "bg-amber-500 text-night-950" : "bg-white/10 text-cream/50"
                  }`}
                >
                  {has ? <IconTrophy className="h-5 w-5" /> : <IconLock className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-game text-sm font-bold">{a.name}</span>
                  <span className="block text-xs text-cream/55">{a.desc}</span>
                </span>
              </div>
            );
          })}
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

/* ---- Illustration Bible ouverte + croix + halo ---- */
function BibleCrossArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden fill="none">
      <circle cx="62" cy="34" r="24" fill="rgba(253,224,71,.45)" />
      {/* croix */}
      <rect x="59" y="10" width="6" height="34" rx="2" fill="#F3F3ED" />
      <rect x="50" y="19" width="24" height="6" rx="2" fill="#F3F3ED" />
      {/* livre ouvert */}
      <path d="M14 58c10-5 22-5 30 1 8-6 20-6 30-1v22c-10-5-22-5-30 1-8-6-20-6-30-1z" fill="#F3F3ED" />
      <path d="M44 59v22" stroke="#0C0C0B" strokeWidth="2" opacity=".25" />
      <path d="M20 64c6-2 13-2 19 1M20 70c6-2 13-2 19 1M49 65c6-3 13-3 19-1M49 71c6-3 13-3 19-1" stroke="#0C0C0B" strokeWidth="1.6" opacity=".2" strokeLinecap="round" />
    </svg>
  );
}

/* ---- Sélecteur de thèmes ---- */
function ThemesPicker({ onPick, onClose }: { onPick: (id: string) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-gradient-to-b from-teal-800 to-teal-950 p-5 text-cream shadow-2xl sm:rounded-3xl">
        <h3 className="text-center font-game text-xl font-extrabold">Choisis ton thème</h3>
        <p className="mt-1 text-center text-sm text-cream/60">Une partie centrée sur le sujet choisi.</p>
        <div className="mt-4 space-y-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onPick(t.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-left font-game font-bold active:bg-white/10"
            >
              <IconScroll className="h-5 w-5 shrink-0 text-teal-200" />
              <span className="flex-1">{t.label}</span>
              <IconArrowR className="h-5 w-5 shrink-0 text-cream/50" />
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} className="mt-4 w-full rounded-2xl bg-amber-500 py-3 font-game text-lg font-bold text-night-950">
          Fermer
        </button>
      </div>
    </div>
  );
}

/* ---------------- Styles premium (accueil) ---------------- */
const PREMIUM_CSS = `
@keyframes qz-tick{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
.qzp{background:#0C0C0B}
.qzp-pill{display:inline-flex;align-items:center;gap:4px;padding:5px 9px;border-radius:9999px;background:linear-gradient(180deg,#30302F,#171716);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 2px 6px rgba(0,0,0,.5);font-family:var(--font-game);font-weight:800;font-size:12px;color:#CAF000}
.qzp-card{background:linear-gradient(180deg,rgba(30,30,29,.9),rgba(12,12,11,.94));border:1px solid rgba(243,243,237,.08);border-radius:20px;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 8px 24px rgba(0,0,0,.5)}
.qzp-gold-ring{border-color:rgba(202,240,0,.4);box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 0 0 1px rgba(202,240,0,.28),0 8px 24px rgba(0,0,0,.5)}
.qzp-ribbon{display:inline-block;background:linear-gradient(180deg,#fbbf24,#f59e0b);padding:1px 14px;border-radius:8px;transform:skewX(-7deg);box-shadow:0 3px 0 #b45309}
.qzp-ribbon2{display:inline-block;background:linear-gradient(180deg,#D8F53A,#AAD000);padding:1px 14px;border-radius:8px;transform:skewX(-7deg);box-shadow:0 3px 0 #5b7300}
.qzp-play{background:linear-gradient(180deg,#D8F53A,#AAD000);border-radius:20px;padding:14px;box-shadow:inset 0 2px 0 rgba(255,255,255,.4),0 6px 0 #5b7300}
.qzp-play:active{transform:translateY(3px);box-shadow:inset 0 2px 0 rgba(255,255,255,.4),0 3px 0 #5b7300}
.qzp-joker{border-radius:14px;padding:8px 6px;text-align:center;color:#F3F3ED;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 4px 10px rgba(0,0,0,.45)}
.qzp-joker-blue{background:linear-gradient(180deg,#3b82f6,#1e3a8a)}
.qzp-joker-green{background:linear-gradient(180deg,#10b981,#065f46)}
.qzp-joker-purple{background:linear-gradient(180deg,#CAF000,#879E00);color:#0C0C0B}
.qzp-joker-purple .qzp-joker-ic{color:#0C0C0B;background:rgba(0,0,0,.14);box-shadow:inset 0 2px 4px rgba(255,255,255,.25)}
.qzp-joker-ic{display:inline-grid;place-items:center;width:38px;height:38px;border-radius:9999px;background:rgba(255,255,255,.22);box-shadow:inset 0 2px 4px rgba(255,255,255,.3);font-family:var(--font-game);font-weight:800;color:#fff}
.qzp-hex{width:42px;height:46px;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);box-shadow:inset 0 2px 3px rgba(255,255,255,.45)}
.qzp-hex-cur{outline:3px solid #CAF000;outline-offset:1px;border-radius:6px;animation:qz-tick 1s ease-in-out infinite}
.qzp-opt{display:flex;align-items:center;gap:10px;width:100%;padding:11px 12px;border-radius:14px;font-family:var(--font-game);font-weight:800;font-size:14px;background:linear-gradient(180deg,rgba(48,48,47,.75),rgba(23,23,22,.9));border:1px solid rgba(243,243,237,.08);color:#F3F3ED;transition:background .15s}
.qzp-opt-sel{background:linear-gradient(180deg,#D8F53A,#AAD000);border-color:#CAF000;color:#0C0C0B;box-shadow:0 0 0 2px rgba(202,240,0,.5) inset}
.qzp-opt-correct{background:linear-gradient(180deg,#22c55e,#15803d);border-color:#22c55e;color:#fff}
.qzp-opt-wrong{background:linear-gradient(180deg,#ef4444,#991b1b);border-color:#ef4444;color:#fff}
.qzp-opt-badge{display:grid;place-items:center;width:30px;height:30px;flex:0 0 auto;border-radius:9999px;background:linear-gradient(180deg,#D8F53A,#AAD000);color:#0C0C0B;box-shadow:inset 0 2px 3px rgba(255,255,255,.3)}
.qzp-opt-badge-sel{background:#0C0C0B;color:#CAF000}
.qzp-opt-badge-correct{background:linear-gradient(180deg,#ffffff,#d1fae5);color:#15803d}
.qzp-opt-badge-wrong{background:linear-gradient(180deg,#ffffff,#fee2e2);color:#991b1b}
.qzp-trail{scrollbar-width:none}
.qzp-trail::-webkit-scrollbar{display:none}
.qzp-mini{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 4px;border-radius:14px;background:linear-gradient(180deg,rgba(30,30,29,.9),rgba(12,12,11,.94));border:1px solid rgba(243,243,237,.08);font-family:var(--font-game);font-weight:800;font-size:12px;color:#F3F3ED}
.qzp-mini2{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:9999px;background:rgba(243,243,237,.08);font-family:var(--font-game);font-weight:800;font-size:13px;color:#F3F3ED}
`;

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
.qz-immersive{background:radial-gradient(circle at 18% 8%,#30302F 0%,transparent 42%),radial-gradient(circle at 82% 14%,#1E1E1D 0%,transparent 42%),radial-gradient(circle at 50% 96%,rgba(202,240,0,.12) 0%,transparent 55%),#0C0C0B;}
.qz-bg-orb{position:absolute;border-radius:9999px;filter:blur(60px);pointer-events:none;opacity:.5;}
.qz-bg-1{width:300px;height:300px;background:#CAF000;top:-80px;right:-60px;opacity:.18;animation:qz-drift 14s ease-in-out infinite;}
.qz-bg-2{width:260px;height:260px;background:#30302F;bottom:-70px;left:-50px;opacity:.6;animation:qz-drift 18s ease-in-out infinite reverse;}
.qz-bg-3{width:200px;height:200px;background:#CAF000;top:40%;left:44%;opacity:.12;animation:qz-drift 20s ease-in-out infinite;}
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
