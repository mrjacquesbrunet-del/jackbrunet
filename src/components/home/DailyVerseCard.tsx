"use client";

import { ShareButtons } from "@/components/ui/ShareButtons";
import { useTodayIndex } from "@/lib/today";
import type { Verse } from "@/lib/types";

/** Verset du jour, l'élément affiché bascule à minuit (date locale). */
export function DailyVerseCard({
  verses,
  initialIndex,
}: {
  verses: Verse[];
  initialIndex: number;
}) {
  const i = useTodayIndex(verses.length, initialIndex);
  const verse = verses[i]?? verses[0];

  return (
    <article
      id="verset"
      className="dark-ctx relative flex h-full scroll-mt-24 flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-spirit-700 via-spirit-600 to-night-800 p-7 shadow-spirit sm:p-9"
    >
      <div className="blob -right-12 top-1/3 h-52 w-52 bg-dawn-400/30" />
      <div className="relative flex h-full flex-col">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white">
          Parole du jour
        </span>

        <blockquote className="mt-6 flex-1">
          <span className="font-display text-5xl leading-none text-dawn-300">
            &ldquo;
          </span>
          <p className="-mt-4 font-display text-2xl font-semibold leading-snug text-white sm:text-3xl">
            {verse.text}
          </p>
        </blockquote>

        <div className="mt-6 flex items-center justify-between">
          <p className="font-semibold text-dawn-200">{verse.reference}</p>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
            {verse.version}
          </span>
        </div>

        <div className="mt-7">
          <ShareButtons
            text={`« ${verse.text} », ${verse.reference}`}
            image={{
              text: verse.text,
              reference: verse.reference,
              badge: "Parole du jour",
              filename: "rhema-verset.png",
            }}
          />
        </div>
      </div>
    </article>
  );
}
