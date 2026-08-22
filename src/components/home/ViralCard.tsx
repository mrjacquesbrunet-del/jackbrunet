"use client";

import { useState } from "react";
import { useToolkit } from "@/lib/toolkit";
import { shareImageBlob, saveImageBlob } from "@/lib/share";
import { appShareUrl } from "@/config/app-links";
import { BookmarkGlyph, BookmarkFilledGlyph } from "@/components/ui/DevoIcons";

/** Mots « forts » mis en lumière (lime) dans la punchline — 2 maximum. */
const IMPACT_WORDS = new Set([
  "dieu","jesus","christ","pere","esprit","foi","priere","prie","arme","puissante",
  "puissance","victoire","lumiere","force","grace","amour","vie","esperance","joie",
  "paix","repos","libre","liberte","vainqueur","vainqueurs","misericorde","gratitude",
  "louange","cantique","berger","royaume","parole","croix","guerison","guerit","aime",
  "aimes","source","ancre","jesus","seigneur","gloire","promis","suffit","inebranlable",
]);
function normWord(w: string): string {
  return w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
}
/** Indices des mots à colorer en lime (le premier et le dernier mot fort). */
function pickHighlights(words: string[]): Set<number> {
  const hits = words.map((w, i) => (IMPACT_WORDS.has(normWord(w)) ? i : -1)).filter((i) => i >= 0);
  if (hits.length === 0) return new Set([words.length - 1]);
  if (hits.length === 1) return new Set(hits);
  return new Set([hits[0], hits[hits.length - 1]]);
}

/**
 * Carte « virale »: une punchline percutante, joliment mise en page, que le
 * visiteur peut partager en image (story Instagram, WhatsApp…) ou télécharger.
 * Design: fond olive quasi noir, texte blanc, 1-2 mots forts en lime.
 */
export function ViralCard({ punchline, id }: { punchline: string; id?: string }) {
  const [busy, setBusy] = useState(false);
  const tk = useToolkit();
  const saved = id? tk.isSaved(id): false;

  async function buildImage(story = false): Promise<Blob | null> {
    // Format 4:3 (partage) ou 9:16 plein écran (story Instagram/Snap).
    const W = story? 1080: 1600;
    const H = story? 1920: 1200;
    const k = W / 1600; // échelle des tailles pensées pour 1600 de large
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Fond très sombre de la charte. Un canvas ne résout PAS les variables
    // CSS: on lit les valeurs calculées du thème (app grise / site olive),
    // avec repli neutre si indisponible.
    const css = getComputedStyle(document.documentElement);
    const n950 = css.getPropertyValue("--n-950").trim() || "12 12 11";
    const n900 = css.getPropertyValue("--n-900").trim() || "23 23 22";
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, `rgb(${n950})`);
    bg.addColorStop(1, `rgb(${n900})`);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    // Halos lime (deux coins opposés)
    for (const [gx, gy, r, a] of [
      [W * 0.9, H * 0.05, 620, 0.16],
      [W * 0.05, H * 0.98, 520, 0.1],
    ] as const) {
      const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
      grad.addColorStop(0, `rgba(202,240,0,${a})`);
      grad.addColorStop(1, "rgba(202,240,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }
    // Texture topographique de la charte (mêmes courbes que .bg-topo-dark)
    const s = W / 700;
    ctx.lineWidth = 2.2;
    for (const yb of [-70, 30, 130, 230, 330, 430, 530, 630]) {
      ctx.strokeStyle = yb === 330? "rgba(202,240,0,0.06)": "rgba(255,255,255,0.055)";
      ctx.beginPath();
      ctx.moveTo(-50 * s, yb * s);
      ctx.bezierCurveTo(160 * s, (yb - 90) * s, 320 * s, (yb + 120) * s, 520 * s, (yb + 10) * s);
      ctx.bezierCurveTo(720 * s, (yb - 100) * s, 820 * s, (yb - 60) * s, 900 * s, (yb + 60) * s);
      ctx.stroke();
    }
    // Grain (bruit léger, fondu « overlay »)
    const noise = document.createElement("canvas");
    noise.width = 160;
    noise.height = 160;
    const nctx = noise.getContext("2d");
    if (nctx) {
      const img = nctx.createImageData(160, 160);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.floor(Math.random() * 255);
        img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
      }
      nctx.putImageData(img, 0, 0);
      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.globalCompositeOperation = "overlay";
      for (let x = 0; x < W; x += 160) {
        for (let y = 0; y < H; y += 160) ctx.drawImage(noise, x, y);
      }
      ctx.restore();
    }
    // Fin cadre lime
    ctx.strokeStyle = "rgba(202,240,0,0.45)";
    ctx.lineWidth = 3;
    ctx.strokeRect(44 * k, 44 * k, W - 88 * k, H - 88 * k);

    // Guillemet décoratif centré en haut
    ctx.fillStyle = "rgba(202,240,0,0.9)";
    ctx.font = `700 ${Math.round(150 * k)}px Georgia, "Times New Roman", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("“", W / 2, 70 * k);

    // Punchline centrée, taille auto — mots normaux en blanc, mots forts en lime.
    // Typo élégante de la charte (serif d'affichage), en plus grand qu'avant.
    try {
      await document.fonts.ready;
    } catch {
      /* polices système en repli */
    }
    const serifFamily = 'Georgia, "Times New Roman", serif';
    ctx.textBaseline = "middle";
    const words = punchline.split(" ");
    const highlights = pickHighlights(words);
    const maxWidth = W - 260 * k;
    type Line = { idx: number[]; width: number };
    const setFont = (size: number) => {
      ctx.font = `italic 700 ${size}px ${serifFamily}`;
    };
    const wrap = (size: number): Line[] => {
      setFont(size);
      const space = ctx.measureText(" ").width;
      const lines: Line[] = [];
      let cur: number[] = [];
      let curW = 0;
      words.forEach((w, i) => {
        const ww = ctx.measureText(w).width;
        const test = cur.length? curW + space + ww: ww;
        if (test > maxWidth && cur.length) {
          lines.push({ idx: cur, width: curW });
          cur = [i];
          curW = ww;
        } else {
          cur.push(i);
          curW = test;
        }
      });
      if (cur.length) lines.push({ idx: cur, width: curW });
      return lines;
    };
    let size = Math.round(106 * k);
    let lines = wrap(size);
    while (lines.length * size * 1.28 > H - 480 && size > Math.round(58 * k)) {
      size -= 6;
      lines = wrap(size);
    }
    setFont(size);
    const space = ctx.measureText(" ").width;
    const lineHeight = size * 1.28;
    const startY = H / 2 - ((lines.length - 1) * lineHeight) / 2 + 10;
    ctx.textAlign = "left";
    lines.forEach((line, li) => {
      let x = W / 2 - line.width / 2;
      const y = startY + li * lineHeight;
      for (const wi of line.idx) {
        ctx.fillStyle = highlights.has(wi)? "#CAF000": "#FDFDF9";
        ctx.fillText(words[wi], x, y);
        x += ctx.measureText(words[wi]).width + space;
      }
    });
    ctx.textAlign = "center";

    // Pied centré : trait lime légèrement courbé + signature
    ctx.strokeStyle = "#CAF000";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(W / 2 - 130 * k, H - 208);
    ctx.quadraticCurveTo(W / 2, H - 226, W / 2 + 130 * k, H - 214);
    ctx.stroke();
    ctx.fillStyle = "#F3F3ED";
    ctx.font = '700 40px Georgia, "Times New Roman", serif';
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Jack Brunet", W / 2, H - 138);
    ctx.fillStyle = "rgba(202,240,0,0.9)";
    ctx.font = '700 30px Arial, sans-serif';
    ctx.fillText("jackbrunet.com/app", W / 2, H - 88);
    ctx.textAlign = "left";

    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
  }

  async function share() {
    setBusy(true);
    try {
      const blob = await buildImage();
      if (blob) await shareImageBlob(blob, "rhema-pensee.png", `${punchline}\n\n${appShareUrl()}`);
    } catch {
      /* partage annulé */
    } finally {
      setBusy(false);
    }
  }

  async function downloadImage() {
    setBusy(true);
    try {
      const blob = await buildImage();
      if (blob) await saveImageBlob(blob, "rhema-pensee.png", `${punchline}\n\n${appShareUrl()}`);
    } finally {
      setBusy(false);
    }
  }

  /** Image plein format story (1080×1920) → feuille de partage (Instagram, Snap…). */
  async function shareStory() {
    setBusy(true);
    try {
      const blob = await buildImage(true);
      if (blob) await saveImageBlob(blob, "rhema-story.png");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-night-900/10 bg-night-900/[0.03] p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spirit-600">
        À partager
      </p>

      {/* Aperçu de la carte — 4:3, olive quasi noir, mots forts en lime */}
      <div
        className="dark-ctx relative mt-4 aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl border border-dawn-400/30 shadow-card"
        style={{ background: "linear-gradient(180deg,rgb(var(--n-950)),rgb(var(--n-900)))" }}
      >
        {/* Textures de la charte : courbes topographiques + grain */}
        <div
          className="bg-topo-dark pointer-events-none absolute inset-0 opacity-80"
          style={{ backgroundColor: "transparent" }}
        />
        <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay" />
        <div className="blob -right-12 -top-10 h-40 w-40 bg-dawn-500/20" />
        <div className="blob -bottom-12 -left-10 h-32 w-32 bg-dawn-500/10" />
        <div className="pointer-events-none absolute inset-2 rounded-xl border border-dawn-400/25" />
        <div className="relative flex h-full flex-col items-center px-6 py-4 text-center">
          <span className="font-display text-4xl leading-none text-dawn-400/90">&ldquo;</span>
          <div className="flex min-h-0 flex-1 items-center">
            <p className="font-display text-xl font-extrabold italic leading-snug text-white sm:text-[1.45rem]">
              {(() => {
                const words = punchline.split(" ");
                const hl = pickHighlights(words);
                return words.map((w, i) => (
                  <span key={i} className={hl.has(i)? "text-dawn-400": undefined}>
                    {w}
                    {i < words.length - 1? " ": ""}
                  </span>
                ));
              })()}
            </p>
          </div>
          <div className="flex flex-col items-center gap-0.5 pb-1">
            <svg width="70" height="10" viewBox="0 0 70 10" className="text-dawn-400" aria-hidden>
              <path d="M3 7 Q 35 2, 67 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            </svg>
            <span className="font-display text-xs font-bold text-white">Jack Brunet</span>
            <span className="text-[10px] font-semibold text-dawn-300">jackbrunet.com/app</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={share} disabled={busy} className="btn-primary text-sm">
          {busy? "Un instant…": "Partager la carte"}
        </button>
        <button type="button" onClick={shareStory} disabled={busy} className="btn-ghost inline-flex items-center gap-1.5 text-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
            <circle cx="12" cy="12" r="9" strokeDasharray="4 3" />
            <path d="M12 8.5v7M8.5 12h7" strokeLinecap="round" />
          </svg>
          Story
        </button>
        <button type="button" onClick={downloadImage} disabled={busy} className="btn-ghost text-sm">
          Télécharger l'image
        </button>
        {id? (
          <button
            type="button"
            onClick={() => tk.toggleSnippet({ id, text: punchline, kind: "punchline" })}
            className="btn-ghost inline-flex items-center gap-1.5 text-sm"
          >
            {saved? (
              <BookmarkFilledGlyph className="h-4 w-4 text-dawn-300" />
            ): (
              <BookmarkGlyph className="h-4 w-4" />
            )}
            {saved? "Enregistré": "Enregistrer"}
          </button>
        ): null}
      </div>
    </div>
  );
}
