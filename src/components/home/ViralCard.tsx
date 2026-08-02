"use client";

import { useState } from "react";
import { useToolkit } from "@/lib/toolkit";
import { shareImageBlob, saveImageBlob } from "@/lib/share";
import { BookmarkGlyph, BookmarkFilledGlyph } from "@/components/ui/DevoIcons";

/**
 * Carte « virale »: une punchline percutante, joliment mise en page, que le
 * visiteur peut partager en image (story Instagram, WhatsApp…) ou télécharger.
 */
export function ViralCard({ punchline, id }: { punchline: string; id?: string }) {
  const [busy, setBusy] = useState(false);
  const tk = useToolkit();
  const saved = id? tk.isSaved(id): false;

  async function buildImage(): Promise<Blob | null> {
    // Format 4:3 — plus compact et élégant pour le partage.
    const W = 1600;
    const H = 1200;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Fond nuit olive, dégradé subtil
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#1F2216");
    bg.addColorStop(1, "#2B3020");
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
    // Grille discrète (charte)
    ctx.strokeStyle = "rgba(243,243,237,0.045)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 100) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += 100) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // Fin cadre lime
    ctx.strokeStyle = "rgba(202,240,0,0.45)";
    ctx.lineWidth = 3;
    ctx.strokeRect(44, 44, W - 88, H - 88);

    // Guillemet décoratif centré en haut
    ctx.fillStyle = "rgba(202,240,0,0.9)";
    ctx.font = '700 150px Georgia, "Times New Roman", serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("“", W / 2, 70);

    // Punchline centrée (les deux axes), taille auto pour remplir sans déborder
    ctx.fillStyle = "#F3F3ED";
    ctx.textBaseline = "middle";
    const maxWidth = W - 320;
    const wrap = (size: number): string[] => {
      ctx.font = `italic 700 ${size}px Georgia, "Times New Roman", serif`;
      const words = punchline.split(" ");
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
      return lines;
    };
    let size = 92;
    let lines = wrap(size);
    while (lines.length * size * 1.32 > H - 520 && size > 56) {
      size -= 6;
      lines = wrap(size);
    }
    const lineHeight = size * 1.32;
    const startY = H / 2 - ((lines.length - 1) * lineHeight) / 2 + 10;
    lines.forEach((l, i) => ctx.fillText(l, W / 2, startY + i * lineHeight));

    // Pied centré : trait lime légèrement courbé + signature
    ctx.strokeStyle = "#CAF000";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(W / 2 - 130, H - 208);
    ctx.quadraticCurveTo(W / 2, H - 226, W / 2 + 130, H - 214);
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
      if (blob) await shareImageBlob(blob, "jackbrunet-pensee.png", `${punchline}\n\njackbrunet.com`);
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
      if (blob) await saveImageBlob(blob, "jackbrunet-pensee.png", `${punchline}\n\njackbrunet.com`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-night-900/10 bg-night-900/[0.03] p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spirit-600">
        À partager
      </p>

      {/* Aperçu de la carte — format 4:3, composition centrée */}
      <div className="dark-ctx bg-topo-dark relative mt-4 aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl border border-dawn-400/30 shadow-card">
        <div className="blob -right-12 -top-10 h-40 w-40 bg-dawn-500/25" />
        <div className="blob -bottom-12 -left-10 h-32 w-32 bg-dawn-500/15" />
        <div className="pointer-events-none absolute inset-2 rounded-xl border border-dawn-400/30" />
        <div className="relative flex h-full flex-col items-center px-6 py-4 text-center">
          <span className="font-display text-4xl leading-none text-dawn-300/80">&ldquo;</span>
          <div className="flex min-h-0 flex-1 items-center">
            <p className="font-display text-lg font-extrabold italic leading-snug text-cream sm:text-xl">
              {punchline}
            </p>
          </div>
          <div className="flex flex-col items-center gap-0.5 pb-1">
            <svg width="70" height="10" viewBox="0 0 70 10" className="text-dawn-400" aria-hidden>
              <path d="M3 7 Q 35 2, 67 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            </svg>
            <span className="font-display text-xs font-bold text-cream">Jack Brunet</span>
            <span className="text-[10px] font-semibold text-dawn-300">jackbrunet.com/app</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={share} disabled={busy} className="btn-primary text-sm">
          {busy? "Un instant…": "Partager la carte"}
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
