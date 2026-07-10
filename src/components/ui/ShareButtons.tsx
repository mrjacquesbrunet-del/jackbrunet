"use client";

import { useState } from "react";
import { shareText, shareImageBlob, saveImageBlob } from "@/lib/share";
import { buildVerseImage } from "@/lib/verse-image";
import { openWhatsApp } from "@/lib/external";
import { InAppShare } from "@/components/community/InAppShare";

const SITE_URL = "https://jackbrunet.com";

/**
 * Boutons de partage réutilisables.
 * - WhatsApp (lien direct)
 * - « Partager »: ouvre le menu natif du téléphone (Instagram, SMS, etc.)
 * via l'API Web Share ; repli sur la copie si non disponible (ordinateur).
 * - Copier le texte + le lien.
 */
export function ShareButtons({
  text,
  url = SITE_URL,
  image,
}: {
  text: string;
  url?: string;
  /** Si fourni, ajoute « Image » (partager) et « Enregistrer l'image ». */
  image?: { text: string; reference?: string; badge?: string; filename?: string };
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const message = `${text}\n\n${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* presse-papiers indisponible, on ignore */
    }
  }

  async function nativeShare() {
    // Feuille de partage native (Capacitor) ou Web Share ; repli: copie.
    const shared = await shareText(text, url);
    if (!shared) copy();
  }

  const fileName = image?.filename?? "jackbrunet-verset.png";
  async function shareImage() {
    if (!image) return;
    setBusy(true);
    try {
      const blob = await buildVerseImage(image);
      if (blob) await shareImageBlob(blob, fileName, `${image.text}\n\n${url}`);
    } finally {
      setBusy(false);
    }
  }
  async function saveImage() {
    if (!image) return;
    setBusy(true);
    try {
      const blob = await buildVerseImage(image);
      if (blob) await saveImageBlob(blob, fileName);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {image? (
        <>
          <button
            type="button"
            onClick={shareImage}
            disabled={busy}
            className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
            aria-label="Partager en image"
          >
            <ImageIcon className="h-4 w-4" />
            {busy? "Un instant…": "Image"}
          </button>
          <button
            type="button"
            onClick={saveImage}
            disabled={busy}
            className="btn-ghost px-4 py-2 text-sm disabled:opacity-50"
            aria-label="Enregistrer l'image"
          >
            <DownloadIcon className="h-4 w-4" />
            Enregistrer
          </button>
        </>
      ): null}
      <button
        type="button"
        onClick={() => openWhatsApp(message)}
        className="btn-ghost px-4 py-2 text-sm"
        aria-label="Partager sur WhatsApp"
      >
        <WhatsAppIcon className="h-4 w-4" />
        WhatsApp
      </button>
      <button
        type="button"
        onClick={nativeShare}
        className="btn-ghost px-4 py-2 text-sm"
        aria-label="Partager"
      >
        <ShareIcon className="h-4 w-4" />
        Partager
      </button>
      <button
        type="button"
        onClick={copy}
        className="btn-ghost px-4 py-2 text-sm"
        aria-label="Copier le texte et le lien"
      >
        {copied? "Copié!": "Copier"}
      </button>
      {/* Partage interne: envoyer à un ami / publier sur le mur (si connecté). */}
      <InAppShare text={text} />
    </div>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M4 17l5-5 4 4 3-3 4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0.104 5.359.101 11.892c0 2.096.549 4.142 1.595 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.582 0 11.94-5.359 11.943-11.893a11.821 11.821 0 00-3.416-8.452z" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
