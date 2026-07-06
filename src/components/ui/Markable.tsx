"use client";

import { useState, type ReactNode } from "react";
import { useToolkit, HIGHLIGHT_COLORS, highlightBg } from "@/lib/toolkit";
import { addNote } from "@/lib/notebook";
import {
  HighlighterGlyph,
  CopyGlyph,
  BookmarkGlyph,
  BookmarkFilledGlyph,
  PenGlyph,
} from "@/components/ui/DevoIcons";

const chip =
  "inline-flex items-center gap-1.5 rounded-full border border-night-900/15 bg-white px-3 py-1.5 text-xs font-semibold text-night-900/80 transition-colors hover:border-night-900/30";

/**
 * Rend un bloc de texte « actionnable »: on le touche pour faire apparaître
 * une petite barre, Surligner · Copier · Enregistrer. Le surlignage et
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
  const [noting, setNoting] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  const [showColors, setShowColors] = useState(false);
  const highlighted = tk.isHighlighted(id);
  const color = tk.highlightColor(id);
  const noted = tk.isNoted(id);
  const saved = tk.isSaved(id);

  function saveNote() {
    if (!noteText.trim()) return;
    const dateStr = new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    addNote({
      category: "Note",
      title: reference? `${reference} · ${dateStr}`: dateStr,
      body: noteText.trim(),
    });
    tk.markNoted(id); // petit marqueur « note écrite » sur le passage
    setNoteText("");
    setNoting(false);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2500);
  }

  async function copy() {
    const payload = reference? `${text}\n${reference}`: text;
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
        onClick={() => setOpen((o) =>!o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) =>!o);
          }
        }}
        className={`relative cursor-pointer rounded-xl px-2 -mx-2 transition-colors ${
          highlighted? `${highlightBg(color)} ring-1 ring-black/5`: "hover:bg-night-900/[0.03]"
        }`}
      >
        {children}
        {noted? (
          <span
            aria-label="Note écrite"
            title="Une note existe sur ce passage"
            className="absolute right-0 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-spirit-600 text-cream"
          >
            <PenGlyph className="h-2.5 w-2.5" />
          </span>
        ): null}
      </div>

      {open? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button type="button" className={chip} onClick={() => setShowColors((c) =>!c)}>
            <HighlighterGlyph className="h-3.5 w-3.5" />
            Surligner
          </button>
          {showColors? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-night-900/15 bg-white px-2 py-1">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  aria-label={c.label}
                  title={c.label}
                  onClick={() => tk.highlightWith(id, c.key, { text, reference, kind })}
                  className={`h-5 w-5 rounded-full ${c.swatch} transition-transform hover:scale-110 ${
                    highlighted && color === c.key? "ring-2 ring-night-900 ring-offset-1": ""
                  }`}
                />
              ))}
              {highlighted? (
                <button
                  type="button"
                  aria-label="Retirer le surlignage"
                  title="Retirer"
                  onClick={() => tk.clearHighlight(id)}
                  className="grid h-5 w-5 place-items-center rounded-full border border-night-900/20 text-night-900/50"
                >
                  ✕
                </button>
              ): null}
            </span>
          ): null}
          <button type="button" className={chip} onClick={copy}>
            <CopyGlyph className="h-3.5 w-3.5" />
            {copied? "Copié!": "Copier"}
          </button>
          <button
            type="button"
            className={chip}
            onClick={() => tk.toggleSnippet({ id, text, reference, kind })}
          >
            {saved? (
              <BookmarkFilledGlyph className="h-3.5 w-3.5 text-spirit-600" />
            ): (
              <BookmarkGlyph className="h-3.5 w-3.5" />
            )}
            {saved? "Enregistré": "Enregistrer"}
          </button>
          <button type="button" className={chip} onClick={() => setNoting((n) =>!n)}>
            <PenGlyph className="h-3.5 w-3.5" />
            Noter
          </button>
        </div>
      ): null}

      {/* Éditeur de note, on reste sur la page, ça part dans le carnet */}
      {open && noting? (
        <div className="mt-2 rounded-2xl border border-night-900/15 bg-white p-3">
          {reference? (
            <p className="mb-1.5 text-xs font-semibold text-spirit-600">{reference}</p>
          ): null}
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Ta note sur ce passage…"
            rows={3}
            className="field w-full resize-y text-sm"
            autoFocus
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={saveNote}
              disabled={!noteText.trim()}
              className="btn-primary text-sm disabled:opacity-40"
            >
              Enregistrer dans mon carnet
            </button>
            <button
              type="button"
              onClick={() => {
                setNoting(false);
                setNoteText("");
              }}
              className="btn-ghost text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      ): null}

      {noteSaved? (
        <p className="mt-1.5 text-xs font-semibold text-spirit-600">
          ✓ Note enregistrée dans ton carnet
        </p>
      ): null}
    </div>
  );
}
