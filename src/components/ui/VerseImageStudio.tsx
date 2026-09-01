"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildVerseImage,
  VERSE_BACKGROUNDS,
  VERSE_FONTS,
  type VerseFontId,
} from "@/lib/verse-image";
import { shareImageBlob, saveImageBlob } from "@/lib/share";
import { asset } from "@/lib/asset";
import { appShareUrl } from "@/config/app-links";

/**
 * STUDIO du verset : comme les grandes applis Bible — on choisit le FOND
 * (charte RHEMA ou ambiances photo), la POLICE et le FORMAT, avec aperçu en
 * direct, puis on partage sur ses réseaux ou on enregistre l'image.
 */
export function VerseImageStudio({
  text,
  reference,
  badge,
  onClose,
}: {
  text: string;
  reference?: string;
  badge?: string;
  onClose: () => void;
}) {
  const [bg, setBg] = useState<string | null>(VERSE_BACKGROUNDS[0]?.src ?? null);
  const [font, setFont] = useState<VerseFontId>("elegante");
  const [story, setStory] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const urlRef = useRef<string | null>(null);
  const genRef = useRef(0);

  // Aperçu régénéré à chaque changement d'option.
  useEffect(() => {
    const gen = ++genRef.current;
    const t = setTimeout(async () => {
      const blob = await buildVerseImage({
        text,
        reference,
        badge,
        height: story ? 1920 : 1350,
        bg,
        font,
      });
      if (gen !== genRef.current || !blob) return;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = URL.createObjectURL(blob);
      setPreview(urlRef.current);
    }, 120);
    return () => clearTimeout(t);
  }, [text, reference, badge, bg, font, story]);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  async function makeBlob(): Promise<Blob | null> {
    return buildVerseImage({ text, reference, badge, height: story ? 1920 : 1350, bg, font });
  }

  async function share() {
    setBusy(true);
    try {
      const blob = await makeBlob();
      if (blob) await shareImageBlob(blob, "rhema-verset.jpg", `${text}\n\n${appShareUrl()}`);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    try {
      const blob = await makeBlob();
      if (blob) await saveImageBlob(blob, "rhema-verset.jpg");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dark-ctx fixed inset-0 z-[120] flex flex-col bg-night-950 text-cream" role="dialog" aria-modal>
      {/* En-tête */}
      <div className="flex items-center justify-between px-5 pb-2 pt-[calc(env(safe-area-inset-top)+0.9rem)]">
        <p className="font-display text-lg font-extrabold">Personnaliser le verset</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-cream/80"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Aperçu */}
      <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-2">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Aperçu du verset"
            className="max-h-full max-w-full rounded-2xl border border-white/10 object-contain shadow-2xl"
          />
        ) : (
          <p className="text-sm text-cream/50">Préparation de l&apos;aperçu…</p>
        )}
      </div>

      {/* Réglages */}
      <div className="shrink-0 px-5 pb-[calc(env(safe-area-inset-bottom)+1.1rem)]">
        {/* Fonds */}
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/45">Fond</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {/* Charte RHEMA (design nuit + lime) */}
          <button
            type="button"
            onClick={() => setBg(null)}
            className={`h-20 w-12 shrink-0 overflow-hidden rounded-xl border-2 ${bg === null ? "border-dawn-400" : "border-white/15"}`}
            aria-label="Fond RHEMA"
            style={{
              background:
                "radial-gradient(80% 40% at 80% 10%, rgba(202,240,0,.35) 0%, transparent 60%), linear-gradient(180deg,#171716,#0C0C0B)",
            }}
          >
            <span className="font-game text-[9px] font-black text-dawn-300">RHEMA</span>
          </button>
          {VERSE_BACKGROUNDS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBg(b.src)}
              aria-label={`Fond ${b.label}`}
              className={`h-20 w-12 shrink-0 overflow-hidden rounded-xl border-2 ${bg === b.src ? "border-dawn-400" : "border-white/15"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(b.src.replace(".jpg", "-mini.jpg"))} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>

        {/* Police + format */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {VERSE_FONTS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFont(f.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                font === f.id ? "bg-dawn-400 text-night-950" : "border border-white/15 text-cream/75"
              }`}
              style={{ fontFamily: f.cssVar ? `var(${f.cssVar})` : undefined }}
            >
              {f.label}
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-white/15" />
          <button
            type="button"
            onClick={() => setStory(false)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${!story ? "bg-white/15 text-cream" : "border border-white/15 text-cream/60"}`}
          >
            Publication
          </button>
          <button
            type="button"
            onClick={() => setStory(true)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${story ? "bg-white/15 text-cream" : "border border-white/15 text-cream/60"}`}
          >
            Story
          </button>
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="flex-1 rounded-full border border-white/20 py-3 text-sm font-bold text-cream/85 disabled:opacity-50"
          >
            Enregistrer
          </button>
          <button
            type="button"
            onClick={share}
            disabled={busy}
            className="flex-[1.4] rounded-full bg-dawn-400 py-3 text-sm font-bold text-night-950 disabled:opacity-60"
          >
            {busy ? "…" : "Partager"}
          </button>
        </div>
      </div>
    </div>
  );
}
