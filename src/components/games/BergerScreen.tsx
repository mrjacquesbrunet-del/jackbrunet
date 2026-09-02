"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BERGER_LEVELS,
  BERGER_W,
  BERGER_H,
  bergerBest,
  recordBerger,
  getBergerXp,
  type BergerLevel,
} from "@/lib/berger";
import { getMemorizeXp, levelFromXp } from "@/lib/memorize";
import { getVfXp } from "@/lib/vraifaux";
import { getQuizCoins } from "@/lib/quiz";
import { getSupabase } from "@/lib/supabase";
import { getProfile } from "@/lib/community";
import { submitGameScore, submitWeeklyPoints } from "@/lib/game-scores";
import { ScoreBoard } from "@/components/games/ScoreBoard";
import { bumpAchv, markDayStreak } from "@/lib/achievements";
import { checkLocalBadges } from "@/lib/badges";
import { asset } from "@/lib/asset";
import {
  ArcadeShell,
  HubHeader,
  IcoPlay,
  IcoRefresh,
  IcoTrophy,
  IcoTarget,
} from "./ArcadeUI";

const GREEN = "#4ADE80";

function buzz(p: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(p);
  } catch {
    /* non supporté */
  }
}

/* ---------- Pièces dessinées (pas d'emojis : SVG en trait) ---------- */

function SheepSvg({ onGoal = false }: { onGoal?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden>
      {/* corps laineux */}
      <g fill={onGoal ? "#fef3c7" : "#F3F3ED"} stroke="#171716" strokeWidth="1.6">
        <circle cx="18" cy="24" r="8" />
        <circle cx="27" cy="20" r="8" />
        <circle cx="31" cy="27" r="7" />
        <circle cx="22" cy="30" r="8" />
      </g>
      {/* tête */}
      <ellipse cx="36" cy="21" rx="6.5" ry="5.5" fill="#30302F" stroke="#171716" strokeWidth="1.4" />
      <circle cx="38" cy="20" r="1.2" fill="#F3F3ED" />
      {/* oreille */}
      <ellipse cx="31.5" cy="17.5" rx="3" ry="1.8" fill="#30302F" transform="rotate(-25 31.5 17.5)" />
      {/* pattes */}
      <path d="M16 36v4M24 37v4M30 35v4" stroke="#171716" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ShepherdSvg() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden>
      {/* bâton avec crosse */}
      <path d="M36 8c-4 0-6 3-4 6M34 12v30" stroke="#b45309" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      {/* tunique */}
      <path d="M14 42c0-10 3-16 9-16s9 6 9 16z" fill="#CAF000" stroke="#171716" strokeWidth="1.6" />
      <path d="M20 30v10M26 30v10" stroke="#171716" strokeWidth="1" opacity=".35" />
      {/* tête + keffieh */}
      <circle cx="23" cy="19" r="6.5" fill="#f2c896" stroke="#171716" strokeWidth="1.5" />
      <path d="M16 17c0-5 3.5-8 7-8s7 3 7 8c-2-2.5-4-3.5-7-3.5S18 14.5 16 17z" fill="#F3F3ED" stroke="#171716" strokeWidth="1.4" />
    </svg>
  );
}

function RockSvg() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden>
      <path d="M8 38l5-16 9-8 12 4 6 12-4 8z" fill="#30302F" stroke="#171716" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13 22l9-8 6 10-8 4z" fill="#4b4b49" opacity=".9" />
    </svg>
  );
}

type Pos = [number, number];
const eq = (a: Pos, b: Pos) => a[0] === b[0] && a[1] === b[1];

type Snapshot = { player: Pos; sheep: Pos[] };

type Phase = "hub" | "play";

export function BergerScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("hub");
  const [levelIdx, setLevelIdx] = useState(0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [, setTick] = useState(0); // rafraîchit le hub après une réussite

  useEffect(() => {
    setXp(getMemorizeXp() + getVfXp() + getBergerXp() + Math.floor(getQuizCoins() / 500));
    submitGameScore("berger", getBergerXp());
    (async () => {
      const sb = getSupabase();
      if (!sb) return;
      try {
        const { data } = await sb.auth.getUser();
        const uid = data.user?.id;
        if (!uid) return;
        const prof = await getProfile(uid);
        setName((prof?.pseudo && prof.pseudo.trim()) || "");
        setAvatar(prof?.avatar_url || null);
      } catch {
        /* avatar neutre */
      }
    })();
  }, [phase]);

  const lvl = levelFromXp(xp);

  /* ---------------- HUB : sélection de niveau ---------------- */
  if (phase === "hub") {
    return (
      <ArcadeShell>
        <HubHeader name={name} avatarUrl={avatar} level={lvl.level} xpInto={lvl.into} xpSpan={lvl.span} gems={getBergerXp()} onGear={() => router.push("/profil")} />

        <div className="qm-hero mt-4" style={{ background: "radial-gradient(120% 120% at 100% 0%, rgba(74,222,128,.2), transparent 55%), linear-gradient(135deg,#1E1E1D 0%,#0C0C0B 100%)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/img/jeux/berger.png")} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} className="qm-illo pointer-events-none absolute -bottom-2 -right-2 h-36 w-auto object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,.35)]" />
          <div className="relative max-w-[58%]">
            <span className="qm-rapide" style={{ background: "rgba(74,222,128,.16)", color: GREEN }}>PUZZLE</span>
            <h1 className="mt-2.5 font-game text-[2rem] font-black leading-[0.9] drop-shadow">
              LE <span style={{ color: GREEN }}>BERGER</span>
            </h1>
            <p className="mt-2.5 font-game text-[13px] font-semibold leading-tight text-white/85">
              Ramène chaque brebis à l&apos;enclos — en réfléchissant bien&nbsp;!
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="qm-obj flex items-center gap-3">
            <span className="qm-obj-ic"><IcoTarget className="h-6 w-6" /></span>
            <div className="min-w-0">
              <p className="font-game text-xs font-black text-teal-800">OBJECTIF</p>
              <p className="text-[11px] font-semibold leading-tight text-teal-900/80">Pousse les brebis jusqu&apos;aux enclos.</p>
            </div>
          </div>
          <div className="qm-rec flex items-center gap-3">
            <span className="qm-rec-ic"><IcoTrophy className="h-6 w-6" /></span>
            <div className="min-w-0">
              <p className="font-game text-xs font-black text-amber-700">RÉUSSIS</p>
              <p className="font-game text-2xl font-black leading-none text-[#4a2600]">
                {BERGER_LEVELS.filter((_, i) => bergerBest(i) !== null).length}/{BERGER_LEVELS.length}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 flex items-center justify-between font-game text-sm font-black tracking-wide text-white/85">
          CHOISIS TON NIVEAU
          <span className="text-[11px] font-bold text-amber-300">Étoile = réussi en un minimum de coups</span>
        </p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {BERGER_LEVELS.map((l, i) => {
            const best = bergerBest(i);
            const done = best !== null;
            const perfect = done && (best as number) <= l.par;
            const locked = i > 0 && bergerBest(i - 1) === null;
            return (
              <button
                key={i}
                type="button"
                disabled={locked}
                onClick={() => {
                  setLevelIdx(i);
                  setPhase("play");
                  buzz(15);
                }}
                className="relative grid aspect-square place-items-center rounded-2xl font-game text-lg font-black transition-transform active:scale-95"
                style={
                  locked
                    ? { background: "rgba(255,255,255,.05)", color: "rgba(243,243,237,.25)" }
                    : done
                      ? { background: "linear-gradient(180deg,#4ADE80,#16A34A)", color: "#052e16", boxShadow: "0 3px 0 #14532d" }
                      : { background: "linear-gradient(180deg,#30302F,#1E1E1D)", color: "#F3F3ED", boxShadow: "0 3px 0 rgba(0,0,0,.5)", border: "1px solid rgba(255,255,255,.12)" }
                }
              >
                {locked ? (
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}><path d="M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : (
                  i + 1
                )}
                {perfect ? (
                  <svg viewBox="0 0 24 24" className="absolute -right-1 -top-1 h-4 w-4 text-amber-300" fill="currentColor" aria-hidden>
                    <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.8 6.8 20.5l1-5.8L3.5 9.2l5.9-.9z" />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex justify-center">
          <button type="button" onClick={() => router.push("/jeux")} className="qm-retour">
            <IcoRefresh className="h-4 w-4" /> RETOUR AUX JEUX
          </button>
        </div>

        <div className="mt-5">
          <ScoreBoard mode="berger" accent={GREEN} title="Classement · Le Berger" />
        </div>
      </ArcadeShell>
    );
  }

  return (
    <BergerPlay
      levelIdx={levelIdx}
      onExit={() => {
        setPhase("hub");
        setTick((t) => t + 1);
      }}
      onNext={() => {
        if (levelIdx + 1 < BERGER_LEVELS.length) setLevelIdx((i) => i + 1);
        else setPhase("hub");
      }}
      name={name}
      avatar={avatar}
    />
  );
}

/* ---------------- Le niveau en cours ---------------- */

function BergerPlay({
  levelIdx,
  onExit,
  onNext,
  name,
  avatar,
}: {
  levelIdx: number;
  onExit: () => void;
  onNext: () => void;
  name: string;
  avatar: string | null;
}) {
  void name;
  void avatar;
  const level: BergerLevel = BERGER_LEVELS[levelIdx];
  const walls = useMemo(() => new Set(level.walls.map((p) => p.join(","))), [level]);
  const goals = useMemo(() => new Set(level.goals.map((p) => p.join(","))), [level]);

  const [player, setPlayer] = useState<Pos>(level.player);
  const [sheep, setSheep] = useState<Pos[]>(level.sheep.map((p) => [...p] as Pos));
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [won, setWon] = useState<{ perfect: boolean; xp: number } | null>(null);
  const wonRef = useRef(false);

  // Nouveau niveau → tout remettre.
  useEffect(() => {
    setPlayer(level.player);
    setSheep(level.sheep.map((p) => [...p] as Pos));
    setMoves(0);
    setHistory([]);
    setWon(null);
    wonRef.current = false;
  }, [level]);

  const isWall = useCallback((x: number, y: number) => x < 0 || y < 0 || x >= BERGER_W || y >= BERGER_H || walls.has(`${x},${y}`), [walls]);

  const move = useCallback(
    (dx: number, dy: number) => {
      if (wonRef.current) return;
      const [px, py] = player;
      const nx = px + dx;
      const ny = py + dy;
      if (isWall(nx, ny)) return;
      const si = sheep.findIndex((s) => eq(s, [nx, ny]));
      let nextSheep = sheep;
      if (si >= 0) {
        const bx = nx + dx;
        const by = ny + dy;
        if (isWall(bx, by) || sheep.some((s) => eq(s, [bx, by]))) return; // poussée bloquée
        nextSheep = sheep.map((s, i) => (i === si ? ([bx, by] as Pos) : s));
      }
      setHistory((h) => [...h.slice(-59), { player: [px, py], sheep: sheep.map((s) => [...s] as Pos) }]);
      setPlayer([nx, ny]);
      setSheep(nextSheep);
      const m = moves + 1;
      setMoves(m);
      buzz(8);
      // Victoire ?
      if (nextSheep.every((s) => goals.has(s.join(",")))) {
        wonRef.current = true;
        const res = recordBerger(levelIdx, m);
        submitGameScore("berger", getBergerXp());
        submitWeeklyPoints(res.perfect ? 3 : 2);
        bumpAchv("games_played");
        markDayStreak("play");
        checkLocalBadges();
        buzz([30, 40, 80]);
        setTimeout(() => setWon({ perfect: res.perfect, xp: res.xpGained }), 350);
      }
    },
    [player, sheep, moves, isWall, goals, levelIdx],
  );

  // Glissement du doigt sur le plateau.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e: React.TouchEvent) {
    const s = touchStart.current;
    touchStart.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1, 0);
    else move(0, dy > 0 ? 1 : -1);
  }

  // Flèches clavier (site web).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") move(0, -1);
      else if (e.key === "ArrowDown") move(0, 1);
      else if (e.key === "ArrowLeft") move(-1, 0);
      else if (e.key === "ArrowRight") move(1, 0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  function undo() {
    setHistory((h) => {
      const last = h[h.length - 1];
      if (!last) return h;
      setPlayer(last.player);
      setSheep(last.sheep);
      setMoves((m) => Math.max(0, m - 1));
      return h.slice(0, -1);
    });
  }

  function restart() {
    setPlayer(level.player);
    setSheep(level.sheep.map((p) => [...p] as Pos));
    setMoves(0);
    setHistory([]);
    buzz(10);
  }

  const cellPct = 100 / BERGER_W;

  return (
    <ArcadeShell>
      {/* Barre du niveau */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={onExit} className="flex items-center gap-1.5 font-game text-sm font-bold text-white/70">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}><path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Niveaux
        </button>
        <p className="font-game text-base font-black">
          NIVEAU <span style={{ color: GREEN }}>{levelIdx + 1}</span>
        </p>
        <p className="font-game text-sm font-bold text-white/70">
          {moves} coup{moves > 1 ? "s" : ""} · <span className="text-amber-300">par {level.par}</span>
        </p>
      </div>

      {/* Plateau */}
      <div
        className="relative mx-auto mt-4 w-full max-w-md touch-none select-none overflow-hidden rounded-3xl border border-white/10"
        style={{ background: "linear-gradient(160deg,#2c4a2e,#1d3520)", aspectRatio: "1 / 1" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* damier herbe */}
        {Array.from({ length: BERGER_W * BERGER_H }, (_, i) => {
          const x = i % BERGER_W;
          const y = Math.floor(i / BERGER_W);
          return (x + y) % 2 === 0 ? (
            <div key={i} className="absolute" style={{ left: `${x * cellPct}%`, top: `${y * cellPct}%`, width: `${cellPct}%`, height: `${cellPct}%`, background: "rgba(255,255,255,.04)" }} />
          ) : null;
        })}
        {/* enclos */}
        {level.goals.map(([x, y], i) => (
          <div key={`g${i}`} className="absolute p-[6%]" style={{ left: `${x * cellPct}%`, top: `${y * cellPct}%`, width: `${cellPct}%`, height: `${cellPct}%` }}>
            <div className="h-full w-full rounded-xl border-2 border-dashed border-amber-400/80" style={{ background: "rgba(251,191,36,.14)" }} />
          </div>
        ))}
        {/* rochers */}
        {level.walls.map(([x, y], i) => (
          <div key={`w${i}`} className="absolute" style={{ left: `${x * cellPct}%`, top: `${y * cellPct}%`, width: `${cellPct}%`, height: `${cellPct}%` }}>
            <RockSvg />
          </div>
        ))}
        {/* brebis */}
        {sheep.map(([x, y], i) => (
          <div key={`s${i}`} className="absolute transition-all duration-150 ease-out" style={{ left: `${x * cellPct}%`, top: `${y * cellPct}%`, width: `${cellPct}%`, height: `${cellPct}%` }}>
            <SheepSvg onGoal={goals.has(`${x},${y}`)} />
          </div>
        ))}
        {/* berger */}
        <div className="absolute transition-all duration-150 ease-out" style={{ left: `${player[0] * cellPct}%`, top: `${player[1] * cellPct}%`, width: `${cellPct}%`, height: `${cellPct}%` }}>
          <ShepherdSvg />
        </div>
      </div>

      <p className="mt-2 text-center text-[11px] font-semibold text-white/45">
        Glisse le doigt sur le plateau pour déplacer le berger — il pousse les brebis.
      </p>

      {/* Commandes */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <button type="button" onClick={undo} disabled={history.length === 0} className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 font-game text-sm font-black text-white/85 disabled:opacity-35">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}><path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Annuler
        </button>
        <button type="button" onClick={restart} className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 font-game text-sm font-black text-white/85">
          <IcoRefresh className="h-4 w-4" /> Recommencer
        </button>
      </div>

      {/* Flèches (grands pouces / ordinateur) */}
      <div className="mx-auto mt-3 grid w-40 grid-cols-3 gap-1.5">
        <span />
        <ArrowBtn d="M12 19V5M6 11l6-6 6 6" onClick={() => move(0, -1)} label="Haut" />
        <span />
        <ArrowBtn d="M19 12H5m6-6-6 6 6 6" onClick={() => move(-1, 0)} label="Gauche" />
        <ArrowBtn d="M12 5v14m-6-6 6 6 6-6" onClick={() => move(0, 1)} label="Bas" />
        <ArrowBtn d="M5 12h14m-6-6 6 6-6 6" onClick={() => move(1, 0)} label="Droite" />
      </div>

      {/* Victoire */}
      {won ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-night-950/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs rounded-3xl border border-white/10 bg-night-900 p-6 text-center" style={{ animation: "qm-optin .35s ease-out" }}>
            <p className="font-game text-xl font-black" style={{ color: GREEN }}>
              {won.perfect ? "PARFAIT !" : "NIVEAU RÉUSSI !"}
            </p>
            <p className="mt-2 text-sm text-white/75">
              {moves} coups {won.perfect ? `— le minimum possible (${level.par}) !` : `· minimum possible : ${level.par}`}
            </p>
            {won.perfect ? (
              <svg viewBox="0 0 24 24" className="mx-auto mt-3 h-10 w-10 text-amber-300" fill="currentColor" aria-hidden>
                <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.8 6.8 20.5l1-5.8L3.5 9.2l5.9-.9z" />
              </svg>
            ) : null}
            {won.xp > 0 ? <p className="mt-2 font-game text-sm font-black text-amber-300">+{won.xp} XP</p> : null}
            <div className="mt-5 flex flex-col gap-2">
              {levelIdx + 1 < BERGER_LEVELS.length ? (
                <button type="button" onClick={onNext} className="w-full rounded-full py-3 font-game text-base font-black text-[#052e16]" style={{ background: "linear-gradient(180deg,#4ADE80,#16A34A)", boxShadow: "0 4px 0 #14532d" }}>
                  NIVEAU SUIVANT
                </button>
              ) : null}
              {!won.perfect ? (
                <button type="button" onClick={() => { setWon(null); wonRef.current = false; restart(); }} className="w-full rounded-full border border-amber-400/50 py-3 font-game text-sm font-black text-amber-300">
                  RETENTER LE PARFAIT
                </button>
              ) : null}
              <button type="button" onClick={onExit} className="w-full py-1 font-game text-sm font-bold text-white/55">
                Retour aux niveaux
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ArcadeShell>
  );
}

function ArrowBtn({ d, onClick, label }: { d: string; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid aspect-square place-items-center rounded-2xl border border-white/12 bg-white/[0.07] text-white/85 transition-transform active:scale-90"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
      </svg>
    </button>
  );
}
