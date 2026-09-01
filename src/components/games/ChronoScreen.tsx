"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildChronoDeck,
  firstOf,
  getChronoBest,
  getChronoXp,
  recordChrono,
  CHRONO_ROUNDS,
  CHRONO_TIME,
  type ChronoPair,
} from "@/lib/chrono";
import { getMemorizeXp, levelFromXp } from "@/lib/memorize";
import { getVfXp } from "@/lib/vraifaux";
import { getQuizCoins } from "@/lib/quiz";
import { getSupabase } from "@/lib/supabase";
import { getProfile } from "@/lib/community";
import { submitGameScore, submitWeeklyPoints } from "@/lib/game-scores";
import { ScoreBoard } from "@/components/games/ScoreBoard";
import { bumpAchv, markDayStreak } from "@/lib/achievements";
import { checkLocalBadges } from "@/lib/badges";
import {
  ArcadeShell,
  ArcadeHeader,
  HubHeader,
  IcoClock,
  IcoPlay,
  IcoRefresh,
  IcoTrophy,
  IcoTarget,
  IcoBolt,
  IcoFlameF,
} from "./ArcadeUI";

function buzz(p: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(p);
  } catch {
    /* non supporté */
  }
}

/** Sablier / frise : icône du jeu. */
function IcoHourglass({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 3h12M6 21h12M8 3v3.5c0 2 1.6 3.2 4 5.5-2.4 2.3-4 3.5-4 5.5V21M16 3v3.5c0 2-1.6 3.2-4 5.5 2.4 2.3 4 3.5 4 5.5V21" />
    </svg>
  );
}

type Phase = "hub" | "play" | "over";

const VIOLET = "#A78BFA";

export function ChronoScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("hub");
  const [deck, setDeck] = useState<ChronoPair[]>([]);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [points, setPoints] = useState(0);
  const [combo, setCombo] = useState(0);
  const [picked, setPicked] = useState<"a" | "b" | null>(null);
  const [reveal, setReveal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(CHRONO_TIME);
  const [best, setBest] = useState(0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [shake, setShake] = useState(false);
  const locked = reveal;

  useEffect(() => {
    setBest(getChronoBest());
    setXp(getMemorizeXp() + getVfXp() + getChronoXp() + Math.floor(getQuizCoins() / 500));
    submitGameScore("chrono", getChronoXp());
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
        setName(first);
        setAvatar(prof?.avatar_url || null);
      } catch {
        /* avatar neutre */
      }
    })();
  }, []);

  const lvl = levelFromXp(xp);
  const cur = deck[idx];

  const start = () => {
    setDeck(buildChronoDeck());
    setIdx(0);
    setCorrect(0);
    setPoints(0);
    setCombo(0);
    setPicked(null);
    setReveal(false);
    setTimeLeft(CHRONO_TIME);
    setPhase("play");
    buzz(20);
  };

  const end = useCallback((finalCorrect: number, finalPoints: number) => {
    setPhase("over");
    const res = recordChrono(finalCorrect, finalPoints);
    setBest(res.best);
    setXp(getMemorizeXp() + getVfXp() + getChronoXp() + Math.floor(getQuizCoins() / 500));
    submitGameScore("chrono", getChronoXp());
    submitWeeklyPoints(finalCorrect); // bonnes réponses -> ligue de la semaine
    // Badges : partie parfaite, jours de jeu, paliers fraîchement atteints.
    if (finalCorrect >= CHRONO_ROUNDS) bumpAchv("perfect_games");
    markDayStreak("play");
    checkLocalBadges();
  }, []);

  const answer = useCallback(
    (side: "a" | "b" | null) => {
      if (locked || !cur) return;
      const good = side !== null && cur[side].id === firstOf(cur).id;
      setPicked(side);
      setReveal(true);
      let nCorrect = correct;
      let nPoints = points;
      if (good) {
        const c = combo + 1;
        setCombo(c);
        nCorrect = correct + 1;
        nPoints = points + 100 + timeLeft * 10 + Math.min(c, 5) * 20;
        setCorrect(nCorrect);
        setPoints(nPoints);
        if (CHRONO_TIME - timeLeft <= 3) bumpAchv("fast_answers");
        buzz(25);
      } else {
        setCombo(0);
        setShake(true);
        setTimeout(() => setShake(false), 550);
        buzz([40, 60, 40]);
      }
      setTimeout(() => {
        if (idx + 1 >= deck.length) {
          end(nCorrect, nPoints);
        } else {
          setIdx((i) => i + 1);
          setPicked(null);
          setReveal(false);
          setTimeLeft(CHRONO_TIME);
        }
      }, 2100);
    },
    [locked, cur, correct, points, combo, idx, deck.length, timeLeft, end],
  );

  // Minuteur
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (phase !== "play" || reveal) return;
    timer.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [phase, reveal, idx]);
  useEffect(() => {
    if (phase === "play" && !reveal && timeLeft === 0) answer(null);
  }, [timeLeft, phase, reveal, answer]);

  /* ---------------- HUB ---------------- */
  if (phase === "hub") {
    return (
      <ArcadeShell>
        <HubHeader name={name} avatarUrl={avatar} level={lvl.level} xpInto={lvl.into} xpSpan={lvl.span} gems={best} onGear={() => router.push("/profil")} />

        {/* Héros */}
        <div className="qm-hero mt-4" style={{ background: "radial-gradient(120% 120% at 100% 0%, rgba(167,139,250,.22), transparent 55%), linear-gradient(135deg,#1E1E1D 0%,#0C0C0B 100%)" }}>
          <span className="pointer-events-none absolute right-4 top-4 text-[#A78BFA]/12">
            <IcoHourglass className="h-24 w-24" />
          </span>
          <div className="relative max-w-[62%]">
            <span className="qm-rapide" style={{ background: "rgba(167,139,250,.18)", color: VIOLET }}>
              <IcoBolt className="h-3.5 w-3.5" /> NOUVEAU
            </span>
            <h1 className="mt-2.5 font-game text-[2rem] font-black leading-[0.9] drop-shadow">
              LA <span className="text-[#A78BFA]">CHRONOLOGIE</span>
            </h1>
            <p className="mt-2.5 font-game text-[13px] font-semibold leading-tight text-white/85">
              Deux événements de la Bible : lequel est arrivé en premier&nbsp;?
            </p>
          </div>
        </div>

        {/* Objectif + Record */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="qm-obj flex items-center gap-3">
            <span className="qm-obj-ic"><IcoTarget className="h-6 w-6" /></span>
            <div className="min-w-0">
              <p className="font-game text-xs font-black text-teal-800">OBJECTIF</p>
              <p className="text-[11px] font-semibold leading-tight text-teal-900/80">Remets l&apos;histoire dans l&apos;ordre&nbsp;!</p>
            </div>
          </div>
          <div className="qm-rec flex items-center gap-3">
            <span className="qm-rec-ic"><IcoTrophy className="h-6 w-6" /></span>
            <div className="min-w-0">
              <p className="font-game text-xs font-black text-amber-700">RECORD</p>
              <p className="font-game text-2xl font-black leading-none text-[#4a2600]">{best}</p>
            </div>
          </div>
        </div>

        {/* Comment jouer */}
        <div className="qm-howto mt-4">
          <p className="font-game text-sm font-black tracking-wide text-[#A78BFA]">COMMENT JOUER</p>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            <div className="qm-mini" style={{ background: "linear-gradient(180deg,#ede9fe,#ddd6fe)" }}>
              <span className="qm-mini-ic" style={{ background: "linear-gradient(180deg,#a78bfa,#7c3aed)" }}><IcoHourglass className="h-5 w-5" /></span>
              <p className="mt-1.5 font-game text-[13px] font-black text-[#4c1d95]">{CHRONO_ROUNDS} duels</p>
              <p className="text-[9px] font-semibold text-[#4c1d95]/70">d&apos;événements</p>
            </div>
            <div className="qm-mini" style={{ background: "linear-gradient(180deg,#cffafe,#a5f3fc)" }}>
              <span className="qm-mini-ic" style={{ background: "linear-gradient(180deg,#22d3ee,#0891b2)" }}><IcoBolt className="h-5 w-5" /></span>
              <p className="mt-1.5 font-game text-[13px] font-black text-[#155e75]">{CHRONO_TIME}s</p>
              <p className="text-[9px] font-semibold text-[#155e75]/70">Réponds vite</p>
            </div>
            <div className="qm-mini" style={{ background: "linear-gradient(180deg,#ffedd5,#fed7aa)" }}>
              <span className="qm-mini-ic" style={{ background: "linear-gradient(180deg,#fb923c,#ea580c)" }}><IcoFlameF className="h-5 w-5" /></span>
              <p className="mt-1.5 font-game text-[13px] font-black text-[#7c2d12]">Série</p>
              <p className="text-[9px] font-semibold text-[#7c2d12]/70">Bonus combo</p>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] font-semibold text-white/55">
            Ça se corse au fil de la partie : les événements se rapprochent&nbsp;!
          </p>
        </div>

        <button type="button" onClick={start} className="qm-jouer mt-4">
          <IcoPlay className="h-6 w-6" /> JOUER
        </button>

        <div className="mt-4 flex justify-center">
          <button type="button" onClick={() => router.push("/jeux")} className="qm-retour">
            <IcoRefresh className="h-4 w-4" /> RETOUR AUX JEUX
          </button>
        </div>

        <div className="mt-5">
          <ScoreBoard mode="chrono" accent={VIOLET} title="Classement · La Chronologie" />
        </div>
      </ArcadeShell>
    );
  }

  /* ---------------- FIN ---------------- */
  if (phase === "over") {
    return (
      <ArcadeShell>
        <ArcadeHeader name={name} avatarUrl={avatar} level={lvl.level} xpInto={lvl.into} xpSpan={lvl.span} gems={best} onBack={() => setPhase("hub")} />
        <div className="qm-card mt-6 p-8 text-center" style={{ animation: "qm-optin .3s ease-out" }}>
          <p className="font-game text-lg text-white/60">Partie terminée</p>
          <p className="my-3 font-game text-6xl font-black text-[#A78BFA]">{points}</p>
          <p className="text-sm text-white/70">{correct}/{deck.length} dans le bon ordre</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-game text-sm">
            <IcoTrophy className="h-4 w-4 text-amber-300" /> Record <span className="font-extrabold text-amber-300">{best}</span>
          </div>
        </div>
        <button type="button" onClick={start} className="qm-valid mt-4 flex w-full items-center justify-center gap-2">
          <IcoRefresh className="h-5 w-5" /> REJOUER
        </button>
        <button type="button" onClick={() => router.push("/jeux")} className="qm-ghost mt-2 w-full">
          Accueil des jeux
        </button>
      </ArcadeShell>
    );
  }

  /* ---------------- JEU ---------------- */
  const cardState = (side: "a" | "b"): "idle" | "correct" | "wrong" | "dim" => {
    if (!reveal || !cur) return "idle";
    const isFirst = cur[side].id === firstOf(cur).id;
    if (isFirst) return "correct";
    if (picked === side) return "wrong";
    return "dim";
  };
  const cardStyle = (state: string): React.CSSProperties => {
    if (state === "correct")
      return { background: "linear-gradient(180deg,#22c55e,#15803d)", boxShadow: "inset 0 2px 0 rgba(255,255,255,.35),0 6px 0 rgba(0,0,0,.25)" };
    if (state === "wrong")
      return { background: "linear-gradient(180deg,#ef4444,#991b1b)", boxShadow: "inset 0 2px 0 rgba(255,255,255,.3),0 6px 0 rgba(0,0,0,.25)" };
    return {
      background: "linear-gradient(180deg,#8b5cf6,#6d28d9)",
      boxShadow: "inset 0 2px 0 rgba(255,255,255,.35),0 6px 0 rgba(0,0,0,.3)",
    };
  };

  return (
    <ArcadeShell>
      <ArcadeHeader name={name} avatarUrl={avatar} level={lvl.level} xpInto={lvl.into} xpSpan={lvl.span} gems={points} onBack={() => setPhase("hub")} />

      {/* Carte état : manche · série · points */}
      <div className="qm-card relative mt-4 overflow-hidden p-4">
        <div className="flex items-center justify-between">
          <span className="qm-pill-o">SÉRIE {combo}</span>
          <span className="font-game text-sm font-bold text-white/70">{idx + 1}/{deck.length}</span>
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span className="font-game text-4xl font-black leading-none">{points}</span>
          <span className="mb-1 font-game text-sm font-bold text-white/70">points · record {best}</span>
        </div>
      </div>

      {/* Question + chrono */}
      <div key={idx} className={`qm-card mt-4 p-4 ${shake ? "qm-shake" : ""}`} style={{ animation: shake ? undefined : "qm-optin .35s ease-out" }}>
        <div className="flex items-center justify-between">
          <span className="qm-pill-p" style={{ background: "rgba(167,139,250,.2)", color: "#c4b5fd" }}>LEQUEL EST ARRIVÉ EN PREMIER ?</span>
          <span className={`qm-clock ${timeLeft <= 3 ? "text-rose-300" : ""}`}>
            <IcoClock className="h-4 w-4" /> {timeLeft}s
          </span>
        </div>
        <div className="qm-timebar mt-2">
          <i style={{ width: `${(timeLeft / CHRONO_TIME) * 100}%`, transition: "width 1s linear", background: timeLeft <= 3 ? "linear-gradient(90deg,#fb7185,#e11d48)" : "linear-gradient(90deg,#a78bfa,#7c3aed)" }} />
        </div>

        {/* Les deux événements */}
        <div className="mt-4 flex flex-col gap-3">
          {(["a", "b"] as const).map((side) => {
            const st = cardState(side);
            const e = cur?.[side];
            if (!e) return null;
            return (
              <button
                key={side}
                type="button"
                disabled={locked}
                onClick={() => answer(side)}
                className={`relative rounded-2xl px-4 py-5 text-left font-game transition-transform active:scale-[.98] ${st === "dim" ? "opacity-45" : ""}`}
                style={cardStyle(st)}
              >
                <p className="text-lg font-black leading-snug text-white drop-shadow">{e.label}</p>
                {reveal ? (
                  <p className="mt-1.5 text-[12px] font-bold text-white/85">
                    {e.era} · {e.ref}
                  </p>
                ) : null}
                {st === "correct" ? (
                  <span className="absolute right-3 top-3 rounded-full bg-white/25 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                    En premier
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </ArcadeShell>
  );
}
