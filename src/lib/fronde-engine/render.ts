"use client";

import { FrondeEngine, project, SCREEN_W as W, SCREEN_H as H, HORIZON, POUCH_REST_Y, type LiveTarget } from "./engine";
import { TARGET_RADIUS } from "./types";

/** Emplacements d'images (habillage Magnific) — repli dessiné sinon. */
export const IMG_SLOTS = ["decor", "fronde", "cible", "loup", "lion", "ours", "geant", "philistin"] as const;
export type ImgSlot = (typeof IMG_SLOTS)[number];
export type GameImages = Partial<Record<ImgSlot, HTMLImageElement>>;

const GUARD_IMG: Record<string, ImgSlot> = { wolf: "loup", lion: "lion", bear: "ours", giant: "geant", helmet: "cible", shield: "philistin" };

/** Calage des images : k = largeur en rayons de collider ; cy = fraction de
 * la hauteur de l'image où se trouve le CENTRE du collider (la cible). */
const IMG_ANCHOR: Partial<Record<ImgSlot, { k: number; cy: number }>> = {
  loup: { k: 2.6, cy: 0.5 },
  lion: { k: 2.7, cy: 0.5 },
  ours: { k: 2.6, cy: 0.5 },
  geant: { k: 2.9, cy: 0.48 },
  philistin: { k: 3.0, cy: 0.5 },
  cible: { k: 3.3, cy: 0.33 },
};

type Ctx = CanvasRenderingContext2D;

/** Dessine une frame complète (le canvas est déjà mis à l'échelle). */
export function renderFrame(ctx: Ctx, eng: FrondeEngine, imgs: GameImages, decor: { clouds: { x: number; y: number; s: number }[] }) {
  // Secousse caméra
  const shx = (Math.random() - 0.5) * eng.shake;
  const shy = (Math.random() - 0.5) * eng.shake;
  ctx.save();
  ctx.translate(shx, shy);

  drawBackground(ctx, imgs, decor, eng.t);

  // Cibles, du fond vers l'avant
  const sorted = [...eng.targets].sort((a, b) => b.pos.z - a.pos.z);
  for (const tg of sorted) drawTarget(ctx, tg, imgs, eng.t);

  // Obstacles qui passent DEVANT (balancier, oiseaux)
  for (const o of eng.level.obstacles ?? []) {
    if (o.kind === "log") drawLog(ctx, eng, o);
    else drawBirds(ctx, eng, o);
  }

  // Tempête : pluie et ciel assombri sur les niveaux à vent fort
  if (eng.level.windStrength >= 3) {
    ctx.fillStyle = "rgba(28,36,54,.16)";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(210,225,245,.4)";
    ctx.lineWidth = 1.2;
    const slant = eng.level.windDirection * 5;
    for (let i = 0; i < 34; i++) {
      const rx = ((i * 53 + eng.t * 260) % (W + 40)) - 20;
      const ry = (i * 97 + eng.t * 560) % H;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + slant, ry + 13);
      ctx.stroke();
    }
  }

  // Aperçu de trajectoire pendant la visée
  if (eng.drag) {
    const pts = eng.previewTrajectory();
    ctx.fillStyle = "rgba(255,255,255,.8)";
    pts.forEach((p, i) => {
      const s = project(p);
      ctx.globalAlpha = 0.75 - i * 0.07;
      ctx.beginPath();
      ctx.arc(s.x, s.y, Math.max(1.4, 3.4 - i * 0.25), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // Traînée + pierre en vol
  if (eng.projectile) {
    eng.trail.forEach((p, i) => {
      const s = project(p);
      const k = i / eng.trail.length;
      ctx.globalAlpha = k * 0.45;
      ctx.fillStyle = "#e7e7ef";
      ctx.beginPath();
      ctx.arc(s.x, s.y, 0.11 * s.s * k, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    const s = project(eng.projectile.p);
    drawStone(ctx, s.x, s.y, Math.max(2.5, 0.13 * s.s));
  }

  // La fronde (au premier plan)
  drawSling(ctx, eng, imgs);

  // Particules (espace écran)
  for (const p of eng.particles) {
    ctx.globalAlpha = Math.max(0, p.life / 0.7);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
  ctx.globalAlpha = 1;

  // Scores flottants
  for (const f of eng.floats) {
    const s = project(f.p);
    ctx.globalAlpha = Math.min(1, f.life * 2);
    ctx.font = `900 ${Math.max(12, 0.34 * s.s)}px var(--font-game, system-ui)`;
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(23,23,22,.75)";
    ctx.strokeText(f.text, s.x, s.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, s.x, s.y);
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

/* ---------- Décor ---------- */
function drawBackground(ctx: Ctx, imgs: GameImages, decor: { clouds: { x: number; y: number; s: number }[] }, t: number) {
  if (imgs.decor) {
    ctx.drawImage(imgs.decor, 0, 0, W, H);
    return;
  }
  // Ciel lumineux
  const sky = ctx.createLinearGradient(0, 0, 0, HORIZON + 40);
  sky.addColorStop(0, "#5fb2ee");
  sky.addColorStop(1, "#cdeafb");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, HORIZON + 40);
  // Nuages qui dérivent doucement
  ctx.fillStyle = "rgba(255,255,255,.92)";
  for (const c of decor.clouds) {
    const x = ((c.x + t * 3.5) % (W + 90)) - 45;
    ctx.beginPath();
    ctx.ellipse(x, c.y, 26 * c.s, 10 * c.s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 17 * c.s, c.y + 3, 17 * c.s, 8 * c.s, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 15 * c.s, c.y + 4, 14 * c.s, 7 * c.s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Montagnes rocheuses (palette chaude de la maquette)
  ctx.fillStyle = "#8d7a66";
  tri(ctx, -10, HORIZON + 40, 60, HORIZON - 45, 130, HORIZON + 40);
  tri(ctx, 230, HORIZON + 40, 300, HORIZON - 55, 372, HORIZON + 40);
  ctx.fillStyle = "#a8937c";
  tri(ctx, 80, HORIZON + 40, 175, HORIZON - 70, 265, HORIZON + 40);
  tri(ctx, -40, HORIZON + 40, 20, HORIZON - 15, 90, HORIZON + 40);
  tri(ctx, 280, HORIZON + 40, 345, HORIZON - 20, 400, HORIZON + 40);
  ctx.fillStyle = "rgba(255,255,255,.85)";
  tri(ctx, 160, HORIZON - 55, 175, HORIZON - 70, 191, HORIZON - 54);
  // ligne d'arbres au pied des montagnes
  ctx.fillStyle = "#3f7a33";
  for (let x = -6; x < W + 10; x += 22) {
    ctx.beginPath();
    ctx.ellipse(x, HORIZON + 34, 15, 9 + ((x * 7) % 5), 0, Math.PI, 0);
    ctx.fill();
  }
  // Prairie saturée
  const grass = ctx.createLinearGradient(0, HORIZON, 0, H);
  grass.addColorStop(0, "#86c33d");
  grass.addColorStop(1, "#4c8f2c");
  ctx.fillStyle = grass;
  ctx.fillRect(0, HORIZON + 20, W, H - HORIZON - 20);
  // touffes d'herbe
  ctx.strokeStyle = "rgba(38,88,26,.5)";
  ctx.lineWidth = 2;
  for (const [tx, tz] of [[-4.6, 2.6], [4.5, 3.4], [-3.2, 4.6], [4.9, 6], [-5, 8], [3.6, 9.4]] as const) {
    const s = project({ x: tx, y: 0, z: tz });
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath();
      ctx.moveTo(s.x + k * 0.05 * s.s, s.y);
      ctx.lineTo(s.x + k * 0.09 * s.s, s.y - 0.22 * s.s);
      ctx.stroke();
    }
  }
  // Chemin en perspective
  ctx.fillStyle = "#dcb271";
  ctx.beginPath();
  ctx.moveTo(W / 2 - 26, HORIZON + 22);
  ctx.lineTo(W / 2 + 26, HORIZON + 22);
  ctx.lineTo(W / 2 + 150, H);
  ctx.lineTo(W / 2 - 150, H);
  ctx.fill();
  ctx.fillStyle = "rgba(122,82,48,.16)";
  for (let i = 0; i < 6; i++) {
    const z = 2.2 + i * 1.7;
    const s = project({ x: (i % 2 ? 0.7 : -0.6), y: 0, z });
    ctx.beginPath();
    ctx.ellipse(s.x, s.y, 0.35 * s.s, 0.09 * s.s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Accessoires : rochers, bannières, tonneaux
  for (const [x, z] of [[-3.4, 3], [3.6, 4.2], [-4.2, 6.5], [4.4, 7.5]] as const) {
    const s = project({ x, y: 0, z });
    ctx.fillStyle = "#a8a8a0";
    ctx.beginPath();
    ctx.ellipse(s.x, s.y - 0.16 * s.s, 0.34 * s.s, 0.24 * s.s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.25)";
    ctx.beginPath();
    ctx.ellipse(s.x - 0.08 * s.s, s.y - 0.26 * s.s, 0.12 * s.s, 0.08 * s.s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const [x, z] of [[-2.6, 5.5], [3, 8.5]] as const) {
    const s = project({ x, y: 0, z });
    // mât + bannière violette
    ctx.strokeStyle = "#6b4a26";
    ctx.lineWidth = Math.max(1.5, 0.045 * s.s);
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x, s.y - 1.5 * s.s * 0.55);
    ctx.stroke();
    ctx.fillStyle = "#7c3aed";
    const fh = 0.5 * s.s * 0.55;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y - 1.5 * s.s * 0.55);
    ctx.lineTo(s.x + 0.55 * s.s, s.y - 1.32 * s.s * 0.55);
    ctx.lineTo(s.x, s.y - 1.5 * s.s * 0.55 + fh);
    ctx.fill();
  }
  for (const [x, z] of [[4, 5.8], [-3.8, 9]] as const) {
    const s = project({ x, y: 0, z });
    ctx.fillStyle = "#8a5a2b";
    ctx.strokeStyle = "#57351a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(s.x - 0.22 * s.s, s.y - 0.55 * s.s, 0.44 * s.s, 0.55 * s.s, 0.08 * s.s);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s.x - 0.22 * s.s, s.y - 0.28 * s.s);
    ctx.lineTo(s.x + 0.22 * s.s, s.y - 0.28 * s.s);
    ctx.stroke();
  }
}

function tri(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.fill();
}

/* ---------- Cibles ---------- */
function drawTarget(ctx: Ctx, tg: LiveTarget, imgs: GameImages, t: number) {
  if (tg.dead && tg.dying <= 0) return;
  const scr = project(tg.pos);
  const rM = tg.cfg.radius ?? TARGET_RADIUS[tg.cfg.type];
  const r = rM * scr.s;
  const wob = Math.sin(t * 40) * tg.flash * 3;
  ctx.save();
  ctx.translate(scr.x + wob, scr.y);
  if (tg.dying > 0) {
    ctx.globalAlpha = tg.dying;
    ctx.translate(0, (1 - tg.dying) * 26);
    ctx.rotate((1 - tg.dying) * 0.5);
  }

  const slot = GUARD_IMG[tg.cfg.type] as ImgSlot;
  const img = imgs[slot];
  const anchor = IMG_ANCHOR[slot] ?? { k: 2.4, cy: 0.55 };
  if (tg.cfg.type === "bonus") {
    drawBonusStar(ctx, r, t);
  } else if (img) {
    const iw = r * anchor.k;
    const ih = (img.height / img.width) * iw;
    ctx.drawImage(img, -iw / 2, -anchor.cy * ih, iw, ih);
  } else {
    switch (tg.cfg.type) {
      case "helmet": drawHelmet(ctx, r); break;
      case "shield": drawShieldT(ctx, r, tg.hp < tg.maxHp); break;
      case "giant": drawGiant(ctx, r); break;
      default: drawBeast(ctx, tg.cfg.type, r); break;
    }
  }
  // Flash blanc à l'impact
  if (tg.flash > 0.35) {
    ctx.globalAlpha = (tg.flash - 0.35) * 0.9;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, -r * 0.2, r * 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = tg.dying > 0 ? tg.dying : 1;
  }
  // Barre de vie (géant / multi-coups) — au-dessus du visuel, image comprise
  if (tg.maxHp > 1 && !tg.dead) {
    const topY = img ? -anchor.cy * ((img.height / img.width) * r * anchor.k) - 10 : -r * 1.75;
    const bw = r * 1.9;
    ctx.fillStyle = "rgba(0,0,0,.5)";
    ctx.beginPath();
    ctx.roundRect(-bw / 2, topY, bw, Math.max(4, r * 0.16), 3);
    ctx.fill();
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.roundRect(-bw / 2, topY, bw * (tg.hp / tg.maxHp), Math.max(4, r * 0.16), 3);
    ctx.fill();
  }
  ctx.restore();
}

function drawStone(ctx: Ctx, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#8f87a8";
  ctx.fill();
  ctx.strokeStyle = "#5d5575";
  ctx.lineWidth = Math.max(1, r * 0.18);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.32, r * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,.45)";
  ctx.fill();
}

function drawHelmet(ctx: Ctx, r: number) {
  ctx.fillStyle = "#9aa2ad";
  ctx.strokeStyle = "#5b6470";
  ctx.lineWidth = Math.max(1.4, r * 0.1);
  ctx.beginPath();
  ctx.arc(0, -r * 0.15, r, Math.PI, 0);
  ctx.lineTo(r, r * 0.5);
  ctx.lineTo(-r, r * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // fente
  ctx.fillStyle = "#2f353d";
  ctx.beginPath();
  ctx.roundRect(-r * 0.55, -r * 0.05, r * 1.1, r * 0.28, r * 0.12);
  ctx.fill();
  // plumet violet
  ctx.fillStyle = "#7c3aed";
  ctx.beginPath();
  ctx.ellipse(0, -r * 1.18, r * 0.2, r * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  // reflet
  ctx.fillStyle = "rgba(255,255,255,.4)";
  ctx.beginPath();
  ctx.ellipse(-r * 0.4, -r * 0.55, r * 0.16, r * 0.3, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawShieldT(ctx: Ctx, r: number, cracked: boolean) {
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.4, r * 0.2, 0, 0, r * 1.1);
  grad.addColorStop(0, "#e8edf3");
  grad.addColorStop(1, "#71809a");
  ctx.fillStyle = grad;
  ctx.strokeStyle = "#3c4657";
  ctx.lineWidth = Math.max(1.4, r * 0.1);
  ctx.beginPath();
  ctx.arc(0, -r * 0.1, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#b08d4c";
  ctx.beginPath();
  ctx.arc(0, -r * 0.1, r * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (cracked) {
    ctx.strokeStyle = "#2b3442";
    ctx.lineWidth = Math.max(1.2, r * 0.07);
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, -r * 0.6);
    ctx.lineTo(-r * 0.1, -r * 0.1);
    ctx.lineTo(-r * 0.5, r * 0.4);
    ctx.stroke();
  }
}

const CIBLE_RINGS: [number, string][] = [[1, "#b0793d"], [0.8, "#f6efdd"], [0.58, "#e23c33"], [0.36, "#f6efdd"], [0.16, "#e23c33"]];
function drawDisc(ctx: Ctx, cx: number, cy: number, r: number) {
  for (const [k, col] of CIBLE_RINGS) {
    ctx.beginPath();
    ctx.arc(cx, cy, r * k, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
  }
  ctx.strokeStyle = "#7c4a1e";
  ctx.lineWidth = Math.max(1.2, r * 0.07);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawBeast(ctx: Ctx, type: "wolf" | "lion" | "bear", r: number) {
  const colors = {
    wolf: { body: "#93a1b0", dark: "#4b5563", belly: "#c6ced8" },
    lion: { body: "#e0a94a", dark: "#8a5a12", belly: "#f2cf8e" },
    bear: { body: "#8a5a2b", dark: "#4f3115", belly: "#b98a55" },
  }[type];
  ctx.strokeStyle = colors.dark;
  ctx.lineWidth = Math.max(1.4, r * 0.08);
  // corps assis
  ctx.fillStyle = colors.body;
  ctx.beginPath();
  ctx.ellipse(0, r * 0.15, r * 0.95, r * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // crinière
  if (type === "lion") {
    ctx.fillStyle = "#b3762a";
    ctx.beginPath();
    ctx.arc(0, -r * 0.75, r * 0.78, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // tête
  ctx.fillStyle = colors.body;
  ctx.beginPath();
  ctx.arc(0, -r * 0.75, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // oreilles
  ctx.fillStyle = colors.body;
  if (type === "wolf") {
    tri(ctx, -r * 0.45, -r * 1.05, -r * 0.3, -r * 1.45, -r * 0.1, -r * 1.1);
    tri(ctx, r * 0.45, -r * 1.05, r * 0.3, -r * 1.45, r * 0.1, -r * 1.1);
  } else {
    ctx.beginPath();
    ctx.arc(-r * 0.38, -r * 1.18, r * 0.17, 0, Math.PI * 2);
    ctx.arc(r * 0.38, -r * 1.18, r * 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // museau + yeux
  ctx.fillStyle = colors.belly;
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.62, r * 0.26, r * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#171716";
  ctx.beginPath();
  ctx.arc(-r * 0.2, -r * 0.82, r * 0.07, 0, Math.PI * 2);
  ctx.arc(r * 0.2, -r * 0.82, r * 0.07, 0, Math.PI * 2);
  ctx.arc(0, -r * 0.66, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // la cible que la bête « tient »
  drawDisc(ctx, 0, r * 0.32, r * 0.62);
}

function drawGiant(ctx: Ctx, r: number) {
  ctx.strokeStyle = "#4a3320";
  ctx.lineWidth = Math.max(1.6, r * 0.06);
  // corps
  ctx.fillStyle = "#977553";
  ctx.beginPath();
  ctx.roundRect(-r * 0.95, -r * 1.15, r * 1.9, r * 2.1, r * 0.3);
  ctx.fill();
  ctx.stroke();
  // ceinture
  ctx.fillStyle = "#57351a";
  ctx.fillRect(-r * 0.95, r * 0.45, r * 1.9, r * 0.22);
  // tête + casque
  ctx.fillStyle = "#d9ad7c";
  ctx.beginPath();
  ctx.arc(0, -r * 1.45, r * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#a16207";
  ctx.beginPath();
  ctx.arc(0, -r * 1.52, r * 0.42, Math.PI, 0);
  ctx.fill();
  ctx.stroke();
  // yeux fâchés
  ctx.strokeStyle = "#3b2409";
  ctx.lineWidth = Math.max(1.2, r * 0.05);
  ctx.beginPath();
  ctx.moveTo(-r * 0.26, -r * 1.5);
  ctx.lineTo(-r * 0.08, -r * 1.44);
  ctx.moveTo(r * 0.26, -r * 1.5);
  ctx.lineTo(r * 0.08, -r * 1.44);
  ctx.stroke();
  ctx.fillStyle = "#171716";
  ctx.beginPath();
  ctx.arc(-r * 0.16, -r * 1.4, r * 0.05, 0, Math.PI * 2);
  ctx.arc(r * 0.16, -r * 1.4, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // massue
  ctx.strokeStyle = "#6b4a26";
  ctx.lineWidth = r * 0.16;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(r * 0.95, -r * 0.6);
  ctx.lineTo(r * 1.5, -r * 1.7);
  ctx.stroke();
  ctx.fillStyle = "#7a5230";
  ctx.beginPath();
  ctx.ellipse(r * 1.55, -r * 1.8, r * 0.24, r * 0.34, 0.5, 0, Math.PI * 2);
  ctx.fill();
  // cible sur le plastron
  drawDisc(ctx, 0, -r * 0.15, r * 0.55);
}

function drawBonusStar(ctx: Ctx, r: number, t: number) {
  ctx.save();
  ctx.rotate(Math.sin(t * 2.4) * 0.25);
  ctx.fillStyle = "#FCD34D";
  ctx.strokeStyle = "#b45309";
  ctx.lineWidth = Math.max(1.4, r * 0.1);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 === 0 ? r * 1.05 : r * 0.45;
    ctx[i === 0 ? "moveTo" : "lineTo"](Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/* ---------- Obstacles ---------- */

function drawLog(ctx: Ctx, eng: FrondeEngine, o: Extract<NonNullable<FrondeEngine["level"]["obstacles"]>[number], { kind: "log" }>) {
  const { cx, tilt } = eng.logStateAt(o);
  const c = project({ x: cx, y: o.y, z: o.z });
  const s = c.s;
  const halfLen = 1.2 * s;
  const rad = 0.3 * s;
  const endL = { x: c.x - Math.cos(tilt) * halfLen, y: c.y - Math.sin(tilt) * halfLen };
  const endR = { x: c.x + Math.cos(tilt) * halfLen, y: c.y + Math.sin(tilt) * halfLen };
  // chaînes vers le haut (hors écran)
  ctx.strokeStyle = "#4b5563";
  ctx.lineWidth = Math.max(2, 0.06 * s);
  ctx.setLineDash([Math.max(3, 0.09 * s), Math.max(2, 0.05 * s)]);
  ctx.beginPath();
  ctx.moveTo(endL.x + rad * 0.4, endL.y);
  ctx.lineTo(endL.x + rad * 0.4 + Math.sin(tilt) * 40, -8);
  ctx.moveTo(endR.x - rad * 0.4, endR.y);
  ctx.lineTo(endR.x - rad * 0.4 + Math.sin(tilt) * 40, -8);
  ctx.stroke();
  ctx.setLineDash([]);
  // le tronc
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(tilt);
  ctx.fillStyle = "#8a5a2b";
  ctx.strokeStyle = "#57351a";
  ctx.lineWidth = Math.max(1.6, 0.05 * s);
  ctx.beginPath();
  ctx.roundRect(-halfLen, -rad, halfLen * 2, rad * 2, rad);
  ctx.fill();
  ctx.stroke();
  // sangles + reflet
  ctx.fillStyle = "#5b3a1e";
  ctx.fillRect(-halfLen * 0.55, -rad, 0.12 * s, rad * 2);
  ctx.fillRect(halfLen * 0.43, -rad, 0.12 * s, rad * 2);
  ctx.fillStyle = "rgba(255,255,255,.18)";
  ctx.beginPath();
  ctx.roundRect(-halfLen + rad * 0.4, -rad * 0.65, halfLen * 1.5, rad * 0.4, rad * 0.2);
  ctx.fill();
  ctx.restore();
}

function drawBirds(ctx: Ctx, eng: FrondeEngine, o: Extract<NonNullable<FrondeEngine["level"]["obstacles"]>[number], { kind: "birds" }>) {
  const xs = eng.birdXsAt(o);
  xs.forEach((bx, i) => {
    const c = project({ x: bx, y: o.y + Math.sin(eng.t * 3 + i) * 0.12, z: o.z });
    const s = c.s;
    const size = 0.3 * s;
    const flap = Math.sin(eng.t * 11 + i * 1.7);
    ctx.save();
    ctx.translate(c.x, c.y);
    if (o.dir < 0) ctx.scale(-1, 1);
    // corps
    ctx.fillStyle = "#4a453f";
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.55, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    // tête + bec
    ctx.beginPath();
    ctx.arc(size * 0.55, -size * 0.12, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d97706";
    ctx.beginPath();
    ctx.moveTo(size * 0.75, -size * 0.14);
    ctx.lineTo(size * 0.98, -size * 0.06);
    ctx.lineTo(size * 0.75, 0);
    ctx.fill();
    // ailes qui battent
    ctx.strokeStyle = "#4a453f";
    ctx.lineWidth = Math.max(1.6, size * 0.16);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, 0);
    ctx.quadraticCurveTo(-size * 0.5, -size * (0.5 + flap * 0.55), -size * 0.95, -size * (0.3 + flap * 0.75));
    ctx.stroke();
    ctx.restore();
  });
}

/* ---------- La fronde (premier plan, se déforme avec la tension) ---------- */
function drawSling(ctx: Ctx, eng: FrondeEngine, imgs: GameImages) {
  const pouch = eng.projectile ? { x: W / 2, y: POUCH_REST_Y } : eng.pouchScreen();
  const ratio = eng.pullRatio();
  // fourche qui plie légèrement vers la traction
  const bend = ratio * 6;
  const lean = eng.drag ? Math.max(-5, Math.min(5, (eng.drag.cx - eng.drag.sx) * 0.05)) : 0;
  const tipL = { x: W / 2 - 46 + bend * 0.7 + lean, y: 398 + bend };
  const tipR = { x: W / 2 + 46 - bend * 0.7 + lean, y: 398 + bend };

  if (imgs.fronde) {
    // L'image (fourche + main, SANS élastiques ni poche) est complétée par
    // des élastiques et une poche 100 % dynamiques : ils suivent le doigt,
    // claquent au tir, aucun doublon dessiné.
    const iw = 252;
    const ih = (imgs.fronde.height / imgs.fronde.width) * iw;
    const ix = W / 2 - iw / 2 + lean;
    const iy = H - ih + bend * 0.5;
    ctx.drawImage(imgs.fronde, ix, iy, iw, ih);
    // anneaux violets d'attache (fractions mesurées sur l'asset)
    const imgTipL = { x: ix + iw * 0.17, y: iy + ih * 0.17 };
    const imgTipR = { x: ix + iw * 0.87, y: iy + ih * 0.17 };
    elastics(ctx, imgTipL, imgTipR, pouch, ratio);
    pouchAndStone(ctx, pouch, ratio, !eng.projectile);
    return;
  }

  ctx.save();
  ctx.translate(lean, bend * 0.4);
  // manche
  ctx.strokeStyle = "#8a5a2b";
  ctx.lineWidth = 22;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(W / 2, H + 12);
  ctx.lineTo(W / 2, 444);
  ctx.stroke();
  // ligature de cuir
  ctx.strokeStyle = "#5b3a1e";
  ctx.lineWidth = 24;
  ctx.beginPath();
  ctx.moveTo(W / 2, H - 6);
  ctx.lineTo(W / 2, H - 22);
  ctx.stroke();
  // bras
  ctx.strokeStyle = "#96622f";
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(W / 2, 450);
  ctx.quadraticCurveTo(W / 2 - 40, 428, tipL.x - lean, tipL.y - bend * 0.4);
  ctx.moveTo(W / 2, 450);
  ctx.quadraticCurveTo(W / 2 + 40, 428, tipR.x - lean, tipR.y - bend * 0.4);
  ctx.stroke();
  // reflet du bois
  ctx.strokeStyle = "rgba(255,255,255,.22)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 5, H);
  ctx.lineTo(W / 2 - 5, 452);
  ctx.stroke();
  // attaches violettes
  ctx.strokeStyle = "#7c3aed";
  ctx.lineWidth = 8;
  for (const tip of [tipL, tipR]) {
    ctx.beginPath();
    ctx.moveTo(tip.x - lean - 9, tip.y - bend * 0.4 + 5);
    ctx.lineTo(tip.x - lean + 9, tip.y - bend * 0.4 - 3);
    ctx.stroke();
  }
  ctx.restore();

  elastics(ctx, tipL, tipR, pouch, ratio);
  pouchAndStone(ctx, pouch, ratio, !eng.projectile);
}

function elastics(ctx: Ctx, tipL: { x: number; y: number }, tipR: { x: number; y: number }, pouch: { x: number; y: number }, ratio: number) {
  // plus c'est tendu, plus l'élastique est fin
  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 8 - ratio * 3.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(tipL.x, tipL.y);
  ctx.lineTo(pouch.x - 10, pouch.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tipR.x, tipR.y);
  ctx.lineTo(pouch.x + 10, pouch.y);
  ctx.stroke();
}

function pouchAndStone(ctx: Ctx, pouch: { x: number; y: number }, ratio: number, withStone: boolean) {
  // poche en cuir cousue
  ctx.fillStyle = "#6b4423";
  ctx.strokeStyle = "#3d2712";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(pouch.x, pouch.y + 4, 21, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(252,211,77,.55)";
  ctx.lineWidth = 1.4;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.ellipse(pouch.x, pouch.y + 4, 16, 9.5, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  // la pierre, bien visible quand on la tire en arrière
  if (withStone) drawStone(ctx, pouch.x, pouch.y - 5, 12 + ratio * 3.5);
}
