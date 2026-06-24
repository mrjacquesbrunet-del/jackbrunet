"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { DailyShort } from "@/components/home/DailyShort";
import { useTodayIndex } from "@/lib/today";
import type { Devotion, ReadingPlanDay, Short } from "@/lib/types";

type Props = {
  devotions: Devotion[];
  initialIndex: number;
  plan: ReadingPlanDay[];
  initialPlanIndex: number;
  latestShort: Short | null;
  shorts: Short[];
  todayLabel: string;
};

export function DevotionalView({
  devotions,
  initialIndex,
  plan,
  initialPlanIndex,
  latestShort,
  shorts,
  todayLabel,
}: Props) {
  const i = useTodayIndex(devotions.length, initialIndex);
  const dev = devotions[i] ?? devotions[0];

  const p = useTodayIndex(plan.length, initialPlanIndex);
  const planDay = plan[p] ?? plan[0];

  const [label, setLabel] = useState(todayLabel);
  useEffect(() => {
    setLabel(
      new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    );
  }, []);

  const paragraphs = dev.meditation.split("\n\n");

  return (
    <div className="py-12 sm:py-16 space-y-16">
      {/* 1. Date + titre */}
      <section className="container-x">
        <Reveal>
          <p className="text-sm font-semibold capitalize text-spirit-600">{label}</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
            {dev.theme}
          </h2>
        </Reveal>
      </section>

      {/* 2. Méditation */}
      <section className="container-x">
        <Reveal>
          <SectionHeader eyebrow="Méditation" title="Pour aujourd'hui" />
          <div className="mt-6 max-w-2xl">
            {paragraphs.map((para, idx) => (
              <p
                key={idx}
                className="mt-4 text-base leading-relaxed text-night-900/75 first:mt-0 sm:text-lg"
              >
                {para}
              </p>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 3. Declaration */}
      <section className="container-x">
        <Reveal>
          <div className="dark-ctx bg-topo-dark overflow-hidden rounded-4xl p-7 sm:p-9">
            <div className="blob -right-12 top-1/4 h-56 w-56 bg-glow-500/15" />
            <div className="relative">
              <span className="inline-flex items-center rounded-full border border-dawn-400/30 bg-dawn-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-dawn-300">
                A declarer sur ta vie
              </span>
              <blockquote className="mt-5 font-display text-xl font-bold leading-snug text-cream sm:text-2xl md:text-3xl">
                &laquo;&nbsp;{dev.declarationText}&nbsp;&raquo;
              </blockquote>
              <p className="mt-3 text-sm text-dawn-300">{dev.declarationReference}</p>
              <div className="mt-6">
                <ShareButtons
                  text={`« ${dev.declarationText} » — ${dev.declarationReference}`}
                />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 4. Questions */}
      <section className="container-x">
        <Reveal>
          <div className="glass-strong max-w-2xl p-7">
            <SectionHeader eyebrow="Reflexion" title="Questions pour aujourd'hui" />
            <ul className="mt-6 space-y-4">
              {dev.questions.map((q, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-glow-500/20 text-[10px] font-bold text-glow-400">
                    {idx + 1}
                  </span>
                  <p className="text-base text-night-900/80">{q}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* 5. Passage du jour */}
      {planDay ? (
        <section className="container-x">
          <Reveal>
            <SectionHeader eyebrow="Plan de lecture" title="Le passage du jour" />
            <div className="mt-6 glass-strong max-w-2xl overflow-hidden p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-dawn-400 to-spirit-500 text-night-950">
                  <div className="text-center leading-none">
                    <span className="block text-[10px] font-bold uppercase">Jour</span>
                    <span className="block text-2xl font-extrabold">{planDay.day}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-spirit-600">
                    A lire aujourd'hui
                  </p>
                  <h3 className="mt-1 font-display text-xl font-bold">{planDay.theme}</h3>
                  <p className="text-sm text-night-900/60">
                    {planDay.passages.join(" · ")} &middot; {planDay.minutes} min
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      ) : null}

      {/* 6. Video du jour */}
      {latestShort ? (
        <section className="container-x">
          <Reveal>
            <SectionHeader eyebrow="Shorts" title="La video du jour" />
            <div className="mt-6 max-w-sm">
              <DailyShort latest={latestShort} all={shorts} />
            </div>
          </Reveal>
        </section>
      ) : null}

      {/* 7. Closing */}
      <section className="container-x">
        <Reveal>
          <p className="text-base font-semibold text-night-900/70">
            Reviens demain : un nouveau devotionnel chaque jour.
          </p>
          <div className="mt-6 glass max-w-2xl p-7">
            <p className="text-sm font-semibold text-night-900">
              Recois chaque matin ton devotionnel
            </p>
            <div className="mt-4">
              <NewsletterForm
                source="devotionnel"
                cta="Recevoir chaque matin"
                note=""
              />
            </div>
          </div>
          <div className="mt-6">
            <ShareButtons
              text={`${dev.theme}\n\n${paragraphs[0] ?? ""}`}
            />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
