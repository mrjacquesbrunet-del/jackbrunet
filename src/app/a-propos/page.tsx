import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { MissionBanner } from "@/components/home/MissionBanner";
import { siteConfig } from "@/config/site";
import { NextLiveBanner } from "@/components/home/NextLiveBanner";
import { getAbout, getEvents } from "@/lib/content";
import { asset } from "@/lib/asset";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Notre histoire, notre vision et notre mission: conduire chaque personne à rencontrer Jésus et grandir en Lui, chaque jour.",
};

const values = [
  {
    title: "L'humilité",
    text: "Servir Dieu ne commence pas par vouloir briller, mais par accepter de dépendre de Lui. L'humilité nous garde à notre place devant Dieu. Elle nous rappelle que tout vient de Lui, que tout est pour Lui, et que sans Lui nous ne pouvons rien faire. Je crois qu'un ministère qui porte du fruit doit rester à genoux devant Dieu, même lorsqu'il devient visible devant les hommes.",
  },
  {
    title: "L'amour",
    text: "L'amour est au centre de l'Évangile. Ce n'est pas seulement un message à annoncer, c'est une vie à manifester. Aimer Dieu, aimer les personnes, aimer l'Église, aimer ceux qui souffrent, aimer ceux qui sont loin, aimer même quand cela coûte. Mon désir est que chaque parole, chaque vidéo, chaque prédication et chaque projet soient portés par l'amour de Dieu et l'amour des âmes.",
  },
  {
    title: "La foi",
    text: "La foi nous pousse à avancer quand tout n'est pas encore visible. Elle nous apprend à obéir à Dieu même lorsque nous ne maîtrisons pas tout. Elle nous fait croire que Dieu peut encore sauver, guérir, restaurer, relever et transformer des vies aujourd'hui. Je crois que Dieu agit encore. Je crois que Sa Parole est vivante. Je crois que l'Évangile est toujours puissant pour changer une vie.",
  },
  {
    title: "Le zèle",
    text: "Le zèle, c'est refuser de vivre une foi tiède. C'est servir Dieu avec passion, avec feu, avec persévérance, sans perdre de vue l'essentiel: Jésus. Je crois que notre génération a besoin de chrétiens réveillés, engagés, consacrés, brûlants d'amour pour Dieu et disponibles pour Sa mission.",
  },
];

const callItems = [
  "Annoncer l'Évangile avec clarté et passion",
  "Évangéliser sur les réseaux sociaux",
  "Faire des missions d'évangélisation dans les pays de la francophonie",
  "Encourager l'Église locale",
  "Équiper les chrétiens à grandir dans leur foi",
  "Former des disciples qui ressemblent à Jésus",
  "Appeler les personnes à une intimité plus profonde avec Dieu",
  "Rappeler à chacun son identité d'enfant de Dieu",
];

function InstagramMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.9} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M23.5 6.9a3 3 0 0 0-2.1-2.1C19.5 4.3 12 4.3 12 4.3s-7.5 0-9.4.5A3 3 0 0 0 .5 6.9 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.1 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.1zM9.6 15.6V8.4l6.3 3.6z" />
    </svg>
  );
}

function TikTokMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.5 3c.4 2.3 1.7 3.9 3.9 4.2v2.5c-1.4.1-2.7-.3-3.9-1v5.9c0 3.4-2.6 5.9-5.9 5.9A5.7 5.7 0 0 1 5 14.8c0-3.4 3-6 6.5-5.5v2.7c-.4-.1-.8-.2-1.2-.2-1.6 0-2.8 1.3-2.7 2.9 0 1.5 1.3 2.7 2.8 2.7 1.6 0 2.8-1.2 2.8-2.9V3z" />
    </svg>
  );
}

export default function AProposPage() {
  const about = getAbout();
  const events = getEvents();

  return (
    <>
      <PageHero
        eyebrow="À propos"
        title={
          <>
            Une foi vivante, <span className="text-gradient">simple et profonde</span>
          </>
        }
        description="Ce qui a commencé en 2020 avec quelques vidéos est devenu, par la grâce de Dieu, une famille de plus d'un million de personnes rassemblées sur les différentes plateformes."
      />

      {/* Intro + portrait */}
      <section className="container-x py-16">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
          {/* Portrait */}
          <Reveal from="left">
            <figure className="relative mx-auto w-full max-w-sm lg:mx-0">
              <div className="blob -left-8 -top-8 h-40 w-40 bg-dawn-400/40" />
              <div className="blob -bottom-10 -right-6 h-44 w-44 bg-spirit-400/25" />
              <div className="relative overflow-hidden rounded-[2rem] border border-night-900/10 bg-topo-dark shadow-card ring-1 ring-dawn-400/20">
                <img
                  src={asset(about.photo)}
                  alt={about.title}
                  className="aspect-[4/5] w-full object-cover"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night-900/70 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-display text-lg font-bold text-cream">{about.title}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dawn-300">
                    {about.role}
                  </p>
                </figcaption>
              </div>
            </figure>
          </Reveal>

          {/* Texte */}
          <div className="space-y-6 text-base leading-relaxed text-night-900/70 sm:text-lg">
            <Reveal>
              <p>
                Chaque mois, des millions de personnes sont touchées par des messages, des prières, des
                lives, des exhortations et des contenus bibliques centrés sur Jésus-Christ.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <p>
                Mais derrière les chiffres, il y a surtout une vision. Celle de présenter une foi
                vivante, enracinée et accessible. Une foi qui n'est pas une religion poussiéreuse,
                distante ou compliquée. Une foi qui parle au cœur, qui transforme la vie, qui relève,
                qui restaure et qui ramène les personnes à Jésus.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p>
                Quand j'ai commencé à publier des vidéos, mon désir était simple: parler de Dieu de
                manière concrète, parler de Jésus avec clarté, et transmettre une parole capable
                d'encourager, de réveiller et de transformer.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p>
                Je crois profondément que la Parole de Dieu n'est pas simplement faite pour être
                entendue. Elle est faite pour prendre racine, porter du fruit et transformer notre
                manière de vivre.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* L'appel à s'enraciner */}
      <section className="bg-topo-light border-y border-night-900/10 py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeader
              eyebrow="La vision"
              title={
                <>
                  L'appel à <span className="text-gradient">s'enraciner en Jésus</span>
                </>
              }
            />
          </Reveal>
          <div className="mt-10 mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-night-900/70 sm:text-lg">
            <Reveal delay={0.05}>
              <p>
                Avec le temps, j'ai compris que Dieu m'avait donné un mandat particulier: appeler
                les personnes à s'enraciner plus profondément dans leur intimité avec Jésus et dans
                leur identité d'enfant de Dieu.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <p>
                Je ne crois pas à une foi superficielle. Je ne crois pas à une foi qui se limite à
                des émotions passagères. Je crois à une foi enracinée, vivante, biblique, profonde,
                mais accessible à tous.
              </p>
            </Reveal>
            <Reveal delay={0.11}>
              <p>
                Mon désir est que chacun puisse découvrir Jésus personnellement, non pas seulement
                comme une idée, une religion ou une tradition, mais comme un Sauveur vivant, un Père
                proche, un Seigneur fidèle et une source de vie.
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <p>Je crois que c'est seulement enracinés en Christ que nous pouvons porter du fruit durablement.</p>
            </Reveal>
            <Reveal delay={0.17}>
              <p>
                Aujourd'hui, ce qui me guide, c'est le désir de voir des hommes et des femmes
                devenir de véritables disciples de Jésus: des personnes qui ne se contentent pas
                de croire en Lui, mais qui apprennent à Lui ressembler dans leur quotidien.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Quatre valeurs */}
      <section className="dark-ctx bg-topo-dark border-y border-white/10 py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeader
              align="center"
              eyebrow="Les piliers"
              title={
                <>
                  Quatre valeurs au <span className="text-gradient">cœur de la vision</span>
                </>
              }
            />
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-5 text-center text-base text-cream/65 sm:text-lg">
              Dieu a profondément posé sur mon cœur quatre valeurs qui sont devenues comme des
              piliers pour tout ce que je fais.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {values.map((v, i) => (
              <Reveal key={v.title} from="up" delay={i * 0.08}>
                <div className="glass-strong flex h-full flex-col p-7">
                  <h3 className="font-display text-xl font-bold">{v.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-cream/70">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Mon parcours */}
      <section className="container-x py-20">
        <Reveal>
          <SectionHeader eyebrow="Mon histoire" title="Mon parcours" />
        </Reveal>
        <div className="mt-10 mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-night-900/70 sm:text-lg">
          <Reveal delay={0.05}>
            <p>Cela fait maintenant plusieurs années que je sers Dieu.</p>
          </Reveal>
          <Reveal delay={0.08}>
            <p>
              Après des études en théologie, je suis parti en mission au Brésil, où j'ai travaillé
              dans un orphelinat. Cette saison a profondément marqué ma vie. J'y ai appris à servir,
              à aimer concrètement, à être présent auprès des plus fragiles et à voir l'Évangile non
              seulement comme une parole à annoncer, mais comme une vie à manifester.
            </p>
          </Reveal>
          <Reveal delay={0.11}>
            <p>
              En 2015, Dieu a commencé à m'appeler à prendre davantage ma place dans ce qu'Il
              voulait me confier. Mais pendant plusieurs années, j'ai résisté. Pas par manque
              d'amour pour Dieu, mais parce que j'étais tiraillé par la peur: la peur de me
              tromper, la peur de ne pas être capable, la peur du regard des autres, la peur de
              faire ce que Dieu me demandait réellement. Il m'a fallu cinq ans avant d'oser répondre
              pleinement.
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <p>
              En 2020, j'ai décidé de ne plus marcher par la peur, mais par l'obéissance. J'ai
              commencé à publier mes premières vidéos, à faire mes premiers lives, à annoncer
              l'Évangile sur les réseaux sociaux avec les moyens que j'avais. Et très rapidement,
              j'ai commencé à voir le fruit de Dieu: des personnes touchées, des vies encouragées,
              des cœurs ramenés à Jésus, des témoignages de restauration, de repentance, de foi
              renouvelée et de retour à Dieu.
            </p>
          </Reveal>
          <Reveal delay={0.17}>
            <p>
              Quelques années plus tard, ce sont des millions de personnes qui ont été exposées au
              message de l'Évangile, à la Parole de Dieu et à l'action du Saint-Esprit à travers
              ces contenus. Et ce qui m'anime reste le même: voir Jésus être annoncé et voir des
              vies transformées.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p>
              En 2021, j'ai été consacré pasteur. Aujourd'hui, je suis pasteur dans une église à
              Pau, et je continue à servir Dieu à la fois dans l'Église locale, dans
              l'évangélisation, dans les missions et sur les réseaux sociaux. Je suis marié et père
              d'un enfant de 11 ans. Ma famille fait partie de mon histoire, de mon équilibre et de
              mon appel.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Mon appel aujourd'hui */}
      <section className="bg-topo-light border-y border-night-900/10 py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeader
              eyebrow="Aujourd'hui"
              title={
                <>
                  Mon appel <span className="text-gradient">aujourd'hui</span>
                </>
              }
            />
          </Reveal>
          <div className="mt-10 mx-auto max-w-3xl">
            <Reveal delay={0.05}>
              <p className="text-base leading-relaxed text-night-900/70 sm:text-lg">
                Aujourd'hui, je crois que Dieu m'appelle à avancer dans plusieurs directions:
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="mt-6 space-y-3">
                {callItems.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-base text-night-900/75">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-dawn-500/20 text-[10px] text-dawn-500">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <div className="mt-12 space-y-5">
              <Reveal delay={0.12}>
                <p className="font-display text-xl font-bold text-night-900 sm:text-2xl">
                  Je ne veux pas seulement produire du contenu. Je veux participer à bâtir des vies.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="font-display text-xl font-bold text-night-900 sm:text-2xl">
                  Je ne veux pas seulement toucher des écrans. Je veux voir des cœurs revenir à
                  Jésus.
                </p>
              </Reveal>
              <Reveal delay={0.18}>
                <p className="font-display text-xl font-bold text-night-900 sm:text-2xl">
                  Je ne veux pas seulement inspirer des personnes quelques secondes. Je veux les
                  encourager à s'enraciner durablement en Christ.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.22}>
              <p className="mt-10 text-base leading-relaxed text-night-900/70 sm:text-lg">
                Ma prière est simple: que chaque message, chaque vidéo, chaque mission, chaque
                prédication et chaque projet puissent conduire les personnes à Jésus. Parce qu'au
                fond, tout part de Lui. Tout tient par Lui. Et tout doit revenir à Lui.
              </p>
            </Reveal>
            <Reveal delay={0.26}>
              <div className="mt-10 border-t border-night-900/10 pt-6">
                <p className="font-display text-2xl font-bold italic text-night-900 sm:text-3xl">
                  Pasteur Jack Brunet
                </p>
                <p className="mt-1 text-sm text-night-900/55">
                  Pour Jésus, avec vous.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Mission Madagascar + prochain live */}
      <MissionBanner />
      <NextLiveBanner events={events} />

      {/* Boutons contact */}
      <section className="container-x py-16">
        <Reveal>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={`mailto:${siteConfig.contactEmail}`} className="btn-primary">
              Me contacter
            </a>
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost inline-flex items-center gap-2"
            >
              <InstagramMark className="h-4 w-4" />
              Instagram
            </a>
            <a
              href={siteConfig.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost inline-flex items-center gap-2"
            >
              <YouTubeMark className="h-4 w-4" />
              YouTube
            </a>
            <a
              href={siteConfig.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost inline-flex items-center gap-2"
            >
              <TikTokMark className="h-4 w-4" />
              TikTok
            </a>
          </div>
        </Reveal>
      </section>

      {/* Captation email */}
      <section className="container-x pb-8">
        <Reveal>
          <div className="glass flex flex-col items-center gap-5 p-7 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="font-display text-xl font-bold">Fais partie de l'histoire</h3>
              <p className="mt-1 text-sm text-night-900/65">
                Reçois la pensée du jour et suis les coulisses de la mission.
              </p>
            </div>
            <div className="w-full max-w-sm">
              <NewsletterForm source="page-a-propos" cta="Me joindre" note="" />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
