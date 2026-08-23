"use client";

import { useEffect, useMemo, useState } from "react";
import { markReviewed, type MemorizeItem } from "@/lib/memorize";

/**
 * Jeu « Remets le verset dans l'ordre » : les mots apparaissent mélangés,
 * on les tape dans le bon ordre. Points par mot, combo si l'on enchaîne
 * sans faute, 3 vies. Le meilleur score est gardé sur l'appareil.
 * Jouer, c'est réviser : un verset reconstruit sans perdre de vie compte
 * comme une révision réussie.
 */

const BEST_KEY = "jb.memorize.game.best.v1";

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
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
      className={`h-5 w-5 ${filled ? "fill-dawn-400 stroke-dawn-400" : "fill-none stroke-cream/25"}`}
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path d="M12 20.5S4 15 4 9.6A4.4 4.4 0 0 1 8.4 5c1.6 0 3 .9 3.6 2.2A4.1 4.1 0 0 1 15.6 5 4.4 4.4 0 0 1 20 9.6c0 5.4-8 10.9-8 10.9z" strokeLinejoin="round" />
    </svg>
  );
}

export function VerseGame({ items, onClose }: { items: MemorizeItem[]; onClose: () => void }) {
  // Ordre de passage des versets, mélangé une fois par partie.
  const order = useMemo(() => shuffle(items, Date.now() % 233280), [items]);
  const [round, setRound] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [best, setBest] = useState(0);

  const item = order[round];
  const words = useMemo(() => (item ? item.text.split(/\s+/) : []), [item]);
  // Pastilles mélangées : indices des mots (les doublons restent distincts).
  const pool = useMemo(
    () => shuffle(words.map((_, i) => i), words.length * 7 + round * 13 + 5),
    [words, round],
  );
  const [placed, setPlaced] = useState(0); // nombre de mots déjà bien placés
  const [used, setUsed] = useState<Set<number>>(new Set());
  const [wrongTap, setWrongTap] = useState<number | null>(null);
  const [roundClean, setRoundClean] = useState(true);
  const over = lives <= 0 || round >= order.length;

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

  function tap(poolIdx: number) {
    if (used.has(poolIdx)) return;
    const wordIdx = pool[poolIdx];
    if (words[wordIdx] === words[placed] ) {
      // Bon mot (on compare le TEXTE : deux « et » sont interchangeables).
      const nextUsed = new Set(used);
      nextUsed.add(poolIdx);
      setUsed(nextUsed);
      setScore((s) => s + 10 * combo);
      setCombo((c) => Math.min(5, c + (placed > 0 && placed % 4 === 0 ? 1 : 0)));
      const nextPlaced = placed + 1;
      setPlaced(nextPlaced);
      if (nextPlaced >= words.length) {
        // Verset reconstruit : bonus, et révision validée s'il est resté propre.
        setScore((s) => s + 50);
        if (roundClean && item) markReviewed(item.id);
        setTimeout(() => {
          setRound((r) => r + 1);
          setPlaced(0);
          setUsed(new Set());
          setCombo(1);
          setRoundClean(true);
        }, 900);
      }
    } else {
      setWrongTap(poolIdx);
      setRoundClean(false);
      setCombo(1);
      setLives((v) => v - 1);
      setTimeout(() => setWrongTap(null), 450);
    }
  }

  // ---------- Écran de fin ----------
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
            ? "La Parole s'ancre en jouant — reviens demain battre ton record."
            : "Pas grave — chaque essai grave le verset un peu plus profond."}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setRound(0);
              setLives(3);
              setScore(0);
              setCombo(1);
              setPlaced(0);
              setUsed(new Set());
              setRoundClean(true);
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

  // ---------- Manche en cours ----------
  return (
    <div className="mt-6 rounded-3xl border border-dawn-400/35 bg-night-900/70 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-dawn-300">
          Verset {round + 1} / {order.length}
        </p>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <HeartIcon key={i} filled={i < lives} />
          ))}
        </div>
      </div>
      <div className="mt-1 flex items-center justify-between text-xs font-semibold text-cream/50">
        <span>
          Score <span className="tabular-nums text-cream/85">{score}</span>
        </span>
        <span className={combo > 1 ? "text-dawn-300" : undefined}>Combo ×{combo}</span>
      </div>

      {/* Le verset qui se construit */}
      <p className="mt-4 min-h-[4.5rem] rounded-2xl border border-white/10 bg-night-950/60 p-3.5 text-[15px] leading-relaxed text-cream/90">
        {words.slice(0, placed).join(" ")}
        <span className="text-dawn-300"> ▍</span>
      </p>
      <p className="mt-2 text-sm font-bold text-dawn-300">{item.reference}</p>

      {/* Les mots mélangés */}
      <div className="mt-4 flex flex-wrap gap-2">
        {pool.map((wordIdx, poolIdx) =>
          used.has(poolIdx) ? null : (
            <button
              key={poolIdx}
              type="button"
              onClick={() => tap(poolIdx)}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-all ${
                wrongTap === poolIdx
                  ? "translate-x-0.5 border-rose-400/70 bg-rose-400/15 text-rose-200"
                  : "border-white/15 bg-white/[0.06] text-cream/85 hover:border-dawn-400/50"
              }`}
            >
              {words[wordIdx]}
            </button>
          ),
        )}
      </div>

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
