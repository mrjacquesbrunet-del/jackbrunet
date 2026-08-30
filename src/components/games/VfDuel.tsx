"use client";

import { useEffect, useRef, useState } from "react";
import { buildDeck, type VFItem } from "@/lib/vraifaux";

/**
 * DUEL Vrai ou Faux — deux joueurs, UN téléphone, EN DIRECT.
 * Écran coupé en deux comme le mode conversation de Google Traduction :
 * la moitié du haut est retournée à 180° pour le joueur assis en face.
 * Même question des deux côtés ; le premier qui touche la BONNE réponse
 * marque le point. Une erreur te bloque pour la manche. Premier à 7.
 */

const TARGET = 7; // premier à 7 points
const ROUND_TIME = 10; // secondes par affirmation
const REVEAL_MS = 2600;

type P = "a" | "b";

const DUEL_CSS = `
.vfd{position:fixed;inset:0;z-index:130;display:flex;flex-direction:column;color:#F3F3ED;background:
  radial-gradient(120% 50% at 50% 0%, rgba(252,211,77,.10) 0%, transparent 55%),
  radial-gradient(120% 50% at 50% 100%, rgba(202,240,0,.12) 0%, transparent 55%),
  linear-gradient(180deg,#0C0C0B,#171716 50%,#0C0C0B)}
@keyframes vfd-pop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
.vfd-pop{animation:vfd-pop .35s cubic-bezier(.2,.8,.3,1) both}
@keyframes vfd-win{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
.vfd-win{animation:vfd-win 1.1s ease-in-out infinite}
@keyframes vfd-tick{0%,100%{opacity:.85}50%{opacity:.45}}
.vfd-tick{animation:vfd-tick 1s ease-in-out infinite}
`;

export function VfDuel({ onClose }: { onClose: () => void }) {
  const [deck, setDeck] = useState<VFItem[]>(() => buildDeck());
  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<{ a: number; b: number }>({ a: 0, b: 0 });
  const [locked, setLocked] = useState<{ a: boolean; b: boolean }>({ a: false, b: false });
  const [phase, setPhase] = useState<"play" | "reveal" | "end">("play");
  const [roundWinner, setRoundWinner] = useState<P | null>(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const nextTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cur = deck[idx % deck.length];
  const champion: P | null = scores.a >= TARGET ? "a" : scores.b >= TARGET ? "b" : null;

  // Verrouille le défilement de la page derrière.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      if (nextTimer.current) clearTimeout(nextTimer.current);
    };
  }, []);

  // Compte à rebours de la manche.
  useEffect(() => {
    if (phase !== "play") return;
    if (timeLeft <= 0) {
      reveal(null);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase]);

  function reveal(winner: P | null) {
    setRoundWinner(winner);
    setPhase("reveal");
    nextTimer.current = setTimeout(() => {
      setScores((s) => {
        const done = s.a >= TARGET || s.b >= TARGET;
        if (done) setPhase("end");
        else {
          setIdx((i) => i + 1);
          setLocked({ a: false, b: false });
          setTimeLeft(ROUND_TIME);
          setRoundWinner(null);
          setPhase("play");
        }
        return s;
      });
    }, REVEAL_MS);
  }

  function tap(p: P, val: boolean) {
    if (phase !== "play" || locked[p]) return;
    if (val === cur.answer) {
      setScores((s) => ({ ...s, [p]: s[p] + 1 }));
      reveal(p);
    } else {
      setLocked((l) => {
        const nl = { ...l, [p]: true };
        if (nl.a && nl.b) reveal(null);
        return nl;
      });
    }
  }

  function rematch() {
    if (nextTimer.current) clearTimeout(nextTimer.current);
    setDeck(buildDeck());
    setIdx(0);
    setScores({ a: 0, b: 0 });
    setLocked({ a: false, b: false });
    setRoundWinner(null);
    setTimeLeft(ROUND_TIME);
    setPhase("play");
  }

  return (
    <div className="vfd">
      <style>{DUEL_CSS}</style>

      {/* Moitié du HAUT : joueur 2, retournée pour être lue en face */}
      <div className="min-h-0 flex-1 rotate-180">
        <Half
          player="b"
          cur={cur}
          phase={phase}
          locked={locked.b}
          roundWinner={roundWinner}
          champion={champion}
          score={scores.b}
          onTap={(v) => tap("b", v)}
          onRematch={rematch}
          onQuit={onClose}
        />
      </div>

      {/* Barre centrale : scores + chrono + quitter */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-y border-white/10 bg-night-950/90 px-4 py-2.5">
        <span className="rounded-full bg-[#FCD34D]/15 px-3 py-1 font-game text-lg font-black text-[#FCD34D]">
          {scores.b}
        </span>
        <div className="flex items-center gap-2 text-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Quitter le duel"
            className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-cream/70"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
          <p className="font-game text-[11px] font-bold text-cream/60">
            Premier à {TARGET}
            {phase === "play" ? (
              <span className={`ml-2 tabular-nums ${timeLeft <= 3 ? "text-rose-300 vfd-tick" : "text-cream/80"}`}>
                {timeLeft}s
              </span>
            ) : null}
          </p>
        </div>
        <span className="rounded-full bg-[#CAF000]/15 px-3 py-1 font-game text-lg font-black text-[#CAF000]">
          {scores.a}
        </span>
      </div>

      {/* Moitié du BAS : joueur 1 */}
      <div className="min-h-0 flex-1">
        <Half
          player="a"
          cur={cur}
          phase={phase}
          locked={locked.a}
          roundWinner={roundWinner}
          champion={champion}
          score={scores.a}
          onTap={(v) => tap("a", v)}
          onRematch={rematch}
          onQuit={onClose}
        />
      </div>
    </div>
  );
}

function Half({
  player,
  cur,
  phase,
  locked,
  roundWinner,
  champion,
  score,
  onTap,
  onRematch,
  onQuit,
}: {
  player: P;
  cur: VFItem;
  phase: "play" | "reveal" | "end";
  locked: boolean;
  roundWinner: P | null;
  champion: P | null;
  score: number;
  onTap: (val: boolean) => void;
  onRematch: () => void;
  onQuit: () => void;
}) {
  const accent = player === "a" ? "#CAF000" : "#FCD34D";
  const name = player === "a" ? "JOUEUR 1" : "JOUEUR 2";

  if (phase === "end") {
    const won = champion === player;
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className={`font-game text-3xl font-black ${won ? "vfd-win" : ""}`} style={{ color: accent }}>
          {won ? "VICTOIRE !" : "Bien joué"}
        </p>
        <p className="text-sm text-cream/65">
          {won ? "Tu as remporté le duel." : "Tu prendras ta revanche."} {score} point{score > 1 ? "s" : ""}.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onRematch}
            className="rounded-full px-6 py-3 font-game text-sm font-black text-[#1a2000]"
            style={{ background: "linear-gradient(180deg,#D8F53A,#AAD000)", boxShadow: "0 4px 0 #5b7300" }}
          >
            REVANCHE
          </button>
          <button
            type="button"
            onClick={onQuit}
            className="rounded-full border border-white/15 px-5 py-3 font-game text-sm font-bold text-cream/75"
          >
            Quitter
          </button>
        </div>
      </div>
    );
  }

  const revealTint =
    phase === "reveal" ? (roundWinner === player ? "Point pour toi !" : roundWinner ? "Trop tard…" : "Personne !") : null;

  return (
    <div className="flex h-full flex-col px-4 pb-3 pt-2">
      {/* Nom du joueur */}
      <p className="text-center font-game text-[10px] font-black tracking-[0.2em]" style={{ color: accent }}>
        {name}
      </p>

      {/* L'affirmation */}
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <p
          key={cur.id}
          className={`vfd-pop text-balance text-center font-game font-black leading-snug ${
            cur.text.length > 90 ? "text-base" : "text-lg sm:text-xl"
          }`}
        >
          {cur.text}
        </p>
      </div>

      {/* Résultat de la manche */}
      {phase === "reveal" ? (
        <p className="pb-1 text-center font-game text-xs font-black">
          <span className={cur.answer ? "text-emerald-300" : "text-rose-300"}>
            {cur.answer ? "VRAI" : "FAUX"}
          </span>
          <span className="ml-2 text-cream/60">{revealTint}</span>
        </p>
      ) : locked ? (
        <p className="pb-1 text-center font-game text-xs font-black text-rose-300">Raté ! Manche bloquée…</p>
      ) : null}

      {/* VRAI / FAUX */}
      <div className="flex shrink-0 gap-2.5">
        <button
          type="button"
          disabled={phase !== "play" || locked}
          onClick={() => onTap(true)}
          className="flex-1 rounded-2xl py-4 font-game text-xl font-black text-white transition-transform active:scale-[.97] disabled:opacity-40"
          style={{
            background:
              phase === "reveal" && cur.answer
                ? "linear-gradient(180deg,#34d399,#059669)"
                : "linear-gradient(180deg,#10b981,#047857)",
            boxShadow: "0 4px 0 #064e3b",
          }}
        >
          VRAI
        </button>
        <button
          type="button"
          disabled={phase !== "play" || locked}
          onClick={() => onTap(false)}
          className="flex-1 rounded-2xl py-4 font-game text-xl font-black text-white transition-transform active:scale-[.97] disabled:opacity-40"
          style={{
            background:
              phase === "reveal" && !cur.answer
                ? "linear-gradient(180deg,#fb7185,#e11d48)"
                : "linear-gradient(180deg,#f43f5e,#be123c)",
            boxShadow: "0 4px 0 #881337",
          }}
        >
          FAUX
        </button>
      </div>
    </div>
  );
}
