"use client";

import { useState } from "react";
import Link from "next/link";
import { addNote } from "@/lib/notebook";

/**
 * Petit bloc « prendre une note » placé après la réflexion: ce que la personne
 * écrit est enregistré directement dans son carnet (site + app).
 */
export function QuickNote() {
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState(false);

  function save() {
    if (!body.trim()) return;
    addNote({ category: "Note", title: "", body: body.trim() });
    setBody("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="glass-strong max-w-2xl p-6 sm:p-7">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-night-900 text-dawn-400">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.7}>
            <path d="M5 4h11l3 3v13H5z" strokeLinejoin="round" />
            <path d="M9 12h6M9 16h4" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <p className="font-display text-lg font-bold leading-tight">Prends une note</p>
          <p className="text-sm text-night-900/55">Ce que Dieu met sur ton cœur aujourd'hui.</p>
        </div>
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Écris ta réflexion, une prière, une parole reçue…"
        className="field mt-4 w-full resize-y"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!body.trim()}
          className="btn-primary disabled:opacity-40"
        >
          Ajouter à mon carnet
        </button>
        <Link href="/carnet" className="text-sm font-semibold text-spirit-600 hover:underline">
          Voir mon carnet →
        </Link>
        {saved? <span className="text-sm font-semibold text-spirit-600">✓ Enregistré dans ton carnet</span>: null}
      </div>
    </div>
  );
}
