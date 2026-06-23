import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeader } from "@/components/ui/Section";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { PayButton } from "@/components/ui/PayButton";
import { getMission } from "@/lib/content";
import { STRIPE_LINKS } from "@/config/stripe";

export const metadata: Metadata = {
  title: "Mission Madagascar",
  description:
    "Mission d'évangélisation à Madagascar — début novembre, 10 jours. Conférence, évangélisation de rue et soutien aux œuvres (orphelinats, prisons). Objectif de collecte : 10 000 €.",
};

export default function MissionMadagascarPage() {
  const mission = getMission();
  const { raisedEur, objectiveEur } = mission;
  const percent = Math.min(100, Math.round((raisedEur / objectiveEur) * 100));

  return (
    <>
      <PageHero
        eyebrow="Mission · Madagascar"
        title={
          <>
            Madagascar —{" "}
            <span className="text-gradient">porter la lumière de Jésus</span>
          </>
        }
        description="Début novembre, pendant 10 jours, nous partons annoncer l'Évangile à Madagascar : une conférence d'évangélisation, de l'évangélisation de rue, et la visite d'œuvres — orphelinats, prisons et autres — pour les soutenir par notre présence et nos moyens."
      >
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="#soutenir" className="btn-primary">
            Soutenir la mission
          </Link>
          <Link href="#priere" className="btn-ghost">
            Rejoindre l'équipe de prière
          </Link>
        </div>
      </PageHero>

      {/* Pourquoi Madagascar */}
      <section className="container-x py-16">
        <SectionHeader
          eyebrow="Le projet"
          title={
            <>
              Pourquoi <span className="text-gradient">Madagascar</span> ?
            </>
          }
        />
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-night-900/70 sm:text-lg">
          Madagascar est une terre où la faim spirituelle et les besoins
          matériels sont immenses — et où les cœurs sont étonnamment ouverts à
          l'Évangile. Une véritable porte ouverte pour annoncer Jésus.
        </p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-night-900/70 sm:text-lg">
          Nous voulons y aller non seulement pour proclamer la Bonne Nouvelle,
          mais aussi pour visiter et bénir les plus fragiles : les orphelins,
          les prisonniers, les oubliés. Les soutenir par notre présence, notre
          prière et nos moyens.
        </p>
      </section>

      {/* Ce que nous allons faire */}
      <section className="container-x py-12">
        <SectionHeader
          align="center"
          eyebrow="Sur place"
          title="Ce que nous allons faire"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="glass-strong flex h-full flex-col p-7">
            <h3 className="font-display text-lg font-bold">
              Conférence d'évangélisation
            </h3>
            <p className="mt-3 text-sm text-night-900/70">
              Rassembler largement et proclamer l'Évangile avec puissance, pour
              voir des vies rencontrer Jésus et être transformées.
            </p>
          </div>
          <div className="glass-strong flex h-full flex-col p-7">
            <h3 className="font-display text-lg font-bold">
              Évangélisation de rue
            </h3>
            <p className="mt-3 text-sm text-night-900/70">
              Aller à la rencontre des gens, là où ils sont, pour partager
              simplement et avec amour l'espérance de Christ.
            </p>
          </div>
          <div className="glass-strong flex h-full flex-col p-7">
            <h3 className="font-display text-lg font-bold">
              Visite d'œuvres
            </h3>
            <p className="mt-3 text-sm text-night-900/70">
              Orphelinats, prisons et autres œuvres : les encourager, prier
              avec eux et les soutenir financièrement.
            </p>
          </div>
        </div>
      </section>

      {/* Objectif de collecte */}
      <section
        id="soutenir"
        className="dark-ctx bg-topo-dark scroll-mt-24 border-y border-white/10 py-20"
      >
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <SectionHeader
              align="center"
              eyebrow="Objectif"
              title={
                <>
                  Notre objectif :{" "}
                  <span className="text-gradient">10 000 €</span>
                </>
              }
            />
            <p className="mt-4 text-base leading-relaxed text-cream/70 sm:text-lg">
              Cette mission a un coût : déplacements, logistique sur place, et
              soutien direct aux œuvres que nous visiterons. Chaque don, petit
              ou grand, nous rapproche du but.
            </p>

            {/* Barre de progression */}
            <div className="mt-8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-cream/80">{raisedEur} € collectés</span>
                <span className="font-semibold text-dawn-300">
                  Objectif {objectiveEur} €
                </span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-night-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-dawn-500 to-spirit-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-cream/55">
                {percent}% de l'objectif atteint
              </p>
            </div>

            <div className="mt-8 text-center">
              <PayButton
                href={STRIPE_LINKS.missionMadagascar ?? STRIPE_LINKS.donOnce}
                className="btn-primary sm:px-12"
              >
                Soutenir la mission
              </PayButton>
            </div>
          </div>
        </div>
      </section>

      {/* Équipe de prière */}
      <section id="priere" className="container-x scroll-mt-24 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeader
              eyebrow="Équipe de prière"
              title={
                <>
                  Porte la mission{" "}
                  <span className="text-gradient">dans la prière</span>
                </>
              }
              description="Nous cherchons des intercesseurs qui porteront cette mission avant et pendant les 10 jours. Tu veux prier avec nous, ou même nous rejoindre sur le terrain ? Laisse ton email, nous te tiendrons informé(e)."
            />
          </div>
          <div className="glass-strong p-7 sm:p-8">
            <NewsletterForm
              source="mission-madagascar"
              cta="Je rejoins la mission"
              note="Tu recevras les nouvelles et les sujets de prière."
            />
          </div>
        </div>
      </section>

      {/* Verset de clôture */}
      <section className="container-x pb-16">
        <blockquote className="mx-auto max-w-2xl text-center font-display text-xl italic text-night-900/75">
          « Allez par tout le monde, et prêchez la bonne nouvelle à toute la
          création. »
          <cite className="mt-3 block text-sm not-italic text-night-900/50">
            Marc 16:15
          </cite>
        </blockquote>
      </section>
    </>
  );
}
