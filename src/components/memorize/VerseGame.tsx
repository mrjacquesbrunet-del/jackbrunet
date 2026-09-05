"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { addMemorizeXp, markReviewed, recordPlaySession, GAME_BEST_KEY, type MemorizeItem } from "@/lib/memorize";
import { submitWeeklyPoints } from "@/lib/game-leaderboard";
import { isMusicOn, startGameMusic, stopGameMusic, toggleGameMusic } from "@/lib/game-audio";
import { bumpAchv, markDayStreak } from "@/lib/achievements";
import { checkLocalBadges } from "@/lib/badges";

/**
 * « Le jeu du verset » — vrai mini-jeu mobile plein écran (esprit Duolingo,
 * charte RHEMA). Pour chaque verset :
 *   0. Apprentissage — le verset s'affiche ~30 s (compte à rebours) puis
 *      disparaît ;
 *   1. Puzzle — remets les mots dans l'ordre ;
 *   2. À trous — choisis le bon mot ;
 *   3. Référence — d'où vient le verset ? ;
 *   4. Par cœur — retape le verset.
 * Effets : confettis, « +points » qui s'envolent, combo en feu, barre animée,
 * mascottes. Score → XP (niveaux), combo ×5, 3 vies, meilleur score gardé.
 */

const STUDY_SECONDS = 30;

/**
 * Progression pédagogique par verset : on retient d'abord (trous faciles),
 * puis on cache de plus en plus de mots, une phase de variété, et la phase
 * finale = tout remettre dans l'ordre (le plus exigeant).
 */
const MODES = [
  { kind: "trous", ratio: 0.22, title: "Complète — quelques mots cachés", mult: 1 },
  { kind: "trous", ratio: 0.45, title: "Complète — un peu plus de mots", mult: 2 },
  { kind: "trous", ratio: 0.72, title: "Complète — presque tout de mémoire", mult: 2 },
  { kind: "reference", ratio: 0, title: "D'où vient ce verset ?", mult: 2 },
  { kind: "puzzle", ratio: 1, title: "Remets le verset entier dans l'ordre", mult: 3 },
] as const;
type Mode = (typeof MODES)[number]["kind"];

const chunky =
  "select-none rounded-2xl border-2 transition-all duration-100 active:translate-y-[3px] active:shadow-none";
const chipCls = `${chunky} border-white/12 bg-[#30302F] px-4 py-2.5 text-[16px] font-semibold text-white shadow-[0_4px_0_rgba(255,255,255,0.10)] hover:border-amber-400/40`;
const chipWrongCls = `${chunky} border-rose-400/80 bg-rose-400/15 px-4 py-2.5 text-[16px] font-semibold text-rose-200 shadow-[0_4px_0_rgba(251,113,133,0.35)]`;

/** Styles/animations du jeu, injectés une fois. */
function GameStyles() {
  return (
    <style>{`
      @keyframes jb-pop{0%{transform:scale(0.6);opacity:0}50%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
      @keyframes jb-float{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-46px) scale(1.4);opacity:0}}
      @keyframes jb-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
      @keyframes jb-shimmer{0%{background-position:-160% 0}100%{background-position:260% 0}}
      @keyframes jb-fall{0%{transform:translateY(-10vh) rotate(0);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0.9}}
      @keyframes jb-ring{to{stroke-dashoffset:0}}
      @keyframes jb-glowpulse{0%,100%{box-shadow:0 5px 0 rgba(180,83,9,1),0 0 0 rgba(251,191,36,0)}50%{box-shadow:0 5px 0 rgba(180,83,9,1),0 0 26px rgba(251,191,36,0.55)}}
      @keyframes jb-slidein{0%{transform:translateY(18px);opacity:0}100%{transform:translateY(0);opacity:1}}
      @keyframes jb-wordin{0%{transform:scale(1.5);color:#F6FFB8}60%{transform:scale(0.94)}100%{transform:scale(1)}}
      @keyframes jb-toast{0%{transform:scale(0.5) translateY(10px);opacity:0}20%{transform:scale(1.1) translateY(0);opacity:1}80%{transform:scale(1);opacity:1}100%{transform:scale(0.9) translateY(-14px);opacity:0}}
      @keyframes jb-heartloss{0%{transform:scale(1)}40%{transform:scale(1.5) rotate(-12deg)}100%{transform:scale(0) rotate(20deg);opacity:0}}
      @keyframes jb-chipin{0%{transform:translateY(10px) scale(0.85);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
      .jb-pop{animation:jb-pop .28s ease-out}
      .jb-shake{animation:jb-shake .45s ease-in-out}
      .jb-slidein{animation:jb-slidein .35s cubic-bezier(.2,.9,.3,1.2)}
      .jb-wordin{display:inline-block;animation:jb-wordin .32s ease-out}
      .jb-toast{animation:jb-toast 1s ease-out forwards}
      .jb-heartloss{animation:jb-heartloss .5s ease-in forwards}
      .jb-shimmer{background:linear-gradient(100deg,rgba(251,191,36,0) 20%,rgba(255,255,255,0.55) 50%,rgba(251,191,36,0) 80%);background-size:200% 100%;animation:jb-shimmer 1.6s linear infinite}
      .jb-glow{animation:jb-glowpulse 1.8s ease-in-out infinite}
      .jb-chip{animation:jb-chipin .3s ease-out backwards}
      .mem-root{background:
        radial-gradient(120% 55% at 50% -5%, #30302F 0%, transparent 60%),
        radial-gradient(85% 50% at 50% 108%, rgba(202,240,0,.12) 0%, transparent 55%),
        linear-gradient(180deg,#0C0C0B 0%,#171716 55%,#0C0C0B 100%);
        background-attachment:fixed;}
    `}</style>
  );
}

/** Pluie de confettis (lime/crème) sur un verset bouclé. */
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const s = (i * 9301 + 49297) % 233280;
        const rnd = (n: number) => ((s * (n + 3)) % 1000) / 1000;
        return {
          left: `${Math.round(rnd(1) * 100)}%`,
          delay: `${(rnd(2) * 0.5).toFixed(2)}s`,
          dur: `${(1.1 + rnd(3) * 0.9).toFixed(2)}s`,
          size: 6 + Math.round(rnd(4) * 8),
          color: ["#CAF000", "#F3F3ED", "#A8D400", "#FFD86B"][i % 4],
          round: i % 2 === 0,
        };
      }),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? "9999px" : "2px",
            animation: `jb-fall ${p.dur} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-6 w-6 ${filled ? "fill-amber-400 stroke-amber-400" : "fill-none stroke-white/25"}`}
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path d="M12 20.5S4 15 4 9.6A4.4 4.4 0 0 1 8.4 5c1.6 0 3 .9 3.6 2.2A4.1 4.1 0 0 1 15.6 5 4.4 4.4 0 0 1 20 9.6c0 5.4-8 10.9-8 10.9z" strokeLinejoin="round" />
    </svg>
  );
}

function HappyFace() {
  return (
    <svg viewBox="0 0 48 48" className="h-16 w-16 shrink-0 animate-bounce" aria-hidden="true">
      <circle cx="24" cy="26" r="17" className="fill-amber-400/20 stroke-amber-400" strokeWidth="2.5" />
      <path d="M24 2v4M9 7l2.8 2.8M39 7l-2.8 2.8" className="stroke-amber-300 fill-none" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M15.5 23c1.6-2.2 4.4-2.2 6 0M26.5 23c1.6-2.2 4.4-2.2 6 0" className="stroke-amber-300 fill-none" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M15.5 30c2.4 4.4 6 6.4 8.5 6.4s6.1-2 8.5-6.4" className="stroke-amber-300 fill-none" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function SadFace() {
  return (
    <svg viewBox="0 0 48 48" className="jb-shake h-16 w-16 shrink-0" aria-hidden="true">
      <circle cx="24" cy="26" r="17" className="fill-rose-400/15 stroke-rose-400" strokeWidth="2.5" />
      <path d="M15 20l6 2M33 20l-6 2" className="stroke-rose-300 fill-none" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="18.5" cy="26" r="1.6" className="fill-rose-300" />
      <circle cx="29.5" cy="26" r="1.6" className="fill-rose-300" />
      <path d="M17 35c2.2-3.4 5-4.8 7-4.8s4.8 1.4 7 4.8" className="stroke-rose-300 fill-none" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Phase 0 — Apprentissage (le verset s'affiche puis disparaît)        */
/* ------------------------------------------------------------------ */
function StudyPhase({ item, onReady }: { item: MemorizeItem; onReady: () => void }) {
  const [left, setLeft] = useState(STUDY_SECONDS);
  useEffect(() => {
    setLeft(STUDY_SECONDS);
    const t = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          clearInterval(t);
          onReady();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const R = 20;
  const C = 2 * Math.PI * R;
  const frac = left / STUDY_SECONDS;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-400">Mémorise ce verset</p>
      <div className="mt-6 jb-pop rounded-3xl border-2 border-amber-400/30 bg-[#1E1E1D]/72 p-6">
        <p className="font-game text-2xl font-medium leading-relaxed text-white">
          «{" "}
          {item.text.split(/\s+/).map((w, i) => (
            <span key={i} className="jb-chip inline-block" style={{ animationDelay: `${i * 55}ms`, marginRight: "0.28em" }}>
              {w}
            </span>
          ))}
          »
        </p>
        <p className="mt-4 font-game text-base font-bold text-amber-300">{item.reference}</p>
      </div>

      {/* Compte à rebours circulaire */}
      <div className="mt-8 flex items-center gap-3">
        <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90">
          <circle cx="24" cy="24" r={R} className="fill-none stroke-white/12" strokeWidth="5" />
          <circle
            cx="24"
            cy="24"
            r={R}
            className="fill-none stroke-amber-400 transition-all duration-1000 ease-linear"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - frac)}
          />
        </svg>
        <span className="font-game text-lg font-bold tabular-nums text-white/80">{left}s</span>
      </div>

      <button
        type="button"
        onClick={onReady}
        className={`${chunky} jb-glow mt-8 w-full max-w-xs border-amber-400 bg-amber-400 px-5 py-3.5 font-game text-base font-bold uppercase tracking-wide text-night-950 shadow-[0_5px_0_rgba(180,83,9,1)]`}
      >
        C&apos;est mémorisé !
      </button>
      <p className="mt-3 text-xs text-white/45">Lis-le, retiens-le — il va disparaître.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Manche 1 — Puzzle                                                   */
/* ------------------------------------------------------------------ */
function PuzzleRound({ words, locked, onGood, onBad, onDone }: {
  words: string[]; locked: boolean; onGood: () => void; onBad: () => void; onDone: () => void;
}) {
  const pool = useMemo(() => shuffle(words.map((_, i) => i), words.length * 7 + 5), [words]);
  const [placed, setPlaced] = useState(0);
  const [used, setUsed] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<number | null>(null);
  const [shake, setShake] = useState(false);

  function tap(poolIdx: number) {
    if (locked || used.has(poolIdx)) return;
    if (words[pool[poolIdx]] === words[placed]) {
      const nu = new Set(used); nu.add(poolIdx); setUsed(nu);
      onGood();
      const np = placed + 1; setPlaced(np);
      if (np >= words.length) onDone();
    } else {
      setWrong(poolIdx); onBad();
      setShake(true);
      setTimeout(() => setShake(false), 450);
      setTimeout(() => setWrong(null), 450);
    }
  }

  return (
    <>
      <p className={`min-h-[5.5rem] rounded-3xl border-2 border-white/10 bg-[#1E1E1D]/72 p-4 font-game text-[17px] leading-relaxed text-white ${shake ? "jb-shake" : ""}`}>
        {words.slice(0, placed).map((w, i) => (
          <span key={i} className={i === placed - 1 ? "jb-wordin" : undefined}>{w} </span>
        ))}
        {placed < words.length ? <span className="text-amber-300">▍</span> : null}
      </p>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {pool.map((wordIdx, poolIdx) =>
          used.has(poolIdx) ? null : (
            <button key={poolIdx} type="button" onClick={() => tap(poolIdx)}
              style={{ animationDelay: `${poolIdx * 45}ms` }}
              className={`jb-chip font-game ${wrong === poolIdx ? chipWrongCls : chipCls}`}>
              {words[wordIdx]}
            </button>
          ),
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Manche 2 — À trous                                                  */
/* ------------------------------------------------------------------ */
function BlanksRound({ words, ratio, locked, onGood, onBad, onDone }: {
  words: string[]; ratio: number; locked: boolean; onGood: () => void; onBad: () => void; onDone: () => void;
}) {
  const blanks = useMemo(() => {
    // Nombre de trous selon la difficulté (on garde au moins un mot visible).
    const n = Math.min(
      Math.max(1, words.length - 1),
      Math.max(1, Math.round(words.length * ratio)),
    );
    const seed = words.length * 13 + Math.round(ratio * 100) + 7;
    return shuffle(words.map((_, i) => i), seed).slice(0, n).sort((a, b) => a - b);
  }, [words, ratio]);
  const [current, setCurrent] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const target = blanks[current];
  const options = useMemo(() => {
    if (target === undefined) return [];
    const good = words[target];
    const others = Array.from(new Set(words.filter((w) => w !== good)));
    const decoys = shuffle(others, target * 31 + 7).slice(0, 2);
    return shuffle([good, ...decoys], target * 17 + 3);
  }, [words, target]);

  function pick(w: string) {
    if (locked || target === undefined) return;
    if (w === words[target]) {
      onGood(); setWrong(null);
      const next = current + 1; setCurrent(next);
      if (next >= blanks.length) onDone();
    } else {
      setWrong(w); onBad();
      setShake(true);
      setTimeout(() => setShake(false), 450);
      setTimeout(() => setWrong(null), 450);
    }
  }

  return (
    <>
      <p className={`rounded-3xl border-2 border-white/10 bg-[#1E1E1D]/72 p-4 font-game text-[17px] leading-relaxed text-white ${shake ? "jb-shake" : ""}`}>
        {words.map((w, i) => {
          const bi = blanks.indexOf(i);
          if (bi === -1 || bi < current) {
            // Un mot qu'on vient de compléter apparaît avec un « pop ».
            const justFilled = bi === current - 1;
            return (
              <span key={i} className={bi !== -1 ? `font-bold text-amber-300 ${justFilled ? "jb-wordin" : ""}` : undefined}>
                {w}{" "}
              </span>
            );
          }
          return (
            <span key={i}
              className={`mx-0.5 inline-block h-[1.2em] translate-y-[0.22em] rounded-lg align-baseline ${bi === current ? "bg-amber-400/40 ring-2 ring-amber-400 animate-pulse" : "bg-white/15"}`}
              style={{ width: `${Math.max(2, w.length * 0.62)}ch` }} />
          );
        })}
      </p>
      <div className="mt-5 grid gap-2.5">
        {options.map((w, oi) => (
          <button key={w} type="button" onClick={() => pick(w)}
            style={{ animationDelay: `${oi * 60}ms` }}
            className={`jb-chip font-game w-full text-center ${wrong === w ? chipWrongCls : chipCls}`}>
            {w}
          </button>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Manche 3 — Référence                                                */
/* ------------------------------------------------------------------ */
function ReferenceRound({ item, all, locked, onGood, onBad, onDone }: {
  item: MemorizeItem; all: MemorizeItem[]; locked: boolean; onGood: () => void; onBad: () => void; onDone: () => void;
}) {
  const [wrong, setWrong] = useState<string | null>(null);
  const [found, setFound] = useState(false);

  const options = useMemo(() => {
    const decoys = new Set<string>();
    for (const it of all) { if (it.id !== item.id) decoys.add(it.reference); if (decoys.size >= 3) break; }
    const m = item.reference.match(/^(.*?)(\d+):(\d+)(.*)$/);
    let guard = 0;
    while (decoys.size < 3 && m && guard < 10) {
      guard += 1;
      const fake = `${m[1]}${Number(m[2]) + guard}:${m[3]}${m[4]}`;
      if (fake !== item.reference) decoys.add(fake);
    }
    return shuffle([item.reference, ...Array.from(decoys).slice(0, 3)], item.text.length * 13 + 1);
  }, [item, all]);

  function pick(r: string) {
    if (locked || found) return;
    if (r === item.reference) { setFound(true); onGood(); onDone(); }
    else { setWrong(r); onBad(); setTimeout(() => setWrong(null), 450); }
  }

  return (
    <>
      <p className="rounded-3xl border-2 border-white/10 bg-[#1E1E1D]/72 p-4 font-game text-[17px] leading-relaxed text-white">
        « {item.text} »
      </p>
      <div className="mt-5 grid gap-2.5">
        {options.map((r, oi) => (
          <button key={r} type="button" onClick={() => pick(r)}
            style={{ animationDelay: `${oi * 60}ms` }}
            className={`jb-chip ${chunky} font-game px-4 py-3.5 text-left text-[16px] font-semibold ${
              found && r === item.reference
                ? "border-amber-400 bg-amber-400/15 text-amber-300 shadow-[0_4px_0_rgba(251,191,36,0.35)]"
                : wrong === r
                  ? "border-rose-400/80 bg-rose-400/15 text-rose-200 shadow-[0_4px_0_rgba(251,113,133,0.35)]"
                  : "border-white/12 bg-[#30302F] text-white shadow-[0_4px_0_rgba(255,255,255,0.10)] hover:border-amber-400/40"
            }`}>
            {r}
          </button>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Le jeu complet — plein écran                                        */
/* ------------------------------------------------------------------ */
export function VerseGame({ items, onClose }: { items: MemorizeItem[]; onClose: () => void }) {
  // Ordre aléatoire : « Jouer » lance un verset au hasard (mélange à chaque
  // partie). On mélange une seule fois à l'ouverture du jeu.
  const order = useMemo(() => {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);
  const [verseIdx, setVerseIdx] = useState(0);
  const [modeIdx, setModeIdx] = useState(0);
  const [phase, setPhase] = useState<"study" | "play" | "won">("study");
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [goodInRow, setGoodInRow] = useState(0);
  const [verseClean, setVerseClean] = useState(true);
  const [oops, setOops] = useState(false);
  const [best, setBest] = useState(0);
  const [xpGiven, setXpGiven] = useState(false);
  const [pop, setPop] = useState(false); // pulse du score
  const [floats, setFloats] = useState<{ id: number; text: string }[]>([]);
  const floatId = useRef(0);
  const [losing, setLosing] = useState(false); // cœur qui s'envole
  const [comboToast, setComboToast] = useState<number | null>(null); // « COMBO ×N »
  const [music, setMusic] = useState(false);

  // Musique de jeu : reprend la préférence à l'ouverture, se coupe à la sortie
  // (sans oublier le choix). L'activation manuelle passe par le bouton.
  useEffect(() => {
    if (isMusicOn()) {
      startGameMusic();
      setMusic(true);
    }
    return () => stopGameMusic(false);
  }, []);

  const item = order[verseIdx];
  const words = useMemo(() => (item ? item.text.split(/\s+/) : []), [item]);
  const modeDef = MODES[modeIdx];
  const mode: Mode = modeDef.kind;
  const over = lives <= 0 || verseIdx >= order.length;
  const totalSteps = order.length * (MODES.length + 1);
  const step = verseIdx * (MODES.length + 1) + (phase === "study" ? 0 : modeIdx + 1) + (phase === "won" ? 1 : 0);
  const lastOfVerse = modeIdx === MODES.length - 1;
  const showConfetti = phase === "won" && lastOfVerse;

  useEffect(() => {
    try { const b = Number(localStorage.getItem(GAME_BEST_KEY)); if (Number.isFinite(b)) setBest(b); } catch { /* */ }
  }, []);

  useEffect(() => {
    if (!over || xpGiven) return;
    setXpGiven(true);
    addMemorizeXp(score);
    recordPlaySession(score);
    submitWeeklyPoints(score); // classement hebdo (si connecté)
    bumpAchv("games_played");
    markDayStreak("play");
    checkLocalBadges();
    setBest((b) => {
      const nb = Math.max(b, score);
      try { localStorage.setItem(GAME_BEST_KEY, String(nb)); } catch { /* */ }
      return nb;
    });
  }, [over, score, xpGiven]);

  function spawnFloat(text: string) {
    const id = ++floatId.current;
    setFloats((f) => [...f, { id, text }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 700);
    setPop(true);
    setTimeout(() => setPop(false), 280);
  }

  function good(mult = 1) {
    const gain = 10 * combo * mult;
    setScore((s) => s + gain);
    spawnFloat(`+${gain}`);
    setGoodInRow((g) => {
      const ng = g + 1;
      if (ng % 5 === 0) {
        setCombo((c) => {
          const nc = Math.min(5, c + 1);
          setComboToast(nc);
          setTimeout(() => setComboToast(null), 950);
          return nc;
        });
      }
      return ng;
    });
  }

  function bad() {
    setLives((v) => v - 1);
    setLosing(true);
    setTimeout(() => setLosing(false), 500);
    setCombo(1);
    setGoodInRow(0);
    setVerseClean(false);
    setOops(true);
    setTimeout(() => setOops(false), 1100);
  }

  function roundDone() {
    setScore((s) => s + 30 + (lastOfVerse ? 100 : 0));
    if (lastOfVerse && verseClean && item) markReviewed(item.id);
    setPhase("won");
  }

  function continueGame() {
    if (lastOfVerse) {
      setVerseIdx((i) => i + 1);
      setModeIdx(0);
      setVerseClean(true);
      setPhase("study");
    } else {
      setModeIdx((m) => m + 1);
      setPhase("play");
    }
  }

  function restart() {
    setVerseIdx(0); setModeIdx(0); setPhase("study"); setLives(3); setScore(0);
    setCombo(1); setGoodInRow(0); setVerseClean(true); setXpGiven(false);
  }

  /* ---------- Écran de fin ---------- */
  if (over) {
    const win = lives > 0;
    return (
      <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center overflow-hidden mem-root px-6 pb-[var(--bottom-nav-h,0px)] text-center font-game text-white">
        <GameStyles />
        {win ? <Confetti /> : null}
        <div className="jb-pop">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-400">
            {win ? "Partie terminée" : "Plus de vies"}
          </p>
          <p className="mt-4 text-6xl font-bold text-amber-400">{score}</p>
          <p className="mt-1 text-sm font-semibold text-white/55">points gagnés</p>
        </div>
        <p className="mt-3 text-sm text-white/60">
          Meilleur score : <span className="font-bold text-amber-300">{Math.max(best, score)}</span>
        </p>
        <p className="mt-4 max-w-xs text-sm text-white/65">
          {win ? "La Parole s'ancre en jouant — reviens battre ton record." : "Chaque essai grave le verset un peu plus profond."}
        </p>
        <div className="mt-8 w-full max-w-xs space-y-3">
          <button type="button" onClick={restart}
            className={`${chunky} w-full border-amber-400 bg-amber-400 px-5 py-3.5 text-base font-bold uppercase tracking-wide text-night-950 shadow-[0_5px_0_rgba(180,83,9,1)]`}>
            Rejouer
          </button>
          <button type="button" onClick={onClose}
            className={`${chunky} w-full border-white/15 bg-[#1E1E1D] px-5 py-3.5 text-base font-bold uppercase tracking-wide text-white/80 shadow-[0_5px_0_rgba(255,255,255,0.08)]`}>
            Quitter
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Leçon plein écran ---------- */
  return (
    <div className="fixed inset-0 z-[80] flex flex-col overflow-hidden mem-root font-game text-white">
      <GameStyles />
      {showConfetti ? <Confetti /> : null}

      {/* Toast de combo au centre de l'écran */}
      {comboToast ? (
        <div className="pointer-events-none absolute inset-x-0 top-1/3 z-40 flex justify-center">
          <div className="jb-toast flex items-center gap-2 rounded-full border-2 border-amber-400 bg-[#0C0C0B]/92 px-6 py-3 shadow-[0_0_30px_rgba(251,191,36,0.5)]">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-amber-400" aria-hidden><path d="M12 2c1 3-1 5-2 7s0 5 2 5 3-2 3-4c2 1 3 3 3 5a6 6 0 1 1-11-3c1 2 2 2 2 0 0-3 1-5 3-6z" /></svg>
            <span className="font-game text-2xl font-bold text-amber-300">Combo ×{comboToast} !</span>
          </div>
        </div>
      ) : null}

      {/* Entête : quitter + progression animée + vies */}
      <div className="mx-auto w-full max-w-lg px-4 pt-[calc(env(safe-area-inset-top)+0.9rem)]">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onClose} aria-label="Quitter la partie"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.4}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
          {/* Accueil des jeux */}
          <Link href="/jeux" aria-label="Accueil des jeux"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9}>
              <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          {/* Musique du jeu */}
          <button type="button" onClick={() => setMusic(toggleGameMusic())}
            aria-label={music ? "Couper la musique" : "Activer la musique"}
            aria-pressed={music}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors ${music ? "bg-amber-400 text-night-950" : "text-white/50 hover:bg-white/10 hover:text-white"}`}>
            {music ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9}>
                <path d="M4 10v4a1 1 0 0 0 1 1h3l4 4V5L8 9H5a1 1 0 0 0-1 1zM16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9}>
                <path d="M4 10v4a1 1 0 0 0 1 1h3l4 4V5L8 9H5a1 1 0 0 0-1 1zM22 9l-6 6M16 9l6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-500"
              style={{ width: `${Math.max(4, (step / totalSteps) * 100)}%` }} />
            <div className="jb-shimmer absolute inset-0 rounded-full opacity-70" />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className={losing && i === lives ? "jb-heartloss" : ""}>
                <HeartIcon filled={i < lives || (losing && i === lives)} />
              </span>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-bold text-white/45">
          <span>Verset {verseIdx + 1}/{order.length}{phase !== "study" ? ` · Manche ${modeIdx + 1}/${MODES.length}` : ""}</span>
          <span className="relative flex items-center gap-2">
            <span className={`tabular-nums text-white/80 ${pop ? "jb-pop inline-block" : ""}`}>{score}</span> pts
            <span className={`inline-flex items-center gap-0.5 ${combo > 1 ? "text-amber-300" : "text-white/40"}`}>
              {combo > 1 ? (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-amber-400" aria-hidden><path d="M12 2c1 3-1 5-2 7s0 5 2 5 3-2 3-4c2 1 3 3 3 5a6 6 0 1 1-11-3c1 2 2 2 2 0 0-3 1-5 3-6z" /></svg>
              ) : null}
              ×{combo}
            </span>
            {/* « +points » qui s'envolent */}
            {floats.map((f) => (
              <span key={f.id} className="pointer-events-none absolute -top-1 right-0 font-bold text-amber-300"
                style={{ animation: "jb-float .7s ease-out forwards" }}>{f.text}</span>
            ))}
          </span>
        </div>
      </div>

      {/* Corps */}
      {phase === "study" ? (
        <StudyPhase item={item} onReady={() => setPhase("play")} />
      ) : (
        <div key={`${verseIdx}-${modeIdx}`} className="jb-slidein mx-auto w-full max-w-lg flex-1 overflow-y-auto px-5 pb-6 pt-5">
          <h2 className="font-game text-2xl font-bold leading-tight">{modeDef.title}</h2>
          {mode !== "reference" ? <p className="mt-1 text-sm font-bold text-amber-300">{item.reference}</p> : null}
          <div className="mt-5">
            {mode === "puzzle" ? <PuzzleRound key={`${item.id}-${modeIdx}`} words={words} locked={phase === "won"} onGood={() => good(modeDef.mult)} onBad={bad} onDone={roundDone} /> : null}
            {mode === "trous" ? <BlanksRound key={`${item.id}-${modeIdx}`} words={words} ratio={modeDef.ratio} locked={phase === "won"} onGood={() => good(modeDef.mult)} onBad={bad} onDone={roundDone} /> : null}
            {mode === "reference" ? <ReferenceRound key={`${item.id}-${modeIdx}`} item={item} all={items} locked={phase === "won"} onGood={() => good(modeDef.mult)} onBad={bad} onDone={roundDone} /> : null}
          </div>
        </div>
      )}

      {/* Bandeau bas */}
      {phase === "won" ? (
        <div className="border-t-2 border-amber-400/30 bg-amber-400/[0.12] px-5 pb-[calc(var(--bottom-nav-h,env(safe-area-inset-bottom))+1rem)] pt-4">
          <div className="mx-auto flex w-full max-w-lg items-start gap-4">
            <HappyFace />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-game text-2xl font-bold text-amber-300">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-400 text-night-950">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={3}><path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                {lastOfVerse ? "Verset bouclé ! +100" : "C'est bien !"}
              </p>
              <p className="mt-0.5 text-sm text-white/70">
                {lastOfVerse ? (verseClean ? "Sans faute — révision validée." : "Verset terminé, on continue.") : "+30 points, manche suivante."}
              </p>
              <button type="button" onClick={continueGame}
                className={`${chunky} jb-glow mt-3 w-full border-amber-400 bg-amber-400 px-5 py-3.5 text-center font-game text-base font-bold uppercase tracking-wide text-night-950 shadow-[0_5px_0_rgba(180,83,9,1)]`}>
                Continuer
              </button>
            </div>
          </div>
        </div>
      ) : oops ? (
        <div className="border-t-2 border-rose-400/40 bg-rose-400/[0.12] px-5 pb-[calc(var(--bottom-nav-h,env(safe-area-inset-bottom))+1.2rem)] pt-4">
          <div className="mx-auto flex w-full max-w-lg items-center gap-4">
            <SadFace />
            <div>
              <p className="font-game text-2xl font-bold text-rose-300">Oups !</p>
              <p className="mt-0.5 text-sm text-white/70">Une vie en moins — le combo repart à ×1.</p>
            </div>
          </div>
        </div>
      ) : phase === "play" ? (
        <div className="border-t-2 border-white/8 px-5 pb-[calc(var(--bottom-nav-h,env(safe-area-inset-bottom))+1rem)] pt-4">
          <div className="mx-auto w-full max-w-lg">
            <button type="button" disabled
              className="w-full rounded-2xl border-2 border-white/10 bg-white/[0.05] px-5 py-3.5 text-center font-game text-base font-bold uppercase tracking-wide text-white/30">
              Continuer
            </button>
          </div>
        </div>
      ) : (
        <div className="pb-[var(--bottom-nav-h,env(safe-area-inset-bottom))]" />
      )}
    </div>
  );
}
