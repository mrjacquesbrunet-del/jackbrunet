import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import {
  getFundUsage,
  getImpactStats,
  getSupportTiers,
  getTestimonies,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Soutenir la mission",
  description:
    "Deviens partenaire du ministère : un don unique ou mensuel pour faire rayonner la lumière de Jésus chaque jour. Transparence totale sur l'utilisation des dons.",
};

const oneTimeAmounts = ["10 €", "25 €", "50 €", "100 €"];

export default function DonsPage() {
  const tiers = getSupportTiers();
  const stats = getImpactStats();
  const usage = getFundUsage();
  const impactTestimonies = getTestimonies();

  return (
    <>
      <PageHero
        eyebrow="❤ Soutenir la mission"
        title={
          <>
            Ton don fait <span className="text-gradient">avancer la lumière</span>
          </>
        }
        description="Ce ministère est offert gratuitement à tous. Il existe et grandit uniquement grâce à la générosité de personnes qui croient en cette vision. Merci d'en faire partie."
      >
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="#partenaire" className="btn-primary">
            Devenir partenaire mensuel
          </Link>
          <Link href="#unique" className="btn-ghost">
            Faire un don unique
          </Link>
        </div>
      </PageHero>

      {/* Impact */}
      <section className="container-x py-16">
        <Reveal>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="glass flex flex-col items-center px-4 py-6 text-center">
                <span className="font-display text-2xl font-extrabold text-gradient sm:text-3xl">
                  {s.value}
                </span>
                <span className="mt-1 text-xs text-cream/60">{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Don unique */}
      <section id="unique" className="container-x scroll-mt-24 py-12">
        <Reveal>
          <div className="glass-strong mx-auto max-w-2xl p-7 text-center sm:p-10">
            <SectionHeader align="center" eyebrow="Don unique" title="Un geste, aujourd'hui" />
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {oneTimeAmounts.map((a, i) => (
                <button
                  key={a}
                  className={`rounded-2xl border px-4 py-5 font-display text-xl font-bold transition-all ${
                    i === 1
                      ? "border-dawn-400/60 bg-dawn-500/10 text-dawn-200 shadow-glow"
                      : "border-white/15 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <button className="btn-primary mt-6 w-full sm:w-auto sm:px-12">
              Donner maintenant
            </button>
            <p className="mt-4 text-xs text-cream/45">
              Paiement sécurisé. Reçu fiscal envoyé automatiquement si éligible.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Partenaire mensuel */}
      <section id="partenaire" className="container-x scroll-mt-24 py-12">
        <Reveal>
          <SectionHeader
            align="center"
            eyebrow="Partenaire mensuel"
            title={
              <>
                Rejoins ceux qui portent <span className="text-gradient">la mission</span>
              </>
            }
            description="Un soutien régulier, même modeste, permet de créer, publier et accompagner sans interruption — et de bâtir la future application."
          />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <Reveal key={tier.id} from="up" delay={i * 0.1}>
              <div
                className={`relative flex h-full flex-col overflow-hidden rounded-4xl border p-7 ${
                  tier.featured
                    ? "border-dawn-400/50 bg-gradient-to-b from-dawn-500/15 to-night-800/60 shadow-glow"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                {tier.featured ? (
                  <span className="absolute right-5 top-5 rounded-full bg-dawn-400 px-3 py-1 text-xs font-bold text-night-950">
                    Le plus choisi
                  </span>
                ) : null}
                <h3 className="font-display text-lg font-bold">{tier.name}</h3>
                <div className="mt-3 flex items-end gap-1">
                  <span className="font-display text-4xl font-extrabold">{tier.amount}</span>
                  <span className="mb-1 text-sm text-cream/55">{tier.cadence}</span>
                </div>
                <p className="mt-3 text-sm text-cream/65">{tier.description}</p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 text-sm text-cream/75">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-dawn-500/20 text-[10px] text-dawn-300">
                        ✓
                      </span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button className={`mt-7 ${tier.featured ? "btn-primary" : "btn-ghost"}`}>
                  Devenir {tier.name}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Transparence */}
      <section className="border-y border-white/10 bg-night-900/50 py-20">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal from="left">
            <SectionHeader
              eyebrow="Transparence"
              title={
                <>
                  Où va <span className="text-gradient">ton don</span> ?
                </>
              }
              description="Nous croyons que la confiance se construit dans la clarté. Voici exactement comment chaque euro est employé."
            />
          </Reveal>
          <Reveal from="right" delay={0.1}>
            <div className="glass-strong space-y-5 p-7">
              {usage.map((u) => (
                <div key={u.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cream/80">{u.label}</span>
                    <span className="font-semibold text-dawn-300">{u.percent} %</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-night-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-dawn-500 to-spirit-500"
                      style={{ width: `${u.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Témoignages d'impact */}
      <section className="container-x py-20">
        <Reveal>
          <SectionHeader
            align="center"
            eyebrow="Témoignages d'impact"
            title="Ton soutien change des vies"
          />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {impactTestimonies.map((t, i) => (
            <Reveal key={t.id} from="up" delay={i * 0.1}>
              <figure className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                <blockquote className="flex-1 text-base leading-relaxed text-cream/80">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${t.avatarColor} font-display font-bold text-night-950`}
                  >
                    {t.name.charAt(0)}
                  </span>
                  <div>
                    <p className="font-semibold text-cream">{t.name}</p>
                    <p className="text-xs text-cream/55">{t.location}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Captation email — page dons */}
      <section className="container-x pb-8">
        <Reveal>
          <div className="glass flex flex-col items-center gap-5 p-7 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="font-display text-xl font-bold">Pas encore prêt(e) à donner ?</h3>
              <p className="mt-1 text-sm text-cream/65">
                Reste connecté(e) à la mission : reçois les nouvelles et l'impact de ton futur soutien.
              </p>
            </div>
            <div className="w-full max-w-sm">
              <NewsletterForm source="page-dons" cta="Rester informé(e)" variant="spirit" note="" />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
