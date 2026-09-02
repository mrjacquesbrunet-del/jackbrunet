"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FR_LEVELS,
  FR_CHAPTERS,
  FR_GROUND,
  frondeStars,
  recordFronde,
  getFrondeXp,
  type FrLevel,
  type FrTarget,
  type FrObstacle,
} from "@/lib/fronde";
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
import { ArcadeShell, HubHeader, IcoPlay, IcoRefresh, IcoTrophy, IcoTarget } from "./ArcadeUI";

const AMBER = "#FCD34D";
const W = 360;
const H = 500;
const ANCHOR = { x: 62, y: 402 }; // fourche de la fronde
const GRAV = 1500;
const K = 8; // vitesse par pixel de tension
const MAX_PULL = 95;

function buzz(p: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(p);
  } catch {
    /* non supporté */
  }
}

/* =================== Écran principal =================== */

type Phase = "hub" | "play";

export function FrondeScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("hub");
  const [levelIdx, setLevelIdx] = useState(0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    setXp(getMemorizeXp() + getVfXp() + getFrondeXp() + Math.floor(getQuizCoins() / 500));
    submitGameScore("fronde", getFrondeXp());
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
  const totalStars = useMemo(() => {
    void phase;
    return FR_LEVELS.reduce((n, _, i) => n + frondeStars(i), 0);
  }, [phase]);

  if (phase === "hub") {
    return (
      <ArcadeShell>
        <HubHeader name={name} avatarUrl={avatar} level={lvl.level} xpInto={lvl.into} xpSpan={lvl.span} gems={totalStars} onGear={() => router.push("/profil")} />

        <div className="qm-hero mt-4" style={{ background: "radial-gradient(120% 120% at 100% 0%, rgba(252,211,77,.2), transparent 55%), linear-gradient(135deg,#1E1E1D 0%,#0C0C0B 100%)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/img/jeux/fronde.png")} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} className="qm-illo pointer-events-none absolute -bottom-2 -right-2 h-36 w-auto object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,.35)]" />
          <div className="relative max-w-[58%]">
            <span className="qm-rapide" style={{ background: "rgba(252,211,77,.16)", color: AMBER }}>ADRESSE</span>
            <h1 className="mt-2.5 font-game text-[2rem] font-black leading-[0.9] drop-shadow">
              LA FRONDE <span style={{ color: AMBER }}>DE DAVID</span>
            </h1>
            <p className="mt-2.5 font-game text-[13px] font-semibold leading-tight text-white/85">
              Vise, tends, lâche — et fais tomber le géant&nbsp;!
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="qm-obj flex items-center gap-3">
            <span className="qm-obj-ic"><IcoTarget className="h-6 w-6" /></span>
            <div className="min-w-0">
              <p className="font-game text-xs font-black text-teal-800">OBJECTIF</p>
              <p className="text-[11px] font-semibold leading-tight text-teal-900/80">Brise toutes les cibles, économise tes pierres.</p>
            </div>
          </div>
          <div className="qm-rec flex items-center gap-3">
            <span className="qm-rec-ic"><IcoTrophy className="h-6 w-6" /></span>
            <div className="min-w-0">
              <p className="font-game text-xs font-black text-amber-700">ÉTOILES</p>
              <p className="font-game text-2xl font-black leading-none text-[#4a2600]">{totalStars}/{FR_LEVELS.length * 3}</p>
            </div>
          </div>
        </div>

        {/* Niveaux par chapitre */}
        {FR_CHAPTERS.map((ch, ci) => {
          const to = ci + 1 < FR_CHAPTERS.length ? FR_CHAPTERS[ci + 1].from : FR_LEVELS.length;
          return (
            <div key={ch.from} className="mt-5">
              <p className="font-game text-sm font-black tracking-wide" style={{ color: AMBER }}>
                CHAPITRE {ci + 1} — {ch.title.toUpperCase()}
              </p>
              <p className="mt-1 text-[11px] italic leading-snug text-white/50">{ch.verse}</p>
              <div className="mt-2.5 grid grid-cols-5 gap-2">
                {FR_LEVELS.slice(ch.from, to).map((l, k) => {
                  const i = ch.from + k;
                  const stars = frondeStars(i);
                  const locked = i > 0 && frondeStars(i - 1) === 0;
                  const boss = l.targets.some((t) => t.type === "goliath");
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
                          : stars > 0
                            ? { background: "linear-gradient(180deg,#FCD34D,#F59E0B)", color: "#4a2600", boxShadow: "0 3px 0 #92400e" }
                            : { background: "linear-gradient(180deg,#30302F,#1E1E1D)", color: "#F3F3ED", boxShadow: "0 3px 0 rgba(0,0,0,.5)", border: boss ? "1px solid rgba(252,211,77,.5)" : "1px solid rgba(255,255,255,.12)" }
                      }
                    >
                      {locked ? (
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}><path d="M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      ) : (
                        <>
                          {boss ? <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-rose-500 px-1.5 text-[8px] font-black text-white">GÉANT</span> : null}
                          {i + 1}
                        </>
                      )}
                      {!locked && stars > 0 ? (
                        <span className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-[1px]">
                          {[1, 2, 3].map((s) => (
                            <svg key={s} viewBox="0 0 24 24" className="h-3 w-3" fill={s <= stars ? "#4a2600" : "rgba(74,38,0,.25)"} aria-hidden>
                              <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.8 6.8 20.5l1-5.8L3.5 9.2l5.9-.9z" />
                            </svg>
                          ))}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="mt-4 flex justify-center">
          <button type="button" onClick={() => router.push("/jeux")} className="qm-retour">
            <IcoRefresh className="h-4 w-4" /> RETOUR AUX JEUX
          </button>
        </div>

        <div className="mt-5">
          <ScoreBoard mode="fronde" accent={AMBER} title="Classement · La Fronde" />
        </div>
      </ArcadeShell>
    );
  }

  return (
    <FrondePlay
      levelIdx={levelIdx}
      onExit={() => {
        setPhase("hub");
        setTick((t) => t + 1);
      }}
      onNext={() => {
        if (levelIdx + 1 < FR_LEVELS.length) setLevelIdx((i) => i + 1);
        else setPhase("hub");
      }}
    />
  );
}

/* =================== La partie (canvas) =================== */

type Stone = { x: number; y: number; vx: number; vy: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number };
type LiveTarget = FrTarget & { maxHp: number; dead: boolean; wob: number };

type GameRef = {
  mode: "ready" | "drag" | "fly";
  stone: Stone;
  pull: { x: number; y: number };
  stonesLeft: number;
  used: number;
  targets: LiveTarget[];
  particles: Particle[];
  t: number;
  restMs: number;
  over: null | "win" | "fail";
};

function obstacleRect(o: FrObstacle, t: number): { x: number; y: number; w: number; h: number } {
  const oy = o.osc ? Math.sin(t * o.osc.speed) * o.osc.amp : 0;
  return { x: o.x, y: o.y + oy, w: o.w, h: o.h };
}

function FrondePlay({ levelIdx, onExit, onNext }: { levelIdx: number; onExit: () => void; onNext: () => void }) {
  const level: FrLevel = FR_LEVELS[levelIdx];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameRef | null>(null);
  const [hud, setHud] = useState({ stonesLeft: level.stones, targetsLeft: level.targets.length });
  const [over, setOver] = useState<null | { win: boolean; stars: number; xp: number }>(null);
  const overRef = useRef(false);

  // Étoiles décoratives du fond (stables pour le niveau).
  const bgStars = useMemo(
    () => Array.from({ length: 26 }, () => ({ x: Math.random() * W, y: Math.random() * 260, r: Math.random() * 1.3 + 0.4 })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [levelIdx],
  );

  const reset = useCallback(() => {
    gameRef.current = {
      mode: "ready",
      stone: { x: ANCHOR.x, y: ANCHOR.y - 6, vx: 0, vy: 0 },
      pull: { x: 0, y: 0 },
      stonesLeft: level.stones,
      used: 0,
      targets: level.targets.map((tg) => ({ ...tg, maxHp: tg.hp, dead: false, wob: 0 })),
      particles: [],
      t: 0,
      restMs: 0,
      over: null,
    };
    overRef.current = false;
    setOver(null);
    setHud({ stonesLeft: level.stones, targetsLeft: level.targets.length });
  }, [level]);

  useEffect(() => {
    reset();
  }, [reset]);

  /* ---------- Fin de niveau ---------- */
  const finish = useCallback(
    (win: boolean) => {
      if (overRef.current) return;
      overRef.current = true;
      const g = gameRef.current!;
      let stars = 0;
      if (win) {
        stars = g.used <= level.par ? 3 : g.used <= level.par + 1 ? 2 : 1;
        const res = recordFronde(levelIdx, stars);
        submitGameScore("fronde", getFrondeXp());
        submitWeeklyPoints(stars);
        bumpAchv("games_played");
        if (stars === 3) bumpAchv("perfect_games");
        markDayStreak("play");
        checkLocalBadges();
        buzz([30, 40, 90]);
        setTimeout(() => setOver({ win: true, stars, xp: res.xpGained }), 500);
      } else {
        bumpAchv("games_played");
        markDayStreak("play");
        buzz([60, 50, 60]);
        setTimeout(() => setOver({ win: false, stars: 0, xp: 0 }), 400);
      }
    },
    [level, levelIdx],
  );

  /* ---------- Boucle de jeu ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();

    const spawnParticles = (x: number, y: number, color: string, n = 14) => {
      const g = gameRef.current!;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 60 + Math.random() * 200;
        g.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80, life: 0.7, color, size: 2 + Math.random() * 3.5 });
      }
    };

    const nextStone = (g: GameRef) => {
      if (g.targets.every((tg) => tg.dead)) return; // victoire déjà en route
      if (g.stonesLeft <= 0) {
        finish(false);
        return;
      }
      g.mode = "ready";
      g.stone = { x: ANCHOR.x, y: ANCHOR.y - 6, vx: 0, vy: 0 };
      g.pull = { x: 0, y: 0 };
    };

    const update = (dt: number) => {
      const g = gameRef.current;
      if (!g || overRef.current) return;
      g.t += dt;
      // Particules
      g.particles = g.particles.filter((p) => {
        p.life -= dt;
        p.vy += 900 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        return p.life > 0;
      });
      for (const tg of g.targets) tg.wob = Math.max(0, tg.wob - dt * 3);

      if (g.mode !== "fly") return;
      const s = g.stone;
      const r = 7;
      // sous-pas pour ne pas traverser les cibles à grande vitesse
      const steps = 3;
      for (let step = 0; step < steps; step++) {
        const sdt = dt / steps;
        s.vy += GRAV * sdt;
        s.x += s.vx * sdt;
        s.y += s.vy * sdt;

        // Sol
        if (s.y + r > FR_GROUND) {
          s.y = FR_GROUND - r;
          if (Math.abs(s.vy) > 90) {
            s.vy *= -0.42;
            s.vx *= 0.85;
          } else {
            s.vy = 0;
            s.vx *= 0.9;
          }
        }
        // Obstacles (poutres)
        for (const o of level.obstacles) {
          const rect = obstacleRect(o, g.t);
          const cx = Math.max(rect.x, Math.min(s.x, rect.x + rect.w));
          const cy = Math.max(rect.y, Math.min(s.y, rect.y + rect.h));
          const dx = s.x - cx;
          const dy = s.y - cy;
          if (dx * dx + dy * dy < r * r) {
            // axe de pénétration dominant
            if (Math.abs(dx) > Math.abs(dy)) {
              s.x = cx + Math.sign(dx || 1) * r;
              s.vx *= -0.45;
            } else {
              s.y = cy + Math.sign(dy || 1) * r;
              s.vy *= -0.45;
            }
          }
        }
        // Cibles
        for (const tg of g.targets) {
          if (tg.dead) continue;
          const dx = s.x - tg.x;
          const dy = s.y - tg.y;
          if (dx * dx + dy * dy < (tg.r + r) * (tg.r + r)) {
            tg.hp -= 1;
            tg.wob = 1;
            const color = tg.type === "jarre" ? "#f59e0b" : tg.type === "bouclier" ? "#cbd5e1" : "#b45309";
            spawnParticles(tg.x, tg.y, color, tg.type === "goliath" ? 20 : 14);
            buzz(20);
            if (tg.hp <= 0) {
              tg.dead = true;
              spawnParticles(tg.x, tg.y, color, 22);
            }
            s.vx *= 0.5;
            s.vy *= 0.55;
            if (g.targets.every((x) => x.dead)) {
              setHud({ stonesLeft: g.stonesLeft, targetsLeft: 0 });
              finish(true);
              return;
            }
          }
        }
      }
      setHud((h) =>
        h.targetsLeft !== g.targets.filter((x) => !x.dead).length || h.stonesLeft !== g.stonesLeft
          ? { stonesLeft: g.stonesLeft, targetsLeft: g.targets.filter((x) => !x.dead).length }
          : h,
      );
      // Pierre morte ?
      const slow = Math.abs(s.vx) < 25 && Math.abs(s.vy) < 25 && s.y + r >= FR_GROUND - 1;
      const out = s.x < -40 || s.x > W + 40 || s.y > H + 60;
      if (slow || out) {
        g.restMs += dt * 1000;
        if (g.restMs > (out ? 0 : 350)) {
          g.restMs = 0;
          nextStone(g);
        }
      } else {
        g.restMs = 0;
      }
    };

    const draw = () => {
      const g = gameRef.current;
      if (!g) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cw = canvas.clientWidth;
      const chh = (cw * H) / W;
      if (canvas.width !== Math.round(cw * dpr)) {
        canvas.width = Math.round(cw * dpr);
        canvas.height = Math.round(chh * dpr);
      }
      const sc = (cw / W) * dpr;
      ctx.setTransform(sc, 0, 0, sc, 0, 0);

      // Ciel
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#171716");
      sky.addColorStop(0.65, "#26261f");
      sky.addColorStop(1, "#30302F");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(243,243,237,.55)";
      for (const st of bgStars) {
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Collines
      ctx.fillStyle = "#1E1E1D";
      ctx.beginPath();
      ctx.moveTo(0, 330);
      ctx.quadraticCurveTo(90, 270, 200, 320);
      ctx.quadraticCurveTo(300, 360, 360, 310);
      ctx.lineTo(360, H);
      ctx.lineTo(0, H);
      ctx.fill();
      // Sol
      ctx.fillStyle = "#3a2f18";
      ctx.fillRect(0, FR_GROUND, W, H - FR_GROUND);
      ctx.fillStyle = "rgba(202,240,0,.16)";
      ctx.fillRect(0, FR_GROUND, W, 3);

      // Obstacles
      for (const o of level.obstacles) {
        const rct = obstacleRect(o, g.t);
        ctx.fillStyle = "#6b4a26";
        ctx.strokeStyle = "#402a12";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(rct.x, rct.y, rct.w, rct.h, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,.12)";
        ctx.fillRect(rct.x + 2, rct.y + 2, rct.w - 4, 2.5);
      }

      // Cibles
      for (const tg of g.targets) {
        if (tg.dead) continue;
        const wob = Math.sin(g.t * 40) * tg.wob * 2.5;
        ctx.save();
        ctx.translate(tg.x + wob, tg.y);
        if (tg.type === "jarre") drawJar(ctx, tg.r);
        else if (tg.type === "bouclier") drawShield(ctx, tg.r, tg.hp < tg.maxHp);
        else drawGoliath(ctx, tg.r, tg.hp, tg.maxHp);
        ctx.restore();
      }

      // Fronde (fourche en Y)
      ctx.strokeStyle = "#7a5230";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(ANCHOR.x, FR_GROUND);
      ctx.lineTo(ANCHOR.x, ANCHOR.y + 18);
      ctx.moveTo(ANCHOR.x, ANCHOR.y + 18);
      ctx.lineTo(ANCHOR.x - 13, ANCHOR.y - 8);
      ctx.moveTo(ANCHOR.x, ANCHOR.y + 18);
      ctx.lineTo(ANCHOR.x + 13, ANCHOR.y - 8);
      ctx.stroke();

      const stonePos =
        g.mode === "drag"
          ? { x: ANCHOR.x + g.pull.x, y: ANCHOR.y + g.pull.y }
          : { x: g.stone.x, y: g.stone.y };

      // Élastiques
      if (g.mode !== "fly") {
        ctx.strokeStyle = "#caa06a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ANCHOR.x - 13, ANCHOR.y - 8);
        ctx.lineTo(stonePos.x, stonePos.y);
        ctx.lineTo(ANCHOR.x + 13, ANCHOR.y - 8);
        ctx.stroke();
      }

      // Prévisualisation de la trajectoire
      if (g.mode === "drag") {
        const vx = -g.pull.x * K;
        const vy = -g.pull.y * K;
        ctx.fillStyle = "rgba(243,243,237,.5)";
        let px = stonePos.x;
        let py = stonePos.y;
        let pvx = vx;
        let pvy = vy;
        for (let i = 0; i < 22; i++) {
          const ddt = 0.045;
          pvy += GRAV * ddt;
          px += pvx * ddt;
          py += pvy * ddt;
          if (py > FR_GROUND) break;
          ctx.beginPath();
          ctx.arc(px, py, Math.max(1.4, 3 - i * 0.08), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Pierre
      ctx.beginPath();
      ctx.arc(stonePos.x, stonePos.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#9ca3af";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(stonePos.x - 2, stonePos.y - 2.5, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,.5)";
      ctx.fill();

      // Particules
      for (const p of g.particles) {
        ctx.globalAlpha = Math.max(0, p.life / 0.7);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;

      // Pierres restantes (petits cailloux au pied de la fronde)
      for (let i = 0; i < g.stonesLeft - (g.mode === "fly" ? 0 : 1); i++) {
        ctx.beginPath();
        ctx.arc(20 + i * 14, FR_GROUND - 6, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#6b7280";
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      update(dt);
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [level, bgStars, finish]);

  /* ---------- Doigt : viser / tendre / lâcher ---------- */
  const toWorld = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * W, y: ((e.clientY - rect.top) / rect.height) * H };
  };

  function onDown(e: React.PointerEvent) {
    const g = gameRef.current;
    if (!g || g.mode !== "ready" || overRef.current) return;
    const p = toWorld(e);
    const dx = p.x - ANCHOR.x;
    const dy = p.y - ANCHOR.y;
    if (dx * dx + dy * dy < 90 * 90) {
      g.mode = "drag";
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  }
  function onMove(e: React.PointerEvent) {
    const g = gameRef.current;
    if (!g || g.mode !== "drag") return;
    const p = toWorld(e);
    let dx = p.x - ANCHOR.x;
    let dy = p.y - ANCHOR.y;
    const len = Math.hypot(dx, dy);
    if (len > MAX_PULL) {
      dx = (dx / len) * MAX_PULL;
      dy = (dy / len) * MAX_PULL;
    }
    g.pull = { x: dx, y: dy };
  }
  function onUp() {
    const g = gameRef.current;
    if (!g || g.mode !== "drag") return;
    const len = Math.hypot(g.pull.x, g.pull.y);
    if (len < 14) {
      g.mode = "ready";
      g.pull = { x: 0, y: 0 };
      return;
    }
    g.stone = { x: ANCHOR.x + g.pull.x, y: ANCHOR.y + g.pull.y, vx: -g.pull.x * K, vy: -g.pull.y * K };
    g.mode = "fly";
    g.stonesLeft -= 1;
    g.used += 1;
    setHud({ stonesLeft: g.stonesLeft, targetsLeft: g.targets.filter((t) => !t.dead).length });
    buzz(18);
  }

  const boss = level.targets.some((t) => t.type === "goliath");

  return (
    <ArcadeShell>
      <div className="flex items-center justify-between">
        <button type="button" onClick={onExit} className="flex items-center gap-1.5 font-game text-sm font-bold text-white/70">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}><path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Niveaux
        </button>
        <p className="font-game text-base font-black">
          NIVEAU <span style={{ color: AMBER }}>{levelIdx + 1}</span>
          {boss ? <span className="ml-1.5 rounded-full bg-rose-500 px-2 py-0.5 align-middle text-[9px] font-black text-white">GÉANT</span> : null}
        </p>
        <p className="font-game text-sm font-bold text-white/70">
          {hud.stonesLeft} pierre{hud.stonesLeft > 1 ? "s" : ""} · {hud.targetsLeft} cible{hud.targetsLeft > 1 ? "s" : ""}
        </p>
      </div>

      <canvas
        ref={canvasRef}
        className="mt-3 w-full touch-none select-none rounded-3xl border border-white/10"
        style={{ aspectRatio: `${W} / ${H}` }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />
      <p className="mt-2 text-center text-[11px] font-semibold text-white/45">
        Pose le doigt sur la pierre, tire vers l&apos;arrière pour viser, lâche pour tirer.
      </p>
      <div className="mt-2 flex justify-center">
        <button type="button" onClick={reset} className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 font-game text-xs font-black text-white/80">
          <IcoRefresh className="h-3.5 w-3.5" /> Recommencer le niveau
        </button>
      </div>

      {/* Fin de niveau */}
      {over ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-night-950/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs rounded-3xl border border-white/10 bg-night-900 p-6 text-center" style={{ animation: "qm-optin .35s ease-out" }}>
            {over.win ? (
              <>
                <p className="font-game text-xl font-black" style={{ color: AMBER }}>
                  {boss ? "LE GÉANT EST TOMBÉ !" : "NIVEAU RÉUSSI !"}
                </p>
                <div className="mt-3 flex justify-center gap-1.5">
                  {[1, 2, 3].map((s) => (
                    <svg key={s} viewBox="0 0 24 24" className="h-10 w-10" fill={s <= over.stars ? "#FCD34D" : "rgba(243,243,237,.15)"} aria-hidden>
                      <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.8 6.8 20.5l1-5.8L3.5 9.2l5.9-.9z" />
                    </svg>
                  ))}
                </div>
                {over.xp > 0 ? <p className="mt-2 font-game text-sm font-black text-amber-300">+{over.xp} XP</p> : null}
                {boss ? (
                  <p className="mt-2 text-xs italic leading-snug text-white/60">
                    « C'est l'Éternel qui donne la victoire. » — 1 Samuel 17:47
                  </p>
                ) : null}
                <div className="mt-5 flex flex-col gap-2">
                  {levelIdx + 1 < FR_LEVELS.length ? (
                    <button type="button" onClick={onNext} className="w-full rounded-full py-3 font-game text-base font-black text-[#4a2600]" style={{ background: "linear-gradient(180deg,#FCD34D,#F59E0B)", boxShadow: "0 4px 0 #92400e" }}>
                      NIVEAU SUIVANT
                    </button>
                  ) : null}
                  {over.stars < 3 ? (
                    <button type="button" onClick={reset} className="w-full rounded-full border border-amber-400/50 py-3 font-game text-sm font-black text-amber-300">
                      RETENTER LES 3 ÉTOILES
                    </button>
                  ) : null}
                  <button type="button" onClick={onExit} className="w-full py-1 font-game text-sm font-bold text-white/55">
                    Retour aux niveaux
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="font-game text-xl font-black text-rose-300">PLUS DE PIERRES…</p>
                <p className="mt-2 text-sm text-white/70">Il reste {hud.targetsLeft} cible{hud.targetsLeft > 1 ? "s" : ""} — retente ta chance !</p>
                <div className="mt-5 flex flex-col gap-2">
                  <button type="button" onClick={reset} className="w-full rounded-full py-3 font-game text-base font-black text-[#4a2600]" style={{ background: "linear-gradient(180deg,#FCD34D,#F59E0B)", boxShadow: "0 4px 0 #92400e" }}>
                    <span className="inline-flex items-center gap-1.5"><IcoPlay className="h-4 w-4" /> REJOUER</span>
                  </button>
                  <button type="button" onClick={onExit} className="w-full py-1 font-game text-sm font-bold text-white/55">
                    Retour aux niveaux
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </ArcadeShell>
  );
}

/* ---------- Dessin des cibles ---------- */

function drawJar(ctx: CanvasRenderingContext2D, r: number) {
  ctx.fillStyle = "#d97706";
  ctx.strokeStyle = "#7c2d12";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, r * 0.15, r * 0.85, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // col
  ctx.fillStyle = "#b45309";
  ctx.beginPath();
  ctx.roundRect(-r * 0.4, -r * 1.05, r * 0.8, r * 0.42, 3);
  ctx.fill();
  ctx.stroke();
  // reflet
  ctx.fillStyle = "rgba(255,255,255,.25)";
  ctx.beginPath();
  ctx.ellipse(-r * 0.3, -r * 0.1, r * 0.16, r * 0.42, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawShield(ctx: CanvasRenderingContext2D, r: number, cracked: boolean) {
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.2, 0, 0, r);
  grad.addColorStop(0, "#e2e8f0");
  grad.addColorStop(1, "#64748b");
  ctx.fillStyle = grad;
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#94a3b8";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (cracked) {
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, -r * 0.5);
    ctx.lineTo(-r * 0.15, 0);
    ctx.lineTo(-r * 0.5, r * 0.45);
    ctx.moveTo(-r * 0.15, 0);
    ctx.lineTo(r * 0.3, r * 0.2);
    ctx.stroke();
  }
}

function drawGoliath(ctx: CanvasRenderingContext2D, r: number, hp: number, maxHp: number) {
  // tête
  ctx.fillStyle = "#d4a373";
  ctx.strokeStyle = "#57351a";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // casque de bronze
  ctx.fillStyle = "#a16207";
  ctx.beginPath();
  ctx.arc(0, -r * 0.18, r, Math.PI, 0);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#854d0e";
  ctx.beginPath();
  ctx.roundRect(-r * 0.16, -r * 1.35, r * 0.32, r * 0.5, 3);
  ctx.fill();
  // yeux froncés
  ctx.strokeStyle = "#3b2409";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-r * 0.55, -r * 0.05);
  ctx.lineTo(-r * 0.2, r * 0.08);
  ctx.moveTo(r * 0.55, -r * 0.05);
  ctx.lineTo(r * 0.2, r * 0.08);
  ctx.stroke();
  ctx.fillStyle = "#171716";
  ctx.beginPath();
  ctx.arc(-r * 0.34, r * 0.16, r * 0.09, 0, Math.PI * 2);
  ctx.arc(r * 0.34, r * 0.16, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  // bouche
  ctx.strokeStyle = "#57351a";
  ctx.beginPath();
  ctx.arc(0, r * 0.62, r * 0.28, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  // barre de vie
  const bw = r * 1.7;
  ctx.fillStyle = "rgba(0,0,0,.45)";
  ctx.beginPath();
  ctx.roundRect(-bw / 2, -r - 16, bw, 7, 4);
  ctx.fill();
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.roundRect(-bw / 2, -r - 16, bw * (hp / maxHp), 7, 4);
  ctx.fill();
}
