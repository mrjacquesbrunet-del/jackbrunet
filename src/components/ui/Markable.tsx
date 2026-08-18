"use client";

import { useState, type ReactNode } from "react";
import { useToolkit, HIGHLIGHT_COLORS, highlightBg } from "@/lib/toolkit";
import { shareText } from "@/lib/share";
import { addNote, updateNote, removeNote, useNotebook } from "@/lib/notebook";
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
  const saved = tk.isSaved(id);

  // Note reliée à ce passage (pour l'ouvrir/l'éditer directement sous le verset).
  const notes = useNotebook();
  const existingNote = notes.find((n) => n.ref === id);
  const noted = tk.isNoted(id) || Boolean(existingNote);

  /** Ouvre la note directement sous le verset (création ou édition). */
  function openNote() {
    setOpen(true);
    setNoteText(existingNote?.body?? "");
    setNoting(true);
  }

  function saveNote() {
    if (!noteText.trim()) return;
    if (existingNote) {
      updateNote(existingNote.id, { body: noteText.trim() });
    } else {
      const dateStr = new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      addNote({
        category: "Note",
        title: reference? `${reference} · ${dateStr}`: dateStr,
        body: noteText.trim(),
        ref: id,
      });
      tk.markNoted(id); // petit marqueur « note écrite » sur le passage
    }
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
          <button
            type="button"
            aria-label="Voir / modifier ma note"
            title="Une note existe sur ce passage · toucher pour la voir"
            onClick={(e) => {
              e.stopPropagation();
              openNote();
            }}
            className="absolute -right-1 top-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-spirit-600 text-cream shadow-sm transition-transform hover:scale-110"
          >
            <PenGlyph className="h-3 w-3" />
          </button>
        ): null}
      </div>

      {open? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button type="button" className={chip} onClick={() => setShowColors((c) =>!c)}>
            <HighlighterGlyph className="h-3.5 w-3.5" />
            Surligner
          </button>
          {showColors? (
            <div className="mt-1 flex w-full flex-wrap items-center gap-2.5 rounded-2xl border border-night-900/15 bg-white px-3 py-2.5">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  aria-label={c.label}
                  title={c.label}
                  onClick={() => tk.highlightWith(id, c.key, { text, reference, kind })}
                  className={`h-7 w-7 shrink-0 rounded-full ${c.swatch} transition-transform hover:scale-110 ${
                    highlighted && color === c.key? "ring-2 ring-night-900 ring-offset-2": ""
                  }`}
                />
              ))}
              {highlighted? (
                <button
                  type="button"
                  aria-label="Retirer le surlignage"
                  title="Retirer"
                  onClick={() => tk.clearHighlight(id)}
                  className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full border border-night-900/20 px-2.5 py-1 text-xs font-semibold text-night-900/55 transition-colors hover:text-night-900/80"
                >
                  ✕ Retirer
                </button>
              ): null}
            </div>
          ): null}
          <button type="button" className={chip} onClick={copy}>
            <CopyGlyph className="h-3.5 w-3.5" />
            {copied? "Copié!": "Copier"}
          </button>
          <button
            type="button"
            className={chip}
            onClick={() => shareText(reference? `${text}\n${reference}`: text, "https://jackbrunet.com/app")}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={1.9}>
              <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v13M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Partager
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
          <button type="button" className={chip} onClick={openNote}>
            <PenGlyph className="h-3.5 w-3.5" />
            {existingNote? "Ma note": "Noter"}
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
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveNote}
              disabled={!noteText.trim()}
              className="btn-primary text-sm disabled:opacity-40"
            >
              Enregistrer
            </button>
            {existingNote? (
              <button
                type="button"
                onClick={() => {
                  removeNote(existingNote.id);
                  tk.unmarkNoted(id);
                  setNoting(false);
                  setNoteText("");
                }}
                className="btn-ghost text-sm text-red-500"
              >
                Supprimer
              </button>
            ): null}
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
