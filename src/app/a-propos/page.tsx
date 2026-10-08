import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { MissionBanner } from "@/components/home/MissionBanner";
import { siteConfig } from "@/config/site";
import { NextLiveBanner } from "@/components/home/NextLiveBanner";
import { getAbout, getEvents } from "@/lib/content";
import { asset } from "@/lib/asset";
import { AProposBarre } from "@/components/apropos/AProposBarre";
import { Compteur, EnTeteAPropos, Valeurs, type Valeur } from "@/components/apropos/AProposAnime";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Notre histoire, notre vision et notre mission: conduire chaque personne à rencontrer Jésus et grandir en Lui, chaque jour.",
};

const ICONES = {
  humilite: "M12 3v4M7 21h10M9 21l1.2-7.5a2 2 0 0 1 3.6 0L15 21M6.5 11.5c1.6-1 3.4-1.5 5.5-1.5s3.9.5 5.5 1.5",
  amour: "M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z",
  foi: "M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.3 6.8 19l1-5.8L3.6 9.1l5.8-.8z",
  zele: "M12 3c1 3-1 4-2 6-1 2 0 4 2 4s3-2 2-4c2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 4-6 5-11z",
};
const ACCROCHES = ["Rester à genoux devant Dieu", "Une vie à manifester", "Avancer quand tout n'est pas visible", "Refuser une foi tiède"];

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
  const valeurs: Valeur[] = values.map((v, i) => ({
    titre: v.title,
    accroche: ACCROCHES[i],
    texte: v.text,
    icone: [ICONES.humilite, ICONES.amour, ICONES.foi, ICONES.zele][i],
  }));

  const parcours = [
    {
      quand: "Les fondations",
      titre: "Théologie, puis le Brésil",
      texte:
        "Après des études en théologie, je suis parti en mission au Brésil, où j'ai travaillé dans un orphelinat. Cette saison a profondément marqué ma vie. J'y ai appris à servir, à aimer concrètement, à être présent auprès des plus fragiles et à voir l'Évangile non seulement comme une parole à annoncer, mais comme une vie à manifester.",
    },
    {
      quand: "2015",
      titre: "L'appel",
      texte:
        "En 2015, Dieu a commencé à m'appeler à prendre davantage ma place dans ce qu'Il voulait me confier. Mais pendant plusieurs années, j'ai résisté. Pas par manque d'amour pour Dieu, mais parce que j'étais tiraillé par la peur: la peur de me tromper, la peur de ne pas être capable, la peur du regard des autres, la peur de faire ce que Dieu me demandait réellement. Il m'a fallu cinq ans avant d'oser répondre pleinement.",
    },
    {
      quand: "2020",
      titre: "Le pas d'obéissance",
      texte:
        "En 2020, j'ai décidé de ne plus marcher par la peur, mais par l'obéissance. J'ai commencé à publier mes premières vidéos, à faire mes premiers lives, à annoncer l'Évangile sur les réseaux sociaux avec les moyens que j'avais. Et très rapidement, j'ai commencé à voir le fruit de Dieu: des personnes touchées, des vies encouragées, des cœurs ramenés à Jésus, des témoignages de restauration, de repentance, de foi renouvelée et de retour à Dieu.",
    },
    {
      quand: "2021",
      titre: "Consacré pasteur",
      texte:
        "En 2021, j'ai été consacré pasteur. Aujourd'hui, je suis pasteur dans une église à Pau, et je continue à servir Dieu à la fois dans l'Église locale, dans l'évangélisation, dans les missions et sur les réseaux sociaux. Je suis marié et père d'un enfant de 11 ans. Ma famille fait partie de mon histoire, de mon équilibre et de mon appel.",
    },
    {
      quand: "Aujourd'hui",
      titre: "Des millions de vies",
      texte:
        "Quelques années plus tard, ce sont des millions de personnes qui ont été exposées au message de l'Évangile, à la Parole de Dieu et à l'action du Saint-Esprit à travers ces contenus. Et ce qui m'anime reste le même: voir Jésus être annoncé et voir des vies transformées.",
    },
  ];

  const eyebrow = "text-[11px] font-black uppercase tracking-[0.22em] text-dawn-400";
  const h2 = "mt-2 font-display text-[30px] font-extrabold leading-tight text-cream sm:text-4xl";

  return (
    <div className="keep-dark bg-night-950 text-cream">
      <AProposBarre />
      <EnTeteAPropos photo={asset(about.photo)} titre={about.title} role={about.role} />

      {/* Chiffres qui s'animent */}
      <section className="mx-auto max-w-3xl px-5">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { v: 100, s: " M+", l: "vues sur les vidéos" },
            { v: 2020, s: "", l: "premières vidéos", annee: true },
            { v: 2021, s: "", l: "consacré pasteur", annee: true },
          ].map((c, i) => (
            <Reveal key={c.l} delay={i * 0.08}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-4 text-center">
                <p className="whitespace-nowrap font-display text-[22px] font-extrabold leading-none text-dawn-400">
                  <Compteur valeur={c.v} suffixe={c.s} annee={"annee" in c} />
                </p>
                <p className="mt-1.5 text-[11.5px] font-semibold leading-tight text-cream/60">{c.l}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-3xl space-y-5 px-5 py-12 text-[16px] leading-relaxed text-cream/75">
        <Reveal>
          <p className="font-display text-[22px] font-bold leading-snug text-cream">
            Chaque mois, des millions de personnes sont touchées par des messages, des prières, des lives, des
            exhortations et des contenus bibliques centrés sur Jésus-Christ.
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <p>
            Mais derrière les chiffres, il y a surtout une vision. Celle de présenter une foi vivante, enracinée et
            accessible. Une foi qui n'est pas une religion poussiéreuse, distante ou compliquée. Une foi qui parle au
            cœur, qui transforme la vie, qui relève, qui restaure et qui ramène les personnes à Jésus.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <p>
            Quand j'ai commencé à publier des vidéos, mon désir était simple: parler de Dieu de manière concrète,
            parler de Jésus avec clarté, et transmettre une parole capable d'encourager, de réveiller et de
            transformer.
          </p>
        </Reveal>
      </section>

      {/* La vision */}
      <section className="relative overflow-hidden border-y border-white/10 bg-night-900 py-14">
        <div aria-hidden className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-dawn-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-5">
          <Reveal>
            <p className={eyebrow}>La vision</p>
            <h2 className={h2}>
              L'appel à <span className="text-dawn-400">s'enraciner en Jésus</span>
            </h2>
          </Reveal>
          <div className="mt-6 space-y-5 text-[16px] leading-relaxed text-cream/75">
            <Reveal delay={0.05}>
              <p>
                Avec le temps, j'ai compris que Dieu m'avait donné un mandat particulier: appeler les personnes à
                s'enraciner plus profondément dans leur intimité avec Jésus et dans leur identité d'enfant de Dieu.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <blockquote className="rounded-3xl border-l-4 border-dawn-400 bg-dawn-400/[0.06] py-4 pl-5 pr-4 font-display text-[20px] italic leading-snug text-cream">
                Je crois que c'est seulement enracinés en Christ que nous pouvons porter du fruit durablement.
              </blockquote>
            </Reveal>
            <Reveal delay={0.11}>
              <p>
                Mon désir est que chacun puisse découvrir Jésus personnellement, non pas seulement comme une idée,
                une religion ou une tradition, mais comme un Sauveur vivant, un Père proche, un Seigneur fidèle et
                une source de vie.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Quatre valeurs */}
      <section className="mx-auto max-w-3xl px-5 py-14">
        <Reveal>
          <p className={eyebrow}>Les piliers</p>
          <h2 className={h2}>
            Quatre valeurs au <span className="text-dawn-400">cœur de la vision</span>
          </h2>
          <p className="mt-3 text-[15px] text-cream/60">Touche une valeur pour la découvrir.</p>
        </Reveal>
        <div className="mt-6">
          <Valeurs valeurs={valeurs} />
        </div>
      </section>

      {/* Mon parcours : frise */}
      <section className="relative border-y border-white/10 bg-night-900 py-14">
        <div className="mx-auto max-w-3xl px-5">
          <Reveal>
            <p className={eyebrow}>Mon histoire</p>
            <h2 className={h2}>Mon parcours</h2>
          </Reveal>
          <ol className="relative mt-8 space-y-7 border-l border-dawn-400/30 pl-6">
            {parcours.map((e, i) => (
              <Reveal key={e.titre} delay={i * 0.06}>
                <li className="relative">
                  <span className="absolute -left-[31px] top-1 grid h-4 w-4 place-items-center rounded-full bg-night-900">
                    <span className="h-2.5 w-2.5 rounded-full bg-dawn-400 shadow-[0_0_10px_rgba(202,240,0,.7)]" />
                  </span>
                  <p className="text-[12px] font-black uppercase tracking-[0.18em] text-dawn-400">{e.quand}</p>
                  <h3 className="mt-1 font-display text-[21px] font-extrabold leading-tight text-cream">{e.titre}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-cream/70">{e.texte}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Mon appel aujourd'hui */}
      <section className="mx-auto max-w-3xl px-5 py-14">
        <Reveal>
          <p className={eyebrow}>Aujourd'hui</p>
          <h2 className={h2}>
            Mon appel <span className="text-dawn-400">aujourd'hui</span>
          </h2>
        </Reveal>
        <ul className="mt-6 space-y-2.5">
          {callItems.map((item, i) => (
            <Reveal key={item} delay={i * 0.04}>
              <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[15px] font-semibold text-cream/85">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden>
                    <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {item}
              </li>
            </Reveal>
          ))}
        </ul>
        <div className="mt-10 space-y-4">
          {[
            "Je ne veux pas seulement produire du contenu. Je veux participer à bâtir des vies.",
            "Je ne veux pas seulement toucher des écrans. Je veux voir des cœurs revenir à Jésus.",
            "Je ne veux pas seulement inspirer des personnes quelques secondes. Je veux les encourager à s'enraciner durablement en Christ.",
          ].map((t, i) => (
            <Reveal key={t} from="left" delay={i * 0.1}>
              <p className="border-l-2 border-dawn-400 pl-4 font-display text-[21px] font-bold leading-snug text-cream">{t}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <p className="mt-10 text-[16px] leading-relaxed text-cream/75">
            Ma prière est simple: que chaque message, chaque vidéo, chaque mission, chaque prédication et chaque
            projet puissent conduire les personnes à Jésus. Parce qu'au fond, tout part de Lui. Tout tient par Lui.
            Et tout doit revenir à Lui.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="font-display text-[28px] font-bold italic text-cream">Pasteur Jack Brunet</p>
            <p className="mt-1 text-sm text-dawn-400">Pour Jésus, avec vous.</p>
          </div>
        </Reveal>
      </section>

      {/* Mission Madagascar + prochain live */}
      <MissionBanner />
      <NextLiveBanner events={events} />

      {/* Réseaux */}
      <section className="mx-auto max-w-3xl px-5 py-10">
        <Reveal>
          <div className="grid grid-cols-2 gap-2.5">
            <a href={`mailto:${siteConfig.contactEmail}`} className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-dawn-400 py-3.5 font-display text-[17px] font-extrabold text-night-950">
              Me contacter
            </a>
            {[
              { href: siteConfig.social.instagram, label: "Instagram", Icone: InstagramMark },
              { href: siteConfig.social.youtube, label: "YouTube", Icone: YouTubeMark },
              { href: siteConfig.social.tiktok, label: "TikTok", Icone: TikTokMark },
            ].map(({ href, label, Icone }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] py-3 text-[14px] font-bold text-cream last:col-span-2"
              >
                <Icone className="h-4 w-4 text-dawn-400" />
                {label}
              </a>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Captation email */}
      <section className="mx-auto max-w-3xl px-5 pb-16">
        <Reveal>
          <div className="dark-ctx rounded-3xl border border-dawn-400/25 bg-dawn-400/[0.05] p-6 text-center">
            <h3 className="font-display text-[22px] font-bold">Fais partie de l'histoire</h3>
            <p className="mt-1 text-sm text-cream/65">Reçois la pensée du jour et suis les coulisses de la mission.</p>
            <div className="mx-auto mt-4 max-w-sm">
              <NewsletterForm source="page-a-propos" cta="Me joindre" note="" />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
