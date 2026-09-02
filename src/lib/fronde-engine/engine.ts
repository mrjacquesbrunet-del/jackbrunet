"use client";

import {
  TARGET_RADIUS,
  TARGET_HEALTH,
  type LevelConfig,
  type TargetConfig,
  type ObstacleConfig,
  type GameState,
  type FrondeServices,
  type HudSnapshot,
} from "./types";
import {
  sfxStretch,
  sfxStretchStop,
  sfxLaunch,
  sfxImpactGround,
  sfxImpactMetal,
  sfxHit,
  sfxBreak,
  sfxVictory,
  sfxFail,
} from "./sfx";

/* ---------- Caméra (partagée avec le rendu) ---------- */
export const SCREEN_W = 360;
export const SCREEN_H = 480;
export const CAM_Y = 1.6;
export const FOCAL = 300;
export const HORIZON = 150;

export type V3 = { x: number; y: number; z: number };

export function project(p: V3): { x: number; y: number; s: number } {
  const z = Math.max(0.35, p.z);
  return {
    x: SCREEN_W / 2 + (p.x * FOCAL) / z,
    y: HORIZON + ((CAM_Y - p.y) * FOCAL) / z,
    s: FOCAL / z, // pixels par mètre à cette profondeur
  };
}

/* ---------- Réglages du tir (SlingshotController) ---------- */
const SLING_ORIGIN: V3 = { x: 0, y: 0.95, z: 0.9 };
/** Hauteur écran de la poche au repos (pend dans le V de la fronde image). */
export const POUCH_REST_Y = 362;
const MAX_PULL_PX = 165;
const MIN_POWER = 6.4;
const MAX_POWER = 15.6;
const ELEVATION = 0.615; // ~35°
const MAX_AZIMUT = 0.4; // ~23°
const WIND_ACCEL = 0.6; // m/s² par m/s de vent

export type LiveTarget = {
  cfg: TargetConfig;
  hp: number;
  maxHp: number;
  dead: boolean;
  /** Décalage d'animation de mouvement. */
  phase: number;
  /** Flash d'impact (1 → 0). */
  flash: number;
  /** Animation de destruction (1 → 0), la cible tombe/éclate. */
  dying: number;
  pos: V3; // position ANIMÉE courante
};

export type FloatText = { p: V3; text: string; color: string; life: number };
export type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number };

export type DragState = { sx: number; sy: number; cx: number; cy: number };

/**
 * Le moteur du jeu — AUCUN React ici. La coquille (FrondeGame) lui envoie
 * les évènements pointeur + tick, et lit son état pour le rendu/HUD.
 */
export class FrondeEngine {
  state: GameState = "ready";
  readonly level: LevelConfig;
  targets: LiveTarget[] = [];
  ammo: number;
  score = 0;
  combo = 0;
  stars = 0;
  t = 0;
  timeScale = 1;
  shake = 0;
  drag: DragState | null = null;
  projectile: { p: V3; v: V3 } | null = null;
  trail: V3[] = [];
  floats: FloatText[] = [];
  particles: Particle[] = [];
  private windPhase = Math.random() * Math.PI * 2;
  private fullPowerBuzzed = false;
  private services: FrondeServices;
  private onHud: (h: HudSnapshot) => void;

  constructor(level: LevelConfig, services: FrondeServices, onHud: (h: HudSnapshot) => void) {
    this.level = level;
    this.ammo = level.maxAmmo;
    this.services = services;
    this.onHud = onHud;
    this.targets = level.targets.map((cfg) => ({
      cfg,
      hp: cfg.health ?? TARGET_HEALTH[cfg.type],
      maxHp: cfg.health ?? TARGET_HEALTH[cfg.type],
      dead: false,
      phase: Math.random() * Math.PI * 2,
      flash: 0,
      dying: 0,
      pos: { ...cfg.position },
    }));
    this.pushHud();
  }

  /* ================= WindSystem ================= */
  wind(): number {
    return this.level.windStrength * this.level.windDirection * (0.6 + 0.4 * Math.sin(this.t * 0.55 + this.windPhase));
  }

  /* ================= ObstacleController ================= */

  /** Position du balancier à l'instant t (centre + inclinaison). */
  logStateAt(o: Extract<ObstacleConfig, { kind: "log" }>, t = this.t): { cx: number; tilt: number } {
    return { cx: o.x + Math.sin(t * o.speed) * o.amp, tilt: Math.cos(t * o.speed) * 0.14 };
  }

  /** Positions x des oiseaux d'un vol à l'instant t (défilement bouclé). */
  birdXsAt(o: Extract<ObstacleConfig, { kind: "birds" }>, t = this.t): number[] {
    const RANGE = 15; // de -7.5 à +7.5 m
    const gap = 1.15;
    const out: number[] = [];
    for (let i = 0; i < o.count; i++) {
      const raw = (t * o.speed * o.dir + i * gap * o.dir) % RANGE;
      const x = ((raw + RANGE * 1.5) % RANGE) - RANGE / 2;
      out.push(x);
    }
    return out;
  }

  /** La pierre touche-t-elle un obstacle ? Renvoie le point d'impact. */
  private hitObstacle(p: V3): { kind: "log" | "birds"; at: V3 } | null {
    for (const o of this.level.obstacles ?? []) {
      if (o.kind === "log") {
        if (Math.abs(p.z - o.z) > 0.45) continue;
        const { cx } = this.logStateAt(o);
        // le tronc : 3 sphères le long de sa longueur (2,4 m)
        for (const off of [-0.8, 0, 0.8]) {
          const dx = p.x - (cx + off);
          const dy = p.y - o.y;
          if (dx * dx + dy * dy < 0.42 * 0.42) return { kind: "log", at: { x: cx + off, y: o.y, z: o.z } };
        }
      } else {
        if (Math.abs(p.z - o.z) > 0.4) continue;
        for (const bx of this.birdXsAt(o)) {
          const dx = p.x - bx;
          const dy = p.y - o.y;
          if (dx * dx + dy * dy < 0.34 * 0.34) return { kind: "birds", at: { x: bx, y: o.y, z: o.z } };
        }
      }
    }
    return null;
  }

  /* ================= SlingshotController ================= */
  pullRatio(): number {
    if (!this.drag) return 0;
    const dx = this.drag.cx - this.drag.sx;
    const dy = this.drag.cy - this.drag.sy;
    return Math.min(1, Math.hypot(dx, dy * 1.15) / MAX_PULL_PX) * (dy > 0 ? 1 : 0.25);
  }

  /** Position écran de la poche (suivant le doigt, bornée). */
  pouchScreen(): { x: number; y: number } {
    const rest = { x: SCREEN_W / 2, y: POUCH_REST_Y };
    if (!this.drag) return rest;
    const dx = Math.max(-70, Math.min(70, (this.drag.cx - this.drag.sx) * 0.55));
    const dy = Math.max(-8, Math.min(52, (this.drag.cy - this.drag.sy) * 0.34));
    return { x: rest.x + dx, y: rest.y + dy };
  }

  private launchVelocity(): V3 | null {
    if (!this.drag) return null;
    const ratio = this.pullRatio();
    if (ratio < 0.07) return null;
    const power = MIN_POWER + ratio * (MAX_POWER - MIN_POWER);
    // direction opposée à la traction (comme une vraie fronde)
    const az = Math.max(-MAX_AZIMUT, Math.min(MAX_AZIMUT, -(this.drag.cx - this.drag.sx) * 0.004));
    return {
      x: power * Math.sin(az) * Math.cos(ELEVATION),
      y: power * Math.sin(ELEVATION),
      z: power * Math.cos(az) * Math.cos(ELEVATION),
    };
  }

  /** Aperçu léger de trajectoire (premiers instants seulement). */
  previewTrajectory(): V3[] {
    const v0 = this.launchVelocity();
    if (!v0) return [];
    const pts: V3[] = [];
    const p = { ...SLING_ORIGIN };
    const v = { ...v0 };
    const dt = 0.05;
    for (let i = 0; i < 9; i++) {
      v.y -= this.level.gravity * dt;
      p.x += v.x * dt;
      p.y += v.y * dt;
      p.z += v.z * dt;
      if (p.y < 0) break;
      pts.push({ ...p });
    }
    return pts;
  }

  /* ================= Entrées tactiles ================= */
  pointerDown(x: number, y: number) {
    if (this.state !== "ready" || this.ammo <= 0) return;
    if (y < SCREEN_H * 0.42) return; // on saisit la pierre dans la zone basse
    this.drag = { sx: x, sy: y, cx: x, cy: y };
    this.state = "aiming";
    this.fullPowerBuzzed = false;
    this.pushHud();
  }

  pointerMove(x: number, y: number) {
    if (!this.drag) return;
    this.drag.cx = x;
    this.drag.cy = y;
    const r = this.pullRatio();
    sfxStretch(r);
    if (r >= 0.995 && !this.fullPowerBuzzed) {
      this.fullPowerBuzzed = true;
      this.services.haptic(20); // pleine puissance
    }
  }

  pointerUp() {
    if (!this.drag) return;
    const v = this.launchVelocity();
    sfxStretchStop();
    this.drag = null;
    if (this.state === "aiming") this.state = "ready";
    if (!v) {
      this.pushHud();
      return;
    }
    // Lancer !
    this.projectile = { p: { ...SLING_ORIGIN }, v };
    this.trail = [];
    this.ammo -= 1;
    this.state = "projectileFlying";
    this.services.haptic(14);
    sfxLaunch();
    this.spawnScreenParticles(this.pouchScreenStatic(), "#c9c9d4", 6, 90);
    this.pushHud();
  }

  private pouchScreenStatic() {
    return { x: SCREEN_W / 2, y: POUCH_REST_Y };
  }

  togglePause() {
    if (this.state === "paused") this.state = this.projectile ? "projectileFlying" : "ready";
    else if (this.state === "ready" || this.state === "aiming" || this.state === "projectileFlying") {
      this.drag = null;
      sfxStretchStop();
      this.state = "paused";
    }
    this.pushHud();
  }

  /* ================= Boucle ================= */
  update(realDt: number) {
    if (this.state === "paused") return;
    // ralenti « coup parfait » : le monde ralentit, puis récupère
    this.timeScale = Math.min(1, this.timeScale + realDt * 1.8);
    const dt = realDt * this.timeScale;
    this.t += dt;
    this.shake = Math.max(0, this.shake - realDt * 26);

    // Cibles : mouvement + animations
    for (const tg of this.targets) {
      const { cfg } = tg;
      tg.flash = Math.max(0, tg.flash - dt * 5);
      if (tg.dying > 0) tg.dying = Math.max(0, tg.dying - dt * 1.6);
      if (cfg.moving && !tg.dead) {
        const amp = cfg.moveAmp ?? 1;
        const sp = cfg.moveSpeed ?? 1.5;
        const k = Math.sin(this.t * sp + tg.phase);
        if (cfg.movementPattern === "vertical") tg.pos.y = cfg.position.y + k * amp * 0.5;
        else if (cfg.movementPattern === "circle") {
          tg.pos.x = cfg.position.x + Math.cos(this.t * sp + tg.phase) * amp * 0.6;
          tg.pos.y = cfg.position.y + k * amp * 0.4;
        } else tg.pos.x = cfg.position.x + k * amp;
      }
    }

    // Textes flottants / particules
    this.floats = this.floats.filter((f) => {
      f.life -= dt;
      f.p.y += dt * 0.9;
      return f.life > 0;
    });
    this.particles = this.particles.filter((p) => {
      p.life -= dt;
      p.vy += 620 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      return p.life > 0;
    });

    // ProjectileController : intégration balistique réelle
    if (this.projectile) {
      const wind = this.wind();
      const steps = 3;
      for (let s = 0; s < steps && this.projectile; s++) {
        const h = dt / steps;
        const pr = this.projectile;
        pr.v.y -= this.level.gravity * h;
        pr.v.x += wind * WIND_ACCEL * h;
        const damp = 1 - 0.035 * h;
        pr.v.x *= damp;
        pr.v.y *= damp;
        pr.v.z *= damp;
        pr.p.x += pr.v.x * h;
        pr.p.y += pr.v.y * h;
        pr.p.z += pr.v.z * h;
        // Obstacles qui passent devant : la pierre est bloquée
        const ob = this.hitObstacle(pr.p);
        if (ob) {
          const scr = project(ob.at);
          this.spawnScreenParticles(scr, ob.kind === "log" ? "#8a5a2b" : "#9aa3ad", 12, 140);
          sfxImpactGround();
          this.shake = 3;
          this.services.haptic(18);
          this.projectile = null;
          this.afterShot(false);
          break;
        }
        this.checkCollisions();
        if (!this.projectile) break;
        if (pr.p.y <= 0.05) {
          this.missGround({ ...pr.p, y: 0.06 });
          break;
        }
        if (pr.p.z > 13 || Math.abs(pr.p.x) > 8 || pr.p.y > 9) {
          this.projectile = null;
          this.afterShot(false);
          break;
        }
      }
      if (this.projectile) {
        this.trail.push({ ...this.projectile.p });
        if (this.trail.length > 16) this.trail.shift();
      }
    }
  }

  /* ================= Collisions & impacts ================= */
  private checkCollisions() {
    const pr = this.projectile;
    if (!pr) return;
    for (const tg of this.targets) {
      if (tg.dead) continue;
      const r = (tg.cfg.radius ?? TARGET_RADIUS[tg.cfg.type]) + 0.13;
      const dx = pr.p.x - tg.pos.x;
      const dy = pr.p.y - tg.pos.y;
      const dz = pr.p.z - tg.pos.z;
      if (dx * dx + dy * dy + dz * dz <= r * r) {
        this.hitTarget(tg);
        return;
      }
    }
  }

  private hitTarget(tg: LiveTarget) {
    const scr = project(tg.pos);
    tg.hp -= 1;
    tg.flash = 1;
    this.combo += 1;
    const mult = Math.min(1.6, 1 + 0.15 * (this.combo - 1));
    const gained = Math.round(tg.cfg.points * mult * (tg.hp <= 0 ? 1 : 0.4));
    this.score += gained;
    this.floats.push({ p: { ...tg.pos, y: tg.pos.y + 0.5 }, text: `+${gained}`, color: "#FCD34D", life: 1 });
    if (this.combo >= 2) this.floats.push({ p: { ...tg.pos, y: tg.pos.y + 0.95 }, text: `COMBO ×${this.combo}`, color: "#CAF000", life: 0.9 });
    const metal = tg.cfg.type === "helmet" || tg.cfg.type === "shield";
    if (metal) sfxImpactMetal();
    const big = tg.cfg.type === "giant";
    if (tg.hp <= 0) {
      tg.dead = true;
      tg.dying = 1;
      sfxBreak();
      sfxHit(big);
      this.shake = big ? 9 : 5;
      this.timeScale = 0.35; // petit ralenti sur le coup décisif
      this.services.haptic(big ? [40, 60, 120] : [25, 35, 70]);
      this.spawnScreenParticles(scr, big ? "#b45309" : "#fbbf24", big ? 26 : 16, 200);
    } else {
      sfxHit(big);
      this.shake = big ? 5 : 3;
      this.services.haptic(22);
      this.spawnScreenParticles(scr, metal ? "#cbd5e1" : "#ef4444", 12, 150);
    }
    this.projectile = null;
    this.afterShot(true);
  }

  private missGround(at: V3) {
    const scr = project(at);
    this.spawnScreenParticles(scr, "#c8b08a", 9, 90);
    sfxImpactGround();
    this.projectile = null;
    this.afterShot(false);
  }

  private afterShot(hit: boolean) {
    this.state = hit ? "hit" : "miss";
    if (!hit) this.combo = 0;
    const required = this.targets.filter((t) => t.cfg.type !== "bonus");
    const remaining = required.filter((t) => !t.dead).length;
    if (remaining === 0) {
      // bonus de munitions restantes
      const bonus = this.ammo * 120;
      if (bonus > 0) {
        this.score += bonus;
        this.floats.push({ p: { x: 0, y: 2.6, z: 4 }, text: `PIERRES +${bonus}`, color: "#CAF000", life: 1.4 });
      }
      this.stars = this.starsFor(this.score);
      this.state = "levelComplete";
      sfxVictory();
      this.services.haptic([30, 40, 90]);
      this.services.onLevelComplete({ levelId: this.level.id, score: this.score, stars: this.stars, xpEarned: 0 });
    } else if (this.ammo <= 0) {
      this.state = "gameOver";
      sfxFail();
      this.services.onGameOver({ levelId: this.level.id, score: this.score });
    } else {
      this.state = "ready";
    }
    this.pushHud();
  }

  /* ================= ScoreManager ================= */
  starsFor(score: number): number {
    if (score >= this.level.requiredScore * 1.9) return 3;
    if (score >= this.level.requiredScore * 1.4) return 2;
    return 1;
  }

  private spawnScreenParticles(at: { x: number; y: number }, color: string, n: number, speed: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = speed * (0.4 + Math.random());
      this.particles.push({
        x: at.x,
        y: at.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 70,
        life: 0.55 + Math.random() * 0.25,
        color,
        size: 2 + Math.random() * 3.2,
      });
    }
  }

  private pushHud() {
    const giant = this.targets.find((t) => t.cfg.type === "giant");
    this.onHud({
      state: this.state,
      ammo: this.ammo,
      score: this.score,
      combo: this.combo,
      targetsLeft: this.targets.filter((t) => !t.dead && t.cfg.type !== "bonus").length,
      stars: this.stars,
      bossHp: giant ? { hp: Math.max(0, giant.hp), max: giant.maxHp } : null,
    });
  }
}
