import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { MissionProgress } from "@/components/mission/MissionProgress";
import { MissionDonate } from "@/components/mission/MissionDonate";
import { WhatsAppChannel } from "@/components/ui/WhatsAppChannel";
import { asset } from "@/lib/asset";
import { getMission } from "@/lib/content";
import { STRIPE_LINKS } from "@/config/stripe";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Mission Madagascar",
  description:
    "Mission d'évangélisation à Madagascar, début novembre, 10 jours. Conférence, évangélisation de rue et soutien aux œuvres (orphelinats, prisons). Annoncer, aimer, servir.",
};

// Compte Instagram de la mission.
const IG_HANDLE = "missionmadagascar";
const IG_URL = `https://www.instagram.com/${IG_HANDLE}`;

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.9} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function MissionMadagascarPage() {
  const mission = getMission();
  const { raisedEur, objectiveEur } = mission;

  return (
    <div className="bg-[#FAF6F0] text-[#1F2E24]">
      {/* HÉROS */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32">
        <div className="pointer-events-none absolute left-1/2 top-8 h-80 w-80 -translate-x-1/2 rounded-full bg-[#E0892B]/15 blur-3xl" />
        <div className="container-x relative text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/mission/logo-web.webp")}
            alt="Mission Madagascar, annoncer, aimer, servir"
            className="mx-auto w-full max-w-[300px] sm:max-w-[380px]"
          />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.32em] text-[#E0892B] sm:text-sm">
            Annoncer · Aimer · Servir
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] sm:text-5xl">
            Porter la lumière de <span className="text-[#E0892B]">Jésus</span> à Madagascar
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#1F2E24]/70">
            Début novembre, pendant 10 jours, nous partons annoncer l'Évangile: une conférence
            d'évangélisation, de l'évangélisation de rue, et la visite d'œuvres, orphelinats,
            prisons et autres, pour les soutenir par notre présence et nos moyens.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="#soutenir"
              className="rounded-full bg-[#E0892B] px-7 py-3.5 font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
            >
              Soutenir la mission
            </Link>
            <a
              href={IG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#1F2E24] px-7 py-3.5 font-bold text-[#1F2E24] transition-colors hover:bg-[#1F2E24] hover:text-[#FAF6F0]"
            >
              <InstagramIcon className="h-5 w-5" />
              Suivre sur Instagram
            </a>
            <Link
              href="#priere"
              className="rounded-full px-6 py-3.5 font-semibold text-[#1F2E24]/65 transition-colors hover:text-[#1F2E24]"
            >
              Rejoindre la prière
            </Link>
          </div>
        </div>
      </section>

      {/* POURQUOI MADAGASCAR */}
      <section className="relative overflow-hidden py-16">
        <div className="container-x relative">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#E0892B]">Le projet</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
            Pourquoi Madagascar&nbsp;?
          </h2>
          <p className="mt-6 max-w-2xl font-display text-xl font-bold italic sm:text-2xl">
            Une terre à aimer, à servir et à toucher par l'Évangile.
          </p>
          <div className="mt-6 max-w-2xl space-y-5 text-base leading-relaxed text-[#1F2E24]/75 sm:text-lg">
            <p>
              Depuis quelque temps, Dieu a placé Madagascar sur mon cœur. Après plusieurs
              confirmations, nous croyons qu'il est temps d'y aller, non pas simplement pour
              organiser un événement, mais pour répondre à un appel: annoncer Jésus, encourager les
              cœurs, visiter les oubliés et soutenir concrètement ceux qui œuvrent déjà sur place.
            </p>
            <p>
              Madagascar est une terre magnifique, riche d'histoire, de culture et de visages. Mais
              c'est aussi une terre où les besoins sont immenses: pauvreté, précarité, enfants
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
              C'est dans ce contexte que nous voulons aller, avec humilité, respect et amour. Notre
              but n'est pas d'arriver avec des réponses toutes faites, mais de servir: proclamer
              Jésus-Christ avec clarté, prier pour les personnes, encourager les croyants et
              manifester l'amour de Christ par des actes concrets.
            </p>
          </div>
        </div>
      </section>

      {/* CE QUE NOUS ALLONS FAIRE */}
      <section className="container-x py-12">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#E0892B]">Sur place</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
            Ce que nous allons faire
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              t: "Conférence d'évangélisation",
              d: "Organiser une conférence pour que beaucoup entendent clairement le message de l'Évangile et rencontrent Jésus.",
            },
            {
              t: "Évangélisation de rue",
              d: "Aller dans les rues à la rencontre des personnes, prier avec elles, leur parler de Jésus et leur annoncer l'espérance du salut.",
            },
            {
              t: "Visite d'œuvres",
              d: "Visiter orphelinats, prisons et autres œuvres locales: encourager ceux qui se sentent oubliés, bénir ceux qui servent déjà, et apporter un soutien concret.",
            },
          ].map((c) => (
            <div
              key={c.t}
              className="flex h-full flex-col rounded-3xl border border-[#1F2E24]/10 bg-white/60 p-7"
            >
              <span className="h-1.5 w-10 rounded-full bg-[#E0892B]" />
              <h3 className="mt-4 font-display text-lg font-bold">{c.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#1F2E24]/70">{c.d}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-base leading-relaxed text-[#1F2E24]/70 sm:text-lg">
          Annoncer, mais aussi écouter. Prier, mais aussi soutenir. Prêcher, mais aussi visiter.
          Parler de Jésus, mais aussi montrer Son amour par notre présence. Notre désir est que
          cette mission soit une semence pour Madagascar: une semence de salut, d'encouragement,
          de restauration et de compassion.
        </p>
      </section>

      {/* INSTAGRAM */}
      <section className="py-14">
        <div className="container-x">
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1F2E24] to-[#2C3B2E] p-8 text-center sm:p-11">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#E0892B]/25 blur-2xl" />
            <div className="relative">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#E0892B] text-white">
                <InstagramIcon className="h-7 w-7" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-extrabold text-[#FAF6F0] sm:text-3xl">
                Suis la mission au jour le jour
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[#FAF6F0]/75">
                Photos, témoignages, préparatifs et nouvelles du terrain. Rejoins-nous sur Instagram
                et partage la mission autour de toi.
              </p>
              <a
                href={IG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#E0892B] px-7 py-3.5 font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                <InstagramIcon className="h-5 w-5" />@{IG_HANDLE}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* OBJECTIF DE COLLECTE */}
      <section id="soutenir" className="scroll-mt-24 bg-[#1F2E24] py-20 text-[#FAF6F0]">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#EBA94D]">Objectif</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
              Notre objectif&nbsp;: <span className="text-[#E0892B]">{objectiveEur.toLocaleString("fr-FR")} €</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#FAF6F0]/70 sm:text-lg">
              Cette mission a un coût: déplacements, logistique sur place, et soutien direct aux
              œuvres que nous visiterons. Chaque don, petit ou grand, nous rapproche du but.
            </p>

            <MissionProgress initialRaised={raisedEur} objective={objectiveEur} />

            <div className="mt-8">
              <MissionDonate
                stripeUrl={STRIPE_LINKS.missionMadagascar?? STRIPE_LINKS.donOnce}
                siteUrl={`${siteConfig.url}/mission-madagascar#soutenir`}
                className="rounded-full bg-[#E0892B] px-12 py-3.5 font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                Faire un don
              </MissionDonate>
              <p className="mt-3 text-sm text-[#FAF6F0]/55">
                Don sécurisé, tu es redirigé(e) vers le site.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ÉQUIPE DE PRIÈRE */}
      <section id="priere" className="container-x scroll-mt-24 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#E0892B]">
              Équipe de prière
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
              Porte la mission dans la prière
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#1F2E24]/70 sm:text-lg">
              Nous cherchons des intercesseurs qui porteront cette mission avant et pendant les 10
              jours. Tu veux prier avec nous, ou même nous rejoindre sur le terrain&nbsp;? Laisse ton
              email, nous te tiendrons informé(e).
            </p>
          </div>
          <div className="rounded-3xl border border-[#1F2E24]/10 bg-white/60 p-7 sm:p-8">
            <NewsletterForm
              source="mission-madagascar"
              layout="stacked"
              size="lg"
              variant="spirit"
              cta="Je rejoins la mission"
              note="Tu recevras les nouvelles et les sujets de prière."
            />
          </div>
        </div>
      </section>

      {/* DÉCLARATION DE FOI */}
      <section className="bg-[#1F2E24] py-20 text-[#FAF6F0]">
        <div className="container-x mx-auto max-w-2xl text-center">
          <p className="text-base leading-relaxed text-[#FAF6F0]/75 sm:text-lg">
            Nous partons avec un double objectif: annoncer l'Évangile et manifester l'amour de Dieu
            de manière concrète.
          </p>
          <div className="mt-8 space-y-2 font-display text-xl font-bold leading-snug sm:text-2xl">
            <p>Nous croyons que Dieu aime Madagascar.</p>
            <p>Nous croyons que Jésus veut toucher les cœurs.</p>
            <p>
              Nous croyons que le <span className="text-[#E0892B]">Saint-Esprit</span> peut agir
              puissamment.
            </p>
          </div>
          <p className="mt-6 text-base leading-relaxed text-[#FAF6F0]/70 sm:text-lg">
            Et nous croyons qu'ensemble, par la prière, le soutien et l'obéissance, nous pouvons
            prendre part à ce que Dieu veut faire là-bas.
          </p>
        </div>
      </section>

      {/* VERSET DE CLÔTURE */}
      <section className="container-x py-16">
        <blockquote className="mx-auto max-w-2xl text-center font-display text-xl italic text-[#1F2E24]/75">
          &laquo;&nbsp;Allez par tout le monde, et prêchez la bonne nouvelle à toute la
          création.&nbsp;&raquo;
          <cite className="mt-3 block text-sm not-italic text-[#1F2E24]/50">Marc 16:15</cite>
        </blockquote>
      </section>

      <WhatsAppChannel />
    </div>
  );
}
