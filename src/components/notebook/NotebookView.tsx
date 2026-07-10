"use client";

import { useState } from "react";
import {
  useNotebook,
  addNote,
  updateNote,
  removeNote,
  toggleAnswered,
  NOTE_CATEGORIES,
  type NoteCategory,
} from "@/lib/notebook";
import { BookGlyph, NoteGlyph } from "@/components/ui/DevoIcons";
import { PrayerMark } from "@/components/ui/PrayerMark";

const CAT_ICON: Record<NoteCategory, (p: { className?: string }) => React.ReactElement> = {
  Prière: PrayerMark,
  "Parole reçue": BookGlyph,
  Note: NoteGlyph,
};
const CAT_LABEL: Record<NoteCategory, string> = {
  Prière: "Sujet de prière",
  "Parole reçue": "Parole reçue",
  Note: "Note",
};

const fmt = (ts: number) =>
  new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export function NotebookView() {
  const notes = useNotebook();
  const [category, setCategory] = useState<NoteCategory>("Prière");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [filter, setFilter] = useState<NoteCategory | "Tout">("Tout");

  // Édition d'une note existante (rouvrir pour modifier / compléter).
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  const visible = notes.filter((n) => filter === "Tout" || n.category === filter);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() &&!title.trim()) return;
    addNote({ category, title, body });
    setTitle("");
    setBody("");
  }

  function startEdit(id: string, t: string, b: string) {
    setEditId(id);
    setEditTitle(t);
    setEditBody(b);
  }
  function saveEdit() {
    if (!editId) return;
    updateNote(editId, { title: editTitle.trim(), body: editBody.trim() });
    setEditId(null);
  }

  return (
    <section className="container-x py-10">
      {/* Formulaire d'ajout */}
      <form onSubmit={submit} className="glass-strong max-w-2xl p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {NOTE_CATEGORIES.map((c) => {
            const Icon = CAT_ICON[c];
            return (
              <button
                type="button"
                key={c}
                onClick={() => setCategory(c)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  category === c
? "bg-night-900 text-cream"
: "border border-night-900/15 text-night-900/70 hover:border-night-900/30"
                }`}
              >
                <Icon className="h-4 w-4" />
                {CAT_LABEL[c]}
              </button>
            );
          })}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre (facultatif)"
          className="field mt-4 w-full"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            category === "Prière"
? "Pour qui / quoi pries-tu?"
: category === "Parole reçue"
? "Quelle parole as-tu reçue de Dieu?"
: "Ta note…"
          }
          rows={3}
          className="field mt-3 w-full resize-y"
        />
        <button type="submit" className="btn-primary mt-4">
          Ajouter au carnet
        </button>
      </form>

      {/* Filtres */}
      <div className="mt-8 flex flex-wrap gap-2">
        {(["Tout",...NOTE_CATEGORIES] as const).map((f) => (
          <button
            type="button"
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              filter === f
? "bg-dawn-400 text-night-950"
: "border border-night-900/15 text-night-900/70 hover:border-night-900/30"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Liste */}
      {visible.length === 0? (
        <p className="mt-8 max-w-2xl text-night-900/55">
          Ton carnet est vide pour l'instant. Note ton premier sujet de prière ou une
          parole reçue ci-dessus.
        </p>
      ): (
        <ul className="mt-8 grid max-w-2xl gap-3">
          {visible.map((n) => (
            <li
              key={n.id}
              className={`rounded-2xl border p-4 ${
                n.answered
? "border-spirit-500/30 bg-spirit-500/[0.06]"
: "border-night-900/10 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-spirit-600">
                  {n.category}
                  {n.answered? " · exaucé": ""}
                </span>
                <div className="flex items-center gap-2">
                  {n.category === "Prière"? (
                    <button
                      type="button"
                      onClick={() => toggleAnswered(n.id)}
                      className="text-xs font-semibold text-spirit-600 hover:underline"
                    >
                      {n.answered? "Rouvrir": "Marquer exaucé"}
                    </button>
                  ): null}
                  {editId!== n.id? (
                    <button
                      type="button"
                      onClick={() => startEdit(n.id, n.title, n.body)}
                      aria-label="Modifier"
                      className="text-night-900/35 transition-colors hover:text-spirit-700"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8}>
                        <path d="M16.5 4.5l3 3L8 19l-4 1 1-4L16.5 4.5z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  ): null}
                  <button
                    type="button"
                    onClick={() => removeNote(n.id)}
                    aria-label="Supprimer"
                    className="text-night-900/30 transition-colors hover:text-night-900/70"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {editId === n.id? (
                <div className="mt-2">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Titre (facultatif)"
                    className="field w-full"
                  />
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    placeholder="Ta note…"
                    rows={4}
                    className="field mt-2 w-full resize-y"
                    autoFocus
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={!editBody.trim() &&!editTitle.trim()}
                      className="btn-primary text-sm disabled:opacity-40"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditId(null)}
                      className="btn-ghost text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ): (
                <>
                  {n.title? (
                    <p className="mt-1 font-display text-lg font-bold text-night-900">{n.title}</p>
                  ): null}
                  {n.body? (
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-night-900/80">
                      {n.body}
                    </p>
                  ): null}
                  <p className="mt-2 text-xs text-night-900/40">{fmt(n.ts)}</p>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 max-w-2xl text-xs text-night-900/45">
        Ton carnet reste privé, enregistré uniquement sur cet appareil.
      </p>
    </section>
  );
}
