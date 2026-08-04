"use client";

import { useEffect, useState } from "react";
import moodsData from "../../../content/moods.json";

type MoodEntry = { verse: string; ref: string };
type Mood = { id: string; label: string; emoji: string; entries: MoodEntry[] };

const MOODS = (moodsData as { question: string; moods: Mood[] }).moods;
const QUESTION = (moodsData as { question: string }).question;

const KEY = "jb.mood.v1";

type Saved = { date: string; moodId: string; idx: number };

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function readSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Saved;
    return s.date === todayStr() ? s : null;
  } catch {
    return null;
  }
}

function save(s: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

/**
 * Check-in émotionnel : « Comment te sens-tu aujourd'hui ? ». La personne
 * choisit son humeur → l'app répond avec un verset adapté (contenu :
 * content/moods.json). Le choix du jour est mémorisé, avec la possibilité
 * d'en changer ou de recevoir une autre parole.
 */
export function MoodCheckin() {
  const [picked, setPicked] = useState<Saved | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPicked(readSaved());
    setReady(true);
  }, []);

  if (!ready) return null;

  const mood = picked ? MOODS.find((m) => m.id === picked.moodId) ?? null : null;
  const entry = mood ? mood.entries[picked!.idx % mood.entries.length] : null;

  function pick(m: Mood) {
    // Variante choisie selon le jour, pour que ça change naturellement.
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
    );
    const s: Saved = { date: todayStr(), moodId: m.id, idx: dayOfYear % m.entries.length };
    save(s);
    setPicked(s);
  }

  function another() {
    if (!picked || !mood) return;
    const s: Saved = { ...picked, idx: (picked.idx + 1) % mood.entries.length };
    save(s);
    setPicked(s);
  }

  function reset() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setPicked(null);
  }

  return (
    <div className="dark-ctx bg-topo-dark relative overflow-hidden rounded-3xl p-5 text-cream sm:p-6">
      <div className="blob -right-10 -top-8 h-32 w-32 bg-dawn-400/20" />

      {!mood || !entry ? (
        <div className="relative">
          <p className="font-display text-lg font-extrabold">{QUESTION}</p>
          <p className="mt-0.5 text-xs text-cream/55">
            Dieu a une parole pour chaque saison du cœur.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => pick(m)}
                className="flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-cream/90 transition-colors hover:border-dawn-400/50 hover:bg-dawn-400/10 active:scale-95"
              >
                <span aria-hidden>{m.emoji}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-dawn-300">
              <span aria-hidden className="text-base">{mood.emoji}</span>
              Pour toi, {mood.label.toLowerCase()}
            </p>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-cream/50 underline-offset-2 hover:underline"
            >
              Changer
            </button>
          </div>
          <p className="mt-3 font-display text-xl font-bold italic leading-snug">
            « {entry.verse} »
          </p>
          <p className="mt-2 text-xs font-semibold text-dawn-300">{entry.ref}</p>
          {mood.entries.length > 1 ? (
            <button
              type="button"
              onClick={another}
              className="mt-3 text-sm font-semibold text-dawn-300 underline-offset-4 hover:underline"
            >
              Une autre parole →
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
