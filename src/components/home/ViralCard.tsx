"use client";

import { useState } from "react";
import { useToolkit } from "@/lib/toolkit";
import { BookmarkGlyph, BookmarkFilledGlyph } from "@/components/ui/DevoIcons";

/**
 * Carte « virale » : une punchline percutante, joliment mise en page, que le
 * visiteur peut partager en image (story Instagram, WhatsApp…) ou télécharger.
 */
export function ViralCard({ punchline, id }: { punchline: string; id?: string }) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const tk = useToolkit();
  const saved = id ? tk.isSaved(id) : false;

  async function buildImage(): Promise<Blob | null> {
    const W = 1080;
    const H = 1350;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Fond olive
    ctx.fillStyle = "#2b3020";
    ctx.fillRect(0, 0, W, H);
    // Halo lime discret
    const grad = ctx.createRadialGradient(W * 0.85, H * 0.12, 0, W * 0.85, H * 0.12, 700);
    grad.addColorStop(0, "rgba(202,240,0,0.18)");
    grad.addColorStop(1, "rgba(202,240,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    // Cadre lime
    ctx.strokeStyle = "rgba(202,240,0,0.5)";
    ctx.lineWidth = 4;
    ctx.strokeRect(48, 48, W - 96, H - 96);

    // Guillemet
    ctx.fillStyle = "rgba(202,240,0,0.85)";
    ctx.font = '700 220px Georgia, "Times New Roman", serif';
    ctx.textBaseline = "top";
    ctx.fillText("“", 96, 90);

    // Punchline (centrée verticalement, retour à la ligne auto)
    ctx.fillStyle = "#F3F3ED";
    ctx.font = '700 76px Georgia, "Times New Roman", serif';
    ctx.textBaseline = "middle";
    const maxWidth = W - 200;
    const lineHeight = 100;
    const words = punchline.split(" ");
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
    const startY = H / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((l, i) => ctx.fillText(l, 100, startY + i * lineHeight));

    // Pied : wordmark + url
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#CAF000";
    ctx.font = '700 34px Arial, sans-serif';
    ctx.fillText("JACKBRUNET", 100, H - 110);
    ctx.fillStyle = "rgba(243,243,237,0.6)";
    ctx.font = '400 30px Arial, sans-serif';
    ctx.textAlign = "right";
    ctx.fillText("jackbrunet.com", W - 100, H - 110);
    ctx.textAlign = "left";

    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
  }

  async function share() {
    setBusy(true);
    try {
      const blob = await buildImage();
      if (!blob) return;
      const file = new File([blob], "jackbrunet-pensee.png", { type: "image/png" });
      const nav = navigator as Navigator & {
        canShare?: (d: { files: File[] }) => boolean;
      };
      if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({
          files: [file],
          text: `${punchline}\n\njackbrunet.com`,
        });
      } else {
        download(blob);
      }
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
      if (blob) download(blob);
    } finally {
      setBusy(false);
    }
  }

  function download(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jackbrunet-pensee.png";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(`${punchline}\n\njackbrunet.com`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* indisponible */
    }
  }

  return (
    <div className="rounded-3xl border border-night-900/10 bg-night-900/[0.03] p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spirit-600">
        À partager
      </p>

      {/* Aperçu de la carte */}
      <div className="dark-ctx bg-topo-dark relative mt-4 aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-dawn-400/30 p-7 shadow-card">
        <div className="blob -right-12 -top-10 h-44 w-44 bg-dawn-500/25" />
        <div className="relative flex h-full flex-col">
          <span className="font-display text-5xl leading-none text-dawn-300/70">&ldquo;</span>
          <div className="flex flex-1 items-center">
            <p className="font-display text-2xl font-extrabold leading-tight text-cream sm:text-[1.7rem]">
              {punchline}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-[0.2em] text-dawn-300">JACKBRUNET</span>
            <span className="text-[11px] text-cream/50">jackbrunet.com</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={share} disabled={busy} className="btn-primary text-sm">
          {busy ? "Un instant…" : "Partager la carte"}
        </button>
        <button type="button" onClick={downloadImage} disabled={busy} className="btn-ghost text-sm">
          Télécharger l'image
        </button>
        <button type="button" onClick={copyText} className="btn-ghost text-sm">
          {copied ? "Copié !" : "Copier le texte"}
        </button>
        {id ? (
          <button
            type="button"
            onClick={() => tk.toggleSnippet({ id, text: punchline, kind: "punchline" })}
            className="btn-ghost inline-flex items-center gap-1.5 text-sm"
          >
            {saved ? (
              <BookmarkFilledGlyph className="h-4 w-4 text-dawn-300" />
            ) : (
              <BookmarkGlyph className="h-4 w-4" />
            )}
            {saved ? "Enregistré" : "Enregistrer"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
