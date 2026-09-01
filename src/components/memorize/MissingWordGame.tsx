"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addMemorizeXp, recordPlaySession, type MemorizeItem } from "@/lib/memorize";
import { resolveRef, getBook } from "@/lib/bible-client";
import { VERSE_PACKS } from "@/config/verse-packs";
import { submitWeeklyPoints } from "@/lib/game-scores";
import { bumpAchv, markDayStreak } from "@/lib/achievements";
import { checkLocalBadges } from "@/lib/badges";

/**
 * « Le mot manquant » — exercice éclair de la mémorisation : un verset
 * s'affiche avec UN mot caché, quatre propositions, un chrono. Les versets
 * viennent des parcours proposés + de la liste du joueur ; parfait pour
 * ancrer la Parole même sans avoir encore ajouté de verset.
 */

const ROUNDS = 10;
const ROUND_TIME = 15;

/** Mots à ne jamais masquer (trop courts / vides de sens seuls). */
const STOP = new Set(
  "le la les un une des de du au aux et ou mais donc or ni car que qui quoi dont il elle ils elles je tu nous vous se sa son ses mon ma mes ton ta tes leur leurs ce cet cette ces dans par pour sur avec sans est sont sera était fut a ont été être avoir ne pas plus tout tous toute toutes en y à si".split(" "),
);

type Round = {
  reference: string;
  words: string[];
  hideIdx: number;
  options: string[]; // 4 propositions, mélangées
};

function cleanWord(w: string): string {
  return w.replace(/[«»".,;:!?()’']/g, "").trim();
}

function significantIdx(words: string[]): number[] {
  return words
    .map((w, i) => ({ w: cleanWord(w).toLowerCase(), i }))
    .filter(({ w }) => w.length >= 4 && !STOP.has(w))
    .map(({ i }) => i);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function fetchVerse(refQuery: string): Promise<{ reference: string; text: string } | null> {
  try {
    const r = await resolveRef(refQuery);
    if (!r) return null;
    const book = await getBook(r.bookId);
    const chap = book.chapters[r.chapter - 1] || [];
    const verses: string[] = [];
    for (let v = r.vStart; v <= Math.min(r.vEnd, chap.length); v++) verses.push(chap[v - 1]);
    if (verses.length === 0) return null;
    const reference = `${r.bookName} ${r.chapter}:${r.vStart}${r.vEnd > r.vStart ? `-${r.vEnd}` : ""}`;
    return { reference, text: verses.join(" ") };
  } catch {
    return null;
  }
}

export function MissingWordGame({ items, onClose }: { items: MemorizeItem[]; onClose: () => void }) {
  const [rounds, setRounds] = useState<Round[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [points, setPoints] = useState(0);
  const [combo, setCombo] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [over, setOver] = useState(false);
  const doneRef = useRef(false);

  // Construit la partie : versets du joueur + versets des parcours.
  useEffect(() => {
    let alive = true;
    (async () => {
      const pool: { reference: string; text: string }[] = items.map((it) => ({
        reference: it.reference,
        text: it.text,
      }));
      const packRefs = shuffle(VERSE_PACKS.flatMap((p) => p.refs));
      for (const r of packRefs) {
        if (pool.length >= ROUNDS + 8) break;
        if (pool.some((p) => p.reference.toLowerCase() === r.toLowerCase())) continue;
        const v = await fetchVerse(r);
        if (v && !pool.some((p) => p.reference === v.reference)) pool.push(v);
      }
      if (!alive) return;
      // Banque de mots-leurres : mots significatifs de TOUS les versets.
      const bank = Array.from(
        new Set(
          pool.flatMap((p) => {
            const ws = p.text.split(/\s+/);
            return significantIdx(ws).map((i) => cleanWord(ws[i]));
          }),
        ),
      );
      const rds: Round[] = [];
      for (const p of shuffle(pool)) {
        if (rds.length >= ROUNDS) break;
        const words = p.text.split(/\s+/);
        const sig = significantIdx(words);
        if (sig.length === 0) continue;
        const hideIdx = sig[Math.floor(Math.random() * sig.length)];
        const good = cleanWord(words[hideIdx]);
        const decoys = shuffle(
          bank.filter((w) => w.toLowerCase() !== good.toLowerCase()),
        ).slice(0, 3);
        if (decoys.length < 3) continue;
        rds.push({ reference: p.reference, words, hideIdx, options: shuffle([good, ...decoys]) });
      }
      setRounds(rds);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cur = rounds?.[idx] ?? null;

  const end = useCallback(
    (finalCorrect: number, finalPoints: number) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setOver(true);
      // XP mémorisation (réduits : exercice rapide) + série + ligue + badges.
      const xp = Math.max(1, Math.round(finalPoints / 10));
      addMemorizeXp(xp);
      recordPlaySession(xp);
      submitWeeklyPoints(finalCorrect);
      if (finalCorrect >= ROUNDS) bumpAchv("perfect_games");
      markDayStreak("play");
      checkLocalBadges();
    },
    [],
  );

  const answer = useCallback(
    (w: string | null) => {
      if (reveal || !cur) return;
      const good = cleanWord(cur.words[cur.hideIdx]);
      const ok = w !== null && w.toLowerCase() === good.toLowerCase();
      setPicked(w);
      setReveal(true);
      let nCorrect = correct;
      let nPoints = points;
      if (ok) {
        const c = combo + 1;
        setCombo(c);
        nCorrect = correct + 1;
        nPoints = points + 100 + timeLeft * 5 + Math.min(c, 5) * 20;
        setCorrect(nCorrect);
        setPoints(nPoints);
        if (ROUND_TIME - timeLeft <= 3) bumpAchv("fast_answers");
      } else {
        setCombo(0);
      }
      setTimeout(() => {
        if (!rounds || idx + 1 >= rounds.length) {
          end(nCorrect, nPoints);
        } else {
          setIdx((i) => i + 1);
          setPicked(null);
          setReveal(false);
          setTimeLeft(ROUND_TIME);
        }
      }, 1600);
    },
    [reveal, cur, correct, points, combo, idx, rounds, timeLeft, end],
  );

  // Minuteur
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!cur || reveal || over) return;
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
  }, [cur, reveal, over, idx]);
  useEffect(() => {
    if (cur && !reveal && !over && timeLeft === 0) answer(null);
  }, [timeLeft, cur, reveal, over, answer]);

  /* ---------- Chargement ---------- */
  if (!rounds) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#1E1E1D]/80 p-8 text-center">
        <p className="font-game text-sm font-bold text-white/60">Préparation des versets…</p>
      </div>
    );
  }

  /* ---------- Fin ---------- */
  if (over) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#1E1E1D]/80 p-7 text-center" style={{ animation: "qm-optin .3s ease-out" }}>
        <p className="font-game text-lg text-white/60">Exercice terminé</p>
        <p className="my-3 font-game text-5xl font-black text-amber-300">{points}</p>
        <p className="text-sm text-white/70">{correct}/{rounds.length} mots retrouvés</p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-amber-400 py-3 font-game text-base font-black text-night-950"
          >
            RETOUR À LA MÉMORISATION
          </button>
        </div>
      </div>
    );
  }

  if (!cur) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#1E1E1D]/80 p-8 text-center">
        <p className="text-sm text-white/60">Pas assez de versets pour jouer — ajoute un verset d&apos;abord.</p>
        <button type="button" onClick={onClose} className="mt-4 rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white/75">
          Fermer
        </button>
      </div>
    );
  }

  const good = cleanWord(cur.words[cur.hideIdx]);

  return (
    <div>
      {/* État : manche · série · points + chrono */}
      <div className="rounded-3xl border border-white/10 bg-[#1E1E1D]/80 p-4">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-amber-400/15 px-3 py-1 font-game text-[11px] font-black uppercase tracking-wider text-amber-300">
            Le mot manquant · {idx + 1}/{rounds.length}
          </span>
          <span className={`font-game text-sm font-black ${timeLeft <= 4 ? "text-rose-300" : "text-white/70"}`}>{timeLeft}s</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <i
            className="block h-full rounded-full"
            style={{
              width: `${(timeLeft / ROUND_TIME) * 100}%`,
              transition: "width 1s linear",
              background: timeLeft <= 4 ? "linear-gradient(90deg,#fb7185,#e11d48)" : "linear-gradient(90deg,#fbbf24,#d97706)",
            }}
          />
        </div>

        {/* Le verset à trou */}
        <p className="mt-4 font-game text-[17px] leading-relaxed text-white">
          {cur.words.map((w, i) => {
            if (i !== cur.hideIdx) return <span key={i}>{w} </span>;
            if (reveal) {
              return (
                <span key={i} className={`font-black ${picked && picked.toLowerCase() === good.toLowerCase() ? "text-emerald-300" : "text-amber-300"}`}>
                  {w}{" "}
                </span>
              );
            }
            return (
              <span
                key={i}
                className="mx-0.5 inline-block h-[1.2em] translate-y-[0.22em] animate-pulse rounded-lg bg-amber-400/40 align-baseline ring-2 ring-amber-400"
                style={{ width: `${Math.max(3, good.length * 0.62)}ch` }}
              />
            );
          })}
        </p>
        <p className="mt-2 text-xs font-bold text-amber-300">{cur.reference}</p>
      </div>

      {/* Les 4 propositions */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {cur.options.map((w) => {
          const isGood = w.toLowerCase() === good.toLowerCase();
          const isPicked = picked === w;
          let cls = "border-white/12 bg-[#30302F] text-white";
          if (reveal && isGood) cls = "border-emerald-400 bg-emerald-400/20 text-emerald-200";
          else if (reveal && isPicked) cls = "border-rose-400 bg-rose-400/20 text-rose-200";
          else if (reveal) cls = "border-white/10 bg-[#30302F] text-white/40";
          return (
            <button
              key={w}
              type="button"
              disabled={reveal}
              onClick={() => answer(w)}
              className={`rounded-2xl border-2 px-3 py-3.5 text-center font-game text-[15px] font-black transition-transform active:scale-[.97] ${cls}`}
            >
              {w}
            </button>
          );
        })}
      </div>

      <button type="button" onClick={onClose} className="mt-4 w-full text-center font-game text-sm font-bold text-white/50">
        Quitter l&apos;exercice
      </button>
    </div>
  );
}
