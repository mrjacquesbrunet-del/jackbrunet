"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { shareText } from "@/lib/share";
import { appShareUrl } from "@/config/app-links";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { ViralCard } from "@/components/home/ViralCard";
import { DevotionAuthor } from "@/components/home/DevotionAuthor";
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
  ArrowRightGlyph,
  HighlighterGlyph,
  BookmarkFilledGlyph,
  BookmarkGlyph,
} from "@/components/ui/DevoIcons";
import { DailyShort, FloatingDailyShort } from "@/components/home/DailyShort";
import { Rewards } from "@/components/app/Rewards";
import { Greeting } from "@/components/app/Greeting";
import { useTodayIndex } from "@/lib/today";
import { bibleHref } from "@/lib/bible-ref";
import { useEngagement } from "@/lib/engagement";
import { track } from "@/lib/analytics";
import { fetchPublishedDevotions } from "@/lib/devotions";
import { asset, mediaUrl } from "@/lib/asset";
import { trace } from "@/lib/boot-trace";
import { MakeVersePublicButton } from "@/components/community/MakeVersePublicButton";
import { useAuth } from "@/components/community/useAuth";
import { NotificationsBell } from "@/components/community/NotificationsBell";
import { MessagesButton } from "@/components/community/MessagesButton";
import { isNativeApp } from "@/lib/notifications";
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

/** Clé de punchline normalisée (minuscules, sans accents ni ponctuation). */
function normPunch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

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
  // Connecté ? → cloche de notifications + messagerie dans l'en-tête.
  const { userId } = useAuth();
  // La mémorisation de versets est réservée à l'application.
  const [nativeApp, setNativeApp] = useState(false);
  useEffect(() => setNativeApp(isNativeApp()), []);
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
  // Cartes-images (bucket « medias ») indexées par punchline normalisée, depuis
  // le contenu intégré au build (qui référence les fichiers de cartes). La
  // normalisation (minuscules, sans accents ni ponctuation) évite qu'une
  // petite différence de texte côté CMS empêche de retrouver la carte.
  const bundledCardByPunch = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of devotions) {
      if (d.card && d.punchline) m.set(normPunch(d.punchline), d.card);
    }
    return m;
  }, [devotions]);
  // Base = données publiées (Supabase) si présentes, sinon contenu intégré.
  // On complète la carte manquante par celle du contenu intégré, pour que les
  // images de cartes déposées dans « medias » s'affichent même si la base n'a
  // pas encore la colonne `card` renseignée.
  const list = useMemo(() => {
    const base = remote ?? devotions;
    return base.map((d) =>
      d.card ? d : { ...d, card: bundledCardByPunch.get(normPunch(d.punchline || "")) ?? d.card },
    );
  }, [remote, devotions, bundledCardByPunch]);

  const i = useTodayIndex(list.length, initialIndex);
  const dev = list[i]?? list[0];
  const audioSrc = audioMap[String(i)]? mediaUrl(audioMap[String(i)]): null;

  const p = useTodayIndex(plan.length, initialPlanIndex);
  const planDay = plan[p]?? plan[0];

  const eng = useEngagement();
  const tk = useToolkit();

  // Mini-célébration quand la série atteint un palier (3, 5, 7, 14, 21, 30…).
  const [celebrate, setCelebrate] = useState<number | null>(null);

  // Semaine en cours (lundi → dimanche) pour l'anneau de progression.
  const dayStrLocal = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const todayStr = dayStrLocal(new Date());
  const weekDays = (() => {
    const now = new Date();
    const dow = (now.getDay() + 6) % 7; // 0 = lundi
    const monday = new Date(now);
    monday.setDate(now.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return dayStrLocal(d);
    });
  })();
  const weekLabels = ["L", "M", "M", "J", "V", "S", "D"];
  const weekDoneCount = weekDays.filter((d) => eng.completedDates.includes(d)).length;

  // Tags OneSignal pour cibler les relances push (série en danger, inactifs…).
  useEffect(() => {
    if (!eng.ready) return;
    import("@/lib/onesignal")
      .then((m) =>
        m.updateEngagementTags({
          streak: String(eng.streak),
          meditated_today: eng.isCompletedToday ? "1" : "0",
          last_active: todayStr,
        }),
      )
      .catch(() => undefined);
  }, [eng.ready, eng.streak, eng.isCompletedToday, todayStr]);
  function meditate() {
    const before = eng.streak;
    eng.markCompletedToday();
    // Statistique « méditation complétée » (anonyme, une fois par jour).
    try {
      const day = new Date().toISOString().slice(0, 10);
      const key = `jb.track.meditate.${day}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, "1");
        track("meditate", "devotionnel");
      }
    } catch {
      /* ignore */
    }
    // La série vient d'avancer : si on touche un palier, on le fête.
    const milestones = [3, 5, 7, 14, 21, 30, 60, 100];
    const after = before + 1;
    if (milestones.includes(after)) {
      setCelebrate(after);
      setTimeout(() => setCelebrate(null), 5000);
      // Moment de joie → occasion idéale de proposer de noter l'app
      // (après la célébration, jamais pendant).
      setTimeout(() => {
        try {
          window.dispatchEvent(new Event("jb:joy"));
        } catch {
          /* ignore */
        }
      }, 5600);
    }
  }

  const paragraphs = dev.meditation.split("\n\n");

  return (
    <div className="space-y-16 py-12 sm:space-y-20 sm:py-16">
      {/* 1. Date + thème */}
      <section id="meditation" className="container-x scroll-mt-20">
        <Reveal>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Greeting />
              <p className="mt-1 text-sm font-semibold capitalize text-spirit-600">Méditation du jour</p>
            </div>
            {/* Cloche + messagerie, discrètes (mêmes composants que le profil,
                notifications avec lien intelligent vers le bon écran) */}
            {userId ? (
              <div className="flex shrink-0 items-center gap-2">
                <NotificationsBell userId={userId} tone="light" />
                <MessagesButton tone="light" />
              </div>
            ) : null}
          </div>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-[1.05] sm:text-4xl md:text-5xl">
            {dev.theme}
          </h2>
          <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-dawn-400 to-spirit-500" />
        </Reveal>
      </section>

      {/* 1b. Engagement: série + progression */}
      {eng.ready? (
        <section className="container-x">
          {/* Une seule carte compacte : série + méditations + semaine */}
          <div className="glass p-3.5 sm:p-4">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <p className="flex items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-dawn-400/15 text-dawn-600">
                  <FlameGlyph className="h-4 w-4" />
                </span>
                <span className="font-display text-base font-extrabold leading-none">
                  {eng.streak}
                  <span className="ml-1 text-xs font-semibold text-night-900/55">
                    j de suite{eng.best > 1 ? ` · record ${eng.best}` : ""}
                  </span>
                </span>
              </p>
              <p className="flex items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-spirit-500/15 text-spirit-600">
                  <BookGlyph className="h-4 w-4" />
                </span>
                <span className="font-display text-base font-extrabold leading-none">
                  {eng.completedCount}
                  <span className="ml-1 text-xs font-semibold text-night-900/55">
                    méditée{eng.completedCount > 1 ? "s" : ""}
                  </span>
                </span>
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 sm:gap-1.5">
                {weekDays.map((d, i) => {
                  const done = eng.completedDates.includes(d);
                  const isToday = d === todayStr;
                  return (
                    <span
                      key={d}
                      className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold transition-colors ${
                        done
                          ? "bg-dawn-400 text-night-950"
                          : isToday
                            ? "border-2 border-dawn-400/70 text-dawn-600"
                            : "bg-night-900/[0.06] text-night-900/40"
                      }`}
                    >
                      {done ? (
                        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        weekLabels[i]
                      )}
                    </span>
                  );
                })}
              </div>
              <p className="text-sm font-extrabold text-night-900">
                {weekDoneCount}/7
                <span className="ml-1 text-[11px] font-medium text-night-900/50">semaine</span>
              </p>
            </div>
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

          {/* Check-in émotionnel, compact : s'ouvre au toucher */}
          <div className="mt-4">
            <MoodCheckin />
          </div>

          {/* Rappel quotidien (app native) — disparaît une fois activé,
              le réglage reste dans la personnalisation du profil */}
          <div className="mt-4">
            <ReminderToggle hideWhenEnabled />
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
              <ViralCard punchline={dev.punchline} id={`dev:${i}:punchline`} index={i} card={dev.card} />
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
            <DevotionAuthor
              author={dev.author}
              authorRole={dev.authorRole}
              authorBio={dev.authorBio}
              authorInstagram={dev.authorInstagram}
              authorPhoto={dev.authorPhoto}
              authorResources={dev.authorResources}
            />
            {/* Un seul « Partager » (texte) ici — les boutons complets (Image,
                Story, WhatsApp…) sont sur la carte à déclarer juste en dessous */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  shareText(`${dev.theme}, « ${dev.verseText} » (${dev.verseReference})`, appShareUrl())
                }
                className="btn-ghost inline-flex items-center gap-1.5"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
                  <path d="M12 3v12M8 7l4-4 4 4M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Partager
              </button>
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
          <div
            className="dark-ctx relative overflow-hidden rounded-3xl border border-dawn-400/25 p-6 sm:p-8"
            style={{
              background:
                "radial-gradient(110% 70% at 100% 0%, rgba(202,240,0,.16) 0%, transparent 55%), radial-gradient(90% 60% at 0% 100%, rgba(202,240,0,.08) 0%, transparent 50%), linear-gradient(160deg, #171716 0%, #0C0C0B 60%, #101010 100%)",
            }}
          >
            {/* Guillemet géant en filigrane */}
            <span
              aria-hidden
              className="pointer-events-none absolute -top-7 right-2 select-none font-display text-[9rem] font-bold leading-none text-dawn-400/10"
            >
              &ldquo;
            </span>

            <div className="relative">
              {/* Chapeau typographique entre deux filets */}
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-dawn-400/50" />
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.3em] text-dawn-300">
                  À déclarer sur ta vie
                </span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-dawn-400/50" />
              </div>

              <Markable
                id={`dev:${i}:declaration`}
                text={dev.declarationText}
                reference={dev.declarationReference}
                kind="déclaration"
              >
                <blockquote className="mt-5 text-balance text-center font-display text-xl font-bold leading-snug text-cream sm:text-2xl">
                  {dev.declarationText}
                </blockquote>
                <p className="mt-3 text-right font-display text-sm italic text-dawn-300">
                  — {dev.declarationReference}
                </p>
              </Markable>

              <div className="mt-5 flex justify-center">
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

      {/* 4c. Marquer la méditation du jour (nourrit la série) — en fin de
          parcours, là où on a réellement fini de méditer */}
      {eng.ready && !eng.isCompletedToday ? (
        <section className="container-x">
          <button type="button" onClick={meditate} className="btn-primary w-full max-w-2xl">
            J&apos;ai médité aujourd&apos;hui
          </button>
        </section>
      ) : null}

      {/* 4b. Le sujet du jour du mur : porter UN seul sujet dans la prière */}
      <DailyPrayerSpotlight />

      {/* Bulle flottante ronde : la vidéo tourne en muet, un toucher fait
          défiler jusqu'à la section « La vidéo du jour » */}
      {latestShort ? <FloatingDailyShort latest={latestShort} /> : null}

      {/* 5. Vidéo du jour (avant la lecture) */}
      {latestShort? (
        <section id="video-jour" className="container-x scroll-mt-24">
          <Reveal from="up">
            <SectionHeader eyebrow="Shorts" title="La vidéo du jour" />
            <div className="mt-6 max-w-sm">
              <DailyShort latest={latestShort} all={shorts} />
            </div>
          </Reveal>
        </section>
      ): null}

      {/* 6. Passage de lecture du jour — uniquement le jour, cliquable vers le passage */}
      {planDay? (
        <section className="container-x">
          <Reveal from="right">
            <SectionHeader eyebrow="Plan de lecture" title="Le passage du jour" />
            <Link
              href={bibleHref(planDay.passages[0])?? "/bible"}
              className="group mt-6 flex max-w-2xl items-center gap-4 rounded-3xl border border-night-900/10 bg-white p-6 shadow-card transition-colors hover:border-dawn-400/60"
            >
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-dawn-400 to-spirit-500 text-night-950">
                <div className="text-center leading-none">
                  <span className="block text-[10px] font-bold uppercase">Jour</span>
                  <span className="block text-2xl font-extrabold">{planDay.day}</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-spirit-600">
                  À lire aujourd'hui
                </p>
                <h3 className="mt-1 font-display text-xl font-bold">{planDay.theme}</h3>
                <p className="text-sm text-night-900/60">
                  {planDay.passages.join(" · ")} &middot; {planDay.minutes} min
                </p>
              </div>
              <span className="shrink-0 text-night-900/30 transition-colors group-hover:text-dawn-500" aria-hidden>
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={2}>
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
            <p className="mt-3 text-sm text-night-900/50">
              Touche la carte pour ouvrir directement le passage dans la Bible.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/plans"
                className="inline-flex items-center gap-2 rounded-full bg-night-900 px-5 py-3 text-sm font-bold text-cream transition-colors hover:bg-night-800"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Mon plan de lecture
              </Link>
              {nativeApp ? (
                <Link
                  href="/memoriser"
                  className="inline-flex items-center gap-2 rounded-full bg-dawn-400 px-5 py-3 text-sm font-bold text-night-950 transition-colors hover:bg-dawn-300"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
                    <path d="M12 3a6 6 0 0 0-3.5 10.9c.7.5 1 1.3 1 2.1h5c0-.8.3-1.6 1-2.1A6 6 0 0 0 12 3zM10 19h4M10.8 21.5h2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Mémoriser des versets
                </Link>
              ) : null}
            </div>
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
