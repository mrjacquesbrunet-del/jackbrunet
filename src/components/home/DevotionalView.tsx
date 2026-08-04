"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { ViralCard } from "@/components/home/ViralCard";
import { Markable } from "@/components/ui/Markable";
import { QuickNote } from "@/components/home/QuickNote";
import { MoodCheckin } from "@/components/home/MoodCheckin";
import { DailyPrayerSpotlight } from "@/components/home/DailyPrayerSpotlight";
import { HomeQuickSlider } from "@/components/home/HomeQuickSlider";
import { useToolkit } from "@/lib/toolkit";
import { WhatsAppChannel } from "@/components/ui/WhatsAppChannel";
import { ReminderToggle } from "@/components/pwa/ReminderToggle";
import { SoakingBar } from "@/components/home/SoakingBar";
import {
  FlameGlyph,
  BookGlyph,
  PenGlyph,
  GiftGlyph,
  ArrowRightGlyph,
  HighlighterGlyph,
  BookmarkFilledGlyph,
  BookmarkGlyph,
} from "@/components/ui/DevoIcons";
import { DailyShort } from "@/components/home/DailyShort";
import { Rewards } from "@/components/app/Rewards";
import { Greeting } from "@/components/app/Greeting";
import { useTodayIndex } from "@/lib/today";
import { bibleHref } from "@/lib/bible-ref";
import { useEngagement } from "@/lib/engagement";
import { fetchPublishedDevotions } from "@/lib/devotions";
import { asset, mediaUrl } from "@/lib/asset";
import { trace } from "@/lib/boot-trace";
import { MakeVersePublicButton } from "@/components/community/MakeVersePublicButton";
import type { Devotion, ReadingPlanDay, Short } from "@/lib/types";

type Props = {
  devotions: Devotion[];
  initialIndex: number;
  plan: ReadingPlanDay[];
  initialPlanIndex: number;
  latestShort: Short | null;
  shorts: Short[];
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
  bookTitle,
  bookCover,
  audioMap,
}: Props) {
  // Dévotionnels gérés par l'admin (Supabase) s'ils existent, sinon repli sur
  // les 60 intégrés au build. Le repli garantit que la méditation ne casse
  // jamais, même hors ligne ou si la base est vide.
  const [remote, setRemote] = useState<Devotion[] | null>(null);
  useEffect(() => {
    let alive = true;
    trace("page:devotionnel-affichee");
    fetchPublishedDevotions()
.then((r) => {
        if (alive && r && r.length > 0) setRemote(r);
      })
.catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);
  const list = remote?? devotions;

  const i = useTodayIndex(list.length, initialIndex);
  const dev = list[i]?? list[0];
  const audioSrc = audioMap[String(i)]? mediaUrl(audioMap[String(i)]): null;

  const p = useTodayIndex(plan.length, initialPlanIndex);
  const planDay = plan[p]?? plan[0];

  const eng = useEngagement();
  const tk = useToolkit();

  // Mini-célébration quand la série atteint un palier (3, 5, 7, 14, 21, 30…).
  const [celebrate, setCelebrate] = useState<number | null>(null);
  function meditate() {
    const before = eng.streak;
    eng.markCompletedToday();
    // La série vient d'avancer : si on touche un palier, on le fête.
    const milestones = [3, 5, 7, 14, 21, 30, 60, 100];
    const after = before + 1;
    if (milestones.includes(after)) {
      setCelebrate(after);
      setTimeout(() => setCelebrate(null), 5000);
    }
  }

  const paragraphs = dev.meditation.split("\n\n");

  return (
    <div className="space-y-16 py-12 sm:space-y-20 sm:py-16">
      {/* 1. Date + thème */}
      <section className="container-x">
        <Reveal>
          <Greeting />
          <p className="mt-1 text-sm font-semibold capitalize text-spirit-600">Méditation du jour</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-[1.05] sm:text-4xl md:text-5xl">
            {dev.theme}
          </h2>
          <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-dawn-400 to-spirit-500" />
        </Reveal>
      </section>

      {/* 1b. Engagement: série + progression */}
      {eng.ready? (
        <section className="container-x">
          <div className="glass flex flex-wrap items-center gap-4 p-4 sm:gap-5 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-dawn-400/15 text-dawn-600">
                <FlameGlyph className="h-6 w-6" />
              </span>
              <div className="leading-tight">
                <p className="font-display text-xl font-extrabold">
                  {eng.streak}{" "}
                  <span className="text-sm font-semibold text-night-900/60">
                    jour{eng.streak > 1? "s": ""}
                  </span>
                </p>
                <p className="text-xs text-night-900/55">
                  de suite
                  {eng.best > 1? ` · record ${eng.best}`: ""}
                </p>
              </div>
            </div>

            <div className="hidden h-9 w-px bg-night-900/10 sm:block" />

            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-spirit-500/15 text-spirit-600">
                <BookGlyph className="h-6 w-6" />
              </span>
              <div className="leading-tight">
                <p className="font-display text-xl font-extrabold">{eng.completedCount}</p>
                <p className="text-xs text-night-900/55">
                  méditation{eng.completedCount > 1? "s": ""} méditée
                  {eng.completedCount > 1? "s": ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={meditate}
              disabled={eng.isCompletedToday}
              className={`sm:ml-auto ${eng.isCompletedToday? "btn-ghost": "btn-primary"}`}
            >
              {eng.isCompletedToday? "✓ Médité aujourd'hui": "J'ai médité aujourd'hui"}
            </button>
          </div>

          {/* Palier de série atteint → petite fête */}
          {celebrate? (
            <div className="mt-4 animate-[pulse_1.2s_ease-in-out_2] rounded-2xl border border-dawn-400/40 bg-dawn-400/15 px-4 py-3 text-center">
              <p className="flex items-center justify-center gap-2 font-display text-lg font-extrabold">
                <FlameGlyph className="h-5 w-5 text-dawn-600" />
                {celebrate} jours avec Dieu d&apos;affilée !
              </p>
              <p className="mt-0.5 text-sm text-night-900/65">
                Ta fidélité porte du fruit. Continue comme ça.
              </p>
            </div>
          ): null}

          {/* Série perdue récemment → encouragement doux à la reconstruire */}
          {!celebrate && eng.previousStreak >= 3 && eng.streak <= 2? (
            <div className="mt-4 rounded-2xl border border-spirit-500/25 bg-spirit-500/[0.07] px-4 py-3">
              <p className="text-sm font-semibold text-night-900/80">
                Ta série repart — tu étais monté(e) à {eng.previousStreak} jours de suite.
              </p>
              <p className="mt-0.5 text-xs text-night-900/55">
                Aucune culpabilité : un jour après l&apos;autre, tu vas les retrouver.
              </p>
            </div>
          ): null}

          {/* Musique de fond pour méditer + cadeau */}
          <div className="mt-4">
            <SoakingBar />
          </div>

          {/* Raccourcis compacts: carnet + récompenses (côte à côte) */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              href="/carnet"
              className="flex items-center gap-2.5 rounded-2xl border border-dawn-400/30 bg-dawn-400/10 px-3 py-3 transition-colors hover:bg-dawn-400/20"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-night-900 text-cream">
                <PenGlyph className="h-4 w-4" />
              </span>
              <span className="font-display text-sm font-bold leading-tight">Mon carnet</span>
            </Link>
            <button
              type="button"
              onClick={() =>
                document.getElementById("recompenses")?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex items-center gap-2.5 rounded-2xl border border-dawn-400/30 bg-dawn-400/10 px-3 py-3 text-left transition-colors hover:bg-dawn-400/20"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-night-900 text-cream">
                <GiftGlyph className="h-4 w-4" />
              </span>
              <span className="font-display text-sm font-bold leading-tight">Récompenses</span>
            </button>
          </div>

          {/* Check-in émotionnel : un verset selon comment on se sent */}
          <div className="mt-4">
            <MoodCheckin />
          </div>

          {/* Rappel quotidien (app native uniquement) */}
          <div className="mt-4">
            <ReminderToggle />
          </div>
        </section>
      ): null}

      {/* 2. Méditation développée */}
      <section className="container-x">
        <Reveal from="up">
          <SectionHeader eyebrow="Le rhéma du jour" title="La révélation" />
          <div className="mt-6 max-w-2xl">
            <Markable
              id={`dev:${i}:verse`}
              text={dev.verseText}
              reference={dev.verseReference}
              kind="verset"
            >
              <div className="rounded-2xl border-l-4 border-dawn-400 bg-night-900/[0.03] py-4 pl-5 pr-4">
                <p className="font-display text-lg italic leading-snug text-night-900 sm:text-xl">
                  &laquo;&nbsp;{dev.verseText}&nbsp;&raquo;
                </p>
                <p className="mt-2 text-sm font-semibold text-spirit-600">
                  {dev.verseReference}
                </p>
              </div>
            </Markable>

            <p className="mt-3 flex items-center gap-1.5 text-xs text-night-900/45">
              <HighlighterGlyph className="h-3.5 w-3.5" />
              Touche un verset ou un paragraphe pour le surligner, le copier ou l'enregistrer.
            </p>

            {/* Punchline du jour, carte à partager */}
            <div className="mt-6">
              <ViralCard punchline={dev.punchline} id={`dev:${i}:punchline`} />
            </div>

            {audioSrc? (
              <div className="mt-5">
                <AudioPlayer
                  src={audioSrc}
                  label="Écouter la méditation"
                />
              </div>
            ): null}
            <div className="mt-6">
            {paragraphs.map((para, idx) => (
              <Markable
                key={idx}
                id={`dev:${i}:p${idx}`}
                text={para}
                reference={dev.verseReference}
                kind="méditation"
                className={idx === 0? "": "mt-5"}
              >
                <p
                  className={`text-base leading-relaxed text-night-900/75 sm:text-lg ${
                    idx === 0
? "first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-6xl first-letter:font-bold first-letter:leading-none first-letter:text-spirit-700"
: ""
                  }`}
                >
                  {para}
                </p>
              </Markable>
            ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ShareButtons
                text={`${dev.theme}, « ${dev.verseText} » (${dev.verseReference})`}
                image={{
                  text: dev.verseText,
                  reference: dev.verseReference,
                  filename: "jackbrunet-verset.png",
                }}
              />
              {eng.ready? (
                <button
                  type="button"
                  onClick={() => {
                    eng.toggleFavorite(i);
                    // Aussi dans « Mes favoris » (carnet) pour retrouver le verset.
                    tk.toggleSnippet({
                      id: `dev:${i}:fav`,
                      text: dev.verseText,
                      reference: dev.verseReference,
                      kind: "méditation",
                    });
                  }}
                  aria-pressed={eng.isFavorite(i)}
                  className="btn-ghost inline-flex items-center gap-1.5"
                >
                  {eng.isFavorite(i)? (
                    <BookmarkFilledGlyph className="h-4 w-4 text-spirit-600" />
                  ): (
                    <BookmarkGlyph className="h-4 w-4" />
                  )}
                  {eng.isFavorite(i)? "Enregistré": "Mettre en favori"}
                </button>
              ): null}
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
              <Markable
                id={`dev:${i}:declaration`}
                text={dev.declarationText}
                reference={dev.declarationReference}
                kind="déclaration"
              >
                <blockquote className="-mt-4 font-display text-2xl font-bold leading-snug text-cream sm:text-3xl md:text-4xl">
                  {dev.declarationText}
                </blockquote>
                <p className="mt-4 text-sm font-semibold text-dawn-200">
                  {dev.declarationReference}
                </p>
              </Markable>
              <div className="mt-7 flex justify-center">
                <ShareButtons
                  text={`« ${dev.declarationText} », ${dev.declarationReference}`}
                  image={{
                    text: dev.declarationText,
                    reference: dev.declarationReference,
                    badge: "À déclarer sur ta vie",
                    filename: "jackbrunet-declaration.png",
                  }}
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

      {/* 4b. Prendre une note → carnet */}
      <section className="container-x">
        <Reveal from="up">
          <QuickNote />
        </Reveal>
      </section>

      {/* 4b. Le sujet du jour du mur : porter quelqu'un dans la prière */}
      <DailyPrayerSpotlight />

      {/* 5. Vidéo du jour (avant la lecture) */}
      {latestShort? (
        <section className="container-x">
          <Reveal from="up">
            <SectionHeader eyebrow="Shorts" title="La vidéo du jour" />
            <div className="mt-6 max-w-sm">
              <DailyShort latest={latestShort} all={shorts} />
            </div>
          </Reveal>
        </section>
      ): null}

      {/* 6. Passage de lecture du jour */}
      {planDay? (
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

            <Link
              href={bibleHref(planDay.passages[0])?? "/bible"}
              className="btn-ghost mt-4 inline-flex"
            >
              Ouvrir la Bible
            </Link>

            {/* Plan de lecture complet (aujourd'hui mis en avant), chaque jour
                ouvre directement le bon passage dans la Bible. */}
            <ol className="mt-4 grid max-w-2xl gap-3 sm:grid-cols-2">
              {plan.map((d) => {
                const isToday = d.day === planDay.day;
                return (
                  <li key={d.day}>
                    <Link
                      href={bibleHref(d.passages[0])?? "/bible"}
                      className={`flex h-full items-center gap-3 rounded-2xl border p-3.5 transition-colors ${
                        isToday
? "border-dawn-400/60 bg-dawn-400/10 hover:border-dawn-400"
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
                    </Link>
                  </li>
                );
              })}
            </ol>
          </Reveal>
        </section>
      ): null}


      {/* 6b. Mon parcours: favoris enregistrés */}
      {eng.ready && eng.favorites.length > 0? (
        <section className="container-x">
          <Reveal from="up">
            <SectionHeader eyebrow="Mon parcours" title="Mes méditations favorites" />
            <ul className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
              {eng.favorites
.filter((idx) => list[idx])
.map((idx) => {
                  const d = list[idx];
                  return (
                    <li key={idx}>
                      <div className="flex h-full items-start gap-3 rounded-2xl border border-night-900/10 bg-white p-3.5">
                        <BookmarkFilledGlyph className="mt-0.5 h-4 w-4 shrink-0 text-spirit-600" />
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
      ): null}

      {/* 6c. Ma bibliothèque: extraits enregistrés */}
      {tk.saved.length > 0? (
        <section className="container-x">
          <Reveal from="up">
            <SectionHeader
              eyebrow="Ma bibliothèque"
              title="Mes versets & paroles enregistrés"
            />
            <ul className="mt-6 grid max-w-2xl gap-3">
              {tk.saved.map((s) => (
                <li
                  key={s.id}
                  className="rounded-2xl border border-night-900/10 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-spirit-600">
                      {s.kind}
                    </span>
                    <button
                      type="button"
                      onClick={() => tk.removeSnippet(s.id)}
                      aria-label="Retirer"
                      className="shrink-0 text-night-900/30 transition-colors hover:text-night-900/70"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-night-900/80">{s.text}</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    {s.reference? (
                      <p className="text-xs font-semibold text-night-900/50">{s.reference}</p>
                    ): (
                      <span />
                    )}
                    <MakeVersePublicButton text={s.text} reference={s.reference} />
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      ): null}

      {/* 6d. Récompenses de fidélité, en bas pour entrer vite dans la méditation */}
      <div id="recompenses" className="scroll-mt-20">
        <Rewards />
      </div>

      {/* 6e. Accès rapides glissants: Soutien + À propos (carrousel) */}
      <section className="container-x">
        <Reveal from="up">
          <HomeQuickSlider />
        </Reveal>
      </section>

      {/* Promotion du livre RHEMA, avant « Reviens demain » */}
      <section className="container-x">
        <Reveal from="up">
          <div className="bg-topo-light relative overflow-hidden rounded-4xl border border-spirit-700/10 p-7 sm:p-9">
            <div className="blob -right-12 -top-10 h-44 w-44 bg-dawn-400/20" />
            <div className="relative grid items-center gap-6 sm:grid-cols-[auto_1fr]">
              {bookCover? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bookCover}
                  alt={bookTitle}
                  className="mx-auto w-32 rounded-xl shadow-card sm:w-36"
                />
              ): null}
              <div>
                <span className="eyebrow">Le livre</span>
                <h3 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
                  Va plus loin avec <span className="text-gradient">RHEMA</span>
                </h3>
                <p className="mt-2 max-w-xl text-night-900/70">
                  Tu aimes ces méditations? RHEMA, c'est 365 révélations bibliques à
                  méditer chaque jour de l'année, l'aboutissement de tout ce que je
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

      {/* 7. Reviens demain + inscription */}
      <section className="container-x">
        <Reveal from="up">
          <div className="glass max-w-2xl p-7 sm:p-8">
            <h3 className="font-display text-xl font-bold">
              Reviens demain: un nouveau dévotionnel chaque jour
            </h3>
            <p className="mt-1 text-sm text-night-900/60">
              Reçois-le directement dans ta boîte mail, chaque matin.
            </p>
            <div className="mt-4">
              <NewsletterForm source="devotionnel" cta="Recevoir chaque matin" note="" />
            </div>
            <div className="mt-5">
              <ShareButtons text={`${dev.theme}\n\n${paragraphs[0]?? ""}`} />
            </div>
          </div>
        </Reveal>
      </section>

      <WhatsAppChannel />
    </div>
  );
}
