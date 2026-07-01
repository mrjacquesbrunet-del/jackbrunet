"use client";

import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { useTodayIndex } from "@/lib/today";
import type { ReadingPlanDay } from "@/lib/types";

/** Plan de lecture — version compacte: la carte du jour + des liens. */
export function ReadingPlanView({
  plan,
  initialIndex,
}: {
  plan: ReadingPlanDay[];
  initialIndex: number;
}) {
  const i = useTodayIndex(plan.length, initialIndex);
  const today = plan[i]?? plan[0];

  return (
    <section
      id="plan"
      className="dark-ctx bg-topo-dark relative scroll-mt-24 overflow-hidden border-y border-white/10 py-14 sm:py-16"
    >
      <div className="blob right-0 top-0 h-72 w-72 bg-glow-500/15" />
      <div className="container-x relative">
        <Reveal from="up">
          <div className="mx-auto max-w-2xl text-center">
            <SectionHeader
              align="center"
              eyebrow="Plan de lecture"
              title={
                <>
                  Lis la Bible <span className="text-gradient-spirit">sans te perdre</span>
                </>
              }
              description="Un parcours guidé, jour après jour. Quelques minutes suffisent."
            />
          </div>

          {/* Carte du jour, compacte */}
          <div className="glass-strong mx-auto mt-8 flex max-w-xl flex-col items-center gap-4 p-5 sm:flex-row sm:p-6">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-dawn-400 to-spirit-500 text-night-950">
              <div className="text-center leading-none">
                <span className="block text-[9px] font-bold uppercase">Jour</span>
                <span className="block text-xl font-extrabold">{today.day}</span>
              </div>
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-dawn-300">
                À lire aujourd'hui
              </p>
              <h3 className="mt-0.5 font-display text-lg font-bold">{today.theme}</h3>
              <p className="truncate text-sm text-cream/60">
                {today.passages.join(" · ")} · {today.minutes} min
              </p>
            </div>
          </div>

          {/* Liens */}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/devotionnel" className="btn-primary">
              Vivre le dévotionnel du jour
            </Link>
            <Link href="/devotionnel#plan" className="btn-ghost">
              Voir tout le plan
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
