import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { DailyShort } from "@/components/home/DailyShort";
import { DailyThoughtCard } from "@/components/home/DailyThoughtCard";
import { DailyVerseCard } from "@/components/home/DailyVerseCard";
import { TodayLabel } from "@/components/home/TodayLabel";
import {
  getThoughts,
  getVerses,
  todayIndex,
  getLatestShort,
  getShorts,
} from "@/lib/content";

/**
 * Le cœur du retour quotidien : pensée du jour, parole du jour et vidéo du jour.
 * La pensée et le verset basculent automatiquement à minuit (date locale du
 * visiteur), sans dépendre d'une reconstruction du site.
 */
export function DailyHub() {
  const thoughts = getThoughts();
  const verses = getVerses();
  const latestShort = getLatestShort();
  const shorts = getShorts();

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section id="aujourdhui" className="container-x scroll-mt-24 py-20 sm:py-28">
      <Reveal>
        <SectionHeader
          eyebrow="Aujourd'hui"
          title={
            <>
              Ton rendez-vous <span className="text-gradient">quotidien</span>
            </>
          }
          description="Un avant-goût de ton dévotionnel du jour. Ouvre-le pour le vivre en entier : méditation, verset à déclarer, questions et vidéo."
        />
        <TodayLabel initial={today} />
      </Reveal>

      <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
        <Reveal from="left">
          <DailyThoughtCard
            thoughts={thoughts}
            initialIndex={todayIndex(thoughts.length)}
          />
        </Reveal>

        <Reveal from="right" delay={0.1}>
          <DailyVerseCard verses={verses} initialIndex={todayIndex(verses.length)} />
        </Reveal>

        {latestShort ? (
          <Reveal from="up" delay={0.2}>
            <DailyShort latest={latestShort} all={shorts} />
          </Reveal>
        ) : null}
      </div>

      <Reveal>
        <div className="mt-12 text-center">
          <Link href="/devotionnel" className="btn-primary sm:px-10">
            Ouvrir le dévotionnel du jour
          </Link>
          <p className="mt-3 text-sm text-night-900/55">
            Médite en profondeur, déclare la Parole, prends 10 minutes avec Dieu.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
