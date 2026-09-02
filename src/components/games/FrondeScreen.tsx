"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FR_LEVELS,
  FR_CHAPTERS,
  frondeStars,
  recordFronde,
  getFrondeXp,
  type FrLevel,
  type FrGuard,
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
const H = 480;
/** Fourche de la fronde (première personne, bas de l'écran). */
const FORK_L = { x: 136, y: 400 };
const FORK_R = { x: 224, y: 400 };
const POUCH_REST = { x: 180, y: 428 };

function buzz(p: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(p);
  } catch {
    /* non supporté */
  }
}

/* ---------- Perspective : profondeur → écran ---------- */

/** Largeur du demi-chemin à la profondeur d. */
const halfW = (d: number) => 165 - d * 112;
/** Position écran d'un point (u 0..1, d 0..1) posé au sol. */
function groundPos(u: number, d: number): { x: number; y: number } {
  return { x: 180 + (u - 0.5) * 2 * halfW(d), y: 424 - d * 222 };
}
/** Échelle visuelle à la profondeur d. */
const scaleAt = (d: number) => 1.12 - d * 0.76;

/* ---------- Images optionnelles (habillage Magnific) ---------- */

const IMG_SLOTS = ["decor", "fronde", "cible", "loup", "lion", "ours", "geant"] as const;
type ImgSlot = (typeof IMG_SLOTS)[number];

function useGameImages(): Record<ImgSlot, HTMLImageElement | null> {
  const [imgs, setImgs] = useState<Record<ImgSlot, HTMLImageElement | null>>({
    decor: null, fronde: null, cible: null, loup: null, lion: null, ours: null, geant: null,
  });
  useEffect(() => {
    for (const slot of IMG_SLOTS) {
      const im = new Image();
      im.onload = () => setImgs((m) => ({ ...m, [slot]: im }));
      im.src = asset(`/img/jeux/fronde/${slot}.png`);
    }
  }, []);
  return imgs;
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
              Vise, tends, lâche — attention au vent&nbsp;!
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="qm-obj flex items-center gap-3">
            <span className="qm-obj-ic"><IcoTarget className="h-6 w-6" /></span>
            <div className="min-w-0">
              <p className="font-game text-xs font-black text-teal-800">OBJECTIF</p>
              <p className="text-[11px] font-semibold leading-tight text-teal-900/80">Touche toutes les cibles, économise tes pierres.</p>
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
                  const boss = l.targets.some((t) => t.guard === "geant");
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

/* =================== La partie (canvas première personne) =================== */

type LiveTarget = {
  u: number;
  d: number;
  hp: number;
  maxHp: number;
  guard?: FrGuard;
  move?: { amp: number; speed: number; phase: number };
  dead: boolean;
  wob: number;
};

type Shot = {
  t: number; // 0..1
  dur: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  arc: number;
  windDrift: number; // décalage x total dû au vent
  depth: number;
  landU: number;
};

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number };

type GameRef = {
  targets: LiveTarget[];
  stonesLeft: number;
  used: number;
  drag: null | { sx: number; sy: number; cx: number; cy: number };
  shot: Shot | null;
  particles: Particle[];
  t: number;
  windPhase: number;
  windDir: 1 | -1;
  paused: boolean;
  done: boolean;
};

function FrondePlay({ levelIdx, onExit, onNext }: { levelIdx: number; onExit: () => void; onNext: () => void }) {
  const level: FrLevel = FR_LEVELS[levelIdx];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const powerRef = useRef<HTMLDivElement>(null);
  const windTxtRef = useRef<HTMLSpanElement>(null);
  const windArrowRef = useRef<HTMLSpanElement>(null);
  const g = useRef<GameRef | null>(null);
  const imgs = useGameImages();
  const imgsRef = useRef(imgs);
  imgsRef.current = imgs;

  const [hud, setHud] = useState({ stones: level.stones, targets: level.targets.length });
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState<null | { win: boolean; stars: number; xp: number }>(null);
  const overRef = useRef(false);

  const clouds = useMemo(
    () => Array.from({ length: 4 }, (_, i) => ({ x: 40 + i * 90 + Math.random() * 40, y: 28 + Math.random() * 55, s: 0.7 + Math.random() * 0.7 })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [levelIdx],
  );

  const reset = useCallback(() => {
    g.current = {
      targets: level.targets.map((t) => ({
        u: t.u, d: t.d, hp: t.hp, maxHp: t.hp, guard: t.guard,
        move: t.move ? { ...t.move, phase: Math.random() * Math.PI * 2 } : undefined,
        dead: false, wob: 0,
      })),
      stonesLeft: level.stones,
      used: 0,
      drag: null,
      shot: null,
      particles: [],
      t: 0,
      windPhase: Math.random() * Math.PI * 2,
      windDir: Math.random() < 0.5 ? 1 : -1,
      paused: false,
      done: false,
    };
    overRef.current = false;
    setOver(null);
    setPaused(false);
    setHud({ stones: level.stones, targets: level.targets.length });
  }, [level]);

  useEffect(() => {
    reset();
  }, [reset]);

  /** Vent instantané en m/s (varie doucement — il faut choisir son moment). */
  const windNow = useCallback((): number => {
    const st = g.current;
    if (!st) return 0;
    return level.wind * st.windDir * (0.55 + 0.45 * Math.sin(st.t * 0.7 + st.windPhase));
  }, [level.wind]);

  const finish = useCallback(
    (win: boolean) => {
      if (overRef.current) return;
      overRef.current = true;
      const st = g.current!;
      st.done = true;
      let stars = 0;
      let xpGained = 0;
      if (win) {
        stars = st.used <= level.par ? 3 : st.used <= level.par + 1 ? 2 : 1;
        const res = recordFronde(levelIdx, stars);
        xpGained = res.xpGained;
        submitGameScore("fronde", getFrondeXp());
        submitWeeklyPoints(stars);
        bumpAchv("games_played");
        if (stars === 3) bumpAchv("perfect_games");
        markDayStreak("play");
        checkLocalBadges();
        buzz([30, 40, 90]);
      } else {
        bumpAchv("games_played");
        markDayStreak("play");
        buzz([60, 50, 60]);
      }
      setTimeout(() => setOver({ win, stars, xp: xpGained }), 550);
    },
    [level, levelIdx],
  );

  /* ---------- Position d'une cible à l'instant t ---------- */
  const targetU = (tg: LiveTarget, t: number) => (tg.move ? tg.u + Math.sin(t * tg.move.speed + tg.move.phase) * tg.move.amp : tg.u);

  /* ---------- Boucle ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();

    const spawn = (x: number, y: number, color: string, n: number, spread = 180) => {
      const st = g.current!;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 40 + Math.random() * spread;
        st.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, life: 0.6, color, size: 2 + Math.random() * 3 });
      }
    };

    const update = (dt: number) => {
      const st = g.current;
      if (!st || st.paused || st.done) return;
      st.t += dt;
      st.particles = st.particles.filter((p) => {
        p.life -= dt;
        p.vy += 700 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        return p.life > 0;
      });
      for (const tg of st.targets) tg.wob = Math.max(0, tg.wob - dt * 3);

      // Jauges DOM (sans re-render React)
      const wind = level.wind * st.windDir * (0.55 + 0.45 * Math.sin(st.t * 0.7 + st.windPhase));
      if (windTxtRef.current) windTxtRef.current.textContent = `${Math.abs(wind).toFixed(1)} m/s`;
      if (windArrowRef.current) windArrowRef.current.style.transform = `scaleX(${wind >= 0 ? 1 : -1})`;
      if (powerRef.current) {
        const p = st.drag ? Math.min(1, Math.max(0, (st.drag.cy - st.drag.sy) / 150)) : 0;
        powerRef.current.style.height = `${Math.round(p * 100)}%`;
      }

      // Vol de la pierre
      if (st.shot) {
        st.shot.t += dt / st.shot.dur;
        if (st.shot.t >= 1) {
          const sh = st.shot;
          st.shot = null;
          // Impact : cherche une cible touchée (distance écran + profondeur)
          const land = { x: sh.to.x + sh.windDrift, y: sh.to.y };
          let hitAny = false;
          for (const tg of st.targets) {
            if (tg.dead) continue;
            const pos = groundPos(targetU(tg, st.t), tg.d);
            const r = 40 * scaleAt(tg.d);
            const cx = pos.x;
            const cy = pos.y - r * 0.55;
            const dx = land.x - cx;
            const dy = land.y - cy;
            if (Math.hypot(dx, dy) < r * 1.02 && Math.abs(sh.depth - tg.d) < 0.14) {
              hitAny = true;
              tg.hp -= 1;
              tg.wob = 1;
              spawn(cx, cy, tg.guard === "geant" ? "#b45309" : "#ef4444", 16);
              buzz(25);
              if (tg.hp <= 0) {
                tg.dead = true;
                spawn(cx, cy, "#fbbf24", 22);
              }
              break;
            }
          }
          if (!hitAny) spawn(land.x, land.y, "#c8b08a", 10, 90); // poussière
          const left = st.targets.filter((x) => !x.dead).length;
          setHud({ stones: st.stonesLeft, targets: left });
          if (left === 0) finish(true);
          else if (st.stonesLeft <= 0) finish(false);
        }
      }
    };

    const draw = () => {
      const st = g.current;
      if (!st) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cw = canvas.clientWidth;
      if (canvas.width !== Math.round(cw * dpr)) {
        canvas.width = Math.round(cw * dpr);
        canvas.height = Math.round(((cw * H) / W) * dpr);
      }
      const sc = (cw / W) * dpr;
      ctx.setTransform(sc, 0, 0, sc, 0, 0);
      const im = imgsRef.current;

      /* ----- Décor ----- */
      if (im.decor) {
        ctx.drawImage(im.decor, 0, 0, W, H);
      } else {
        // Ciel
        const sky = ctx.createLinearGradient(0, 0, 0, 200);
        sky.addColorStop(0, "#6db9ef");
        sky.addColorStop(1, "#cde9fb");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, 200);
        // Nuages
        ctx.fillStyle = "rgba(255,255,255,.9)";
        for (const c of clouds) {
          ctx.beginPath();
          ctx.ellipse(c.x, c.y, 26 * c.s, 10 * c.s, 0, 0, Math.PI * 2);
          ctx.ellipse(c.x + 18 * c.s, c.y + 3, 18 * c.s, 8 * c.s, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        // Montagnes
        ctx.fillStyle = "#8a7f9c";
        ctx.beginPath();
        ctx.moveTo(0, 200); ctx.lineTo(50, 132); ctx.lineTo(105, 200); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(240, 200); ctx.lineTo(305, 122); ctx.lineTo(360, 200); ctx.fill();
        ctx.fillStyle = "#a99dbb";
        ctx.beginPath();
        ctx.moveTo(70, 200); ctx.lineTo(150, 112); ctx.lineTo(235, 200); ctx.fill();
        // Prairie
        const grass = ctx.createLinearGradient(0, 190, 0, H);
        grass.addColorStop(0, "#7cb45a");
        grass.addColorStop(1, "#4c8a37");
        ctx.fillStyle = grass;
        ctx.fillRect(0, 190, W, H - 190);
        // Chemin en perspective
        ctx.fillStyle = "#d9b06c";
        ctx.beginPath();
        ctx.moveTo(180 - halfW(1) * 0.55, 200);
        ctx.lineTo(180 + halfW(1) * 0.55, 200);
        ctx.lineTo(180 + halfW(0) * 0.72, H);
        ctx.lineTo(180 - halfW(0) * 0.72, H);
        ctx.fill();
        ctx.fillStyle = "rgba(122,82,48,.18)";
        for (let i = 0; i < 7; i++) {
          const d = 0.12 + i * 0.13;
          const p = groundPos(0.5, d);
          ctx.beginPath();
          ctx.ellipse(p.x + (i % 2 ? 22 : -20) * scaleAt(d), p.y, 14 * scaleAt(d), 3.5 * scaleAt(d), 0, 0, Math.PI * 2);
          ctx.fill();
        }
        // Rochers en bord de chemin
        ctx.fillStyle = "#9b9b93";
        for (const [u, d] of [[0.02, 0.2], [0.98, 0.32], [0.03, 0.55], [0.97, 0.66]] as [number, number][]) {
          const p = groundPos(u, d);
          const s = 12 * scaleAt(d);
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, s, s * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* ----- Cibles (du fond vers l'avant) ----- */
      const sorted = [...st.targets].sort((a, b) => b.d - a.d);
      for (const tg of sorted) {
        if (tg.dead) continue;
        const u = targetU(tg, st.t);
        const pos = groundPos(u, tg.d);
        const s = scaleAt(tg.d);
        const r = 40 * s;
        const wob = Math.sin(st.t * 42) * tg.wob * 3;
        ctx.save();
        ctx.translate(pos.x + wob, pos.y);
        // Gardien derrière la cible
        if (tg.guard) drawGuard(ctx, tg.guard, s, im[tg.guard], tg.hp, tg.maxHp);
        // Socle
        ctx.fillStyle = "#8a5a2b";
        ctx.strokeStyle = "#57351a";
        ctx.lineWidth = 1.6 * s;
        ctx.beginPath();
        ctx.roundRect(-r * 0.42, -r * 0.18, r * 0.84, r * 0.24, 3 * s);
        ctx.fill();
        ctx.stroke();
        // Cible
        if (im.cible) {
          ctx.drawImage(im.cible, -r, -r * 0.55 - r, r * 2, r * 2);
        } else {
          const cy = -r * 0.55;
          const rings: [number, string][] = [[1, "#b0793d"], [0.82, "#f6efdd"], [0.6, "#e23c33"], [0.38, "#f6efdd"], [0.18, "#e23c33"]];
          for (const [k, col] of rings) {
            ctx.beginPath();
            ctx.arc(0, cy, r * k, 0, Math.PI * 2);
            ctx.fillStyle = col;
            ctx.fill();
          }
          ctx.strokeStyle = "#7c4a1e";
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.arc(0, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      /* ----- Réticule de visée ----- */
      if (st.drag && !st.shot) {
        const aim = aimFromDrag(st.drag);
        if (aim) {
          const p = groundPos(aim.u, aim.d);
          const s = scaleAt(aim.d);
          ctx.strokeStyle = "rgba(23,23,22,.55)";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, 26 * s, 9 * s, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(23,23,22,.6)";
          ctx.fill();
          // pointillés de trajectoire
          ctx.fillStyle = "rgba(255,255,255,.75)";
          const from = pouchPos(st.drag);
          for (let i = 1; i <= 7; i++) {
            const k = i / 8;
            const x = from.x + (p.x - from.x) * k;
            const y = from.y + (p.y - from.y) * k - Math.sin(k * Math.PI) * (55 + 80 * aim.d);
            ctx.beginPath();
            ctx.arc(x, y, 2.6 - k, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      /* ----- Pierre en vol ----- */
      if (st.shot) {
        const sh = st.shot;
        const k = Math.min(1, sh.t);
        const x = sh.from.x + (sh.to.x - sh.from.x) * k + sh.windDrift * k * k;
        const y = sh.from.y + (sh.to.y - sh.from.y) * k - Math.sin(k * Math.PI) * sh.arc;
        const sz = 8 * (1 - 0.62 * k * sh.depth);
        ctx.beginPath();
        ctx.arc(x, y, sz, 0, Math.PI * 2);
        ctx.fillStyle = "#8b8b95";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x - sz * 0.3, y - sz * 0.3, sz * 0.32, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,.5)";
        ctx.fill();
      }

      /* ----- Particules ----- */
      for (const p of st.particles) {
        ctx.globalAlpha = Math.max(0, p.life / 0.6);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;

      /* ----- La fronde (première personne) ----- */
      const pouch = st.shot ? POUCH_REST : pouchPos(st.drag);
      if (im.fronde) {
        const iw = 210;
        const ih = (im.fronde.height / im.fronde.width) * iw;
        // élastiques DERRIÈRE l'image
        ctx.strokeStyle = "#7c3aed";
        ctx.lineWidth = 7;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(FORK_L.x, FORK_L.y);
        ctx.lineTo(pouch.x, pouch.y);
        ctx.lineTo(FORK_R.x, FORK_R.y);
        ctx.stroke();
        drawPouchStone(ctx, pouch, !st.shot);
        ctx.drawImage(im.fronde, 180 - iw / 2, H - ih, iw, ih);
      } else {
        // fourche en bois
        ctx.strokeStyle = "#8a5a2b";
        ctx.lineWidth = 20;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(180, H + 10);
        ctx.lineTo(180, 442);
        ctx.stroke();
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.moveTo(180, 448);
        ctx.lineTo(FORK_L.x, FORK_L.y);
        ctx.moveTo(180, 448);
        ctx.lineTo(FORK_R.x, FORK_R.y);
        ctx.stroke();
        // ligatures
        ctx.strokeStyle = "#7c3aed";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(FORK_L.x - 8, FORK_L.y + 6);
        ctx.lineTo(FORK_L.x + 9, FORK_L.y - 2);
        ctx.moveTo(FORK_R.x - 9, FORK_R.y - 2);
        ctx.lineTo(FORK_R.x + 8, FORK_R.y + 6);
        ctx.stroke();
        // élastiques
        ctx.strokeStyle = "#8b5cf6";
        ctx.lineWidth = 6.5;
        ctx.beginPath();
        ctx.moveTo(FORK_L.x, FORK_L.y);
        ctx.lineTo(pouch.x, pouch.y);
        ctx.lineTo(FORK_R.x, FORK_R.y);
        ctx.stroke();
        drawPouchStone(ctx, pouch, !st.shot);
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
  }, [level, clouds, finish, windNow]);

  /* ---------- Visée depuis le glissement ---------- */
  function pouchPos(drag: GameRef["drag"]): { x: number; y: number } {
    if (!drag) return POUCH_REST;
    const dx = Math.max(-55, Math.min(55, (drag.cx - drag.sx) * 0.5));
    const dy = Math.max(0, Math.min(48, (drag.cy - drag.sy) * 0.32));
    return { x: POUCH_REST.x + dx, y: POUCH_REST.y + dy };
  }
  function aimFromDrag(drag: NonNullable<GameRef["drag"]>): { u: number; d: number; power: number } | null {
    const power = (drag.cy - drag.sy) / 150; // tirer VERS LE BAS = plus loin
    if (power < 0.08) return null;
    const p = Math.min(1, power);
    const lateral = -(drag.cx - drag.sx) / 120; // fronde : on tire à l'opposé
    return { u: 0.5 + Math.max(-0.62, Math.min(0.62, lateral)) * 0.62, d: 0.06 + p * 0.9, power: p };
  }

  const toWorld = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * W, y: ((e.clientY - rect.top) / rect.height) * H };
  };

  function onDown(e: React.PointerEvent) {
    const st = g.current;
    if (!st || st.paused || st.shot || st.done || st.stonesLeft <= 0) return;
    const p = toWorld(e);
    if (p.y < 230) return; // on saisit la fronde dans la moitié basse
    st.drag = { sx: p.x, sy: p.y, cx: p.x, cy: p.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    const st = g.current;
    if (!st?.drag) return;
    const p = toWorld(e);
    st.drag.cx = p.x;
    st.drag.cy = p.y;
  }
  function onUp() {
    const st = g.current;
    if (!st?.drag) return;
    const aim = aimFromDrag(st.drag);
    const from = pouchPos(st.drag);
    st.drag = null;
    if (powerRef.current) powerRef.current.style.height = "0%";
    if (!aim) return;
    const to = groundPos(aim.u, aim.d);
    const wind = windNow();
    st.stonesLeft -= 1;
    st.used += 1;
    st.shot = {
      t: 0,
      dur: 0.5 + aim.d * 0.4,
      from,
      to: { x: to.x, y: to.y - 40 * scaleAt(aim.d) * 0.55 },
      arc: 55 + 95 * aim.d,
      windDrift: wind * 7.5 * aim.d,
      depth: aim.d,
      landU: aim.u,
    };
    setHud({ stones: st.stonesLeft, targets: st.targets.filter((x) => !x.dead).length });
    buzz(18);
  }

  function togglePause() {
    const st = g.current;
    if (!st || st.done) return;
    st.paused = !st.paused;
    setPaused(st.paused);
  }

  const boss = level.targets.some((t) => t.guard === "geant");

  return (
    <div className="relative mx-auto min-h-[100dvh] w-full max-w-md px-3 pb-6 pt-[calc(0.6rem+env(safe-area-inset-top))]">
      {/* Scène */}
      <div className="relative overflow-hidden rounded-3xl border border-black/20 shadow-2xl">
        <canvas
          ref={canvasRef}
          className="block w-full touch-none select-none"
          style={{ aspectRatio: `${W} / ${H}` }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />

        {/* Badge NIVEAU */}
        <div className="pointer-events-none absolute left-3 top-3 rounded-2xl px-3.5 py-2 text-center shadow-lg" style={{ background: "linear-gradient(180deg,#7c3aed,#5b21b6)", border: "2px solid #a78bfa" }}>
          <p className="font-game text-[9px] font-black uppercase tracking-widest text-white/85">Niveau</p>
          <p className="-mt-0.5 font-game text-xl font-black text-amber-300">{levelIdx + 1}</p>
        </div>

        {/* Pause */}
        <button type="button" onClick={togglePause} aria-label="Pause" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-2xl shadow-lg" style={{ background: "linear-gradient(180deg,#7c3aed,#5b21b6)", border: "2px solid #a78bfa" }}>
          <svg viewBox="0 0 24 24" className="h-4.5 w-5 fill-white" aria-hidden><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
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

        {/* Pierres restantes */}
        <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-2xl px-3 py-2 shadow-lg" style={{ background: "linear-gradient(180deg,#7c3aed,#5b21b6)", border: "2px solid #a78bfa" }}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#b9a8d8" aria-hidden><path d="M12 3l6 3 3 6-4 7-7 2-6-4-1-7 4-5z" /></svg>
          <span className="font-game text-base font-black text-white">×{hud.stones}</span>
        </div>

        {/* Cibles restantes */}
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-2xl bg-black/35 px-3 py-1.5 font-game text-[11px] font-black text-white shadow">
          {hud.targets} cible{hud.targets > 1 ? "s" : ""}
        </div>

        {/* Pause overlay */}
        {paused && !over ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-night-950/70 backdrop-blur-sm">
            <div className="w-56 rounded-3xl border border-white/10 bg-night-900 p-5 text-center text-cream">
              <p className="font-game text-lg font-black">PAUSE</p>
              <button type="button" onClick={togglePause} className="mt-4 w-full rounded-full py-2.5 font-game text-sm font-black text-[#4a2600]" style={{ background: "linear-gradient(180deg,#FCD34D,#F59E0B)" }}>
                REPRENDRE
              </button>
              <button type="button" onClick={reset} className="mt-2 w-full rounded-full border border-white/20 py-2.5 font-game text-sm font-black text-cream/85">
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
        Glisse le doigt VERS LE BAS pour tendre (puissance = distance), sur les côtés pour viser. Le vent dévie la pierre&nbsp;!
      </p>

      {/* Fin de niveau */}
      {over ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-night-950/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs rounded-3xl border border-white/10 bg-night-900 p-6 text-center text-cream" style={{ animation: "qm-optin .35s ease-out" }}>
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
                  <p className="mt-2 text-xs italic leading-snug text-cream/60">« C'est l'Éternel qui donne la victoire. » — 1 Samuel 17:47</p>
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
                  <button type="button" onClick={onExit} className="w-full py-1 font-game text-sm font-bold text-cream/55">
                    Retour aux niveaux
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="font-game text-xl font-black text-rose-300">PLUS DE PIERRES…</p>
                <p className="mt-2 text-sm text-cream/70">Il reste {hud.targets} cible{hud.targets > 1 ? "s" : ""} — retente ta chance !</p>
                <div className="mt-5 flex flex-col gap-2">
                  <button type="button" onClick={reset} className="w-full rounded-full py-3 font-game text-base font-black text-[#4a2600]" style={{ background: "linear-gradient(180deg,#FCD34D,#F59E0B)", boxShadow: "0 4px 0 #92400e" }}>
                    <span className="inline-flex items-center gap-1.5"><IcoPlay className="h-4 w-4" /> REJOUER</span>
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
    </div>
  );
}

/* ---------- Poche + pierre ---------- */
function drawPouchStone(ctx: CanvasRenderingContext2D, pouch: { x: number; y: number }, withStone: boolean) {
  ctx.fillStyle = "#5b3a1e";
  ctx.beginPath();
  ctx.ellipse(pouch.x, pouch.y + 3, 15, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  if (withStone) {
    ctx.beginPath();
    ctx.arc(pouch.x, pouch.y - 3, 9, 0, Math.PI * 2);
    ctx.fillStyle = "#8b8b95";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pouch.x - 3, pouch.y - 6, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.fill();
  }
}

/* ---------- Gardiens des cibles (repli dessiné ; image si fournie) ---------- */
function drawGuard(
  ctx: CanvasRenderingContext2D,
  guard: FrGuard,
  s: number,
  img: HTMLImageElement | null,
  hp: number,
  maxHp: number,
) {
  const r = 40 * s;
  if (img) {
    const iw = guard === "geant" ? r * 3.4 : r * 2.3;
    const ih = (img.height / img.width) * iw;
    ctx.drawImage(img, -iw / 2, -r * 0.55 - ih + r * 0.7, iw, ih);
  } else if (guard === "geant") {
    // corps
    ctx.fillStyle = "#8a6a4f";
    ctx.strokeStyle = "#4a3320";
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.roundRect(-r * 1.15, -r * 3.1, r * 2.3, r * 2.7, 14 * s);
    ctx.fill();
    ctx.stroke();
    // tête + casque
    ctx.fillStyle = "#d4a373";
    ctx.beginPath();
    ctx.arc(0, -r * 3.35, r * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#a16207";
    ctx.beginPath();
    ctx.arc(0, -r * 3.45, r * 0.62, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    // yeux
    ctx.fillStyle = "#171716";
    ctx.beginPath();
    ctx.arc(-r * 0.2, -r * 3.32, r * 0.07, 0, Math.PI * 2);
    ctx.arc(r * 0.2, -r * 3.32, r * 0.07, 0, Math.PI * 2);
    ctx.fill();
    // massue
    ctx.strokeStyle = "#6b4a26";
    ctx.lineWidth = 8 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(r * 1.1, -r * 2.6);
    ctx.lineTo(r * 1.7, -r * 3.8);
    ctx.stroke();
    // barre de vie
    const bw = r * 2;
    ctx.fillStyle = "rgba(0,0,0,.5)";
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -r * 4.35, bw, 6 * s, 3 * s);
    ctx.fill();
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -r * 4.35, bw * (hp / maxHp), 6 * s, 3 * s);
    ctx.fill();
  } else {
    const colors: Record<string, { body: string; dark: string }> = {
      loup: { body: "#8d99a6", dark: "#4b5563" },
      lion: { body: "#d9a441", dark: "#92600e" },
      ours: { body: "#8a5a2b", dark: "#57351a" },
    };
    const c = colors[guard];
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 2 * s;
    // corps rond derrière la cible
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.arc(0, -r * 1.15, r * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // crinière du lion
    if (guard === "lion") {
      ctx.fillStyle = "#b3762a";
      ctx.beginPath();
      ctx.arc(0, -r * 1.5, r * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    // tête
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.arc(0, -r * 1.5, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // oreilles
    ctx.beginPath();
    if (guard === "loup") {
      ctx.moveTo(-r * 0.35, -r * 1.75);
      ctx.lineTo(-r * 0.22, -r * 2.05);
      ctx.lineTo(-r * 0.1, -r * 1.8);
      ctx.moveTo(r * 0.35, -r * 1.75);
      ctx.lineTo(r * 0.22, -r * 2.05);
      ctx.lineTo(r * 0.1, -r * 1.8);
      ctx.fill();
    } else {
      ctx.arc(-r * 0.3, -r * 1.85, r * 0.14, 0, Math.PI * 2);
      ctx.arc(r * 0.3, -r * 1.85, r * 0.14, 0, Math.PI * 2);
      ctx.fill();
    }
    // yeux
    ctx.fillStyle = "#171716";
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 1.52, r * 0.06, 0, Math.PI * 2);
    ctx.arc(r * 0.15, -r * 1.52, r * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
}
