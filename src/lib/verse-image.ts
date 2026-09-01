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
    ctx.font = `${weight} ${size}px ${family}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    const maxWidth = W - 220;
    const lineHeight = Math.round(size * 1.4);
    const words = body.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
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
  ctx.font = '700 72px Georgia, "Times New Roman", serif';
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  const maxWidth = W - 200;
  const lineHeight = 96;
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line? `${line} ${w}`: w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
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
