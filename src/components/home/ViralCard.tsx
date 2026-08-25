"use client";

import { useState } from "react";
import { useToolkit } from "@/lib/toolkit";
import { shareImageBlob, saveImageBlob } from "@/lib/share";
import { appShareUrl } from "@/config/app-links";
import { BookmarkGlyph, BookmarkFilledGlyph } from "@/components/ui/DevoIcons";

/**
 * Carte « punchline » — gabarit unique (fait avec Claude Design) pour toute
 * l'app : gros texte bold, UN mot accentué en italique serif, fond qui change
 * chaque jour (noir / gris clair grainé / vert lime), grain, et la signature
 * RHEMA « Une révélation chaque jour dans notre App ».
 *
 * Le mot accentué se marque dans la punchline avec des astérisques :
 *   « Tes *genoux* vont là où tes pieds ne peuvent pas. »
 * Sans marqueur, un mot fort est choisi automatiquement.
 */

/* ---------- Schémas de couleur (rotation par jour) ---------- */
type Scheme = {
  bg: string;
  grain: number; // opacité du grain
  text: string;
  accentText: string; // couleur du mot accentué
  accentBox: string | null; // fond du surlignage (null = pas de boîte)
  footer: string; // couleur discrète du pied
  chipBg: string | null; // fond de la pastille du logo
  chipInk: string; // couleur du logo dans la pastille / à nu
};
const SCHEMES: Scheme[] = [
  // Noir — mot vert, sans boîte
  { bg: "#0C0C0B", grain: 0.05, text: "#E6E6E1", accentText: "#63C400", accentBox: null, footer: "rgba(243,243,237,0.55)", chipBg: null, chipInk: "#E6E6E1" },
  // Gris clair grainé — mot noir sur boîte verte
  { bg: "#D7D7D2", grain: 0.14, text: "#141412", accentText: "#141412", accentBox: "#8FE23C", footer: "rgba(20,20,18,0.55)", chipBg: "#141412", chipInk: "#F3F3ED" },
  // Vert lime — mot blanc sur boîte noire
  { bg: "#6FBF12", grain: 0.1, text: "#0C0C0B", accentText: "#F3F3ED", accentBox: "#0C0C0B", footer: "rgba(12,12,11,0.6)", chipBg: "#0C0C0B", chipInk: "#F3F3ED" },
];
export function schemeForIndex(i: number): Scheme {
  return SCHEMES[((i % SCHEMES.length) + SCHEMES.length) % SCHEMES.length];
}

/* ---------- Choix du mot accentué ---------- */
const IMPACT_WORDS = new Set([
  "dieu","jesus","christ","pere","esprit","foi","priere","prie","grace","amour","vie",
  "esperance","joie","paix","repos","liberte","victoire","lumiere","force","gloire",
  "parole","croix","guerison","berger","royaume","promesse","promis","present","milieu",
]);
function normWord(w: string): string {
  return w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zà-ÿ]/gi, "");
}

/** Découpe la punchline en mots + repère le mot accentué (marqueur * ou auto). */
function parsePunchline(raw: string): { words: string[]; accent: number } {
  const tokens = raw.split(/\s+/).filter(Boolean);
  let accent = -1;
  const words = tokens.map((t, i) => {
    if (t.includes("*")) {
      accent = i;
      return t.replace(/\*/g, "");
    }
    return t;
  });
  if (accent === -1) {
    const hits = words.map((w, i) => (IMPACT_WORDS.has(normWord(w)) ? i : -1)).filter((i) => i >= 0);
    accent = hits.length ? hits[hits.length - 1] : words.length - 1;
  }
  return { words, accent };
}

/** Sépare un mot en (avant, cœur lettres, après) pour n'accentuer que les lettres. */
function splitCore(word: string): [string, string, string] {
  const m = word.match(/^([^\p{L}]*)(.*?)([^\p{L}]*)$/u);
  if (!m) return ["", word, ""];
  return [m[1], m[2], m[3]];
}

/** Fauteuil + lampe (marque RHEMA), en trait. */
function RhemaMark({ className, stroke }: { className?: string; stroke: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke={stroke} strokeWidth={1.7} aria-hidden>
      <path d="M8 16v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 16a1.6 1.6 0 0 0-1.6 1.6V21h13.2v-3.4A1.6 1.6 0 0 0 18 16z" strokeLinejoin="round" />
      <path d="M7 21v2M19 21v2" strokeLinecap="round" />
      <path d="M24 12l2-5 2 5zM26 12v9M23.5 23h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ViralCard({ punchline, id, index = 0 }: { punchline: string; id?: string; index?: number }) {
  const [busy, setBusy] = useState(false);
  const tk = useToolkit();
  const saved = id ? tk.isSaved(id) : false;
  const sc = schemeForIndex(index);
  const { words, accent } = parsePunchline(punchline);

  /* ---------- Export image (canvas) ---------- */
  async function buildImage(story = false): Promise<Blob | null> {
    const W = 1080;
    const H = story ? 1920 : 1350; // 9:16 (story) ou 4:5 (carte)
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Fond
    ctx.fillStyle = sc.bg;
    ctx.fillRect(0, 0, W, H);
    // Grain
    const noise = document.createElement("canvas");
    noise.width = 200;
    noise.height = 200;
    const nctx = noise.getContext("2d");
    if (nctx) {
      const img = nctx.createImageData(200, 200);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.floor(Math.random() * 255);
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      nctx.putImageData(img, 0, 0);
      ctx.save();
      ctx.globalAlpha = sc.grain;
      ctx.globalCompositeOperation = "overlay";
      for (let x = 0; x < W; x += 200) for (let y = 0; y < H; y += 200) ctx.drawImage(noise, x, y);
      ctx.restore();
    }

    // Polices réelles (Archivo / Playfair) chargées par l'app
    try {
      await document.fonts.ready;
    } catch {
      /* repli système */
    }
    const sansFam = getComputedStyle(document.body).fontFamily || "Arial, sans-serif";
    const probe = document.createElement("span");
    probe.className = "font-display";
    probe.style.cssText = "position:absolute;visibility:hidden";
    document.body.appendChild(probe);
    const serifFam = getComputedStyle(probe).fontFamily || 'Georgia, serif';
    probe.remove();

    const fontFor = (i: number, size: number) =>
      i === accent ? `italic 800 ${size}px ${serifFam}` : `800 ${size}px ${sansFam}`;

    // Mise en page : retour à la ligne automatique, taille ajustée
    const maxWidth = W - 200;
    type Line = { idx: number[]; width: number };
    const measure = (w: string, i: number, size: number) => {
      ctx.font = fontFor(i, size);
      return ctx.measureText(w).width;
    };
    const wrap = (size: number): Line[] => {
      ctx.font = `800 ${size}px ${sansFam}`;
      const space = ctx.measureText(" ").width;
      const lines: Line[] = [];
      let cur: number[] = [];
      let curW = 0;
      words.forEach((w, i) => {
        const ww = measure(w, i, size);
        const test = cur.length ? curW + space + ww : ww;
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
    let size = 118;
    let lines = wrap(size);
    while (lines.length * size * 1.16 > H - 620 && size > 62) {
      size -= 5;
      lines = wrap(size);
    }
    ctx.font = `800 ${size}px ${sansFam}`;
    const space = ctx.measureText(" ").width;
    const lineHeight = size * 1.16;
    const startY = H / 2 - ((lines.length - 1) * lineHeight) / 2;
    ctx.textBaseline = "middle";

    lines.forEach((line, li) => {
      let x = W / 2 - line.width / 2;
      const y = startY + li * lineHeight;
      for (const wi of line.idx) {
        const w = words[wi];
        const ww = measure(w, wi, size);
        if (wi === accent) {
          const [pre, core, post] = splitCore(w);
          ctx.font = fontFor(wi, size);
          const preW = ctx.measureText(pre).width;
          const coreW = ctx.measureText(core).width;
          const postW = ctx.measureText(post).width;
          // Boîte de surlignage autour du cœur
          if (sc.accentBox) {
            const padX = size * 0.1;
            const padY = size * 0.12;
            const bx = x + preW - padX;
            const by = y - size * 0.5 - padY / 2;
            const bw = coreW + padX * 2;
            const bh = size + padY;
            const r = size * 0.12;
            ctx.fillStyle = sc.accentBox;
            ctx.beginPath();
            ctx.moveTo(bx + r, by);
            ctx.arcTo(bx + bw, by, bx + bw, by + bh, r);
            ctx.arcTo(bx + bw, by + bh, bx, by + bh, r);
            ctx.arcTo(bx, by + bh, bx, by, r);
            ctx.arcTo(bx, by, bx + bw, by, r);
            ctx.fill();
          }
          ctx.textAlign = "left";
          ctx.fillStyle = sc.text;
          ctx.fillText(pre, x, y);
          ctx.fillStyle = sc.accentText;
          ctx.fillText(core, x + preW, y);
          ctx.fillStyle = sc.text;
          ctx.fillText(post, x + preW + coreW, y);
          x += preW + coreW + postW + space;
        } else {
          ctx.font = fontFor(wi, size);
          ctx.textAlign = "left";
          ctx.fillStyle = sc.text;
          ctx.fillText(w, x, y);
          x += ww + space;
        }
      }
    });

    // Pied : marque + tagline
    const footY = H - 170;
    // pastille éventuelle
    ctx.textAlign = "left";
    const markX = W / 2 - 118;
    if (sc.chipBg) {
      ctx.fillStyle = sc.chipBg;
      const s = 54;
      const r = 14;
      const bx = markX - 8;
      const by = footY - s / 2;
      ctx.beginPath();
      ctx.moveTo(bx + r, by);
      ctx.arcTo(bx + s, by, bx + s, by + s, r);
      ctx.arcTo(bx + s, by + s, bx, by + s, r);
      ctx.arcTo(bx, by + s, bx, by, r);
      ctx.arcTo(bx, by, bx + s, by, r);
      ctx.fill();
    }
    // fauteuil + lampe (trait)
    ctx.strokeStyle = sc.chipInk;
    ctx.lineWidth = 2.4;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const ox = markX + 3;
    const oy = footY - 16;
    const u = 1.35;
    ctx.beginPath();
    ctx.moveTo(ox + 8 * u, oy + 16 * u); ctx.lineTo(ox + 8 * u, oy + 14 * u);
    ctx.arc(ox + 10 * u, oy + 14 * u, 2 * u, Math.PI, 1.5 * Math.PI);
    ctx.lineTo(ox + 16 * u, oy + 12 * u);
    ctx.stroke();
    ctx.strokeRect(ox + 6.4 * u, oy + 16 * u, 12.2 * u, 5 * u);
    ctx.beginPath();
    ctx.moveTo(ox + 24 * u, oy + 12 * u); ctx.lineTo(ox + 26 * u, oy + 7 * u); ctx.lineTo(ox + 28 * u, oy + 12 * u); ctx.closePath();
    ctx.moveTo(ox + 26 * u, oy + 12 * u); ctx.lineTo(ox + 26 * u, oy + 21 * u);
    ctx.moveTo(ox + 23.5 * u, oy + 21 * u); ctx.lineTo(ox + 28.5 * u, oy + 21 * u);
    ctx.stroke();
    // RHEMA
    ctx.fillStyle = sc.text;
    ctx.font = `800 40px ${sansFam}`;
    ctx.textBaseline = "middle";
    ctx.fillText("R H E M A", markX + 62, footY);
    // tagline
    ctx.fillStyle = sc.footer;
    ctx.font = `600 26px ${sansFam}`;
    ctx.textAlign = "center";
    ctx.fillText("Une révélation chaque jour dans notre App", W / 2, footY + 52);
    ctx.textAlign = "left";

    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
  }

  async function share() {
    setBusy(true);
    try {
      const blob = await buildImage();
      if (blob) await shareImageBlob(blob, "rhema-punchline.png", `${punchline.replace(/\*/g, "")}\n\n${appShareUrl()}`);
    } catch {
      /* annulé */
    } finally {
      setBusy(false);
    }
  }
  async function downloadImage() {
    setBusy(true);
    try {
      const blob = await buildImage();
      if (blob) await saveImageBlob(blob, "rhema-punchline.png", `${punchline.replace(/\*/g, "")}\n\n${appShareUrl()}`);
    } finally {
      setBusy(false);
    }
  }
  async function shareStory() {
    setBusy(true);
    try {
      const blob = await buildImage(true);
      if (blob) await saveImageBlob(blob, "rhema-story.png");
    } finally {
      setBusy(false);
    }
  }

  /* ---------- Aperçu à l'écran (fidèle au gabarit) ---------- */
  return (
    <div className="rounded-3xl border border-night-900/10 bg-night-900/[0.03] p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-spirit-600">À partager</p>

      <div
        className="relative mt-4 aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl shadow-card"
        style={{ background: sc.bg }}
      >
        <div className="bg-noise pointer-events-none absolute inset-0 mix-blend-overlay" style={{ opacity: sc.grain * 3 }} />
        <div className="relative flex h-full flex-col px-7 py-8">
          <div className="flex flex-1 items-center justify-center">
            <p
              className="text-center text-[1.9rem] font-extrabold leading-[1.08]"
              style={{ color: sc.text, fontFamily: "var(--font-sans)" }}
            >
              {words.map((w, i) => {
                if (i !== accent) return <span key={i}>{w} </span>;
                const [pre, core, post] = splitCore(w);
                return (
                  <span key={i}>
                    {pre}
                    <span
                      className="italic"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: sc.accentText,
                        background: sc.accentBox ?? "transparent",
                        borderRadius: sc.accentBox ? "0.35rem" : undefined,
                        padding: sc.accentBox ? "0 0.28rem" : undefined,
                        boxDecorationBreak: "clone",
                        WebkitBoxDecorationBreak: "clone",
                      }}
                    >
                      {core}
                    </span>
                    {post}{" "}
                  </span>
                );
              })}
            </p>
          </div>
          {/* Pied : marque + tagline */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="inline-flex items-center gap-2">
              <span
                className="grid h-8 w-8 place-items-center rounded-lg"
                style={{ background: sc.chipBg ?? "transparent" }}
              >
                <RhemaMark className="h-6 w-6" stroke={sc.chipInk} />
              </span>
              <span className="text-sm font-extrabold tracking-[0.16em]" style={{ color: sc.text }}>
                RHEMA
              </span>
            </span>
            <span className="text-[11px] font-semibold" style={{ color: sc.footer }}>
              Une révélation chaque jour dans notre App
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={share} disabled={busy} className="btn-primary text-sm">
          {busy ? "Un instant…" : "Partager la carte"}
        </button>
        <button type="button" onClick={shareStory} disabled={busy} className="btn-ghost inline-flex items-center gap-1.5 text-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
            <circle cx="12" cy="12" r="9" strokeDasharray="4 3" />
            <path d="M12 8.5v7M8.5 12h7" strokeLinecap="round" />
          </svg>
          Story
        </button>
        <button type="button" onClick={downloadImage} disabled={busy} className="btn-ghost text-sm">
          Télécharger l&apos;image
        </button>
        {id ? (
          <button
            type="button"
            onClick={() => tk.toggleSnippet({ id, text: punchline.replace(/\*/g, ""), kind: "punchline" })}
            className="btn-ghost inline-flex items-center gap-1.5 text-sm"
          >
            {saved ? <BookmarkFilledGlyph className="h-4 w-4 text-dawn-300" /> : <BookmarkGlyph className="h-4 w-4" />}
            {saved ? "Enregistré" : "Enregistrer"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
