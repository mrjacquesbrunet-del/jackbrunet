import { Reveal } from "@/components/ui/Reveal";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { SectionHeader } from "@/components/ui/Section";
import { DailyShort } from "@/components/home/DailyShort";
import { getDailyThought, getDailyVerse, getLatestShort, getShorts } from "@/lib/content";

/**
 * Le cœur du retour quotidien : pensée du jour, parole du jour et vidéo du jour.
 * Chaque bloc intègre sa propre captation email (non agressive).
 */
export function DailyHub() {
  const thought = getDailyThought();
  const verse = getDailyVerse();
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
          description="Deux minutes pour recentrer ta journée sur l'essentiel. Reviens demain : tout change chaque matin."
        />
        <p className="mt-3 text-sm font-semibold capitalize text-spirit-600">{today}</p>
      </Reveal>

      <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
        {/* Pensée du jour */}
        <Reveal from="left">
          <article
            id="pensee"
            className="glass group relative flex h-full scroll-mt-24 flex-col overflow-hidden p-7 sm:p-9"
          >
            <div className="blob -left-10 -top-10 h-44 w-44 bg-dawn-500/20 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex h-full flex-col">
              <span className="eyebrow">✨ Pensée du jour</span>
              <h3 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
                {thought.title}
              </h3>
              <p className="mt-4 flex-1 text-base leading-relaxed text-night-900/70">
                {thought.body}
              </p>
              <p className="mt-5 text-sm font-semibold text-night-900/50">
                — {thought.author}
              </p>

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
        </Reveal>

        {/* Verset du jour */}
        <Reveal from="right" delay={0.1}>
          <article
            id="verset"
            className="dark-ctx relative flex h-full scroll-mt-24 flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-spirit-700 via-spirit-600 to-night-800 p-7 shadow-spirit sm:p-9"
          >
            <div className="blob -right-12 top-1/3 h-52 w-52 bg-dawn-400/30" />
            <div className="relative flex h-full flex-col">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                📖 Parole du jour
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

              <div className="mt-7 flex flex-wrap gap-2">
                <button className="btn-ghost border-white/20 bg-white/10 text-sm hover:bg-white/20">
                  Méditer ce verset
                </button>
                <button className="btn-ghost border-white/20 bg-white/10 text-sm hover:bg-white/20">
                  Partager
                </button>
              </div>
            </div>
          </article>
        </Reveal>

        {/* Vidéo du jour (dernier Short) */}
        {latestShort ? (
          <Reveal from="up" delay={0.2}>
            <DailyShort latest={latestShort} all={shorts} />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
