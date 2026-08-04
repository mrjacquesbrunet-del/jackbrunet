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
 * « Focus de prière de la semaine », change automatiquement chaque semaine
 * (rotation sur la liste content/prayer-focus.json). Affiché EN GRAND, avec
 * le verset visible.
 */
export function PrayerFocus() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (ITEMS.length > 0) setIndex(isoWeek(new Date()) % ITEMS.length);
  }, []);

  if (ITEMS.length === 0) return null;
  const f = ITEMS[index];

  return (
    <div className="dark-ctx overflow-hidden rounded-3xl border border-dawn-500/30 bg-night-900 p-5 text-cream sm:p-6">
      <span className="eyebrow inline-flex items-center gap-1.5">
        <PrayerMark className="h-3.5 w-3.5" />
        Focus de prière · cette semaine
      </span>
      <p className="mt-2 font-display text-xl font-extrabold sm:text-2xl">{f.theme}</p>
      <p className="mt-1.5 text-sm text-cream/75">{f.text}</p>
      <p className="mt-3 border-l-2 border-dawn-400 pl-3 text-sm italic text-cream/80">
        « {f.verse} »
        <span className="mt-0.5 block text-xs font-semibold not-italic text-dawn-300">
          {f.reference}
        </span>
      </p>
    </div>
  );
}
