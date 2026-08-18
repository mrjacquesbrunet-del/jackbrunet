"use client";

/**
 * Génère une belle image partageable (1080×1350, format story/portrait) pour
 * un verset ou une déclaration, dans la charte de l'app (gris-noir + lime, serif).
 * Utilisée pour « Partager en image » et « Enregistrer l'image ».
 */
export async function buildVerseImage(opts: {
  text: string;
  reference?: string;
  badge?: string;
  /** Hauteur du canevas : 1350 (portrait) par défaut, 1920 pour une story. */
  height?: number;
}): Promise<Blob | null> {
  const { text, reference, badge } = opts;
  const W = 1080;
  const H = opts.height?? 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

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

  // Référence (sous le texte, en lime)
  if (reference) {
    ctx.fillStyle = "#CAF000";
    ctx.font = '700 40px Georgia, "Times New Roman", serif';
    ctx.textBaseline = "top";
    ctx.fillText(reference, 100, startY + blockH / 2 + lineHeight / 2 + 40);
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
