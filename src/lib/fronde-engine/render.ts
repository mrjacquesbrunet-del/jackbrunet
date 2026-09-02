"use client";

import { FrondeEngine, project, SCREEN_W as W, SCREEN_H as H, HORIZON, type LiveTarget } from "./engine";
import { TARGET_RADIUS } from "./types";

/** Emplacements d'images (habillage Magnific) — repli dessiné sinon. */
export const IMG_SLOTS = ["decor", "fronde", "cible", "loup", "lion", "ours", "geant", "casque", "bouclier"] as const;
export type ImgSlot = (typeof IMG_SLOTS)[number];
export type GameImages = Partial<Record<ImgSlot, HTMLImageElement>>;

const GUARD_IMG: Record<string, ImgSlot> = { wolf: "loup", lion: "lion", bear: "ours", giant: "geant", helmet: "casque", shield: "bouclier" };

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
  // Montagnes
  ctx.fillStyle = "#9b8fb0";
  tri(ctx, -10, HORIZON + 40, 60, HORIZON - 45, 130, HORIZON + 40);
  tri(ctx, 230, HORIZON + 40, 300, HORIZON - 55, 372, HORIZON + 40);
  ctx.fillStyle = "#b3a6c9";
  tri(ctx, 80, HORIZON + 40, 175, HORIZON - 70, 265, HORIZON + 40);
  ctx.fillStyle = "rgba(255,255,255,.85)";
  tri(ctx, 160, HORIZON - 55, 175, HORIZON - 70, 191, HORIZON - 54);
  // Prairie
  const grass = ctx.createLinearGradient(0, HORIZON, 0, H);
  grass.addColorStop(0, "#8cc63f");
  grass.addColorStop(1, "#4f9a2e");
  ctx.fillStyle = grass;
  ctx.fillRect(0, HORIZON + 20, W, H - HORIZON - 20);
  // Chemin en perspective
  ctx.fillStyle = "#e0b76f";
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

  const img = imgs[GUARD_IMG[tg.cfg.type] as ImgSlot];
  if (tg.cfg.type === "bonus") {
    drawBonusStar(ctx, r, t);
  } else if (img) {
    const iw = r * 2.4;
    const ih = (img.height / img.width) * iw;
    ctx.drawImage(img, -iw / 2, -ih / 2 - r * 0.2, iw, ih);
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
  // Barre de vie (géant / multi-coups)
  if (tg.maxHp > 1 && !tg.dead) {
    const bw = r * 1.9;
    ctx.fillStyle = "rgba(0,0,0,.5)";
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -r * 1.75, bw, Math.max(4, r * 0.16), 3);
    ctx.fill();
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -r * 1.75, bw * (tg.hp / tg.maxHp), Math.max(4, r * 0.16), 3);
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

/* ---------- La fronde (premier plan, se déforme avec la tension) ---------- */
function drawSling(ctx: Ctx, eng: FrondeEngine, imgs: GameImages) {
  const pouch = eng.projectile ? { x: W / 2, y: 424 } : eng.pouchScreen();
  const ratio = eng.pullRatio();
  // fourche qui plie légèrement vers la traction
  const bend = ratio * 6;
  const lean = eng.drag ? Math.max(-5, Math.min(5, (eng.drag.cx - eng.drag.sx) * 0.05)) : 0;
  const tipL = { x: W / 2 - 46 + bend * 0.7 + lean, y: 398 + bend };
  const tipR = { x: W / 2 + 46 - bend * 0.7 + lean, y: 398 + bend };

  if (imgs.fronde) {
    // élastiques derrière l'image
    elastics(ctx, tipL, tipR, pouch, ratio);
    if (!eng.projectile) pouchAndStone(ctx, pouch, ratio);
    const iw = 215;
    const ih = (imgs.fronde.height / imgs.fronde.width) * iw;
    ctx.drawImage(imgs.fronde, W / 2 - iw / 2 + lean, H - ih + bend * 0.5, iw, ih);
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
  if (!eng.projectile) pouchAndStone(ctx, pouch, ratio);
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

function pouchAndStone(ctx: Ctx, pouch: { x: number; y: number }, ratio: number) {
  ctx.fillStyle = "#5b3a1e";
  ctx.strokeStyle = "#3d2712";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(pouch.x, pouch.y + 3, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // la pierre, bien visible quand on la tire en arrière
  drawStone(ctx, pouch.x, pouch.y - 4, 9 + ratio * 2.5);
}
