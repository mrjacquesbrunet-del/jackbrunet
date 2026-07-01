import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { getImpactStats, getSupportTiers } from "@/lib/content";
import { STRIPE_LINKS, STRIPE_MONTHLY } from "@/config/stripe";
import { PayButton } from "@/components/ui/PayButton";

/**
 * Section dons en page d'accueil.
 * Présentée comme une réponse à la vision — jamais comme une pression.
 */
export function Support() {
  const allTiers = getSupportTiers();
  // Les paliers à montant fixe en colonnes ; la « Semence libre » en bandeau.
  const tiers = allTiers.filter((t) => t.amount);
  const free = allTiers.find((t) =>!t.amount);
  const stats = getImpactStats();

  return (
    <section
      id="soutenir"
      className="dark-ctx bg-topo-dark relative scroll-mt-24 overflow-hidden py-20 sm:py-28"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-night-900/0 via-spirit-700/10 to-night-900/0" />
      <div className="blob left-0 top-1/3 h-96 w-96 bg-dawn-500/15" />
      <div className="blob right-0 bottom-0 h-96 w-96 bg-spirit-600/15" />

      <div className="container-x relative">
        <Reveal>
          <SectionHeader
            align="center"
            eyebrow="Soutenir la mission"
            title={
              <>
                Ce ministère est <span className="text-gradient">gratuit</span>.
                <br className="hidden sm:block" /> Il vit grâce à toi.
              </>
            }
            description="Chaque pensée, chaque vidéo, chaque prière touchée est rendue possible par des personnes comme toi. Devenir partenaire, c'est répondre à une vision: que la lumière atteigne le plus grand nombre, chaque jour."
          />
        </Reveal>

        {/* Statistiques d'impact */}
        <Reveal delay={0.05}>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="glass flex flex-col items-center px-4 py-6 text-center"
              >
                <span className="font-display text-2xl font-extrabold text-gradient sm:text-3xl">
                  {s.value}
                </span>
                <span className="mt-1 text-xs text-cream/60">{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Niveaux de partenariat */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <Reveal key={tier.id} from="up" delay={i * 0.1}>
              <div
                className={`relative flex h-full flex-col overflow-hidden rounded-4xl border p-7 transition-all duration-300 hover:-translate-y-1 ${
                  tier.featured
? "border-dawn-400/50 bg-gradient-to-b from-dawn-500/15 to-night-800/60 shadow-glow"
: "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                {tier.featured? (
                  <span className="absolute right-5 top-5 rounded-full bg-dawn-400 px-3 py-1 text-xs font-bold text-night-950">
                    Le plus choisi
                  </span>
                ): null}
                <h3 className="font-display text-lg font-bold">{tier.name}</h3>
                <div className="mt-3 flex items-end gap-1">
                  <span className="font-display text-4xl font-extrabold">
                    {tier.amount || "Libre"}
                  </span>
                  {tier.cadence? (
                    <span className="mb-1 text-sm text-cream/55">{tier.cadence}</span>
                  ): null}
                </div>
                <p className="mt-3 text-sm text-cream/65">{tier.description}</p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {(tier.perks?? []).map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 text-sm text-cream/75">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-dawn-500/20 text-[10px] text-dawn-300">
                        ✓
                      </span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <PayButton href={STRIPE_MONTHLY[tier.name]?? null} className={`mt-7 ${tier.featured? "btn-primary": "btn-ghost"}`}>Devenir {tier.name}</PayButton>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Semence libre — bandeau horizontal englobant */}
        {free? (
          <Reveal from="up" delay={0.15}>
            <div className="mt-6 flex flex-col gap-6 overflow-hidden rounded-4xl border border-dawn-400/40 bg-gradient-to-r from-dawn-500/15 via-dawn-400/10 to-transparent p-7 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex rounded-full bg-dawn-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-night-950">
                  {free.name}
                </span>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-cream/75">
                  {free.description}
                </p>
              </div>
              <div className="shrink-0">
                <PayButton href={STRIPE_LINKS.donOnce} className="btn-primary w-full sm:w-auto">Personnaliser mon don</PayButton>
                <p className="mt-2 text-center text-xs text-cream/45">
                  Unique ou mensuel · montant libre
                </p>
              </div>
            </div>
          </Reveal>
        ): null}

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <Link href="/dons" className="text-sm font-semibold text-dawn-300 underline-offset-4 hover:underline">
              Faire un don unique ou voir comment les dons sont utilisés →
            </Link>
            <p className="max-w-xl text-xs text-cream/45">
              Transparence totale: 100 % des dons servent la mission. Tu peux modifier
              ou arrêter ton soutien à tout moment, sans aucune question.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
