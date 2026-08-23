"use client";

import { useState } from "react";
import { useSoaking, SOAKING_VOL_MIN, SOAKING_VOL_MAX } from "@/lib/soaking";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { asset, mediaUrl } from "@/lib/asset";
import { PlayGlyph, PauseGlyph, GiftGlyph, MusicGlyph, DownloadGlyph } from "@/components/ui/DevoIcons";

/**
 * Barre compacte « soaking »: lecteur play/pause + cadeau (musique offerte
 * contre email) replié dans la même barre.
 */
export function SoakingBar() {
  const { playing, toggle, label, volume, setVolume } = useSoaking();
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const volPct = Math.round(
    ((volume - SOAKING_VOL_MIN) / (SOAKING_VOL_MAX - SOAKING_VOL_MIN)) * 100,
  );

  return (
    <div className="rounded-3xl border border-spirit-600/20 bg-spirit-500/[0.08] p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-pressed={playing}
          aria-label={playing? "Mettre en pause": "Lancer la musique"}
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors ${
            playing? "bg-spirit-500 text-cream": "bg-dawn-400 text-night-950"
          }`}
        >
          {playing? <PauseGlyph className="h-5 w-5" />: <PlayGlyph className="h-5 w-5" />}
        </button>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-display text-sm font-bold leading-tight">
            <MusicGlyph className="h-4 w-4 text-spirit-600" />
            Musique soaking
          </p>
          <p className="truncate text-xs text-night-900/60">
            {playing? `En cours · ${label}`: "Une ambiance pour ton temps avec Dieu"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) =>!o)}
          aria-expanded={open}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-night-900 px-3.5 py-2 text-xs font-semibold text-cream transition-colors hover:bg-night-800"
        >
          <GiftGlyph className="h-4 w-4" />
          Offerte
        </button>
      </div>

      {playing ? (
        <div className="mt-3 flex items-center gap-2.5 border-t border-spirit-600/15 pt-3">
          {/* Volume de la musique, indépendant de la voix de la méditation */}
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 shrink-0 fill-none stroke-spirit-600"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <path
              d="M4 10v4a1 1 0 0 0 1 1h3l4 4V5L8 9H5a1 1 0 0 0-1 1zM16.5 12a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="range"
            min={SOAKING_VOL_MIN}
            max={SOAKING_VOL_MAX}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1 flex-1 accent-spirit-600"
            aria-label="Volume de la musique soaking"
          />
          <span className="w-9 text-right text-[11px] tabular-nums text-night-900/50">
            {volPct}%
          </span>
        </div>
      ) : null}

      {open? (
        <div className="mt-3 border-t border-spirit-600/15 pt-3">
          {unlocked? (
            <a
              href={mediaUrl("/audio/soaking-jack-brunet.mp3")}
              download="Soaking - Jack Brunet.mp3"
              className="btn-primary inline-flex items-center gap-1.5 text-sm"
            >
              <DownloadGlyph className="h-4 w-4" />
              Télécharger la musique
            </a>
          ): (
            <>
              <p className="mb-2 text-xs text-night-900/65">
                Reçois la musique en cadeau, laisse ton email.
              </p>
              <NewsletterForm
                source="cadeau-soaking"
                cta="Recevoir"
                note=""
                onSuccess={() => setUnlocked(true)}
              />
            </>
          )}
        </div>
      ): null}
    </div>
  );
}
