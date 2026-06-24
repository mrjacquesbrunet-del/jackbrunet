"use client";

import Link from "next/link";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { useTodayIndex } from "@/lib/today";
import type { DailyThought } from "@/lib/types";

/** Pensée du jour — l'élément affiché bascule à minuit (date locale). */
export function DailyThoughtCard({
  thoughts,
  initialIndex,
}: {
  thoughts: DailyThought[];
  initialIndex: number;
}) {
  const i = useTodayIndex(thoughts.length, initialIndex);
  const thought = thoughts[i] ?? thoughts[0];

  return (
    <article
      id="pensee"
      className="glass group relative flex h-full scroll-mt-24 flex-col overflow-hidden p-7 sm:p-9"
    >
      <div className="blob -left-10 -top-10 h-44 w-44 bg-dawn-500/20 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative flex h-full flex-col">
        <span className="eyebrow">Pensée du jour</span>
        <h3 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
          {thought.title}
        </h3>
        <p className="mt-4 flex-1 text-base leading-relaxed text-night-900/70">
          {thought.body}
        </p>
        <p className="mt-5 text-sm font-semibold text-night-900/50">
          — {thought.author}
        </p>

        <Link
          href="/devotionnel"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-spirit-700 transition-colors hover:text-spirit-600"
        >
          Lire la méditation complète →
        </Link>

        <div className="mt-5">
          <ShareButtons
            text={`${thought.title}\n\n${thought.body}\n\n— ${thought.author}`}
          />
        </div>

        <div className="mt-7 rounded-2xl border border-night-900/10 bg-night-900/[0.04] p-5">
          <p className="text-sm font-semibold text-night-900">
            Reçois la pensée du jour chaque matin
          </p>
          <p className="mt-1 text-xs text-night-900/55">
            + le cadeau « 7 jours pour retrouver la paix ».
          </p>
          <div className="mt-4">
            <NewsletterForm source="pensee-du-jour" cta="Recevoir" note="" />
          </div>
        </div>
      </div>
    </article>
  );
}
