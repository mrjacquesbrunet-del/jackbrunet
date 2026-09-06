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
  const wool = onGoal ? "#fdf0c8" : "#fbfaf4";
  const woolShade = onGoal ? "#f0d896" : "#e4e0d2";
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden>
      {/* ombre portée */}
      <ellipse cx="24" cy="41.5" rx="11.5" ry="3" fill="rgba(0,0,0,.28)" />
      {/* pattes */}
      <path d="M17 34v6M22.5 35v6M27.5 35v6M32 34v6" stroke="#3b342c" strokeWidth="2.4" strokeLinecap="round" />
      {/* toison : nuage de boucles */}
      <g fill={wool} stroke="#3b342c" strokeWidth="1.5">
        <circle cx="15.5" cy="25" r="6.8" />
        <circle cx="22" cy="20.5" r="7.6" />
        <circle cx="29.5" cy="22" r="7" />
        <circle cx="33" cy="28" r="6.2" />
        <circle cx="25" cy="29.5" r="7.6" />
        <circle cx="16.5" cy="30.5" r="6" />
      </g>
      {/* modelé bas de toison */}
      <path d="M12 30c2 4 6 6 12 6s10-2 12-6" fill="none" stroke={woolShade} strokeWidth="2.4" strokeLinecap="round" opacity=".8" />
      {/* tête */}
      <ellipse cx="36" cy="20" rx="5.6" ry="6.2" fill="#4a4038" stroke="#2e2820" strokeWidth="1.4" />
      {/* oreilles */}
      <ellipse cx="30.5" cy="16" rx="3.4" ry="2" fill="#4a4038" stroke="#2e2820" strokeWidth="1.1" transform="rotate(-30 30.5 16)" />
      <ellipse cx="40.5" cy="15.5" rx="3.2" ry="1.9" fill="#4a4038" stroke="#2e2820" strokeWidth="1.1" transform="rotate(24 40.5 15.5)" />
      {/* houppette de laine sur la tête */}
      <circle cx="35" cy="13.5" r="3.6" fill={wool} stroke="#3b342c" strokeWidth="1.3" />
      {/* yeux + museau */}
      <circle cx="34.6" cy="19.5" r="1.9" fill="#fff" />
      <circle cx="38.8" cy="19.8" r="1.9" fill="#fff" />
      <circle cx="35" cy="19.8" r="1" fill="#171716" />
      <circle cx="39.1" cy="20.1" r="1" fill="#171716" />
      <ellipse cx="37" cy="24" rx="1.6" ry="1.1" fill="#8a7263" />
      {onGoal ? <path d="M34.8 25.6c1.4 1.2 3 1.2 4.4 0" stroke="#2e2820" strokeWidth="1" fill="none" strokeLinecap="round" /> : null}
    </svg>
  );
}

function ShepherdSvg() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden>
      {/* ombre portée */}
      <ellipse cx="23" cy="42" rx="10" ry="2.8" fill="rgba(0,0,0,.28)" />
      {/* bâton avec crosse */}
      <path d="M40 8c-4.5-1.5-7 2-4.5 5" stroke="#8a5a2b" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      <path d="M36.5 12.5V41" stroke="#8a5a2b" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M36.5 12.5V41" stroke="#b07a41" strokeWidth="1.1" strokeLinecap="round" />
      {/* tunique */}
      <path d="M13.5 41.5c0-10.5 3.5-17 9.5-17s9.5 6.5 9.5 17z" fill="#CAF000" stroke="#2e2820" strokeWidth="1.6" />
      <path d="M13.5 41.5c0-10.5 3.5-17 9.5-17 1.6 0 3 .5 4.2 1.4-4.8 2.2-7.4 8-7.4 15.6z" fill="#a8c800" opacity=".55" />
      {/* ceinture */}
      <path d="M17.2 32.5c3.8 1.6 7.8 1.6 11.6 0" stroke="#6b4a2c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* bras vers le bâton */}
      <path d="M30.5 30c2.5-1 4.5-1.5 6-1.5" stroke="#CAF000" strokeWidth="4.4" strokeLinecap="round" />
      <circle cx="37" cy="28.5" r="2.1" fill="#f2c896" stroke="#2e2820" strokeWidth="1" />
      {/* tête */}
      <circle cx="23" cy="17.5" r="6.6" fill="#f2c896" stroke="#2e2820" strokeWidth="1.5" />
      {/* sourire + yeux */}
      <circle cx="20.8" cy="17" r="1" fill="#171716" />
      <circle cx="25.2" cy="17" r="1" fill="#171716" />
      <path d="M21 20.4c1.3 1.1 2.7 1.1 4 0" stroke="#171716" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      {/* keffieh : voile + bandeau */}
      <path d="M15.5 16c0-5.5 3.5-8.8 7.5-8.8s7.5 3.3 7.5 8.8c-2.2-3-4.4-4.2-7.5-4.2s-5.3 1.2-7.5 4.2z" fill="#fbfaf4" stroke="#2e2820" strokeWidth="1.4" />
      <path d="M16.2 12.8c2-2.3 4.2-3.4 6.8-3.4s4.8 1.1 6.8 3.4" stroke="#d97706" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* pan du voile */}
      <path d="M29.5 12c1.5 2.5 1.8 5.5 1 8.5" stroke="#fbfaf4" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function RockSvg() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden>
      {/* ombre portée */}
      <ellipse cx="24" cy="40" rx="13" ry="3.2" fill="rgba(0,0,0,.3)" />
      {/* pierre chaude, facettée */}
      <path d="M8 37l4.5-15 10-7.5 12.5 3.5 5.5 11.5-4 7.5z" fill="#8b8073" stroke="#4e463c" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12.5 22l10-7.5 5.5 9.5-8.5 4.5z" fill="#a89d8d" />
      <path d="M28 24l7-6 5.5 11.5-4 7.5-5-2z" fill="#6f6558" />
      <path d="M19.5 28.5l8.5-4.5 4.5 9.5-6 3.5z" fill="#978b7b" opacity=".7" />
      {/* mousse au pied */}
      <path d="M9 37c2-2.5 5-2.5 7 0M31 38c1.8-2.2 4.4-2.2 6.2 0" stroke="#5f8f3f" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Enclos : petit parc en bois avec litière de paille. */
function PenSvg({ occupied = false }: { occupied?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden>
      {/* halo doré quand une brebis est rentrée */}
      {occupied ? <circle cx="24" cy="26" r="19" fill="rgba(251,191,36,.28)" /> : null}
      {/* litière de paille */}
      <ellipse cx="24" cy="30" rx="16.5" ry="10" fill={occupied ? "rgba(251,191,36,.4)" : "rgba(216,180,90,.28)"} stroke="rgba(146,100,32,.5)" strokeWidth="1.2" />
      <path d="M14 29l5-2M22 33l6-2M30 27l5 2M18 25l4 2" stroke="rgba(146,100,32,.55)" strokeWidth="1.3" strokeLinecap="round" />
      {/* clôture du fond (les brebis passent devant) */}
      <g stroke="#8a5a2b" strokeWidth="2.6" strokeLinecap="round">
        <path d="M8 14v16M24 11v10M40 14v16" />
      </g>
      <g stroke="#a8743d" strokeWidth="2.2" strokeLinecap="round">
        <path d="M8 17.5c10-4 22-4 32 0M8 24.5c10-4 22-4 32 0" />
      </g>
    </svg>
  );
}

/** Touffe d'herbe décorative (déterministe, sous les pièces). */
function TuftSvg({ flower = false }: { flower?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden>
      <path d="M20 34c-1-4 0-7 1.5-9M24 35c0-5 .8-8 2-10M28 34c1-3.5.6-6.5-.4-9" stroke="#6fae4a" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".7" />
      {flower ? (
        <g>
          <circle cx="31.5" cy="23" r="2.6" fill="#fbfaf4" opacity=".9" />
          <circle cx="31.5" cy="23" r="1.1" fill="#fbbf24" />
        </g>
      ) : null}
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

        <div className="qm-hero mt-4" style={{ background: "radial-gradient(120% 120% at 100% 0%, rgba(74,222,128,.2), transparent 55%), linear-gradient(135deg,rgba(30,30,29,.72) 0%,rgba(12,12,11,.84) 100%)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/img/jeux/berger.png")} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} className="qm-illo pointer-events-none absolute -bottom-2 -right-2 h-32 w-auto max-w-[38%] object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,.35)]" />
          <div className="relative max-w-[62%]">
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

      {/* Plateau : prairie dans un cadre de bois */}
      <div
        className="mx-auto mt-4 w-full max-w-md rounded-[26px] p-[7px]"
        style={{
          background: "linear-gradient(160deg,#8a5a2b,#5f3d1d)",
          boxShadow: "0 6px 0 #3d2712, 0 14px 24px rgba(0,0,0,.45)",
        }}
      >
        <div
          className="relative w-full touch-none select-none overflow-hidden rounded-[20px]"
          style={{
            background:
              "radial-gradient(130% 100% at 20% 0%, rgba(255,244,190,.14), transparent 55%), radial-gradient(120% 120% at 80% 110%, rgba(0,0,0,.3), transparent 60%), linear-gradient(160deg,#5f9a44,#3e7231 55%,#2f5d27)",
            aspectRatio: "1 / 1",
            boxShadow: "inset 0 2px 10px rgba(0,0,0,.35)",
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* damier d'herbe + décor déterministe (touffes, fleurs) */}
          {Array.from({ length: BERGER_W * BERGER_H }, (_, i) => {
            const x = i % BERGER_W;
            const y = Math.floor(i / BERGER_W);
            const h = (x * 31 + y * 17 + levelIdx * 7) % 11;
            return (
              <div key={i} className="absolute" style={{ left: `${x * cellPct}%`, top: `${y * cellPct}%`, width: `${cellPct}%`, height: `${cellPct}%` }}>
                {(x + y) % 2 === 0 ? <div className="absolute inset-0" style={{ background: "rgba(255,255,255,.055)" }} /> : null}
                {h === 0 ? <TuftSvg /> : h === 5 ? <TuftSvg flower /> : null}
              </div>
            );
          })}
          {/* enclos */}
          {level.goals.map(([x, y], i) => (
            <div key={`g${i}`} className="absolute" style={{ left: `${x * cellPct}%`, top: `${y * cellPct}%`, width: `${cellPct}%`, height: `${cellPct}%` }}>
              <PenSvg occupied={sheep.some((s) => eq(s, [x, y]))} />
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
