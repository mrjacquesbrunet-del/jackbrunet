"use client";

import { useEffect, useMemo, useState } from "react";
import { addMemorizeXp, markReviewed, GAME_BEST_KEY, type MemorizeItem } from "@/lib/memorize";

/**
 * « Le jeu du verset » — leçon plein écran façon jeu mobile (style Duolingo,
 * dans la charte RHEMA) : barre de progression épaisse, gros boutons qui
 * s'enfoncent, bandeau vert « Excellent ! » + CONTINUER, bandeau rouge en cas
 * d'erreur. 4 manches par verset (puzzle, à trous, référence, par cœur),
 * combo ×5, 3 vies, bonus, meilleur score sur l'appareil.
 */

const MODES = ["puzzle", "trous", "reference", "type"] as const;
type Mode = (typeof MODES)[number];

const MODE_TITLES: Record<Mode, string> = {
  puzzle: "Remets les mots dans l'ordre",
  trous: "Choisis le bon mot pour chaque trou",
  reference: "D'où vient ce verset ?",
  type: "Retape le verset de mémoire",
};

/** Bouton « 3D » qui s'enfonce quand on appuie (style jeu mobile). */
const chunky =
  "select-none rounded-2xl border-2 transition-all duration-100 active:translate-y-[3px] active:shadow-none";
const chipCls = `${chunky} border-white/12 bg-night-800 px-4 py-2.5 text-[15px] font-bold text-cream shadow-[0_4px_0_rgba(255,255,255,0.10)] hover:border-dawn-400/40`;
const chipWrongCls = `${chunky} border-rose-400/80 bg-rose-400/15 px-4 py-2.5 text-[15px] font-bold text-rose-200 shadow-[0_4px_0_rgba(251,113,133,0.35)]`;

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

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-6 w-6 ${filled ? "fill-dawn-400 stroke-dawn-400" : "fill-none stroke-cream/25"}`}
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path d="M12 20.5S4 15 4 9.6A4.4 4.4 0 0 1 8.4 5c1.6 0 3 .9 3.6 2.2A4.1 4.1 0 0 1 15.6 5 4.4 4.4 0 0 1 20 9.6c0 5.4-8 10.9-8 10.9z" strokeLinejoin="round" />
    </svg>
  );
}

/** Mascotte contente (bonne réponse) : visage lime qui rebondit. */
function HappyFace() {
  return (
    <svg viewBox="0 0 48 48" className="h-14 w-14 shrink-0 animate-bounce" aria-hidden="true">
      <circle cx="24" cy="26" r="17" className="fill-dawn-400/15 stroke-dawn-400" strokeWidth="2.5" />
      {/* rayons de joie */}
      <path
        d="M24 2v4M9 7l2.8 2.8M39 7l-2.8 2.8"
        className="stroke-dawn-300 fill-none"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* yeux fermés de bonheur */}
      <path
        d="M15.5 23c1.6-2.2 4.4-2.2 6 0M26.5 23c1.6-2.2 4.4-2.2 6 0"
        className="stroke-dawn-300 fill-none"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* grand sourire */}
      <path
        d="M15.5 30c2.4 4.4 6 6.4 8.5 6.4s6.1-2 8.5-6.4"
        className="stroke-dawn-300 fill-none"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Mascotte déçue (mauvaise réponse) : visage rosé qui tremble. */
function SadFace() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-14 w-14 shrink-0"
      style={{ animation: "jb-shake 0.5s ease-in-out 2" }}
      aria-hidden="true"
    >
      <style>{"@keyframes jb-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}"}</style>
      <circle cx="24" cy="26" r="17" className="fill-rose-400/15 stroke-rose-400" strokeWidth="2.5" />
      {/* sourcils tombants */}
      <path
        d="M15 20l6 2M33 20l-6 2"
        className="stroke-rose-300 fill-none"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* yeux */}
      <circle cx="18.5" cy="26" r="1.6" className="fill-rose-300" />
      <circle cx="29.5" cy="26" r="1.6" className="fill-rose-300" />
      {/* bouche déçue */}
      <path
        d="M17 35c2.2-3.4 5-4.8 7-4.8s4.8 1.4 7 4.8"
        className="stroke-rose-300 fill-none"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Manche 1 — Puzzle                                                   */
/* ------------------------------------------------------------------ */
function PuzzleRound({
  words,
  locked,
  onGood,
  onBad,
  onDone,
}: {
  words: string[];
  locked: boolean;
  onGood: () => void;
  onBad: () => void;
  onDone: () => void;
}) {
  const pool = useMemo(() => shuffle(words.map((_, i) => i), words.length * 7 + 5), [words]);
  const [placed, setPlaced] = useState(0);
  const [used, setUsed] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<number | null>(null);

  function tap(poolIdx: number) {
    if (locked || used.has(poolIdx)) return;
    if (words[pool[poolIdx]] === words[placed]) {
      const nu = new Set(used);
      nu.add(poolIdx);
      setUsed(nu);
      onGood();
      const np = placed + 1;
      setPlaced(np);
      if (np >= words.length) onDone();
    } else {
      setWrong(poolIdx);
      onBad();
      setTimeout(() => setWrong(null), 450);
    }
  }

  return (
    <>
      <p className="min-h-[5.5rem] rounded-3xl border-2 border-white/10 bg-night-900/70 p-4 text-[16px] leading-relaxed text-cream">
        {words.slice(0, placed).join(" ")}
        {placed < words.length ? <span className="text-dawn-300"> ▍</span> : null}
      </p>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {pool.map((wordIdx, poolIdx) =>
          used.has(poolIdx) ? null : (
            <button
              key={poolIdx}
              type="button"
              onClick={() => tap(poolIdx)}
              className={wrong === poolIdx ? chipWrongCls : chipCls}
            >
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
function BlanksRound({
  words,
  locked,
  onGood,
  onBad,
  onDone,
}: {
  words: string[];
  locked: boolean;
  onGood: () => void;
  onBad: () => void;
  onDone: () => void;
}) {
  const blanks = useMemo(() => {
    const n = Math.max(1, Math.round(words.length / 3));
    const out: number[] = [];
    const step = words.length / n;
    for (let k = 0; k < n; k++) out.push(Math.min(words.length - 1, Math.floor(k * step + step / 2)));
    return Array.from(new Set(out));
  }, [words]);
  const [current, setCurrent] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);

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
      onGood();
      setWrong(null);
      const next = current + 1;
      setCurrent(next);
      if (next >= blanks.length) onDone();
    } else {
      setWrong(w);
      onBad();
      setTimeout(() => setWrong(null), 450);
    }
  }

  return (
    <>
      <p className="rounded-3xl border-2 border-white/10 bg-night-900/70 p-4 text-[16px] leading-relaxed text-cream">
        {words.map((w, i) => {
          const bi = blanks.indexOf(i);
          if (bi === -1 || bi < current) {
            return (
              <span key={i} className={bi !== -1 ? "font-bold text-dawn-300" : undefined}>
                {w}{" "}
              </span>
            );
          }
          return (
            <span
              key={i}
              className={`mx-0.5 inline-block h-[1.2em] translate-y-[0.22em] rounded-lg align-baseline ${
                bi === current ? "bg-dawn-400/40 ring-2 ring-dawn-400" : "bg-cream/15"
              }`}
              style={{ width: `${Math.max(2, w.length * 0.62)}ch` }}
            />
          );
        })}
      </p>
      <div className="mt-5 grid gap-2.5">
        {options.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => pick(w)}
            className={`${wrong === w ? chipWrongCls : chipCls} w-full text-center`}
          >
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
function ReferenceRound({
  item,
  all,
  locked,
  onGood,
  onBad,
  onDone,
}: {
  item: MemorizeItem;
  all: MemorizeItem[];
  locked: boolean;
  onGood: () => void;
  onBad: () => void;
  onDone: () => void;
}) {
  const [wrong, setWrong] = useState<string | null>(null);
  const [found, setFound] = useState(false);

  const options = useMemo(() => {
    const decoys = new Set<string>();
    for (const it of all) {
      if (it.id !== item.id) decoys.add(it.reference);
      if (decoys.size >= 3) break;
    }
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
    if (r === item.reference) {
      setFound(true);
      onGood();
      onDone();
    } else {
      setWrong(r);
      onBad();
      setTimeout(() => setWrong(null), 450);
    }
  }

  return (
    <>
      <p className="rounded-3xl border-2 border-white/10 bg-night-900/70 p-4 text-[16px] leading-relaxed text-cream">
        « {item.text} »
      </p>
      <div className="mt-5 grid gap-2.5">
        {options.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => pick(r)}
            className={`${chunky} px-4 py-3.5 text-left text-[15px] font-bold ${
              found && r === item.reference
                ? "border-dawn-400 bg-dawn-400/15 text-dawn-300 shadow-[0_4px_0_rgba(202,240,0,0.35)]"
                : wrong === r
                  ? "border-rose-400/80 bg-rose-400/15 text-rose-200 shadow-[0_4px_0_rgba(251,113,133,0.35)]"
                  : "border-white/12 bg-night-800 text-cream shadow-[0_4px_0_rgba(255,255,255,0.10)] hover:border-dawn-400/40"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Manche 4 — Par cœur (retaper)                                       */
/* ------------------------------------------------------------------ */
function TypeRound({
  item,
  locked,
  onGood,
  onBad,
  onDone,
}: {
  item: MemorizeItem;
  locked: boolean;
  onGood: (n: number) => void;
  onBad: () => void;
  onDone: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<null | { ok: boolean; pct: number }>(null);

  function check() {
    if (locked) return;
    const want = normalize(item.text).split(" ");
    const got = normalize(typed).split(" ").filter(Boolean);
    let match = 0;
    const used = new Array(got.length).fill(false);
    for (const w of want) {
      const idx = got.findIndex((g, i) => !used[i] && g === w);
      if (idx !== -1) {
        used[idx] = true;
        match += 1;
      }
    }
    const pct = Math.round((match / want.length) * 100);
    const ok = pct >= 85;
    setResult({ ok, pct });
    if (ok) {
      onGood(Math.max(1, Math.round(want.length / 2)));
      onDone();
    } else {
      onBad();
    }
  }

  return (
    <>
      <textarea
        value={typed}
        onChange={(e) => {
          setTyped(e.target.value);
          setResult(null);
        }}
        rows={4}
        placeholder="Tape le verset ici…"
        className="w-full rounded-3xl border-2 border-white/12 bg-night-900/70 p-4 text-[16px] leading-relaxed text-cream placeholder:text-cream/30 focus:border-dawn-400/60 focus:outline-none"
      />
      <p className="mt-2 text-xs text-cream/45">
        Les accents et la ponctuation ne comptent pas — il faut 85 % des mots.
      </p>
      {result && !result.ok ? (
        <div className="mt-3 rounded-2xl border-2 border-rose-400/40 bg-rose-400/10 p-3.5">
          <p className="text-sm font-bold text-rose-200">
            {result.pct}% retrouvés — relis-le et réessaie.
          </p>
          <p className="mt-1 text-sm text-cream/70">« {item.text} »</p>
        </div>
      ) : null}
      {!result?.ok ? (
        <button
          type="button"
          onClick={check}
          disabled={!typed.trim()}
          className={`${chunky} mt-4 w-full border-dawn-400 bg-dawn-400 px-5 py-3.5 text-center text-base font-extrabold uppercase tracking-wide text-night-950 shadow-[0_5px_0_rgba(140,168,0,1)] disabled:opacity-40`}
        >
          Vérifier
        </button>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Le jeu complet — plein écran                                        */
/* ------------------------------------------------------------------ */
export function VerseGame({ items, onClose }: { items: MemorizeItem[]; onClose: () => void }) {
  // Difficulté progressive : on commence par les versets courts,
  // puis de plus en plus longs.
  const order = useMemo(
    () => [...items].sort((a, b) => a.text.split(/\s+/).length - b.text.split(/\s+/).length),
    [items],
  );
  const [verseIdx, setVerseIdx] = useState(0);
  const [modeIdx, setModeIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [goodInRow, setGoodInRow] = useState(0);
  const [verseClean, setVerseClean] = useState(true);
  const [phase, setPhase] = useState<"play" | "won">("play"); // won = bandeau vert + CONTINUER
  const [oops, setOops] = useState(false); // bandeau rouge bref
  const [best, setBest] = useState(0);

  const item = order[verseIdx];
  const words = useMemo(() => (item ? item.text.split(/\s+/) : []), [item]);
  const mode: Mode = MODES[modeIdx];
  const over = lives <= 0 || verseIdx >= order.length;
  const totalSteps = order.length * MODES.length;
  const step = verseIdx * MODES.length + modeIdx + (phase === "won" ? 1 : 0);
  const lastOfVerse = modeIdx === MODES.length - 1;

  useEffect(() => {
    try {
      const b = Number(localStorage.getItem(GAME_BEST_KEY));
      if (Number.isFinite(b)) setBest(b);
    } catch {
      /* stockage indisponible */
    }
  }, []);

  const [xpGiven, setXpGiven] = useState(false);
  useEffect(() => {
    if (!over || xpGiven) return;
    setXpGiven(true);
    addMemorizeXp(score);
    setBest((b) => {
      const nb = Math.max(b, score);
      try {
        localStorage.setItem(GAME_BEST_KEY, String(nb));
      } catch {
        /* ignore */
      }
      return nb;
    });
  }, [over, score, xpGiven]);

  function good(mult = 1) {
    setScore((s) => s + 10 * combo * mult);
    setGoodInRow((g) => {
      const ng = g + 1;
      if (ng % 5 === 0) setCombo((c) => Math.min(5, c + 1));
      return ng;
    });
  }

  function bad() {
    setLives((v) => v - 1);
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
    } else {
      setModeIdx((m) => m + 1);
    }
    setPhase("play");
  }

  /* ---------- Écran de fin ---------- */
  if (over) {
    const win = lives > 0;
    return (
      <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-night-950 px-6 text-center text-cream">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-dawn-400">
          {win ? "Partie terminée" : "Plus de vies"}
        </p>
        <p className="mt-4 font-display text-5xl font-extrabold">{score}</p>
        <p className="mt-1 text-sm font-semibold text-cream/55">points</p>
        <p className="mt-3 text-sm text-cream/65">
          Meilleur score : <span className="font-bold text-dawn-300">{Math.max(best, score)}</span>
        </p>
        <p className="mt-4 max-w-xs text-sm text-cream/65">
          {win
            ? "La Parole s'ancre en jouant — reviens battre ton record."
            : "Pas grave — chaque essai grave le verset un peu plus profond."}
        </p>
        <div className="mt-8 w-full max-w-xs space-y-3">
          <button
            type="button"
            onClick={() => {
              setVerseIdx(0);
              setModeIdx(0);
              setLives(3);
              setScore(0);
              setCombo(1);
              setGoodInRow(0);
              setVerseClean(true);
              setPhase("play");
              setXpGiven(false);
            }}
            className={`${chunky} w-full border-dawn-400 bg-dawn-400 px-5 py-3.5 text-base font-extrabold uppercase tracking-wide text-night-950 shadow-[0_5px_0_rgba(140,168,0,1)]`}
          >
            Rejouer
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`${chunky} w-full border-white/15 bg-night-900 px-5 py-3.5 text-base font-extrabold uppercase tracking-wide text-cream/80 shadow-[0_5px_0_rgba(255,255,255,0.08)]`}
          >
            Quitter
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Leçon plein écran ---------- */
  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-night-950 text-cream">
      {/* Entête : quitter + progression + vies */}
      <div className="mx-auto w-full max-w-lg px-4 pt-[calc(env(safe-area-inset-top)+0.9rem)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Quitter la partie"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-cream/50 hover:bg-white/10 hover:text-cream"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.4}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-dawn-400 to-dawn-300 transition-all duration-500"
              style={{ width: `${Math.max(4, (step / totalSteps) * 100)}%` }}
            />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {[0, 1, 2].map((i) => (
              <HeartIcon key={i} filled={i < lives} />
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-bold text-cream/45">
          <span>
            Verset {verseIdx + 1}/{order.length} · Manche {modeIdx + 1}/4
          </span>
          <span>
            <span className="tabular-nums text-cream/80">{score}</span> pts
            <span className={`ml-2 ${combo > 1 ? "text-dawn-300" : ""}`}>×{combo}</span>
          </span>
        </div>
      </div>

      {/* Contenu de la manche */}
      <div className="mx-auto w-full max-w-lg flex-1 overflow-y-auto px-5 pb-6 pt-5">
        <h2 className="font-display text-2xl font-extrabold leading-tight">
          {MODE_TITLES[mode]}
        </h2>
        {mode !== "reference" ? (
          <p className="mt-1 text-sm font-bold text-dawn-300">{item.reference}</p>
        ) : null}
        <div className="mt-5">
          {mode === "puzzle" ? (
            <PuzzleRound key={item.id} words={words} locked={phase === "won"} onGood={() => good()} onBad={bad} onDone={roundDone} />
          ) : null}
          {mode === "trous" ? (
            <BlanksRound key={item.id} words={words} locked={phase === "won"} onGood={() => good(2)} onBad={bad} onDone={roundDone} />
          ) : null}
          {mode === "reference" ? (
            <ReferenceRound key={item.id} item={item} all={items} locked={phase === "won"} onGood={() => good(3)} onBad={bad} onDone={roundDone} />
          ) : null}
          {mode === "type" ? (
            <TypeRound key={item.id} item={item} locked={phase === "won"} onGood={(n) => good(n)} onBad={bad} onDone={roundDone} />
          ) : null}
        </div>
      </div>

      {/* Bandeau bas : vert (gagné) / rouge (erreur) */}
      {phase === "won" ? (
        <div className="border-t-2 border-dawn-400/30 bg-dawn-400/[0.12] px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
          <div className="mx-auto flex w-full max-w-lg items-start gap-4">
            <HappyFace />
            <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-display text-xl font-extrabold text-dawn-300">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-dawn-400 text-night-950">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={3}>
                  <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {lastOfVerse ? "Verset bouclé ! +100" : "C'est bien !"}
            </p>
            <p className="mt-0.5 text-sm text-cream/70">
              {lastOfVerse
                ? verseClean
                  ? "Sans faute — révision validée."
                  : "Verset terminé, on passe au suivant."
                : "+30 points, manche suivante."}
            </p>
            <button
              type="button"
              onClick={continueGame}
              className={`${chunky} mt-3 w-full border-dawn-400 bg-dawn-400 px-5 py-3.5 text-center text-base font-extrabold uppercase tracking-wide text-night-950 shadow-[0_5px_0_rgba(140,168,0,1)]`}
            >
              Continuer
            </button>
            </div>
          </div>
        </div>
      ) : oops ? (
        <div className="border-t-2 border-rose-400/40 bg-rose-400/[0.12] px-5 pb-[calc(env(safe-area-inset-bottom)+1.2rem)] pt-4">
          <div className="mx-auto flex w-full max-w-lg items-center gap-4">
            <SadFace />
            <div>
              <p className="font-display text-xl font-extrabold text-rose-300">Oups !</p>
              <p className="mt-0.5 text-sm text-cream/70">
                Une vie en moins — le combo repart à ×1.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t-2 border-white/8 px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
          <div className="mx-auto w-full max-w-lg">
            <button
              type="button"
              disabled
              className="w-full rounded-2xl border-2 border-white/10 bg-white/[0.05] px-5 py-3.5 text-center text-base font-extrabold uppercase tracking-wide text-cream/30"
            >
              Continuer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
