"use client";

import { useEffect, useState } from "react";
import moodsData from "../../../content/moods.json";

type MoodEntry = { verse: string; ref: string };
type Mood = { id: string; label: string; entries: MoodEntry[] };

/** Icônes en trait (charte de l'app — mêmes codes que les icônes du menu),
 * une par humeur. Pas d'emoji dans l'interface. */
const MOOD_ICONS: Record<string, string> = {
  // Mains en prière (reconnaissant)
  reconnaissant:
    "M12 3.4c-.6 1.1-1.3 2-2.4 3.1L6.3 9.8c-.6.6-.9 1.5-.7 2.3l.8 4A1.8 1.8 0 0 0 8.2 19.5H12ZM12 3.4c.6 1.1 1.3 2 2.4 3.1L17.7 9.8c.6.6.9 1.5.7 2.3l-.8 4A1.8 1.8 0 0 1 15.8 19.5H12ZM9.4 12.1c1.7-.9 3.5-.9 5.2 0",
  // Soleil (joyeux)
  joyeux:
    "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4",
  // Lune (fatigué)
  fatigue: "M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z",
  // Vent / tourbillon (anxieux)
  anxieux: "M3 8h9a2.5 2.5 0 1 0-2.4-3.2M3 12h13.5a2.5 2.5 0 1 1-2.4 3.2M3 16h7a2 2 0 1 1-1.9 2.6",
  // Nuage et pluie (triste)
  triste:
    "M7 15a4 4 0 0 1 .4-8 5 5 0 0 1 9.6 1.5A3.3 3.3 0 0 1 16.5 15zM8.5 18l-1 2.5M12.5 18l-1 2.5M16.5 18l-1 2.5",
  // Bouclier (en plein combat)
  lutte: "M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6zM9.5 12l2 2 3.5-4",
};

function MoodIcon({ id, className }: { id: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      aria-hidden
    >
      <path d={MOOD_ICONS[id] ?? MOOD_ICONS.reconnaissant} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
                <MoodIcon id={m.id} className="h-[18px] w-[18px] text-dawn-300" />
                {m.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-dawn-300">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-dawn-400/15">
                <MoodIcon id={mood.id} className="h-4 w-4" />
              </span>
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
