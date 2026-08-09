import type { Metadata } from "next";
import Link from "next/link";
import { StoreBadges } from "@/components/app/StoreBadges";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "L'application",
  description:
    "Télécharge l'application Jack Brunet : Foi & Prière — dévotionnel quotidien, Bible, plans de lecture, musique d'adoration et communauté de prière. Gratuite sur iPhone et Android.",
};

const FEATURES = [
  {
    title: "Ton temps avec Jésus",
    text: "Chaque matin, une méditation nouvelle, un verset à déclarer et des questions pour aller en profondeur.",
    icon: "M12 3v2m0 14v2M5.6 5.6l1.4 1.4m10 10 1.4 1.4M3 12h2m14 0h2M5.6 18.4 7 17m10-10 1.4-1.4",
  },
  {
    title: "La Bible, avec toi",
    text: "Lis, surligne, écoute. Tes passages préférés te suivent dans ton carnet, même hors connexion.",
    icon: "M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2V5zm4 4h7M8 12h7",
  },
  {
    title: "Plans de lecture",
    text: "Des parcours thématiques pour avancer pas à pas : foi, paix, identité, combat spirituel…",
    icon: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  },
  {
    title: "Mur de prière",
    text: "Partage tes sujets, prie pour les autres, reçois des encouragements d'une vraie communauté.",
    icon: "M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6.6 5.5 5.5 0 0 1 21.5 12c-2.5 4.5-9.5 9-9.5 9z",
  },
  {
    title: "Musique d'adoration",
    text: "Soaking et fonds musicaux pour prier, méditer ou t'endormir — même écran verrouillé.",
    icon: "M9 18a3 3 0 1 1-2-2.83V5l11-2v12a3 3 0 1 1-2-2.83",
  },
  {
    title: "Ton rappel du matin",
    text: "Une notification douce chaque matin pour ne jamais manquer ton rendez-vous avec Dieu.",
    icon: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  },
] as const;

function FeatureIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={1.7}>
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Maquette de téléphone (CSS pur) montrant l'esprit de l'app. */
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[270px] rotate-[3deg] rounded-[2.6rem] border-[10px] border-night-950 bg-night-950 p-4 shadow-2xl sm:w-[300px]">
      <div className="mx-auto mb-4 h-5 w-28 rounded-full bg-night-950" />
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-dawn-400">
        Mon temps avec Jésus
      </p>
      <p className="mt-3 font-display text-xl font-extrabold leading-snug text-cream">
        « La prière fervente du juste a une grande force. »
      </p>
      <p className="mt-2 text-xs text-cream/60">Jacques 5.16</p>
      <div className="mt-5 rounded-2xl bg-dawn-400 px-4 py-3">
        <p className="font-display text-sm font-extrabold leading-snug text-night-950">
          La prière n'est pas ta dernière option. C'est ton arme la plus puissante.
        </p>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-2.5 w-4/5 rounded-full bg-cream/15" />
        <div className="h-2.5 w-full rounded-full bg-cream/15" />
        <div className="h-2.5 w-2/3 rounded-full bg-cream/15" />
      </div>
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-cream/10 px-4 py-2.5">
        <span className="text-xs font-semibold text-cream/80">🎧 Écouter la méditation</span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-dawn-400 text-night-950">▶</span>
      </div>
    </div>
  );
}

export default function AppLandingPage() {
  return (
    <div className="overflow-hidden">
      {/* HÉROS */}
      <section className="relative pt-28 pb-16 sm:pt-36">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="blob left-[6%] top-24 h-80 w-80 bg-dawn-400/50 animate-pulse-glow" />
        <div className="blob right-[10%] top-1/2 h-72 w-72 bg-spirit-400/25 animate-pulse-glow" />

        <div className="container-x relative z-10 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-dawn-400" />
              Disponible sur iPhone et Android
            </span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.95] sm:text-6xl">
              Ton temps avec <span className="text-outline">Jésus</span>,
              <br />
              dans ta poche.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-night-900/70">
              Dévotionnel quotidien, Bible, plans de lecture, musique d'adoration et une
              communauté qui prie pour toi. Gratuite, sans publicité — pour t'enraciner en
              Christ chaque jour.
            </p>
            <div className="mt-8">
              <StoreBadges />
            </div>
            <p className="mt-4 text-sm text-night-900/50">
              100&nbsp;% gratuite · Un rappel chaque matin · Fonctionne hors connexion
            </p>
          </div>

          <PhoneMockup />
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section className="container-x py-16">
        <span className="eyebrow">Ce qui t'attend</span>
        <h2 className="mt-4 max-w-2xl font-display text-3xl font-extrabold sm:text-4xl">
          Une application pensée pour ta vie de foi
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-3xl p-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-night-950 text-dawn-400">
                <FeatureIcon d={f.icon} />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-night-900/65">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BANDEAU FINAL */}
      <section className="container-x pb-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-night-950 px-6 py-14 text-center sm:px-12">
          <div className="blob left-[12%] top-0 h-56 w-56 bg-dawn-400/30" />
          <p className="relative font-display text-3xl font-extrabold text-cream sm:text-4xl">
            Commence <span className="text-dawn-400">demain matin</span>.
          </p>
          <p className="relative mx-auto mt-4 max-w-xl text-cream/70">
            Installe l'application, active ton rappel, et laisse Dieu parler en premier
            chaque matin.
          </p>
          <div className="relative mt-8">
            <StoreBadges center />
          </div>
          <p className="relative mt-6 text-sm text-cream/50">
            Une question ?{" "}
            <Link href="/a-propos" className="underline hover:text-cream">
              Découvre le ministère
            </Link>{" "}
            ou écris-nous :{" "}
            <a href={`mailto:${siteConfig.contactEmail}`} className="underline hover:text-cream">
              {siteConfig.contactEmail}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
