"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buildDeck, recordVf, getVfBest, getVfXp, saveVfProgress, getVfProgress, clearVfProgress, VF_LIVES, VF_TIME, type VFItem, type VfProgress } from "@/lib/vraifaux";
import { getMemorizeXp, levelFromXp } from "@/lib/memorize";
import { getQuizCoins } from "@/lib/quiz";
import { getSupabase } from "@/lib/supabase";
import { getProfile } from "@/lib/community";
import { submitGameScore, submitWeeklyPoints } from "@/lib/game-scores";
import { ScoreBoard } from "@/components/games/ScoreBoard";
import {
  ArcadeShell,
  ArcadeHeader,
  IcoClock,
  IcoCheck,
  IcoCross,
  IcoPlay,
  IcoRefresh,
  IcoTrophy,
} from "./ArcadeUI";

function buzz(p: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(p);
  } catch {
    /* non supporté */
  }
}

const HEART = "M12 20s-7-4.6-9.2-9C1.3 8 3 5 6 5c1.8 0 3.2 1 3.99 2C10.8 6 12.2 5 14 5c3 0 4.7 3 3.2 6-2.2 4.4-9.2 9-9.2 9z";

type Phase = "hub" | "play" | "over";

export function VraiFauxScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("hub");
  const [deck, setDeck] = useState<VFItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [lives, setLives] = useState(VF_LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [points, setPoints] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [reveal, setReveal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(VF_TIME);
  const [best, setBest] = useState(0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [resumable, setResumable] = useState<VfProgress | null>(null);
  const [shake, setShake] = useState(false);
  const locked = reveal;

  useEffect(() => {
    setBest(getVfBest());
    setResumable(getVfProgress());
    setXp(getMemorizeXp() + getVfXp() + Math.floor(getQuizCoins() / 500));
    submitGameScore("vraifaux", getVfXp());
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
    clearVfProgress();
    setResumable(null);
    const d = buildDeck();
    setDeck(d);
    setIdx(0);
    setLives(VF_LIVES);
    setScore(0);
    setCombo(0);
    setPoints(0);
    setPicked(null);
    setReveal(false);
    setTimeLeft(VF_TIME);
    setPhase("play");
    buzz(20);
  };

  const resume = () => {
    const p = resumable;
    if (!p) return;
    setDeck(p.deck);
    setIdx(p.idx);
    setLives(p.lives);
    setScore(p.score);
    setCombo(p.combo);
    setPoints(p.points);
    setPicked(null);
    setReveal(false);
    setTimeLeft(VF_TIME);
    setPhase("play");
    buzz(15);
  };

  const end = useCallback((finalScore: number, finalPoints: number) => {
    setPhase("over");
    clearVfProgress();
    setResumable(null);
    const res = recordVf(finalScore, finalPoints);
    setBest(res.best);
    setXp(getMemorizeXp() + getVfXp() + Math.floor(getQuizCoins() / 500));
    submitGameScore("vraifaux", getVfXp());
    submitWeeklyPoints(finalScore); // bonnes réponses -> ligue de la semaine
  }, []);

  // Sauvegarde continue de la partie (au début de chaque affirmation).
  useEffect(() => {
    if (phase !== "play" || deck.length === 0 || reveal) return;
    saveVfProgress({ deck, idx, lives, score, combo, points, savedAt: Date.now() });
  }, [phase, deck, idx, lives, score, combo, points, reveal]);

  const answer = useCallback(
    (val: boolean | null) => {
      if (locked || !cur) return;
      const correct = val !== null && val === cur.answer;
      setPicked(val);
      setReveal(true);
      let nScore = score;
      let nLives = lives;
      let nPoints = points;
      if (correct) {
        const c = combo + 1;
        setCombo(c);
        nScore = score + 1;
        nPoints = points + 10 + Math.min(c, 10) * 2;
        setScore(nScore);
        setPoints(nPoints);
        buzz(25);
      } else {
        setCombo(0);
        nLives = lives - 1;
        setLives(nLives);
        setShake(true);
        setTimeout(() => setShake(false), 550);
        buzz([40, 60, 40]);
      }
      setTimeout(() => {
        if (nLives <= 0 || idx + 1 >= deck.length) {
          end(nScore, nPoints);
        } else {
          setIdx((i) => i + 1);
          setPicked(null);
          setReveal(false);
          setTimeLeft(VF_TIME);
        }
      }, 1500);
    },
    [locked, cur, score, lives, points, combo, idx, deck.length, end],
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
        <ArcadeHeader name={name} avatarUrl={avatar} level={lvl.level} xpInto={lvl.into} xpSpan={lvl.span} gems={best} onBack={() => router.push("/jeux")} />

        {/* Héros */}
        <div className="qm-card relative mt-4 overflow-hidden p-5">
          <span className="qm-pill-o">JEU RAPIDE</span>
          <h1 className="mt-2 font-game text-4xl font-black leading-[0.95]">
            VRAI <span className="text-fuchsia-300">ou</span> FAUX
          </h1>
          <p className="mt-2 max-w-[15rem] font-game text-sm font-semibold text-white/75">
            Vrai ou faux&nbsp;? Réponds avant la fin du temps et enchaîne les bonnes réponses.
          </p>
        </div>

        {/* Comment jouer */}
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          <MiniTip d={HEART} tint="#fb7185" label={`${VF_LIVES} vies`} sub="Ne les perds pas" />
          <MiniTip d="M13 3L4 14h6l-1 7 9-11h-6z" tint="#22d3ee" label={`${VF_TIME}s`} sub="Réponds vite" />
          <MiniTip d="M12 3c1 3-1 4-2 6-1 2 0 4 2 4s3-2 2-4c2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 4-6 5-11z" tint="#fbbf24" label="Série" sub="Bonus combo" />
        </div>

        {resumable ? (
          <button type="button" onClick={resume} className="qm-valid mt-4 flex w-full items-center justify-center gap-2">
            <IcoPlay className="h-5 w-5" /> REPRENDRE · score {resumable.score}
          </button>
        ) : null}
        <button type="button" onClick={start} className={resumable ? "qm-ghost mt-3 flex w-full items-center justify-center gap-2" : "qm-valid mt-4 flex w-full items-center justify-center gap-2"}>
          {resumable ? "Nouvelle partie" : <><IcoPlay className="h-5 w-5" /> JOUER</>}
        </button>
        <button type="button" onClick={() => router.push("/jeux")} className="qm-ghost mt-3 w-full">
          Accueil des jeux
        </button>

        <div className="mt-5">
          <ScoreBoard mode="vraifaux" accent="#A855F7" title="Classement · Vrai ou Faux" />
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
          <p className="my-3 font-game text-6xl font-black text-fuchsia-300">{score}</p>
          <p className="text-sm text-white/70">bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""}</p>
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
  const trueState = reveal ? (cur && cur.answer === true ? "correct" : picked === true ? "wrong" : "dim") : "idle";
  const falseState = reveal ? (cur && cur.answer === false ? "correct" : picked === false ? "wrong" : "dim") : "idle";
  const bigBtn = (state: string) => {
    const base = "flex flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl py-6 font-game text-2xl font-black transition-transform active:scale-[.98]";
    if (state === "dim") return `${base} opacity-40`;
    return base;
  };
  const bigStyle = (kind: "true" | "false", state: string): React.CSSProperties => {
    const green = "linear-gradient(180deg,#22c55e,#15803d)";
    const red = "linear-gradient(180deg,#ef4444,#991b1b)";
    if (state === "correct") return { background: green, boxShadow: "inset 0 2px 0 rgba(255,255,255,.4),0 6px 0 rgba(0,0,0,.25)" };
    if (state === "wrong") return { background: red, boxShadow: "inset 0 2px 0 rgba(255,255,255,.35),0 6px 0 rgba(0,0,0,.25)" };
    const g = kind === "true" ? "linear-gradient(180deg,#34d399,#059669)" : "linear-gradient(180deg,#fb7185,#e11d48)";
    return { background: g, color: "#fff", boxShadow: "inset 0 2px 0 rgba(255,255,255,.4),0 6px 0 rgba(0,0,0,.25)" };
  };

  return (
    <ArcadeShell>
      <ArcadeHeader name={name} avatarUrl={avatar} level={lvl.level} xpInto={lvl.into} xpSpan={lvl.span} gems={score} onBack={() => setPhase("hub")} />

      {/* Carte état : vies · série · record */}
      <div className="qm-card relative mt-4 overflow-hidden p-4">
        <div className="flex items-center justify-between">
          <span className="qm-pill-o">SÉRIE {combo}</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: VF_LIVES }, (_, i) => (
              <svg key={i} viewBox="0 0 24 24" className={`h-6 w-6 ${i < lives ? "text-rose-400" : "text-white/20"}`} fill="currentColor" aria-hidden>
                <path d={HEART} />
              </svg>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span className="font-game text-4xl font-black leading-none">{score}</span>
          <span className="mb-1 font-game text-sm font-bold text-white/70">bonnes réponses · record {best}</span>
        </div>
      </div>

      {/* Carte affirmation */}
      <div key={idx} className={`qm-card mt-4 p-4 ${shake ? "qm-shake" : ""}`} style={{ animation: shake ? undefined : "qm-optin .35s ease-out" }}>
        <div className="flex items-center justify-between">
          <span className="qm-pill-p">VRAI OU FAUX ?</span>
          <span className={`qm-clock ${timeLeft <= 3 ? "text-rose-300" : ""}`}>
            <IcoClock className="h-4 w-4" /> {timeLeft}s
          </span>
        </div>
        <div className="qm-timebar mt-2">
          <i style={{ width: `${(timeLeft / VF_TIME) * 100}%`, transition: "width 1s linear", background: timeLeft <= 3 ? "linear-gradient(90deg,#fb7185,#e11d48)" : undefined }} />
        </div>
        <p className="mt-4 text-center font-game text-xl font-black leading-snug">{cur?.text}</p>
        {reveal && cur ? (
          <div className="mt-4 rounded-2xl bg-black/20 p-3 text-center text-sm text-white/85">
            <p className={`font-game font-black ${cur.answer ? "text-emerald-300" : "text-rose-300"}`}>{cur.answer ? "VRAI" : "FAUX"}</p>
            {cur.note ? <p className="mt-1 text-white/75">{cur.note}</p> : null}
            {cur.reference && cur.reference !== "—" ? <p className="mt-1 font-bold text-amber-300">{cur.reference}</p> : null}
          </div>
        ) : null}
      </div>

      {/* Boutons VRAI / FAUX */}
      <div className="mt-4 flex gap-2.5">
        <button type="button" disabled={locked} onClick={() => answer(true)} className={bigBtn(trueState)} style={bigStyle("true", trueState)}>
          <IcoCheck className="h-7 w-7" /> VRAI
        </button>
        <button type="button" disabled={locked} onClick={() => answer(false)} className={bigBtn(falseState)} style={bigStyle("false", falseState)}>
          <IcoCross className="h-7 w-7" /> FAUX
        </button>
      </div>
    </ArcadeShell>
  );
}

function MiniTip({ d, tint, label, sub }: { d: string; tint: string; label: string; sub: string }) {
  return (
    <div className="qm-card p-3 text-center">
      <span className="inline-grid h-9 w-9 place-items-center rounded-full" style={{ background: `${tint}33`, color: tint }}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
      </span>
      <p className="mt-1 font-game text-[12px] font-extrabold text-white">{label}</p>
      <p className="text-[9px] leading-tight text-white/60">{sub}</p>
    </div>
  );
}
