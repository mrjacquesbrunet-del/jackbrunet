"use client";

import { useEffect, useMemo, useState } from "react";
import { markReviewed, type MemorizeItem } from "@/lib/memorize";

/**
 * « Le jeu du verset » — apprendre en s'amusant, façon jeu mobile.
 * Pour CHAQUE verset, 4 manches de difficulté croissante :
 *   1. Puzzle — remets les mots dans l'ordre ;
 *   2. À trous — choisis le bon mot pour chaque trou ;
 *   3. Référence — retrouve d'où vient le verset ;
 *   4. Par cœur — retape le verset entier.
 * Score, combo (jusqu'à ×5), 3 vies partagées, bonus par manche et par
 * verset ; un verset bouclé sans perdre de vie compte comme une révision.
 * Meilleur score gardé sur l'appareil.
 */

const BEST_KEY = "jb.memorize.game.best.v1";
const MODES = ["puzzle", "trous", "reference", "type"] as const;
type Mode = (typeof MODES)[number];

const MODE_LABELS: Record<Mode, string> = {
  puzzle: "Puzzle — remets les mots dans l'ordre",
  trous: "À trous — choisis le bon mot",
  reference: "D'où vient ce verset ?",
  type: "Par cœur — retape le verset",
};

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
      className={`h-5 w-5 ${filled ? "fill-dawn-400 stroke-dawn-400" : "fill-none stroke-cream/25"}`}
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path d="M12 20.5S4 15 4 9.6A4.4 4.4 0 0 1 8.4 5c1.6 0 3 .9 3.6 2.2A4.1 4.1 0 0 1 15.6 5 4.4 4.4 0 0 1 20 9.6c0 5.4-8 10.9-8 10.9z" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Manche 1 — Puzzle : remets les mots dans l'ordre                    */
/* ------------------------------------------------------------------ */
function PuzzleRound({
  words,
  onGood,
  onBad,
  onDone,
}: {
  words: string[];
  onGood: () => void;
  onBad: () => void;
  onDone: () => void;
}) {
  const pool = useMemo(() => shuffle(words.map((_, i) => i), words.length * 7 + 5), [words]);
  const [placed, setPlaced] = useState(0);
  const [used, setUsed] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<number | null>(null);

  function tap(poolIdx: number) {
    if (used.has(poolIdx)) return;
    if (words[pool[poolIdx]] === words[placed]) {
      const nu = new Set(used);
      nu.add(poolIdx);
      setUsed(nu);
      onGood();
      const np = placed + 1;
      setPlaced(np);
      if (np >= words.length) setTimeout(onDone, 700);
    } else {
      setWrong(poolIdx);
      onBad();
      setTimeout(() => setWrong(null), 450);
    }
  }

  return (
    <>
      <p className="min-h-[4.5rem] rounded-2xl border border-white/10 bg-night-950/60 p-3.5 text-[15px] leading-relaxed text-cream/90">
        {words.slice(0, placed).join(" ")}
        <span className="text-dawn-300"> ▍</span>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {pool.map((wordIdx, poolIdx) =>
          used.has(poolIdx) ? null : (
            <button
              key={poolIdx}
              type="button"
              onClick={() => tap(poolIdx)}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-all ${
                wrong === poolIdx
                  ? "translate-x-0.5 border-rose-400/70 bg-rose-400/15 text-rose-200"
                  : "border-white/15 bg-white/[0.06] text-cream/85 hover:border-dawn-400/50"
              }`}
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
/* Manche 2 — À trous : choisis le bon mot pour chaque trou            */
/* ------------------------------------------------------------------ */
function BlanksRound({
  words,
  onGood,
  onBad,
  onDone,
}: {
  words: string[];
  onGood: () => void;
  onBad: () => void;
  onDone: () => void;
}) {
  // ~1 mot sur 3 devient un trou (au moins 1), répartis régulièrement.
  const blanks = useMemo(() => {
    const n = Math.max(1, Math.round(words.length / 3));
    const out: number[] = [];
    const step = words.length / n;
    for (let k = 0; k < n; k++) out.push(Math.min(words.length - 1, Math.floor(k * step + step / 2)));
    return Array.from(new Set(out));
  }, [words]);
  const [current, setCurrent] = useState(0); // index dans blanks
  const [wrong, setWrong] = useState<string | null>(null);

  const target = blanks[current];
  // 3 propositions : le bon mot + 2 leurres pris ailleurs dans le verset.
  const options = useMemo(() => {
    if (target === undefined) return [];
    const good = words[target];
    const others = Array.from(new Set(words.filter((w) => w !== good)));
    const decoys = shuffle(others, target * 31 + 7).slice(0, 2);
    return shuffle([good, ...decoys], target * 17 + 3);
  }, [words, target]);

  function pick(w: string) {
    if (target === undefined) return;
    if (w === words[target]) {
      onGood();
      setWrong(null);
      const next = current + 1;
      setCurrent(next);
      if (next >= blanks.length) setTimeout(onDone, 700);
    } else {
      setWrong(w);
      onBad();
      setTimeout(() => setWrong(null), 450);
    }
  }

  return (
    <>
      <p className="rounded-2xl border border-white/10 bg-night-950/60 p-3.5 text-[15px] leading-relaxed text-cream/90">
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
              className={`mx-0.5 inline-block h-[1.15em] translate-y-[0.2em] rounded-md align-baseline ${
                bi === current ? "bg-dawn-400/40 ring-1 ring-dawn-400" : "bg-cream/15"
              }`}
              style={{ width: `${Math.max(2, w.length * 0.62)}ch` }}
            />
          );
        })}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => pick(w)}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition-all ${
              wrong === w
                ? "translate-x-0.5 border-rose-400/70 bg-rose-400/15 text-rose-200"
                : "border-white/15 bg-white/[0.06] text-cream/90 hover:border-dawn-400/50"
            }`}
          >
            {w}
          </button>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Manche 3 — Référence : d'où vient ce verset ?                       */
/* ------------------------------------------------------------------ */
function ReferenceRound({
  item,
  all,
  onGood,
  onBad,
  onDone,
}: {
  item: MemorizeItem;
  all: MemorizeItem[];
  onGood: () => void;
  onBad: () => void;
  onDone: () => void;
}) {
  const [wrong, setWrong] = useState<string | null>(null);
  const [found, setFound] = useState(false);

  const options = useMemo(() => {
    const decoys = new Set<string>();
    // D'abord les références des autres versets appris…
    for (const it of all) {
      if (it.id !== item.id) decoys.add(it.reference);
      if (decoys.size >= 3) break;
    }
    // …complétées par des variantes proches (chapitre / verset décalés).
    const m = item.reference.match(/^(.*?)(\d+):(\d+)(.*)$/);
    let guard = 0;
    while (decoys.size < 3 && m && guard < 10) {
      guard += 1;
      const chap = Number(m[2]) + guard;
      const fake = `${m[1]}${chap}:${m[3]}${m[4]}`;
      if (fake !== item.reference) decoys.add(fake);
    }
    return shuffle([item.reference, ...Array.from(decoys).slice(0, 3)], item.text.length * 13 + 1);
  }, [item, all]);

  function pick(r: string) {
    if (found) return;
    if (r === item.reference) {
      setFound(true);
      onGood();
      setTimeout(onDone, 700);
    } else {
      setWrong(r);
      onBad();
      setTimeout(() => setWrong(null), 450);
    }
  }

  return (
    <>
      <p className="rounded-2xl border border-white/10 bg-night-950/60 p-3.5 text-[15px] leading-relaxed text-cream/90">
        « {item.text} »
      </p>
      <div className="mt-4 grid gap-2">
        {options.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => pick(r)}
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-all ${
              found && r === item.reference
                ? "border-dawn-400 bg-dawn-400/15 text-dawn-300"
                : wrong === r
                  ? "border-rose-400/70 bg-rose-400/15 text-rose-200"
                  : "border-white/15 bg-white/[0.06] text-cream/90 hover:border-dawn-400/50"
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
/* Manche 4 — Par cœur : retape le verset                              */
/* ------------------------------------------------------------------ */
function TypeRound({
  item,
  onGood,
  onBad,
  onDone,
}: {
  item: MemorizeItem;
  onGood: (n: number) => void;
  onBad: () => void;
  onDone: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<null | { ok: boolean; pct: number }>(null);

  function check() {
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
      setTimeout(onDone, 1300);
    } else {
      onBad();
    }
  }

  return (
    <>
      <p className="text-sm text-cream/65">
        Écris le verset de mémoire ({item.reference}) — les accents et la ponctuation ne comptent pas.
      </p>
      <textarea
        value={typed}
        onChange={(e) => {
          setTyped(e.target.value);
          setResult(null);
        }}
        rows={4}
        placeholder="Tape le verset ici…"
        className="mt-3 w-full rounded-2xl border border-white/15 bg-night-950/70 p-3.5 text-[15px] leading-relaxed text-cream placeholder:text-cream/30 focus:border-dawn-400/60 focus:outline-none"
      />
      {result ? (
        <p className={`mt-2 text-sm font-bold ${result.ok ? "text-dawn-300" : "text-rose-300"}`}>
          {result.ok
            ? `Bravo — ${result.pct}% du verset retrouvé.`
            : `${result.pct}% — relis-le et réessaie (il en faut 85 %).`}
        </p>
      ) : null}
      {result && !result.ok ? (
        <p className="mt-1 text-xs text-cream/50">« {item.text} »</p>
      ) : null}
      <button
        type="button"
        onClick={check}
        disabled={!typed.trim() || Boolean(result?.ok)}
        className="mt-3 rounded-full bg-dawn-400 px-5 py-2.5 text-sm font-bold text-night-950 disabled:opacity-50"
      >
        Vérifier
      </button>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Le jeu complet                                                      */
/* ------------------------------------------------------------------ */
export function VerseGame({ items, onClose }: { items: MemorizeItem[]; onClose: () => void }) {
  const order = useMemo(() => shuffle(items, (Date.now() % 233280) + 1), [items]);
  const [verseIdx, setVerseIdx] = useState(0);
  const [modeIdx, setModeIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [goodInRow, setGoodInRow] = useState(0);
  const [verseClean, setVerseClean] = useState(true);
  const [flash, setFlash] = useState<"bonus" | null>(null);
  const [best, setBest] = useState(0);

  const item = order[verseIdx];
  const words = useMemo(() => (item ? item.text.split(/\s+/) : []), [item]);
  const mode: Mode = MODES[modeIdx];
  const over = lives <= 0 || verseIdx >= order.length;

  useEffect(() => {
    try {
      const b = Number(localStorage.getItem(BEST_KEY));
      if (Number.isFinite(b)) setBest(b);
    } catch {
      /* stockage indisponible */
    }
  }, []);

  useEffect(() => {
    if (!over) return;
    setBest((b) => {
      const nb = Math.max(b, score);
      try {
        localStorage.setItem(BEST_KEY, String(nb));
      } catch {
        /* ignore */
      }
      return nb;
    });
  }, [over, score]);

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
  }

  function roundDone() {
    setScore((s) => s + 30);
    if (modeIdx + 1 < MODES.length) {
      setModeIdx(modeIdx + 1);
    } else {
      // Verset bouclé : gros bonus, révision validée s'il est resté propre.
      setScore((s) => s + 100);
      setFlash("bonus");
      if (verseClean && item) markReviewed(item.id);
      setTimeout(() => {
        setFlash(null);
        setVerseIdx((i) => i + 1);
        setModeIdx(0);
        setVerseClean(true);
      }, 1100);
    }
  }

  /* ---------- Écran de fin ---------- */
  if (over) {
    const win = lives > 0;
    return (
      <div className="mt-6 rounded-3xl border border-dawn-400/35 bg-dawn-400/[0.07] p-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-wide text-dawn-300">
          {win ? "Partie terminée" : "Plus de vies"}
        </p>
        <p className="mt-2 font-display text-3xl font-extrabold text-cream">{score} points</p>
        <p className="mt-1 text-sm text-cream/60">
          Meilleur score : <span className="font-bold text-dawn-300">{Math.max(best, score)}</span>
        </p>
        <p className="mt-2 text-sm text-cream/65">
          {win
            ? "La Parole s'ancre en jouant — reviens battre ton record."
            : "Pas grave — chaque essai grave le verset un peu plus profond."}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
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
            }}
            className="rounded-full bg-dawn-400 px-5 py-2.5 text-sm font-bold text-night-950"
          >
            Rejouer
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-cream/20 px-5 py-2.5 text-sm font-semibold text-cream/75"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Manche en cours ---------- */
  return (
    <div className="relative mt-6 overflow-hidden rounded-3xl border border-dawn-400/35 bg-night-900/70 p-5">
      {/* Bandeau bonus quand un verset est bouclé */}
      {flash === "bonus" ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-night-950/85">
          <div className="text-center">
            <p className="font-display text-2xl font-extrabold text-dawn-300">+100 points</p>
            <p className="mt-1 text-sm font-semibold text-cream/80">Verset bouclé !</p>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-dawn-300">
          Verset {verseIdx + 1} / {order.length}
        </p>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <HeartIcon key={i} filled={i < lives} />
          ))}
        </div>
      </div>

      {/* Progression des 4 manches du verset */}
      <div className="mt-2 flex gap-1.5">
        {MODES.map((m, i) => (
          <span
            key={m}
            className={`h-1.5 flex-1 rounded-full ${i < modeIdx ? "bg-dawn-400" : i === modeIdx ? "bg-dawn-400/50" : "bg-cream/12"}`}
          />
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs font-semibold text-cream/50">
        <span>
          Score <span className="tabular-nums text-cream/85">{score}</span>
        </span>
        <span className={combo > 1 ? "text-dawn-300" : undefined}>Combo ×{combo}</span>
      </div>

      <p className="mt-4 text-sm font-bold text-cream/85">
        Manche {modeIdx + 1}/4 · {MODE_LABELS[mode]}
      </p>
      {mode !== "reference" ? (
        <p className="mb-3 mt-0.5 text-sm font-bold text-dawn-300">{item.reference}</p>
      ) : (
        <div className="mb-3" />
      )}

      {mode === "puzzle" ? (
        <PuzzleRound key={item.id} words={words} onGood={() => good()} onBad={bad} onDone={roundDone} />
      ) : null}
      {mode === "trous" ? (
        <BlanksRound key={item.id} words={words} onGood={() => good(2)} onBad={bad} onDone={roundDone} />
      ) : null}
      {mode === "reference" ? (
        <ReferenceRound key={item.id} item={item} all={items} onGood={() => good(3)} onBad={bad} onDone={roundDone} />
      ) : null}
      {mode === "type" ? (
        <TypeRound key={item.id} item={item} onGood={(n) => good(n)} onBad={bad} onDone={roundDone} />
      ) : null}

      <button
        type="button"
        onClick={onClose}
        className="mt-5 rounded-full border border-cream/15 px-4 py-2 text-sm font-semibold text-cream/55"
      >
        Quitter la partie
      </button>
    </div>
  );
}
