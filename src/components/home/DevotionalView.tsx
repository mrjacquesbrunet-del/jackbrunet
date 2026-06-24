"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { ViralCard } from "@/components/home/ViralCard";
import { WhatsAppChannel } from "@/components/ui/WhatsAppChannel";
import { DailyShort } from "@/components/home/DailyShort";
import { useTodayIndex } from "@/lib/today";
import { useEngagement } from "@/lib/engagement";
import { asset } from "@/lib/asset";
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
  bookTitle: string;
  bookCover: string;
  audioMap: Record<string, string>;
};

export function DevotionalView({
  devotions,
  initialIndex,
  plan,
  initialPlanIndex,
  latestShort,
  shorts,
  todayLabel,
  bookTitle,
  bookCover,
  audioMap,
}: Props) {
  const i = useTodayIndex(devotions.length, initialIndex);
  const dev = devotions[i] ?? devotions[0];
  const audioSrc = audioMap[String(i)] ? asset(audioMap[String(i)]) : null;

  const p = useTodayIndex(plan.length, initialPlanIndex);
  const planDay = plan[p] ?? plan[0];

  const eng = useEngagement();

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

      {/* 1b. Engagement : série + progression */}
      {eng.ready ? (
        <section className="container-x">
          <div className="glass flex flex-wrap items-center gap-4 p-4 sm:gap-5 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-dawn-400/15 text-2xl">
                🔥
              </span>
              <div className="leading-tight">
                <p className="font-display text-xl font-extrabold">
                  {eng.streak}{" "}
                  <span className="text-sm font-semibold text-night-900/60">
                    jour{eng.streak > 1 ? "s" : ""}
                  </span>
                </p>
                <p className="text-xs text-night-900/55">
                  de suite
                  {eng.best > eng.streak ? ` · record ${eng.best}` : ""}
                </p>
              </div>
            </div>

            <div className="hidden h-9 w-px bg-night-900/10 sm:block" />

            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-spirit-500/15 text-2xl">
                📖
              </span>
              <div className="leading-tight">
                <p className="font-display text-xl font-extrabold">{eng.completedCount}</p>
                <p className="text-xs text-night-900/55">
                  méditation{eng.completedCount > 1 ? "s" : ""} méditée
                  {eng.completedCount > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={eng.markCompletedToday}
              disabled={eng.isCompletedToday}
              className={`sm:ml-auto ${eng.isCompletedToday ? "btn-ghost" : "btn-primary"}`}
            >
              {eng.isCompletedToday ? "✓ Médité aujourd'hui" : "J'ai médité aujourd'hui"}
            </button>
          </div>
        </section>
      ) : null}

      {/* 2. Méditation développée */}
      <section className="container-x">
        <Reveal from="up">
          <SectionHeader eyebrow="Le rhéma du jour" title="La révélation" />
          <div className="mt-6 max-w-2xl">
            <div className="rounded-2xl border-l-4 border-dawn-400 bg-night-900/[0.03] py-4 pl-5 pr-4">
              <p className="font-display text-lg italic leading-snug text-night-900 sm:text-xl">
                &laquo;&nbsp;{dev.verseText}&nbsp;&raquo;
              </p>
              <p className="mt-2 text-sm font-semibold text-spirit-600">
                {dev.verseReference}
              </p>
            </div>

            {/* Punchline du jour — carte à partager */}
            <div className="mt-6">
              <ViralCard punchline={dev.punchline} />
            </div>

            {audioSrc ? (
              <div className="mt-5">
                <AudioPlayer
                  src={audioSrc}
                  label="Écouter la méditation"
                />
              </div>
            ) : null}
            <div className="mt-6">
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
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ShareButtons
                text={`${dev.theme} — « ${dev.verseText} » (${dev.verseReference})`}
              />
              {eng.ready ? (
                <button
                  type="button"
                  onClick={() => eng.toggleFavorite(i)}
                  aria-pressed={eng.isFavorite(i)}
                  className="btn-ghost"
                >
                  {eng.isFavorite(i) ? "❤️ Enregistré" : "🤍 Mettre en favori"}
                </button>
              ) : null}
            </div>
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

            <Link href="/bible" className="btn-ghost mt-4 inline-flex">
              Ouvrir la Bible
            </Link>

            {/* Plan de lecture complet (aujourd'hui mis en avant) */}
            <ol className="mt-4 grid max-w-2xl gap-3 sm:grid-cols-2">
              {plan.map((d) => {
                const isToday = d.day === planDay.day;
                return (
                  <li key={d.day}>
                    <div
                      className={`flex h-full items-center gap-3 rounded-2xl border p-3.5 transition-colors ${
                        isToday
                          ? "border-dawn-400/60 bg-dawn-400/10"
                          : "border-night-900/10 bg-white hover:border-night-900/20"
                      }`}
                    >
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display text-base font-bold ${
                          isToday
                            ? "bg-dawn-400 text-night-950"
                            : "bg-night-900/[0.05] text-night-900/60"
                        }`}
                      >
                        {d.day}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-night-900">{d.theme}</p>
                        <p className="truncate text-xs text-night-900/50">
                          {d.passages.join(" · ")} &middot; {d.minutes} min
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
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

      {/* 6b. Mon parcours : favoris enregistrés */}
      {eng.ready && eng.favorites.length > 0 ? (
        <section className="container-x">
          <Reveal from="up">
            <SectionHeader eyebrow="Mon parcours" title="Mes méditations favorites" />
            <ul className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
              {eng.favorites
                .filter((idx) => devotions[idx])
                .map((idx) => {
                  const d = devotions[idx];
                  return (
                    <li key={idx}>
                      <div className="flex h-full items-start gap-3 rounded-2xl border border-night-900/10 bg-white p-3.5">
                        <span className="text-lg leading-none">❤️</span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-night-900">{d.theme}</p>
                          <p className="truncate text-xs text-night-900/50">
                            {d.verseReference}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => eng.toggleFavorite(idx)}
                          aria-label="Retirer des favoris"
                          className="ml-auto shrink-0 text-night-900/30 transition-colors hover:text-night-900/70"
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  );
                })}
            </ul>
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

      {/* 7b. Promotion du livre RHEMA */}
      <section className="container-x">
        <Reveal from="up">
          <div className="bg-topo-light relative overflow-hidden rounded-4xl border border-spirit-700/10 p-7 sm:p-9">
            <div className="blob -right-12 -top-10 h-44 w-44 bg-dawn-400/20" />
            <div className="relative grid items-center gap-6 sm:grid-cols-[auto_1fr]">
              {bookCover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bookCover}
                  alt={bookTitle}
                  className="mx-auto w-32 rounded-xl shadow-card sm:w-36"
                />
              ) : null}
              <div>
                <span className="eyebrow">Le livre</span>
                <h3 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
                  Va plus loin avec <span className="text-gradient">RHEMA</span>
                </h3>
                <p className="mt-2 max-w-xl text-night-900/70">
                  Tu aimes ces méditations ? RHEMA, c'est 365 révélations bibliques à
                  méditer chaque jour de l'année — l'aboutissement de tout ce que je
                  partage. Bientôt disponible.
                </p>
                <Link href="/boutique" className="btn-primary mt-5">
                  Découvrir RHEMA
                </Link>
              </div>
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

      <WhatsAppChannel />
    </div>
  );
}
