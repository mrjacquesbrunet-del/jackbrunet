import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeader } from "@/components/ui/Section";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { PayButton } from "@/components/ui/PayButton";
import { WhatsAppChannel } from "@/components/ui/WhatsAppChannel";
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
        <p className="mt-6 max-w-2xl font-display text-xl font-bold italic text-night-900 sm:text-2xl">
          Une terre à aimer, à servir et à toucher par l'Évangile.
        </p>
        <div className="mt-6 max-w-2xl space-y-5 text-base leading-relaxed text-night-900/70 sm:text-lg">
          <p>
            Depuis quelque temps, Dieu a placé Madagascar sur mon cœur. Après plusieurs
            confirmations, nous croyons qu'il est temps d'y aller — non pas simplement pour
            organiser un événement, mais pour répondre à un appel : annoncer Jésus, encourager les
            cœurs, visiter les oubliés et soutenir concrètement ceux qui œuvrent déjà sur place.
          </p>
          <p>
            Madagascar est une terre magnifique, riche d'histoire, de culture et de visages. Mais
            c'est aussi une terre où les besoins sont immenses : pauvreté, précarité, enfants
            vulnérables, familles en difficulté, détenus oubliés, œuvres locales qui manquent
            parfois de moyens pour continuer leur mission.
          </p>
          <p>
            Au-delà des besoins matériels, nous croyons qu'il existe une faim spirituelle profonde.
            Beaucoup ont besoin d'entendre que Dieu les aime, que Jésus sauve, qu'Il restaure,
            qu'Il relève, qu'Il pardonne et qu'Il donne une espérance qui ne dépend pas des
            circonstances.
          </p>
          <p>
            C'est dans ce contexte que nous voulons aller — avec humilité, respect et amour. Notre
            but n'est pas d'arriver avec des réponses toutes faites, mais de servir : proclamer
            Jésus-Christ avec clarté, prier pour les personnes, encourager les croyants et manifester
            l'amour de Christ par des actes concrets.
          </p>
        </div>
      </section>

      {/* Verset callout */}
      <section className="container-x pb-4">
        <blockquote className="mx-auto max-w-2xl border-l-4 border-dawn-400 pl-6 py-4">
          <p className="font-display text-xl italic font-bold text-night-900 sm:text-2xl">
            &laquo;&nbsp;J'étais en prison, et vous êtes venus vers moi.&nbsp;&raquo;
          </p>
          <cite className="mt-3 block text-sm not-italic text-night-900/50">Matthieu 25:36</cite>
        </blockquote>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-night-900/70 sm:text-lg">
          Servir Dieu, c'est aussi aller vers ceux que beaucoup ne voient plus : les enfants
          vulnérables, les prisonniers, les pauvres, les isolés, les oubliés. Tous ont de la valeur
          aux yeux de Dieu.
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
              Organiser une conférence pour que beaucoup entendent clairement le message de
              l'Évangile et rencontrent Jésus.
            </p>
          </div>
          <div className="glass-strong flex h-full flex-col p-7">
            <h3 className="font-display text-lg font-bold">
              Évangélisation de rue
            </h3>
            <p className="mt-3 text-sm text-night-900/70">
              Aller dans les rues à la rencontre des personnes, prier avec elles, leur parler de
              Jésus et leur annoncer l'espérance du salut.
            </p>
          </div>
          <div className="glass-strong flex h-full flex-col p-7">
            <h3 className="font-display text-lg font-bold">
              Visite d'œuvres
            </h3>
            <p className="mt-3 text-sm text-night-900/70">
              Visiter orphelinats, prisons et autres œuvres locales : encourager ceux qui se sentent
              oubliés, bénir ceux qui servent déjà, et apporter un soutien concret selon les besoins.
            </p>
          </div>
        </div>
        <p className="mt-10 mx-auto max-w-2xl text-center text-base leading-relaxed text-night-900/70 sm:text-lg">
          Annoncer, mais aussi écouter. Prier, mais aussi soutenir. Prêcher, mais aussi visiter.
          Parler de Jésus, mais aussi montrer Son amour par notre présence. Notre désir est que
          cette mission soit une semence pour Madagascar : une semence de salut, d'encouragement,
          de restauration et de compassion.
        </p>
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

      {/* Déclaration de foi */}
      <section className="dark-ctx bg-topo-dark border-y border-white/10 py-20">
        <div className="container-x mx-auto max-w-2xl text-center">
          <p className="text-base leading-relaxed text-cream/75 sm:text-lg">
            Nous partons avec un double objectif : annoncer l'Évangile et
            manifester l'amour de Dieu de manière concrète.
          </p>
          <div className="mt-8 space-y-2 font-display text-xl font-bold leading-snug sm:text-2xl">
            <p>Nous croyons que Dieu aime Madagascar.</p>
            <p>Nous croyons que Jésus veut toucher les cœurs.</p>
            <p>
              Nous croyons que le <span className="text-gradient">Saint-Esprit</span>{" "}
              peut agir puissamment.
            </p>
          </div>
          <p className="mt-6 text-base leading-relaxed text-cream/70 sm:text-lg">
            Et nous croyons qu'ensemble — par la prière, le soutien et
            l'obéissance — nous pouvons prendre part à ce que Dieu veut faire là-bas.
          </p>
        </div>
      </section>

      {/* Verset de clôture */}
      <section className="container-x py-16">
        <blockquote className="mx-auto max-w-2xl text-center font-display text-xl italic text-night-900/75">
          &laquo;&nbsp;Allez par tout le monde, et prêchez la bonne nouvelle à toute la
          création.&nbsp;&raquo;
          <cite className="mt-3 block text-sm not-italic text-night-900/50">
            Marc 16:15
          </cite>
        </blockquote>
      </section>

      <WhatsAppChannel />
    </>
  );
}
