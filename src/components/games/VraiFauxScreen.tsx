"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { buildDeck, recordVf, getVfBest, getVfXp, saveVfProgress, getVfProgress, clearVfProgress, VF_LIVES, VF_TIME, type VFItem, type VfProgress } from "@/lib/vraifaux";
import { getMemorizeXp, levelFromXp } from "@/lib/memorize";
import { getQuizCoins } from "@/lib/quiz";
import { getSupabase } from "@/lib/supabase";
import { getProfile } from "@/lib/community";
import { submitGameScore, submitWeeklyPoints } from "@/lib/game-scores";
import { ScoreBoard } from "@/components/games/ScoreBoard";

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
  scale: "M12 4v16M8 20h8M6 7h12M6 7l-2.5 5a3 3 0 0 0 5 0zM18 7l-2.5 5a3 3 0 0 0 5 0z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0",
  bolt: "M13 3L4 14h6l-1 7 9-11h-6z",
  flame: "M12 3c1 3-1 4-2 6-1 2 0 4 2 4s3-2 2-4c2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 4-6 5-11z",
  target: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
};
const Path = (d: string, cls = "h-6 w-6", sw = 1.9) => (
  <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const VFP_CSS = `
@keyframes vf-in{0%{transform:translateY(16px) scale(.98);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
@keyframes vf-flash{0%{opacity:0}20%{opacity:1}100%{opacity:0}}
@keyframes vf-pop{0%{transform:scale(.6);opacity:0}55%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
.vfp{background:#F3F3ED;color:#171716}
.vfp-card{background:#fff;border:1px solid rgba(23,23,22,.08);border-radius:20px;box-shadow:0 10px 26px rgba(23,23,22,.08)}
.vfp-pill{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:9999px;background:#fff;border:1px solid rgba(23,23,22,.08);box-shadow:0 4px 12px rgba(23,23,22,.06);font-family:var(--font-game);font-weight:800;font-size:13px;color:#0d9488}
.vfp-play{background:linear-gradient(180deg,#2dd4bf,#0d9488);border-radius:20px;box-shadow:inset 0 2px 0 rgba(255,255,255,.5),0 6px 0 #0f766e;color:#04252b}
.vfp-play:active{transform:translateY(3px);box-shadow:inset 0 2px 0 rgba(255,255,255,.5),0 3px 0 #0f766e}
.vfp-hero{background:radial-gradient(120% 100% at 100% 0%,#5eead4 0%,#99f6e4 40%,#e7fbf6 100%);border:1px solid rgba(13,148,136,.18)}
.vfp-true{background:linear-gradient(180deg,#2dd4bf,#0d9488);color:#04252b;box-shadow:inset 0 2px 0 rgba(255,255,255,.45),0 5px 0 #0f766e}
.vfp-true:active{transform:translateY(2px);box-shadow:inset 0 2px 0 rgba(255,255,255,.45),0 3px 0 #0f766e}
.vfp-false{background:linear-gradient(180deg,#fb7185,#e11d48);color:#fff;box-shadow:inset 0 2px 0 rgba(255,255,255,.35),0 5px 0 #9f1239}
.vfp-false:active{transform:translateY(2px);box-shadow:inset 0 2px 0 rgba(255,255,255,.35),0 3px 0 #9f1239}
.vf-immersive{background:radial-gradient(circle at 20% 8%,#5eead4 0%,transparent 45%),radial-gradient(circle at 82% 12%,#99f6e4 0%,transparent 45%),#F3F3ED;}
`;

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
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [resumable, setResumable] = useState<VfProgress | null>(null);
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

  // Écran plein écran : on fige le défilement de la page derrière.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const pb = body.style.overflow;
    const ph = html.style.overflow;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    return () => {
      body.style.overflow = pb;
      html.style.overflow = ph;
    };
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

  // Reprend la partie sauvegardée là où elle s'était arrêtée.
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

  /* ---------------- Bandeau profil (commun) ---------------- */
  const Hud = ({ compact }: { compact?: boolean }) => (
    <div className="flex items-center gap-3">
      <Link href="/jeux" aria-label="Profil" className="shrink-0">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className={`${compact ? "h-11 w-11" : "h-14 w-14"} rounded-full object-cover shadow-md ring-2 ring-teal-400/70`} />
        ) : (
          <span className={`grid ${compact ? "h-11 w-11" : "h-14 w-14"} place-items-center rounded-full bg-night-900/10 text-night-900/60 ring-2 ring-night-900/10`}>
            {Path(Ico.user, "h-7 w-7", 1.8)}
          </span>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <p className="truncate font-game text-base font-extrabold leading-tight text-night-900">{name || "Joueur"}</p>
        <p className="font-game text-[11px] font-bold tracking-wide text-teal-600">NIVEAU {lvl.level}</p>
        <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-night-900/10">
          <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600" style={{ width: `${Math.round((lvl.into / lvl.span) * 100)}%` }} />
        </div>
      </div>
    </div>
  );

  /* ---------------- HUB ---------------- */
  if (phase === "hub") {
    return (
      <div className="vfp fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden [overscroll-behavior:contain] [-webkit-overflow-scrolling:touch]">
        <style dangerouslySetInnerHTML={{ __html: VFP_CSS }} />
        <div className="relative mx-auto w-full max-w-md px-4 pb-10 pt-[calc(0.75rem+env(safe-area-inset-top))]">
          <div className="flex items-center gap-3">
            <div className="flex-1"><Hud /></div>
            <span className="vfp-pill">{Path(Ico.target, "h-4 w-4", 2)} Record {best}</span>
          </div>

          {/* Héros */}
          <div className="vfp-hero relative mt-4 overflow-hidden rounded-3xl p-5 shadow-lg">
            <span className="pointer-events-none absolute -right-6 -top-6 text-teal-700/15">{Path(Ico.scale, "h-40 w-40", 1.2)}</span>
            <div className="relative">
              <span className="inline-block rounded-lg bg-teal-500 px-3 py-0.5 font-game text-xs font-extrabold text-white">JEU RAPIDE</span>
              <h1 className="mt-2 font-game text-4xl font-black leading-[0.95] text-night-900">
                VRAI <span className="text-teal-600">ou</span> FAUX
              </h1>
              <p className="mt-2 max-w-[15rem] font-game text-sm font-semibold text-night-900/70">
                Vrai ou faux&nbsp;? Réponds avant la fin du temps et enchaîne les bonnes réponses.
              </p>
            </div>
          </div>

          {/* Objectif + Record */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="vfp-card flex items-center gap-2.5 p-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-500 text-white shadow">{Path(Ico.target, "h-5 w-5", 2)}</span>
              <div className="min-w-0">
                <p className="font-game text-xs font-extrabold text-teal-600">OBJECTIF</p>
                <p className="text-[11px] leading-tight text-night-900/60">Enchaîne un max de bonnes réponses&nbsp;!</p>
              </div>
            </div>
            <div className="vfp-card flex items-center gap-2.5 p-3.5" style={{ borderColor: "rgba(251,191,36,.5)" }}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 text-night-950 shadow">{Path(Ico.target, "h-5 w-5", 2)}</span>
              <div className="min-w-0">
                <p className="font-game text-[10px] font-extrabold text-amber-500">RECORD</p>
                <p className="font-game text-2xl font-black leading-tight text-night-900">{best}</p>
              </div>
            </div>
          </div>

          {/* Comment jouer */}
          <div className="vfp-card mt-3 p-3">
            <p className="mb-2 font-game text-sm font-extrabold text-night-900/70">COMMENT JOUER</p>
            <div className="grid grid-cols-3 gap-2">
              <Tip icon={Ico.heart} color="#e11d48" label={`${VF_LIVES} vies`} sub="Ne les perds pas" />
              <Tip icon={Ico.bolt} color="#0d9488" label={`${VF_TIME}s`} sub="Réponds vite" />
              <Tip icon={Ico.flame} color="#f59e0b" label="Série" sub="Bonus combo" />
            </div>
          </div>

          {/* Reprise : si une partie a été quittée sans être finie */}
          {resumable ? (
            <button
              type="button"
              onClick={resume}
              className="vfp-play mt-4 flex w-full items-center justify-center gap-3 py-4 font-game text-xl font-black"
            >
              {Path(Ico.play, "h-6 w-6", 2.4)} REPRENDRE · score {resumable.score}
            </button>
          ) : null}

          {/* JOUER */}
          <button
            type="button"
            onClick={start}
            className={
              resumable
                ? "mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-night-900/15 bg-white/70 py-3 font-game text-sm font-bold text-night-900"
                : "vfp-play mt-4 flex w-full items-center justify-center gap-3 py-4 font-game text-2xl font-black"
            }
          >
            {resumable ? "Nouvelle partie" : <>{Path(Ico.play, "h-6 w-6", 2.4)} JOUER</>}
          </button>

          <Link
            href="/jeux"
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-night-900/15 bg-white/70 py-3 font-game text-sm font-bold text-night-900"
          >
            Retour aux jeux
          </Link>

          {/* Classement de ce jeu */}
          <div className="mt-5">
            <ScoreBoard mode="vraifaux" accent="#0d9488" title="Classement · Vrai ou Faux" light />
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- FIN ---------------- */
  if (phase === "over") {
    return (
      <div className="vfp fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden px-6 text-center">
        <style dangerouslySetInnerHTML={{ __html: VFP_CSS }} />
        <div className="vfp-card w-full max-w-sm p-8" style={{ animation: "vf-pop .3s ease-out" }}>
          <p className="font-game text-lg text-night-900/60">Partie terminée</p>
          <p className="my-3 font-game text-6xl font-black text-teal-600">{score}</p>
          <p className="text-sm text-night-900/60">bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""}</p>
          <p className="mt-4 font-game text-sm text-night-900">
            Record : <span className="font-extrabold text-amber-500">{best}</span>
          </p>
          <button type="button" onClick={start} className="vfp-play mt-6 w-full py-4 font-game text-xl font-black">
            REJOUER
          </button>
          <Link href="/jeux" className="mt-3 block rounded-2xl border border-night-900/15 bg-white/70 py-3 font-game font-bold text-night-900">
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
    <div className="vfp fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden [overscroll-behavior:contain] [-webkit-overflow-scrolling:touch]">
      <style dangerouslySetInnerHTML={{ __html: VFP_CSS }} />
      {flash ? (
        <div
          className="pointer-events-none fixed inset-0 z-[95]"
          style={{
            animation: "vf-flash .48s ease-out forwards",
            background:
              flash === "good"
                ? "radial-gradient(circle at 50% 55%, rgba(13,148,136,.28), transparent 70%)"
                : "radial-gradient(circle at 50% 55%, rgba(225,29,72,.28), transparent 70%)",
          }}
        />
      ) : null}
      <div className="relative mx-auto flex min-h-full w-full max-w-md flex-col px-4 pb-8 pt-[calc(0.6rem+env(safe-area-inset-top))]">
        {/* HUD */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/jeux"
            aria-label="Quitter vers l'accueil des jeux"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-night-900/[0.06] text-night-900/70 ring-1 ring-night-900/10"
          >
            {Path(Ico.close, "h-5 w-5")}
          </Link>
          <div className="min-w-0 flex-1"><Hud compact /></div>
          <span className="vfp-pill">Score {score}</span>
        </div>

        {/* Vies + minuteur */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: VF_LIVES }, (_, i) => (
              <svg key={i} viewBox="0 0 24 24" className={`h-5 w-5 ${i < lives ? "text-rose-500" : "text-night-900/15"}`} fill="currentColor" aria-hidden>
                <path d={Ico.heart} />
              </svg>
            ))}
          </div>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-night-900/10">
            <div
              className={`h-full rounded-full ${timeLeft <= 3 ? "bg-rose-500" : "bg-teal-500"}`}
              style={{ width: `${(timeLeft / VF_TIME) * 100}%`, transition: "width 1s linear" }}
            />
          </div>
          <span className={`font-game text-sm font-extrabold ${timeLeft <= 3 ? "text-rose-500" : "text-night-900/70"}`}>{timeLeft}s</span>
        </div>

        {combo >= 2 ? (
          <p className="mt-3 text-center font-game text-sm font-extrabold text-amber-500">Série ×{combo} !</p>
        ) : null}

        {/* Affirmation */}
        <div key={idx} className="vfp-card my-auto p-6 text-center" style={{ animation: "vf-in .35s ease-out" }}>
          <p className="font-game text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600">Vrai ou faux&nbsp;?</p>
          <p className="mt-3 font-display text-2xl font-bold leading-snug text-night-900">{cur?.text}</p>
          {reveal && cur ? (
            <div className="mt-4 rounded-2xl bg-night-900/[0.04] p-3 text-sm text-night-900/75">
              <p className={`font-game font-extrabold ${cur.answer ? "text-teal-600" : "text-rose-600"}`}>
                {cur.answer ? "VRAI" : "FAUX"}
              </p>
              {cur.note ? <p className="mt-1">{cur.note}</p> : null}
              {cur.reference && cur.reference !== "—" ? (
                <p className="mt-1 font-bold text-amber-600">{cur.reference}</p>
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
            className={`flex items-center justify-center gap-2 rounded-2xl py-5 font-game text-xl font-black ${
              isCorrect(true) ? "vfp-true" : isWrongPick(true) ? "vfp-false" : "border border-teal-500/40 bg-teal-500/10 text-teal-700"
            }`}
          >
            {Path(Ico.check, "h-6 w-6", 2.4)} VRAI
          </button>
          <button
            type="button"
            disabled={locked}
            onClick={() => answer(false)}
            className={`flex items-center justify-center gap-2 rounded-2xl py-5 font-game text-xl font-black ${
              isCorrect(false) ? "vfp-true" : isWrongPick(false) ? "vfp-false" : "border border-rose-500/40 bg-rose-500/10 text-rose-700"
            }`}
          >
            {Path(Ico.close, "h-6 w-6", 2.4)} FAUX
          </button>
        </div>
      </div>
    </div>
  );
}

function Tip({ icon, color, label, sub }: { icon: string; color: string; label: string; sub: string }) {
  return (
    <div className="rounded-xl bg-night-900/[0.03] p-2 text-center">
      <span className="inline-grid h-8 w-8 place-items-center rounded-full" style={{ background: `${color}1a`, color }}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg>
      </span>
      <p className="mt-1 font-game text-[11px] font-extrabold text-night-900">{label}</p>
      <p className="text-[9px] leading-tight text-night-900/55">{sub}</p>
    </div>
  );
}
