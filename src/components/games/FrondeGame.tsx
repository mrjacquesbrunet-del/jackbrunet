"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FrondeEngine, SCREEN_W, SCREEN_H } from "@/lib/fronde-engine/engine";
import { FRONDE_LEVELS } from "@/lib/fronde-engine/levels";
import { renderFrame, IMG_SLOTS, type GameImages } from "@/lib/fronde-engine/render";
import { primeFrondeSfx } from "@/lib/fronde-engine/sfx";
import type { HudSnapshot } from "@/lib/fronde-engine/types";
import { recordFronde, getFrondeXp, updateFrondeHighScore, getFrondeHighScore } from "@/lib/fronde";
import { submitGameScore, submitWeeklyPoints } from "@/lib/game-scores";
import { bumpAchv, markDayStreak } from "@/lib/achievements";
import { checkLocalBadges } from "@/lib/badges";
import { asset } from "@/lib/asset";
import { IcoPlay, IcoRefresh } from "./ArcadeUI";

const AMBER = "#FCD34D";

/**
 * Coquille React de La Fronde : héberge le canvas + le HUD, branche le
 * moteur (fronde-engine) sur les systèmes de l'app (XP, ligue, badges,
 * meilleur score). Aucune logique de gameplay ici.
 */
export function FrondeGame({ levelIdx, onExit, onNext }: { levelIdx: number; onExit: () => void; onNext: () => void }) {
  const level = FRONDE_LEVELS[levelIdx];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const powerRef = useRef<HTMLDivElement>(null);
  const windTxtRef = useRef<HTMLSpanElement>(null);
  const windArrowRef = useRef<HTMLSpanElement>(null);
  const engRef = useRef<FrondeEngine | null>(null);
  const [hud, setHud] = useState<HudSnapshot | null>(null);
  const [resultXp, setResultXp] = useState(0);
  const [newRecord, setNewRecord] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [hintSeq, setHintSeq] = useState(0);
  const [imgs, setImgs] = useState<GameImages>({});
  const imgsRef = useRef(imgs);
  imgsRef.current = imgs;

  // Habillage optionnel (images Magnific) : chargées si présentes.
  useEffect(() => {
    for (const slot of IMG_SLOTS) {
      const im = new Image();
      im.onload = () => setImgs((m) => ({ ...m, [slot]: im }));
      im.src = asset(`/img/jeux/fronde/${slot}.png`);
    }
  }, []);

  const clouds = useMemo(
    () => Array.from({ length: 4 }, (_, i) => ({ x: 30 + i * 95 + Math.random() * 40, y: 26 + Math.random() * 60, s: 0.7 + Math.random() * 0.7 })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [levelIdx],
  );

  /** (Re)démarre le niveau : nouveau moteur, callbacks branchés sur l'app. */
  const start = useCallback(() => {
    setResultXp(0);
    setNewRecord(false);
    engRef.current = new FrondeEngine(
      level,
      {
        haptic: (p) => {
          try {
            if ("vibrate" in navigator) navigator.vibrate(p);
          } catch {
            /* non supporté */
          }
        },
        onLevelComplete: ({ score, stars }) => {
          const res = recordFronde(levelIdx, stars);
          setResultXp(res.xpGained);
          submitGameScore("fronde", getFrondeXp());
          submitWeeklyPoints(stars);
          bumpAchv("games_played");
          if (stars === 3) bumpAchv("perfect_games");
          markDayStreak("play");
          checkLocalBadges();
          if (updateFrondeHighScore(score)) setNewRecord(true);
        },
        onHighScoreUpdated: () => undefined,
        onGameOver: () => {
          bumpAchv("games_played");
          markDayStreak("play");
        },
      },
      (h) => setHud({ ...h }),
    );
  }, [level, levelIdx]);

  useEffect(() => {
    start();
    setHintSeq((s) => s + 1);
  }, [start]);

  // Conseil de début de niveau (vent fort, balancier, oiseaux) — 3 s.
  useEffect(() => {
    let msg: string | null = null;
    if (level.windStrength >= 2.5) msg = `VENT FORT ! VISE PLUS À ${level.windDirection === 1 ? "GAUCHE" : "DROITE"}`;
    else if (level.obstacles?.some((o) => o.kind === "log")) msg = "ATTENTION AU BALANCIER !";
    else if (level.obstacles?.some((o) => o.kind === "birds")) msg = "DES OISEAUX PASSENT — CHOISIS TON MOMENT !";
    setHint(msg);
    if (msg) {
      const t = setTimeout(() => setHint(null), 3400);
      return () => clearTimeout(t);
    }
  }, [level, hintSeq]);

  /* ---------- Boucle rendu + jauges ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const eng = engRef.current;
      if (eng) {
        eng.update(dt);
        // mise à l'échelle
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const cw = canvas.clientWidth;
        if (canvas.width !== Math.round(cw * dpr)) {
          canvas.width = Math.round(cw * dpr);
          canvas.height = Math.round(((cw * SCREEN_H) / SCREEN_W) * dpr);
        }
        const sc = (cw / SCREEN_W) * dpr;
        ctx.setTransform(sc, 0, 0, sc, 0, 0);
        renderFrame(ctx, eng, imgsRef.current, { clouds });
        // jauges DOM (pas de re-render React à 60 fps)
        const wind = eng.wind();
        if (windTxtRef.current) windTxtRef.current.textContent = `${Math.abs(wind).toFixed(1)} m/s`;
        if (windArrowRef.current) windArrowRef.current.style.transform = `scaleX(${wind >= 0 ? 1 : -1})`;
        if (powerRef.current) powerRef.current.style.height = `${Math.round(eng.pullRatio() * 100)}%`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [clouds]);

  /* ---------- Entrées ---------- */
  const toWorld = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * SCREEN_W, y: ((e.clientY - rect.top) / rect.height) * SCREEN_H };
  };

  const state = hud?.state ?? "ready";
  const showResult = state === "levelComplete" || state === "gameOver";
  const boss = level.targets.some((t) => t.type === "giant");
  const totalRequired = level.targets.filter((t) => t.type !== "bonus").length;

  return (
    <div className="relative mx-auto min-h-[100dvh] w-full max-w-md px-3 pb-6 pt-[calc(0.6rem+env(safe-area-inset-top))]">
      <div className="relative overflow-hidden rounded-3xl border border-black/20 shadow-2xl">
        <canvas
          ref={canvasRef}
          className="block w-full touch-none select-none"
          style={{ aspectRatio: `${SCREEN_W} / ${SCREEN_H}` }}
          onPointerDown={(e) => {
            primeFrondeSfx();
            const p = toWorld(e);
            engRef.current?.pointerDown(p.x, p.y);
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const p = toWorld(e);
            engRef.current?.pointerMove(p.x, p.y);
          }}
          onPointerUp={() => engRef.current?.pointerUp()}
          onPointerCancel={() => engRef.current?.pointerUp()}
        />

        {/* NIVEAU + progression des cibles (style maquette) */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          <div className="rounded-2xl px-3.5 py-2 text-center shadow-lg" style={{ background: "linear-gradient(180deg,#7c3aed,#5b21b6)", border: "2px solid #a78bfa" }}>
            <p className="font-game text-[9px] font-black uppercase tracking-widest text-white/85">Niveau</p>
            <p className="-mt-0.5 font-game text-xl font-black text-amber-300">{levelIdx + 1}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-black/45 px-2.5 py-1 shadow">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
              <circle cx="12" cy="12" r="9" fill="#e23c33" />
              <circle cx="12" cy="12" r="5.5" fill="#f6efdd" />
              <circle cx="12" cy="12" r="2.5" fill="#e23c33" />
            </svg>
            <span className="font-game text-[11px] font-black text-white">
              {totalRequired - (hud?.targetsLeft ?? totalRequired)}/{totalRequired}
            </span>
          </div>
        </div>

        {/* Score + combo */}
        <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-2xl bg-black/35 px-4 py-1.5 text-center shadow">
          <p className="font-game text-base font-black leading-tight text-white">{hud?.score ?? 0}</p>
          {hud && hud.combo >= 2 ? <p className="font-game text-[10px] font-black leading-tight text-[#CAF000]">COMBO ×{hud.combo}</p> : null}
        </div>

        {/* Barre de vie du GÉANT (boss) */}
        {hud?.bossHp ? (
          <div className="pointer-events-none absolute left-1/2 top-[3.6rem] w-56 -translate-x-1/2 rounded-2xl px-3 py-1.5 shadow-lg" style={{ background: "rgba(12,12,11,.72)", border: "2px solid #a78bfa" }}>
            <p className="text-center font-game text-[9px] font-black uppercase tracking-[0.2em] text-white/85">Géant Philistin</p>
            <div className="mt-1 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="#ef4444" aria-hidden><path d="M12 20s-7-4.6-9.2-9C1.3 8 3 5 6 5c1.8 0 3.2 1 3.99 2C10.8 6 12.2 5 14 5c3 0 4.7 3 3.2 6-2.2 4.4-9.2 9-9.2 9z" /></svg>
              <div className="flex h-2.5 flex-1 gap-[3px]">
                {Array.from({ length: hud.bossHp.max }, (_, i) => (
                  <span key={i} className="flex-1 rounded-sm" style={{ background: i < hud.bossHp!.hp ? "linear-gradient(180deg,#f87171,#dc2626)" : "rgba(255,255,255,.15)" }} />
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Pause */}
        <button type="button" onClick={() => { engRef.current?.togglePause(); }} aria-label="Pause" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-2xl shadow-lg" style={{ background: "linear-gradient(180deg,#7c3aed,#5b21b6)", border: "2px solid #a78bfa" }}>
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
        </button>

        {/* Vent */}
        <div className="pointer-events-none absolute right-3 top-[4.5rem] w-[4.6rem] rounded-2xl p-2 text-center shadow-lg" style={{ background: "linear-gradient(180deg,#7c3aed,#5b21b6)", border: "2px solid #a78bfa" }}>
          <p className="font-game text-[9px] font-black uppercase tracking-widest text-white/85">Vent</p>
          <span ref={windArrowRef} className="mt-0.5 inline-block text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h13M12 6l6 6-6 6" />
            </svg>
          </span>
          <p className="rounded-lg bg-black/30 py-0.5 font-game text-[10px] font-black text-white"><span ref={windTxtRef}>0.0 m/s</span></p>
        </div>

        {/* Jauge de puissance */}
        <div className="pointer-events-none absolute bottom-16 right-3 h-36 w-5 overflow-hidden rounded-full border-2 border-[#a78bfa] bg-black/35 shadow-lg">
          <div className="absolute inset-x-0 bottom-0" ref={powerRef} style={{ height: "0%", background: "linear-gradient(0deg,#4ade80,#facc15 55%,#ef4444)" }} />
        </div>

        {/* Pierres */}
        <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-2xl px-3 py-2 shadow-lg" style={{ background: "linear-gradient(180deg,#7c3aed,#5b21b6)", border: "2px solid #a78bfa" }}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#b9a8d8" aria-hidden><path d="M12 3l6 3 3 6-4 7-7 2-6-4-1-7 4-5z" /></svg>
          <span className="font-game text-base font-black text-white">×{hud?.ammo ?? level.maxAmmo}</span>
        </div>

        {/* Conseil de début de niveau (vent fort, balancier, oiseaux) */}
        {hint && !showResult && state !== "paused" ? (
          <div className="pointer-events-none absolute inset-x-6 bottom-4 flex justify-center">
            <p className="rounded-2xl px-4 py-2 text-center font-game text-[12px] font-black uppercase tracking-wide text-white shadow-lg" style={{ background: "linear-gradient(180deg,#7c3aedE6,#5b21b6E6)", border: "2px solid #a78bfa", animation: "qm-optin .3s ease-out" }}>
              {hint}
            </p>
          </div>
        ) : null}

        {/* Tutoriel du premier niveau (style maquette) */}
        {levelIdx === 0 && !hint && hud && hud.score === 0 && (state === "ready" || state === "aiming") ? (
          <div className="pointer-events-none absolute inset-x-6 bottom-4 flex justify-center">
            <p className="rounded-2xl px-4 py-2 text-center font-game text-[12px] font-black uppercase tracking-wide text-white shadow-lg" style={{ background: "linear-gradient(180deg,#7c3aedE6,#5b21b6E6)", border: "2px solid #a78bfa" }}>
              {state === "aiming" ? "Plus tu tires, plus c'est puissant !" : "Tire pour viser"}
            </p>
          </div>
        ) : null}

        {/* Pause overlay */}
        {state === "paused" ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-night-950/70 backdrop-blur-sm">
            <div className="w-56 rounded-3xl border border-white/10 bg-night-900 p-5 text-center text-cream">
              <p className="font-game text-lg font-black">PAUSE</p>
              <button type="button" onClick={() => engRef.current?.togglePause()} className="mt-4 w-full rounded-full py-2.5 font-game text-sm font-black text-[#4a2600]" style={{ background: "linear-gradient(180deg,#FCD34D,#F59E0B)" }}>
                REPRENDRE
              </button>
              <button type="button" onClick={start} className="mt-2 w-full rounded-full border border-white/20 py-2.5 font-game text-sm font-black text-cream/85">
                RECOMMENCER
              </button>
              <button type="button" onClick={onExit} className="mt-2 w-full py-1 font-game text-xs font-bold text-cream/55">
                Quitter le niveau
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <p className="mt-2 text-center text-[11px] font-semibold text-white/55">
        Pose le doigt sur la pierre, tire VERS LE BAS pour tendre, sur les côtés pour viser — lâche pour tirer. Le vent dévie la pierre&nbsp;!
      </p>

      {/* Résultat */}
      {showResult && hud ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-night-950/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs rounded-3xl border border-white/10 bg-night-900 p-6 text-center text-cream" style={{ animation: "qm-optin .35s ease-out" }}>
            {state === "levelComplete" ? (
              <>
                <p className="font-game text-xl font-black" style={{ color: AMBER }}>
                  {boss ? "LE GÉANT EST TOMBÉ !" : "NIVEAU RÉUSSI !"}
                </p>
                <p className="mt-2 font-game text-3xl font-black text-white">{hud.score}</p>
                <p className="text-[11px] font-bold text-cream/55">
                  points{newRecord ? " · NOUVEAU RECORD !" : ` · record ${getFrondeHighScore()}`}
                </p>
                <div className="mt-3 flex justify-center gap-1.5">
                  {[1, 2, 3].map((s) => (
                    <svg key={s} viewBox="0 0 24 24" className="h-10 w-10" fill={s <= hud.stars ? "#FCD34D" : "rgba(243,243,237,.15)"} aria-hidden>
                      <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.8 6.8 20.5l1-5.8L3.5 9.2l5.9-.9z" />
                    </svg>
                  ))}
                </div>
                {resultXp > 0 ? <p className="mt-2 font-game text-sm font-black text-amber-300">+{resultXp} XP</p> : null}
                {boss ? (
                  <p className="mt-2 text-xs italic leading-snug text-cream/60">« C'est l'Éternel qui donne la victoire. » — 1 Samuel 17:47</p>
                ) : null}
                <div className="mt-5 flex flex-col gap-2">
                  {levelIdx + 1 < FRONDE_LEVELS.length ? (
                    <button type="button" onClick={onNext} className="w-full rounded-full py-3 font-game text-base font-black text-[#4a2600]" style={{ background: "linear-gradient(180deg,#FCD34D,#F59E0B)", boxShadow: "0 4px 0 #92400e" }}>
                      NIVEAU SUIVANT
                    </button>
                  ) : null}
                  {hud.stars < 3 ? (
                    <button type="button" onClick={start} className="w-full rounded-full border border-amber-400/50 py-3 font-game text-sm font-black text-amber-300">
                      RETENTER LES 3 ÉTOILES
                    </button>
                  ) : null}
                  <button type="button" onClick={onExit} className="w-full py-1 font-game text-sm font-bold text-cream/55">
                    Retour aux niveaux
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="font-game text-xl font-black text-rose-300">PLUS DE PIERRES…</p>
                <p className="mt-2 text-sm text-cream/70">
                  Score {hud.score} — il restait {hud.targetsLeft} cible{hud.targetsLeft > 1 ? "s" : ""}. Retente ta chance !
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <button type="button" onClick={start} className="w-full rounded-full py-3 font-game text-base font-black text-[#4a2600]" style={{ background: "linear-gradient(180deg,#FCD34D,#F59E0B)", boxShadow: "0 4px 0 #92400e" }}>
                    <span className="inline-flex items-center justify-center gap-1.5"><IcoPlay className="h-4 w-4" /> REJOUER</span>
                  </button>
                  <button type="button" onClick={onExit} className="w-full py-1 font-game text-sm font-bold text-cream/55">
                    Retour aux niveaux
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-2 flex justify-center">
        <button type="button" onClick={start} className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 font-game text-xs font-black text-white/80">
          <IcoRefresh className="h-3.5 w-3.5" /> Recommencer le niveau
        </button>
      </div>
    </div>
  );
}
