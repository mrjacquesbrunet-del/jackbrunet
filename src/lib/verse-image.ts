"use client";

import { asset } from "./asset";

/** Fonds photo/ambiance du studio (public/img/versets).
 * `light: true` = fond clair → texte nuit et voile inversé. */
export const VERSE_BACKGROUNDS: { id: string; label: string; src: string; light?: boolean }[] = [
  { id: "aurore", label: "Aurore", src: "/img/versets/aurore.jpg" },
  { id: "ocean", label: "Océan", src: "/img/versets/ocean.jpg" },
  { id: "etoiles", label: "Étoiles", src: "/img/versets/etoiles.jpg" },
  { id: "moisson", label: "Moisson", src: "/img/versets/moisson.jpg" },
  { id: "emeraude", label: "Émeraude", src: "/img/versets/emeraude.jpg" },
  { id: "royal", label: "Royal", src: "/img/versets/royal.jpg" },
  { id: "braise", label: "Braise", src: "/img/versets/braise.jpg" },
  { id: "lin", label: "Lin", src: "/img/versets/lin.jpg", light: true },
];

/** Polices proposées (auto-hébergées par l'app → dispo hors-ligne). */
export const VERSE_FONTS: {
  id: VerseFontId;
  label: string;
  cssVar: string;
  fallback: string;
  weight: number;
  /** Ajustement de taille (les manuscrites paraissent petites). */
  scale?: number;
  upper?: boolean;
}[] = [
  { id: "elegante", label: "Élégante", cssVar: "--font-display", fallback: 'Georgia, "Times New Roman", serif', weight: 700 },
  { id: "fine", label: "Majesté", cssVar: "--font-fine", fallback: "Georgia, serif", weight: 600, scale: 1.12 },
  { id: "manuscrite", label: "Manuscrite", cssVar: "--font-script", fallback: "cursive", weight: 700, scale: 1.22 },
  { id: "impact", label: "Impact", cssVar: "--font-impact", fallback: "Arial Narrow, sans-serif", weight: 400, scale: 1.1, upper: true },
  { id: "moderne", label: "Moderne", cssVar: "", fallback: "Arial, Helvetica, sans-serif", weight: 700 },
  { id: "ronde", label: "Ronde", cssVar: "--font-game", fallback: "Arial Rounded MT, Arial, sans-serif", weight: 700 },
];
export type VerseFontId = "elegante" | "fine" | "manuscrite" | "impact" | "moderne" | "ronde";

/** Famille réellement chargée pour une variable de police (next/font renomme
 * les familles) : on lit la valeur calculée sur un élément temporaire. */
function familyFor(fontId: VerseFontId): string {
  const meta = VERSE_FONTS.find((f) => f.id === fontId) ?? VERSE_FONTS[0];
  if (!meta.cssVar) return meta.fallback;
  try {
    const el = document.createElement("span");
    el.style.fontFamily = `var(${meta.cssVar})`;
    document.body.appendChild(el);
    const fam = getComputedStyle(el).fontFamily;
    el.remove();
    return fam || meta.fallback;
  } catch {
    return meta.fallback;
  }
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = asset(src);
  });
}

/** Coupe le texte en lignes d'au plus `maxWidth` (police déjà posée sur ctx). */
function couper(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const w of text.split(" ")) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Taille de police qui fait tenir le texte (plusieurs versets) dans la
 * hauteur disponible : on part de la taille normale et on réduit pas à pas.
 * Si même la plus petite taille ne suffit pas, le texte est coupé « … ».
 */
function ajuster(
  ctx: CanvasRenderingContext2D,
  text: string,
  o: { maxWidth: number; maxHeight: number; size: number; min: number; ratio: number; font: (size: number) => string },
): { lines: string[]; size: number; lineHeight: number } {
  let size = o.size;
  for (;;) {
    ctx.font = o.font(size);
    const lineHeight = Math.round(size * o.ratio);
    const lines = couper(ctx, text, o.maxWidth);
    if (lines.length * lineHeight <= o.maxHeight) return { lines, size, lineHeight };
    if (size <= o.min) {
      const garde = Math.max(1, Math.floor(o.maxHeight / lineHeight));
      const coupees = lines.slice(0, garde);
      coupees[garde - 1] = coupees[garde - 1].replace(/[\s,;:.]*\S*$/, "") + " …";
      return { lines: coupees, size, lineHeight };
    }
    size = Math.max(o.min, size - 4);
  }
}

/**
 * Génère une belle image partageable (1080×1350, format story/portrait) pour
 * un verset ou une déclaration. Par défaut : charte de l'app (nuit + lime).
 * Avec `bg` (studio de personnalisation) : fond photo/ambiance + voile pour
 * la lisibilité + police au choix (`font`).
 */
export async function buildVerseImage(opts: {
  text: string;
  reference?: string;
  badge?: string;
  /** Hauteur du canevas : 1350 (portrait) par défaut, 1920 pour une story. */
  height?: number;
  /** Chemin d'un fond du studio (VERSE_BACKGROUNDS[i].src). */
  bg?: string | null;
  /** Police du studio. */
  font?: VerseFontId;
}): Promise<Blob | null> {
  const { text, reference, badge } = opts;
  const W = 1080;
  const H = opts.height?? 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  try {
    await document.fonts.ready;
  } catch {
    /* polices système en repli */
  }

  /* ---------- Mode STUDIO : fond photo + voile + police au choix ---------- */
  if (opts.bg) {
    const img = await loadImage(opts.bg);
    if (img) {
      // Couvre le canevas (cover, centré)
      const scale = Math.max(W / img.width, H / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = "#171716";
      ctx.fillRect(0, 0, W, H);
    }
    // Fond clair (ex. Lin) → texte nuit et voile blanc doux.
    const light = !!VERSE_BACKGROUNDS.find((b) => b.src === opts.bg)?.light;
    const ink = light ? "#171716" : "#FFFFFF";
    const veil = ctx.createLinearGradient(0, 0, 0, H);
    if (light) {
      veil.addColorStop(0, "rgba(255,255,250,0.22)");
      veil.addColorStop(0.45, "rgba(255,255,250,0.34)");
      veil.addColorStop(1, "rgba(255,255,250,0.42)");
    } else {
      veil.addColorStop(0, "rgba(10,10,10,0.18)");
      veil.addColorStop(0.45, "rgba(10,10,10,0.34)");
      veil.addColorStop(1, "rgba(10,10,10,0.5)");
    }
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, W, H);

    const fontMeta = VERSE_FONTS.find((f) => f.id === (opts.font ?? "elegante")) ?? VERSE_FONTS[0];
    const family = familyFor(fontMeta.id);
    const weight = fontMeta.weight;
    const size = Math.round(66 * (fontMeta.scale ?? 1));
    const refSize = Math.round(38 * Math.min(1.08, fontMeta.scale ?? 1));
    const body = fontMeta.upper ? text.toUpperCase() : text;
    // Force le chargement réel de la police (les faces next/font sont
    // paresseuses : sans ça, le canvas retombe sur une police par défaut).
    try {
      await document.fonts.load(`${weight} ${size}px ${family}`);
      await document.fonts.load(`${weight} ${refSize}px ${family}`);
    } catch {
      /* repli silencieux */
    }

    if (badge) {
      ctx.fillStyle = light ? "rgba(23,23,22,0.75)" : "rgba(255,255,255,0.85)";
      ctx.font = "700 30px Arial, sans-serif";
      ctx.textBaseline = "top";
      ctx.textAlign = "center";
      ctx.fillText(badge.toUpperCase(), W / 2, 150);
    }

    // Verset centré, avec ombre douce
    ctx.fillStyle = ink;
    ctx.shadowColor = light ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";
    ctx.shadowBlur = light ? 14 : 24;
    ctx.shadowOffsetY = light ? 0 : 4;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    // Place du texte : sous le badge, au-dessus de la référence + signature.
    const { lines, lineHeight } = ajuster(ctx, body, {
      maxWidth: W - 220,
      maxHeight: H - (badge ? 230 : 160) - (reference ? 300 : 220),
      size,
      min: Math.round(34 * (fontMeta.scale ?? 1)),
      ratio: 1.4,
      font: (t) => `${weight} ${t}px ${family}`,
    });
    const blockH = (lines.length - 1) * lineHeight;
    const startY = H / 2 - blockH / 2 - (reference ? 30 : 0);
    lines.forEach((l, i) => ctx.fillText(l, W / 2, startY + i * lineHeight));

    if (reference) {
      ctx.font = `${weight} ${refSize}px ${family}`;
      ctx.fillStyle = light ? "rgba(23,23,22,0.85)" : "rgba(255,255,255,0.92)";
      // Sous la DERNIÈRE ligne du bloc (startY = milieu de la 1re ligne).
      ctx.fillText(reference.toUpperCase(), W / 2, startY + blockH + lineHeight / 2 + 60);
    }
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Signature discrète
    ctx.fillStyle = light ? "rgba(23,23,22,0.55)" : "rgba(255,255,255,0.7)";
    ctx.font = "700 28px Arial, sans-serif";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("RHEMA · jackbrunet.com/app", W / 2, H - 90);
    ctx.textAlign = "left";

    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92));
  }

  /* ---------- Mode CHARTE (design nuit + lime historique) ---------- */

  // Fond gris-noir de la charte (un canvas ne résout pas les variables CSS:
  // on lit les valeurs calculées du thème, avec repli neutre).
  const css = getComputedStyle(document.documentElement);
  const n950 = css.getPropertyValue("--n-950").trim() || "12 12 11";
  const n900 = css.getPropertyValue("--n-900").trim() || "23 23 22";
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, `rgb(${n950})`);
  bgGrad.addColorStop(1, `rgb(${n900})`);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);
  // Halo lime discret
  const grad = ctx.createRadialGradient(W * 0.85, H * 0.12, 0, W * 0.85, H * 0.12, 720);
  grad.addColorStop(0, "rgba(202,240,0,0.18)");
  grad.addColorStop(1, "rgba(202,240,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  // Cadre lime
  ctx.strokeStyle = "rgba(202,240,0,0.5)";
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, W - 96, H - 96);

  // Badge éventuel (ex. « À déclarer sur ta vie »)
  if (badge) {
    ctx.fillStyle = "rgba(202,240,0,0.85)";
    ctx.font = '700 30px Arial, sans-serif';
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText(badge.toUpperCase(), 100, 120);
  }

  // Guillemet
  ctx.fillStyle = "rgba(202,240,0,0.85)";
  ctx.font = '700 200px Georgia, "Times New Roman", serif';
  ctx.textBaseline = "top";
  ctx.fillText("“", 96, badge? 150: 110);

  // Verset (centré verticalement, retour à la ligne auto)
  ctx.fillStyle = "#F3F3ED";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  // Entre le guillemet (en haut) et la référence + le pied (en bas).
  const { lines, lineHeight } = ajuster(ctx, text, {
    maxWidth: W - 200,
    maxHeight: H - (badge ? 380 : 340) - (reference ? 250 : 230),
    size: 72,
    min: 38,
    ratio: 96 / 72,
    font: (t) => `700 ${t}px Georgia, "Times New Roman", serif`,
  });
  const blockH = (lines.length - 1) * lineHeight;
  const startY = H / 2 - blockH / 2 - (reference? 30: 0);
  lines.forEach((l, i) => ctx.fillText(l, 100, startY + i * lineHeight));

  // Référence : sous la DERNIÈRE ligne (startY = milieu de la 1re ligne).
  if (reference) {
    ctx.fillStyle = "#CAF000";
    ctx.font = '700 40px Georgia, "Times New Roman", serif';
    ctx.textBaseline = "top";
    ctx.fillText(reference, 100, startY + blockH + lineHeight / 2 + 24);
  }

  // Pied: wordmark + url
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#CAF000";
  ctx.font = '700 34px Arial, sans-serif';
  ctx.textAlign = "left";
  ctx.fillText("JACKBRUNET", 100, H - 110);
  ctx.fillStyle = "rgba(243,243,237,0.6)";
  ctx.font = '400 30px Arial, sans-serif';
  ctx.textAlign = "right";
  ctx.fillText("jackbrunet.com/app", W - 100, H - 110);
  ctx.textAlign = "left";

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}
