"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { DailyShort } from "@/components/home/DailyShort";
import { useTodayIndex } from "@/lib/today";
import { siteConfig } from "@/config/site";
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
    <div className="space-y-16 py-12 sm:space-y-20 sm:py-16">
      {/* 1. Date + thème */}
      <section className="container-x">
        <Reveal>
          <p className="text-sm font-semibold capitalize text-spirit-600">{label}</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-[1.05] sm:text-4xl md:text-5xl">
            {dev.theme}
          </h2>
          <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-dawn-400 to-spirit-500" />
        </Reveal>
      </section>

      {/* 2. Méditation développée */}
      <section className="container-x">
        <Reveal from="up">
          <SectionHeader eyebrow="Méditation" title="Pour aujourd'hui" />
          <div className="mt-6 max-w-2xl">
            {paragraphs.map((para, idx) => (
              <p
                key={idx}
                className={`text-base leading-relaxed text-night-900/75 sm:text-lg ${
                  idx === 0
                    ? "first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-6xl first-letter:font-bold first-letter:leading-none first-letter:text-spirit-700"
                    : "mt-5"
                }`}
              >
                {para}
              </p>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 3. Verset à retenir et à déclarer (carte partageable) */}
      <section className="container-x">
        <Reveal from="scale">
          <div className="dark-ctx bg-topo-dark relative overflow-hidden rounded-4xl border border-dawn-400/30 p-8 shadow-glow sm:p-12">
            <div className="blob -right-12 top-1/4 h-56 w-56 bg-dawn-500/20" />
            <div className="blob -left-10 bottom-0 h-44 w-44 bg-spirit-500/20" />
            <div className="relative text-center">
              <span className="inline-flex items-center rounded-full border border-dawn-400/30 bg-dawn-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-dawn-300">
                À retenir et à déclarer sur ta vie
              </span>
              <span className="mt-6 block font-display text-6xl leading-none text-dawn-300/60">
                &ldquo;
              </span>
              <blockquote className="-mt-4 font-display text-2xl font-bold leading-snug text-cream sm:text-3xl md:text-4xl">
                {dev.declarationText}
              </blockquote>
              <p className="mt-4 text-sm font-semibold text-dawn-200">
                {dev.declarationReference}
              </p>
              <div className="mt-7 flex justify-center">
                <ShareButtons
                  text={`« ${dev.declarationText} » — ${dev.declarationReference}`}
                />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 4. Questions d'application */}
      <section className="container-x">
        <Reveal from="left">
          <div className="glass-strong max-w-2xl p-7 sm:p-8">
            <SectionHeader eyebrow="Réflexion" title="Questions pour aujourd'hui" />
            <ul className="mt-6 space-y-4">
              {dev.questions.map((q, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-dawn-400 text-xs font-bold text-night-950">
                    {idx + 1}
                  </span>
                  <p className="text-base text-night-900/80">{q}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* 5. Passage de lecture du jour */}
      {planDay ? (
        <section className="container-x">
          <Reveal from="right">
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
                    À lire aujourd'hui
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

      {/* 6. Vidéo du jour */}
      {latestShort ? (
        <section className="container-x">
          <Reveal from="up">
            <SectionHeader eyebrow="Shorts" title="La vidéo du jour" />
            <div className="mt-6 max-w-sm">
              <DailyShort latest={latestShort} all={shorts} />
            </div>
          </Reveal>
        </section>
      ) : null}

      {/* 7. Reviens demain + inscription */}
      <section className="container-x">
        <Reveal from="up">
          <div className="glass max-w-2xl p-7 sm:p-8">
            <h3 className="font-display text-xl font-bold">
              Reviens demain : un nouveau dévotionnel chaque jour
            </h3>
            <p className="mt-1 text-sm text-night-900/60">
              Reçois-le directement dans ta boîte mail, chaque matin.
            </p>
            <div className="mt-4">
              <NewsletterForm source="devotionnel" cta="Recevoir chaque matin" note="" />
            </div>
            <div className="mt-5">
              <ShareButtons text={`${dev.theme}\n\n${paragraphs[0] ?? ""}`} />
            </div>
          </div>
        </Reveal>
      </section>

      {/* 8. Me contacter & soutenir */}
      <section className="container-x">
        <Reveal from="up">
          <div className="dark-ctx bg-topo-dark relative overflow-hidden rounded-4xl p-8 text-center sm:p-12">
            <div className="blob -right-16 -top-10 h-52 w-52 bg-spirit-500/20" />
            <div className="relative">
              <h3 className="font-display text-2xl font-extrabold sm:text-3xl">
                Un mot, un besoin, une prière ?
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-cream/70">
                Je suis là. Écris-moi, suis-moi au quotidien, ou soutiens la mission
                pour qu'elle continue de toucher des vies.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <a href={`mailto:${siteConfig.contactEmail}`} className="btn-primary">
                  Me contacter
                </a>
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  Instagram
                </a>
                <Link href="/dons" className="btn-ghost">
                  Soutenir la mission
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
