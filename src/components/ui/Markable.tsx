"use client";

import { useState, type ReactNode } from "react";
import { useToolkit } from "@/lib/toolkit";

const chip =
  "inline-flex items-center gap-1 rounded-full border border-night-900/15 bg-white px-3 py-1.5 text-xs font-semibold text-night-900/80 transition-colors hover:border-night-900/30";

/**
 * Rend un bloc de texte « actionnable » : on le touche pour faire apparaître
 * une petite barre — Surligner · Copier · Enregistrer. Le surlignage et
 * l'enregistrement sont mémorisés sur l'appareil (voir lib/toolkit).
 */
export function Markable({
  id,
  text,
  reference,
  kind = "texte",
  className,
  children,
}: {
  id: string;
  text: string;
  reference?: string;
  kind?: string;
  className?: string;
  children: ReactNode;
}) {
  const tk = useToolkit();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const highlighted = tk.isHighlighted(id);
  const saved = tk.isSaved(id);

  async function copy() {
    const payload = reference ? `${text}\n— ${reference}` : text;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* presse-papiers indisponible */
    }
  }

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        className={`cursor-pointer rounded-xl px-2 -mx-2 transition-colors ${
          highlighted ? "bg-dawn-300/45 ring-1 ring-dawn-400/40" : "hover:bg-night-900/[0.03]"
        }`}
      >
        {children}
      </div>

      {open ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className={chip} onClick={() => tk.toggleHighlight(id)}>
            {highlighted ? "Retirer le surlignage" : "🖍 Surligner"}
          </button>
          <button type="button" className={chip} onClick={copy}>
            {copied ? "Copié !" : "⧉ Copier"}
          </button>
          <button
            type="button"
            className={chip}
            onClick={() => tk.toggleSnippet({ id, text, reference, kind })}
          >
            {saved ? "♥ Enregistré" : "♡ Enregistrer"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
