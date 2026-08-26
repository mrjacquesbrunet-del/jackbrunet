"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { buildDeck, recordVf, getVfBest, VF_LIVES, VF_TIME, type VFItem } from "@/lib/vraifaux";

function buzz(p: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(p);
  } catch {
    /* non supporté */
  }
}

const Ico = {
  close: "M6 6l12 12M18 6L6 18",
  check: "M5 12l4.5 4.5L19 7",
  heart: "M12 20s-7-4.6-9.2-9C1.3 8 3 5 6 5c1.8 0 3.2 1 3.99 2C10.8 6 12.2 5 14 5c3 0 4.7 3 3.2 6-2.2 4.4-9.2 9-9.2 9z",
  play: "M8 5l11 7-11 7z",
};
const Path = (d: string, cls = "h-6 w-6", sw = 1.9) => (
  <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

type Phase = "hub" | "play" | "over";

export function VraiFauxScreen() {
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
  const [flash, setFlash] = useState<null | "good" | "bad">(null);
  const locked = reveal;

  useEffect(() => setBest(getVfBest()), []);

  const cur = deck[idx];

  const start = () => {
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

  const end = useCallback(
    (finalScore: number, finalPoints: number) => {
      setPhase("over");
      const res = recordVf(finalScore, finalPoints);
      setBest(res.best);
    },
    [],
  );

  const doFlash = (k: "good" | "bad") => {
    setFlash(null);
    requestAnimationFrame(() => setFlash(k));
    setTimeout(() => setFlash(null), 480);
  };

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
        doFlash("good");
        buzz(25);
      } else {
        setCombo(0);
        nLives = lives - 1;
        setLives(nLives);
        doFlash("bad");
        buzz([40, 60, 40]);
      }
      // Suite ou fin
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
  // Temps écoulé → mauvaise réponse
  useEffect(() => {
    if (phase === "play" && !reveal && timeLeft === 0) answer(null);
  }, [timeLeft, phase, reveal, answer]);

  const FX = `
@keyframes vf-in{0%{transform:translateY(16px) scale(.98);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
@keyframes vf-flash{0%{opacity:0}20%{opacity:1}100%{opacity:0}}
@keyframes vf-pop{0%{transform:scale(.6);opacity:0}55%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
.vf-immersive{background:radial-gradient(circle at 20% 8%,#0e7490 0%,transparent 45%),radial-gradient(circle at 82% 12%,#155e75 0%,transparent 45%),radial-gradient(circle at 50% 96%,#083344 0%,transparent 55%),#04141b;}
`;

  /* ---------------- HUB ---------------- */
  if (phase === "hub") {
    return (
      <div className="vf-immersive fixed inset-0 z-[100] flex flex-col overflow-y-auto text-cream">
        <style dangerouslySetInnerHTML={{ __html: FX }} />
        <div className="relative m-auto w-full max-w-md px-6 pb-10 pt-[calc(2rem+env(safe-area-inset-top))] text-center">
          <p className="font-game text-sm font-bold uppercase tracking-[0.3em] text-teal-300">Jeu rapide</p>
          <h1 className="mt-2 font-game text-5xl font-black leading-[0.95] drop-shadow">
            VRAI
            <span className="mx-2 text-teal-300">ou</span>
            FAUX
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-cream/70">
            Affirmation biblique : dis si c&apos;est vrai ou faux, avant la fin du temps. 3 vies, enchaîne les bonnes réponses&nbsp;!
          </p>

          <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-white/10 px-6 py-2 font-game text-lg font-extrabold text-teal-200">
            Record : {best}
          </div>

          <button
            type="button"
            onClick={start}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-teal-400 py-4 font-game text-xl font-extrabold text-night-950 shadow-[0_6px_0_#0f766e] active:translate-y-1 active:shadow-[0_2px_0_#0f766e]"
          >
            {Path(Ico.play, "h-5 w-5", 2.4)} JOUER
          </button>
          <Link
            href="/jeux"
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-2.5 font-game text-sm font-bold"
          >
            Retour aux jeux
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- FIN ---------------- */
  if (phase === "over") {
    return (
      <div className="vf-immersive fixed inset-0 z-[100] flex items-center justify-center px-6 text-center text-cream">
        <style dangerouslySetInnerHTML={{ __html: FX }} />
        <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-md" style={{ animation: "vf-pop .3s ease-out" }}>
          <p className="font-game text-lg text-cream/70">Partie terminée</p>
          <p className="my-4 font-game text-6xl font-black text-teal-300">{score}</p>
          <p className="text-sm text-cream/70">bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""}</p>
          <p className="mt-4 font-game text-sm">
            Record : <span className="font-extrabold text-amber-300">{best}</span>
          </p>
          <button
            type="button"
            onClick={start}
            className="mt-6 w-full rounded-2xl bg-teal-400 py-4 font-game text-xl font-extrabold text-night-950 shadow-[0_6px_0_#0f766e] active:translate-y-1 active:shadow-[0_2px_0_#0f766e]"
          >
            REJOUER
          </button>
          <Link href="/jeux" className="mt-3 block rounded-2xl bg-white/10 py-3 font-game font-bold">
            Retour aux jeux
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- JEU ---------------- */
  const isCorrect = (v: boolean) => reveal && cur && cur.answer === v;
  const isWrongPick = (v: boolean) => reveal && picked === v && cur && cur.answer !== v;

  return (
    <div className="vf-immersive fixed inset-0 z-[100] overflow-y-auto text-cream">
      <style dangerouslySetInnerHTML={{ __html: FX }} />
      {flash ? (
        <div
          className="pointer-events-none fixed inset-0 z-[95]"
          style={{
            animation: "vf-flash .48s ease-out forwards",
            background:
              flash === "good"
                ? "radial-gradient(circle at 50% 55%, rgba(45,212,191,.4), transparent 70%)"
                : "radial-gradient(circle at 50% 55%, rgba(239,68,68,.4), transparent 70%)",
          }}
        />
      ) : null}
      <div className="relative mx-auto flex min-h-full w-full max-w-md flex-col px-4 pb-8 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        {/* Entête */}
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setPhase("hub")} aria-label="Quitter" className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
            {Path(Ico.close, "h-5 w-5")}
          </button>
          <span className="rounded-full bg-white/10 px-4 py-1.5 font-game text-sm font-extrabold text-teal-200">Score {score}</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: VF_LIVES }, (_, i) => (
              <svg key={i} viewBox="0 0 24 24" className={`h-5 w-5 ${i < lives ? "text-rose-400" : "text-white/20"}`} fill="currentColor" aria-hidden>
                <path d={Ico.heart} />
              </svg>
            ))}
          </div>
        </div>

        {/* Minuteur */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${timeLeft <= 3 ? "bg-rose-400" : "bg-teal-400"}`}
            style={{ width: `${(timeLeft / VF_TIME) * 100}%`, transition: "width 1s linear" }}
          />
        </div>

        {combo >= 2 ? (
          <p className="mt-3 text-center font-game text-sm font-extrabold text-amber-300">Série ×{combo} !</p>
        ) : null}

        {/* Affirmation */}
        <div key={idx} className="my-auto rounded-3xl bg-white/[0.06] p-6 text-center shadow-xl" style={{ animation: "vf-in .35s ease-out" }}>
          <p className="font-game text-[11px] font-bold uppercase tracking-[0.2em] text-teal-300">Vrai ou faux ?</p>
          <p className="mt-3 font-display text-2xl font-bold leading-snug">{cur?.text}</p>
          {reveal && cur ? (
            <div className="mt-4 rounded-2xl bg-black/20 p-3 text-sm text-cream/75">
              <p className={`font-game font-extrabold ${cur.answer ? "text-teal-300" : "text-rose-300"}`}>
                {cur.answer ? "VRAI" : "FAUX"}
              </p>
              {cur.note ? <p className="mt-1">{cur.note}</p> : null}
              {cur.reference && cur.reference !== "—" ? (
                <p className="mt-1 font-bold text-amber-200">{cur.reference}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Boutons */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={locked}
            onClick={() => answer(true)}
            className={`flex items-center justify-center gap-2 rounded-2xl py-5 font-game text-xl font-extrabold transition-colors ${
              isCorrect(true) ? "bg-teal-400 text-night-950" : isWrongPick(true) ? "bg-rose-500 text-white" : "bg-teal-500/20 text-teal-100 ring-1 ring-teal-400/40"
            }`}
          >
            {Path(Ico.check, "h-6 w-6", 2.4)} VRAI
          </button>
          <button
            type="button"
            disabled={locked}
            onClick={() => answer(false)}
            className={`flex items-center justify-center gap-2 rounded-2xl py-5 font-game text-xl font-extrabold transition-colors ${
              isCorrect(false) ? "bg-teal-400 text-night-950" : isWrongPick(false) ? "bg-rose-500 text-white" : "bg-rose-500/15 text-rose-100 ring-1 ring-rose-400/40"
            }`}
          >
            {Path(Ico.close, "h-6 w-6", 2.4)} FAUX
          </button>
        </div>
      </div>
    </div>
  );
}
