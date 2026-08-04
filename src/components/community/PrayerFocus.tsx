"use client";

import { useEffect, useState } from "react";
import { PrayerMark } from "@/components/ui/PrayerMark";
import focusData from "../../../content/prayer-focus.json";

type Focus = { theme: string; text: string; verse: string; reference: string };

const ITEMS = focusData.items as Focus[];

/** Numéro de semaine ISO (pour faire tourner le focus chaque semaine). */
function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((date.getTime() - firstThursday.getTime()) / 86_400_000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return week;
}

/**
 * « Focus de prière de la semaine » — version COMPACTE : une fine rangée
 * repliée par défaut (le mur reste tout de suite visible) ; on touche pour
 * lire le texte et le verset. Change automatiquement chaque semaine.
 */
export function PrayerFocus() {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ITEMS.length > 0) setIndex(isoWeek(new Date()) % ITEMS.length);
  }, []);

  if (ITEMS.length === 0) return null;
  const f = ITEMS[index];

  return (
    <div className="dark-ctx overflow-hidden rounded-2xl border border-dawn-500/25 bg-night-900 text-cream">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-dawn-400/15 text-dawn-300">
          <PrayerMark className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-bold">{f.theme}</span>
          <span className="block truncate text-[11px] text-cream/55">
            Focus de prière · cette semaine
          </span>
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 shrink-0 text-cream/50 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div className="px-3.5 pb-3.5">
          <p className="text-sm text-cream/75">{f.text}</p>
          <p className="mt-2.5 border-l-2 border-dawn-400 pl-3 text-sm italic text-cream/80">
            « {f.verse} »
            <span className="mt-0.5 block text-xs font-semibold not-italic text-dawn-300">
              {f.reference}
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
