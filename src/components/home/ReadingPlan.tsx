import { Reveal } from "@/components/ui/Reveal";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { SectionHeader } from "@/components/ui/Section";
import { getReadingPlan, getTodayPlanDay } from "@/lib/content";

export function ReadingPlan() {
  const plan = getReadingPlan();
  const today = getTodayPlanDay();

  return (
    <section
      id="plan"
      className="dark-ctx bg-topo-dark relative scroll-mt-24 overflow-hidden border-y border-white/10 py-20 sm:py-28"
    >
      <div className="blob right-0 top-0 h-80 w-80 bg-glow-500/15" />
      <div className="container-x relative">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal from="left">
            <SectionHeader
              eyebrow="Plan de lecture"
              title={
                <>
                  Lis la Bible <span className="text-gradient-spirit">sans te perdre</span>
                </>
              }
              description="Un parcours guidé, jour après jour. Des passages courts, un thème clair, quelques minutes. Construis l'habitude qui change tout."
            />

            {/* Mise en avant du jour */}
            <div className="mt-8 glass-strong overflow-hidden p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-dawn-400 to-spirit-500 text-night-950">
                  <div className="text-center leading-none">
                    <span className="block text-[10px] font-bold uppercase">Jour</span>
                    <span className="block text-2xl font-extrabold">{today.day}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-dawn-300">
                    À lire aujourd'hui
                  </p>
                  <h3 className="mt-1 font-display text-xl font-bold">{today.theme}</h3>
                  <p className="text-sm text-cream/60">
                    {today.passages.join(" · ")} · {today.minutes} min
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-sm font-semibold text-cream">
                  Reçois le passage du jour par email
                </p>
                <div className="mt-3">
                  <NewsletterForm
                    source="plan-de-lecture"
                    layout="stacked"
                    size="lg"
                    cta="Suivre le plan"
                    note="Un rappel doux chaque matin. Rien d'autre."
                  />
                </div>
              </div>
            </div>
          </Reveal>

          {/* Liste des jours */}
          <Reveal from="right" delay={0.1}>
            <ol className="grid gap-3 sm:grid-cols-2">
              {plan.map((d) => {
                const isToday = d.day === today.day;
                return (
                  <li key={d.day}>
                    <div
                      className={`group flex h-full items-center gap-4 rounded-2xl border p-4 transition-all duration-300 ${
                        isToday
                          ? "border-dawn-400/50 bg-dawn-500/10 shadow-glow"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      <span
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-lg font-bold transition-colors ${
                          isToday
                            ? "bg-dawn-400 text-night-950"
                            : "bg-night-800 text-cream/70 group-hover:text-cream"
                        }`}
                      >
                        {d.day}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-cream">{d.theme}</p>
                        <p className="truncate text-xs text-cream/55">
                          {d.passages.join(" · ")} · {d.minutes} min
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
