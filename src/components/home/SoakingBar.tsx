"use client";

import { useState } from "react";
import { useSoaking } from "@/lib/soaking";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { asset } from "@/lib/asset";
import { PlayGlyph, PauseGlyph, GiftGlyph, MusicGlyph, DownloadGlyph } from "@/components/ui/DevoIcons";

/**
 * Barre compacte « soaking »: lecteur play/pause + cadeau (musique offerte
 * contre email) replié dans la même barre.
 */
export function SoakingBar() {
  const { playing, toggle, label } = useSoaking();
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

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

      {open? (
        <div className="mt-3 border-t border-spirit-600/15 pt-3">
          {unlocked? (
            <a
              href={asset("/audio/soaking-jack-brunet.mp3")}
              download="Soaking - Jack Brunet.mp3"
              className="btn-primary inline-flex items-center gap-1.5 text-sm"
            >
              <DownloadGlyph className="h-4 w-4" />
              Télécharger la musique
            </a>
          ): (
            <>
              <p className="mb-2 text-xs text-night-900/65">
                Reçois la musique en cadeau — laisse ton email.
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
