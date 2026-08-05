"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { StoreBadges } from "@/components/app/StoreBadges";
import { asset } from "@/lib/asset";
import { RHEMA_PREORDER_URL } from "@/config/stripe";

const COVER = "/img/rhema-cover.webp";

/** Sortie officielle du livre. */
const RELEASE_AT = new Date("2026-09-07T00:00:00+02:00");
const RELEASE_LABEL = "7 septembre";

/** Compte à rebours sobre jusqu'à la sortie (masqué une fois passée). */
function Countdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const diff = RELEASE_AT.getTime() - now;
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const cell = (v: number, label: string) => (
    <div className="text-center">
      <p className="font-display text-2xl font-extrabold text-dawn-400 tabular-nums sm:text-3xl">
        {v}
      </p>
      <p className="text-[10px] uppercase tracking-widest text-cream/45">{label}</p>
    </div>
  );
  return (
    <div className="flex items-center justify-center gap-5">
      {cell(d, d > 1? "jours": "jour")}
      {cell(h, "heures")}
      {cell(m, "min")}
    </div>
  );
}

/**
 * Vitrine RHEMA façon « keynote » : sombre, épurée, typographie géante,
 * livre en vue ÉCLATÉE au fil du scroll (les 4 éléments d'une journée se
 * détachent du livre), bandeaux de chiffres, et précommande forte.
 */
/** Étiquette numérotée avec trait (style « schéma technique », comme la vue
 * éclatée) : glisse en place quand elle entre à l'écran. */
function Callout({
  n,
  title,
  text,
  side,
  className,
}: {
  n: string;
  title: string;
  text?: string;
  side: "left" | "right";
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left"? 50: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={`pointer-events-none absolute z-10 w-[42%] max-w-[220px] ${
        side === "left"? "text-right": "text-left"
      } ${className?? ""}`}
    >
      <div className={`flex items-start gap-2 ${side === "left"? "flex-row-reverse": ""}`}>
        <span aria-hidden className="mt-2 h-px w-6 bg-dawn-400/60 sm:w-12" />
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] text-dawn-300">{n}</p>
          <p className="mt-0.5 font-display text-sm font-extrabold leading-tight sm:text-lg">
            {title}
          </p>
          {text? (
            <p className="mt-1 hidden text-xs leading-snug text-cream/55 sm:block">{text}</p>
          ): null}
        </div>
      </div>
    </motion.div>
  );
}

/** Apparition douce au défilement (dynamisme des sections). */
function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RhemaShowcase() {
  return (
    // pb-24 -mb-24 : peint en sombre l'espace au-dessus du pied de page
    // (sinon le fond crème du site apparaît en bande claire).
    <div className="dark-ctx -mb-24 bg-[#0A0B07] pb-24 text-cream">
      <Hero />
      <Exploded />
      <Stats />
      <Story />
      <MotDeJack />
      <Inside />
      <Manifesto />
      <BackCover />
      <Preorder />
      <AppBlock />
      <AccessForAll />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5b. L'application mobile — le même objectif, gratuitement           */
/* ------------------------------------------------------------------ */
function AppBlock() {
  return (
    <section className="px-6 pb-24 sm:pb-28">
      <FadeUp>
        <div className="bg-topo-dark relative mx-auto max-w-2xl overflow-hidden rounded-4xl border border-white/10 p-7 text-center sm:p-10">
          <div className="blob -left-14 -top-12 h-44 w-44 bg-spirit-500/25" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-dawn-300">
              L&apos;application mobile
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
              Le même objectif,
              <br />
              <span className="text-gradient">accessible gratuitement.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-cream/65 sm:text-base">
              RHEMA sur papier, et l&apos;application dans ta poche : une méditation
              chaque matin, la Bible, la communauté de prière et des rappels pour ne
              jamais perdre le fil. 100 % gratuite, sur iPhone et Android.
            </p>
            <div className="mt-6">
              <StoreBadges center />
            </div>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 6. RHEMA pour tous : la Parole n'a pas de frontières                */
/* ------------------------------------------------------------------ */
const GIFT_MAILTO =
  "mailto:contact@jackbrunet.com" +
  "?subject=" +
  encodeURIComponent("RHEMA pour tous — demande d'e-book offert") +
  "&body=" +
  encodeURIComponent(
    "Bonjour Jack,\n\nJe souhaite recevoir l'e-book RHEMA offert.\n\nMon prénom :\nMon pays :\nMa situation (en quelques mots) :\n\nMerci de tout cœur !",
  );

function AccessForAll() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-20 sm:py-24">
      <FadeUp className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-dawn-300">
          RHEMA pour tous
        </p>
        <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
          La Parole n&apos;a pas
          <br />
          <span className="text-gradient">de frontières.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-cream/65">
          Ce livre doit pouvoir toucher chacun, où qu&apos;il vive. C&apos;est pour cela
          que l&apos;e-book sera disponible à 5 € partout dans le monde. Et si tu vis en
          dehors de l&apos;Europe et de l&apos;Amérique du Nord, et que même cela
          représente un obstacle pour toi : écris-moi. Je te l&apos;offre, de tout cœur.
        </p>
        <p className="mx-auto mt-4 max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm leading-relaxed text-cream/70">
          Un mot de transparence : RHEMA représente six années de travail et un vrai
          investissement, en temps comme en argent — et je ne roule pas sur l&apos;or.
          Cette offre est réservée à ceux qui ne peuvent <em>vraiment</em> pas. Si tu as
          les moyens de l&apos;acheter, même à 5 €, fais-le : c&apos;est ce qui me permet
          de continuer à l&apos;offrir à ceux qui n&apos;ont rien. Merci de jouer le jeu,
          avec un cœur honnête.
        </p>
        <a href={GIFT_MAILTO} className="btn-ghost mt-6 inline-flex">
          Demander l&apos;e-book offert
        </a>
        <p className="mt-3 text-xs text-cream/40">
          Un simple email avec ton prénom, ton pays et ta situation — je réponds
          personnellement.
        </p>
      </FadeUp>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3a. L'histoire de RHEMA                                             */
/* ------------------------------------------------------------------ */
const STORY_STATS = [
  { big: "6", small: "années de partage" },
  { big: "+1 000", small: "vidéos publiées" },
  { big: "+100 M", small: "de personnes touchées" },
];

function Story() {
  return (
    <section className="px-6 pt-24 sm:pt-28">
      <FadeUp className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-dawn-300">
          L&apos;histoire de RHEMA
        </p>
        <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-5xl">
          Six années. Mille vidéos.
          <br />
          <span className="text-gradient">Une parole vivante.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-cream/65">
          Pendant six ans, j&apos;ai publié plus de mille vidéos avec une conviction
          profonde : la Parole de Dieu n&apos;a pas été donnée pour augmenter nos
          connaissances, mais pour transformer notre vie. Ces messages ont touché plus
          d&apos;une centaine de millions de personnes — et derrière les chiffres, des
          histoires : des retours à Dieu, des vies données à Jésus, de l&apos;espérance
          retrouvée au milieu de saisons difficiles.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-cream/65">
          Je ne voulais pas que ces paroles restent emportées par le rythme des réseaux.
          RHEMA en rassemble l&apos;essentiel : les révélations les plus fortes,
          retravaillées une à une pour devenir une véritable expérience de méditation —
          s&apos;arrêter, réfléchir, prier, et mettre en pratique.
        </p>
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-6">
          {STORY_STATS.map((s) => (
            <div key={s.small} className="text-center">
              <p className="font-display text-3xl font-extrabold text-dawn-400 sm:text-4xl">
                {s.big}
              </p>
              <p className="mt-1 text-[11px] text-cream/50">{s.small}</p>
            </div>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3a-bis. Le mot de Jack : la photo qui incarne la couverture         */
/* ------------------------------------------------------------------ */
function MotDeJack() {
  return (
    <section className="px-6 pt-24 sm:pt-28">
      <FadeUp className="mx-auto grid max-w-3xl items-center gap-10 sm:grid-cols-[auto_1fr]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset("/img/jack-mot.webp")}
          alt="Jack Brunet lisant RHEMA dans le fauteuil de la couverture"
          className="mx-auto w-64 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] sm:w-72"
          loading="lazy"
        />
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-dawn-300">
            Le mot de Jack
          </p>
          <div className="mt-4 space-y-3 text-[15px] font-medium leading-relaxed text-cream/85 sm:text-base">
            <p>« Ce livre est né bien avant d&apos;être écrit.</p>
            <p>
              Il est né dans ces instants où je m&apos;isolais avec Dieu, où je fermais
              la porte et lui ouvrais mon cœur. C&apos;est là qu&apos;il déposait des
              rhémas, des révélations. Non pas de simples connaissances bibliques, mais
              une Parole vivante, qui vient nous rejoindre exactement là où nous en
              avons besoin.
            </p>
            <p>
              Au fil des années, j&apos;ai vu des vies transformées par quelques minutes
              de vidéo, simplement parce que Dieu avait choisi le bon moment pour
              parler.
            </p>
            <p>
              Alors j&apos;ai prié pour que ces 365 méditations puissent, elles aussi,
              arriver au bon moment dans ta vie.
            </p>
            <p>Une page par jour… et laisse Dieu faire le reste. »</p>
          </div>
          <p className="mt-4 font-display text-2xl font-extrabold text-dawn-400">Jack</p>
        </div>
      </FadeUp>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3b. À l'intérieur : le livre ouvert                                 */
/* ------------------------------------------------------------------ */
function Inside() {
  return (
    <section className="overflow-hidden px-6 pt-24 sm:pt-28">
      <FadeUp className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-dawn-300">
          À l&apos;intérieur
        </p>
        <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
          Une double page.
          <br />
          <span className="text-gradient">Une journée avec Dieu.</span>
        </h2>
        <div className="relative mx-auto mt-10 w-full max-w-2xl">
          {/* Étiquettes superposées : écrans larges uniquement */}
          <div className="hidden sm:contents">
            <Callout
              n="01"
              title="La méditation"
              text="Le rhéma du jour et son verset, à gauche."
              side="left"
              className="left-0 top-[-9%]"
            />
            <Callout
              n="02"
              title="Tes notes"
              text="Ce que Dieu te dit, écrit de ta main, à droite."
              side="right"
              className="bottom-[-9%] right-0"
            />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/img/rhema-open.webp")}
            alt="Le livre RHEMA ouvert : la méditation du jour à gauche, Incarne la révélation, Prie et déclare, et l'espace de notes à droite"
            className="w-full drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)]"
            loading="lazy"
          />
        </div>

        {/* Mobile : les deux repères SOUS l'image, lisibles */}
        <div className="mt-6 grid grid-cols-2 gap-5 text-left sm:hidden">
          {[
            { n: "01", title: "La méditation", text: "Le rhéma du jour et son verset, à gauche." },
            { n: "02", title: "Tes notes", text: "Ce que Dieu te dit, écrit de ta main, à droite." },
          ].map((l, i) => (
            <motion.div
              key={l.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.25em] text-dawn-300">{l.n}</span>
                <span aria-hidden className="h-px flex-1 bg-dawn-400/40" />
              </div>
              <p className="mt-1 font-display text-base font-extrabold leading-tight">{l.title}</p>
              <p className="mt-1 text-xs leading-snug text-cream/55">{l.text}</p>
            </motion.div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-md text-sm text-cream/55">
          À gauche, la méditation du jour et son verset. À droite, tu incarnes la
          révélation, tu pries, tu déclares — et tu notes ce que Dieu te dit.
        </p>
      </FadeUp>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4b. La 4ᵉ de couverture                                             */
/* ------------------------------------------------------------------ */
function BackCover() {
  return (
    <section className="px-6 pb-24 sm:pb-28">
      <FadeUp className="mx-auto grid max-w-3xl items-center gap-10 sm:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset("/img/rhema-back.webp")}
          alt="Quatrième de couverture du livre RHEMA"
          className="mx-auto w-56 -rotate-2 drop-shadow-[0_30px_50px_rgba(0,0,0,0.55)] sm:w-72"
          loading="lazy"
        />
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-dawn-300">
            La 4ᵉ de couverture
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            Méditée. Priée.
            <br />
            <span className="text-gradient">Vécue.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-cream/65">
            L&apos;essentiel est écrit au dos — et l&apos;objet est à la hauteur du
            contenu : 740 pages, une couverture texturée sobre, un livre pensé pour
            être ouvert, souligné et annoté chaque jour pendant un an.
          </p>
          <p className="mt-3 text-xs font-semibold text-cream/40">
            Jack Brunet · pasteur et créateur de contenu chrétien
            <br />
            Préface de Josy W.Brunet
          </p>
        </div>
      </FadeUp>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Héros : titre géant + livre flottant                             */
/* ------------------------------------------------------------------ */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.25]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center overflow-hidden px-6 pt-[calc(6rem+env(safe-area-inset-top))] text-center"
    >
      {/* Halo lime discret derrière le livre */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[52%] h-[560px] w-[560px] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(202,240,0,0.14), transparent 65%)" }}
      />
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cream/50">
        RHEMA — le livre
      </p>
      <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.02] sm:text-7xl">
        Une révélation.
        <br />
        <span className="text-gradient">Chaque jour.</span>
      </h1>
      <p className="mt-5 max-w-md text-base text-cream/65 sm:text-lg">
        365 révélations bibliques à méditer, une par jour, pendant un an. Le condensé de
        six années de partage et de plus de mille vidéos autour de la Parole.
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-cream/40">
        Préface de Josy W.Brunet
      </p>
      <p className="mt-3 text-sm font-semibold text-cream/45">
        <span className="rounded-full bg-dawn-400/15 px-2.5 py-1 text-dawn-300">
          Offre de lancement
        </span>{" "}
        <span className="line-through">29,90 €</span>{" "}
        <span className="text-cream">26,90 €</span> · 740 pages
      </p>
      <div className="mt-5 rounded-2xl border border-dawn-400/30 bg-dawn-400/[0.08] px-6 py-4">
        <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-dawn-300">
          Sortie le {RELEASE_LABEL}
        </p>
        <div className="mt-3">
          <Countdown />
        </div>
      </div>
      <div className="mt-7 flex items-center gap-3">
        <a href="#precommande" className="btn-primary">
          {RHEMA_PREORDER_URL? "Précommander": "Réserver mon exemplaire"}
        </a>
      </div>

      <motion.div style={{ y, opacity }} className="relative mt-12 w-[240px] sm:w-[300px]">
        <motion.img
          src={asset(COVER)}
          alt="Couverture du livre RHEMA"
          className="w-full drop-shadow-[0_40px_60px_rgba(0,0,0,0.55)]"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Reflet au sol */}
        <div
          aria-hidden
          className="mx-auto mt-[-6px] h-8 w-3/4 rounded-[50%] bg-black/60 blur-xl"
        />
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Vue éclatée au scroll : les 4 éléments d'une journée             */
/* ------------------------------------------------------------------ */
const LAYERS = [
  { n: "01", title: "La méditation", text: "Un titre, un verset, une révélation à méditer." },
  { n: "02", title: "Incarne la révélation", text: "Pour la vivre concrètement dans ta journée." },
  { n: "03", title: "Prie et déclare", text: "Une prière et une déclaration de foi." },
  { n: "04", title: "Lecture & notes", text: "Une lecture recommandée, et l'espace pour écrire." },
];

function Layer({
  progress,
  index,
  side,
}: {
  progress: MotionValue<number>;
  index: number;
  side: "left" | "right";
}) {
  const start = 0.08 + index * 0.2;
  const opacity = useTransform(progress, [start, start + 0.12], [0, 1]);
  const x = useTransform(progress, [start, start + 0.16], [side === "left"? 60: -60, 0]);
  const l = LAYERS[index];
  return (
    <motion.div
      style={{ opacity, x }}
      className={`pointer-events-none absolute z-10 w-[44%] max-w-[240px] sm:w-[30%] ${
        side === "left"? "left-0 text-right": "right-0 text-left"
      } ${index < 2? (index === 0? "top-[16%]": "top-[62%]"): index === 2? "top-[16%]": "top-[62%]"}`}
    >
      <div className={`flex items-start gap-2 ${side === "left"? "flex-row-reverse": ""}`}>
        <span aria-hidden className="mt-2 h-px w-6 bg-dawn-400/60 sm:w-12" />
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] text-dawn-300">{l.n}</p>
          <p className="mt-0.5 font-display text-sm font-extrabold leading-tight sm:text-lg">
            {l.title}
          </p>
          <p className="mt-1 hidden text-xs leading-snug text-cream/55 sm:block">{l.text}</p>
        </div>
      </div>
    </motion.div>
  );
}

function Exploded() {
  const ref = useRef<HTMLDivElement>(null);
  // La progression suit la traversée de la section dans l'écran (pas de
  // position sticky : elle est cassée par l'overflow-x global du site).
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "center 0.45"] });
  const scale = useTransform(scrollYProgress, [0, 0.3], [1.05, 0.9]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, -4]);

  return (
    <section ref={ref} className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <p className="mb-10 max-w-md text-center font-display text-2xl font-extrabold leading-tight sm:text-4xl">
          Chaque jour, <span className="text-gradient">quatre temps</span>.
        </p>

        <div className="relative flex w-full max-w-2xl items-center justify-center">
          {/* Étiquettes autour du livre : écrans larges uniquement */}
          <div className="hidden sm:contents">
            <Layer progress={scrollYProgress} index={0} side="left" />
            <Layer progress={scrollYProgress} index={1} side="left" />
            <Layer progress={scrollYProgress} index={2} side="right" />
            <Layer progress={scrollYProgress} index={3} side="right" />
          </div>

          <motion.img
            src={asset(COVER)}
            alt=""
            aria-hidden
            style={{ scale, rotate }}
            className="w-[190px] drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)] sm:w-[240px]"
          />
        </div>

        {/* Mobile : les 4 temps SOUS le livre, en cascade (lisible, sans
            chevauchement) — même style schéma technique. */}
        <div className="mt-10 grid w-full grid-cols-2 gap-x-5 gap-y-6 sm:hidden">
          {LAYERS.map((l, i) => (
            <motion.div
              key={l.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.25em] text-dawn-300">
                  {l.n}
                </span>
                <span aria-hidden className="h-px flex-1 bg-dawn-400/40" />
              </div>
              <p className="mt-1 font-display text-base font-extrabold leading-tight">
                {l.title}
              </p>
              <p className="mt-1 text-xs leading-snug text-cream/55">{l.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Chiffres, façon fiche technique                                  */
/* ------------------------------------------------------------------ */
const STATS = [
  { big: "365", small: "révélations bibliques" },
  { big: "740", small: "pages à vivre" },
  { big: "1", small: "par jour, toute l'année" },
  { big: "10 min", small: "pour nourrir ta foi" },
];

function Stats() {
  return (
    <section className="border-y border-white/[0.06] bg-[#0D0F09] px-6 py-14">
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
        {STATS.map((s, i) => (
          <FadeUp key={s.small} delay={i * 0.1} className="text-center">
            <p className="font-display text-4xl font-extrabold text-dawn-400 sm:text-5xl">{s.big}</p>
            <p className="mt-1.5 text-xs text-cream/50">{s.small}</p>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Manifeste : gros titres, texte court                             */
/* ------------------------------------------------------------------ */
function Manifesto() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl space-y-24">
        <FadeUp>
          <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-5xl">
            Pas un livre à lire.
            <br />
            <span className="text-gradient">Un livre à vivre.</span>
          </h2>
          <p className="mt-5 max-w-xl text-cream/65">
            RHEMA est né d&apos;un chemin personnel avec Dieu, et de plusieurs années de
            partages, de méditations et de vidéos quotidiennes autour de la Parole. Ce
            dévotionnel a été conçu pour t&apos;accompagner jour après jour, afin que la
            Parole ne soit pas seulement écoutée, mais méditée, priée et vécue.
          </p>
        </FadeUp>
        <FadeUp className="sm:text-right">
          <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-5xl">
            Certains messages t&apos;encourageront.
            <br />
            <span className="text-gradient">D&apos;autres te confronteront.</span>
          </h2>
          <p className="mt-5 max-w-xl text-cream/65 sm:ml-auto">
            La foi, la peur, l&apos;identité, les relations, le pardon, les saisons
            d&apos;attente, les combats intérieurs, l&apos;appel de Dieu… Chaque
            méditation poursuit le même objectif : faire passer la Parole de la page
            jusqu&apos;au cœur, puis du cœur jusqu&apos;à la vie.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Précommande                                                      */
/* ------------------------------------------------------------------ */
function Preorder() {
  return (
    <section id="precommande" className="px-6 pb-24 pt-4 sm:pb-32">
      <div className="bg-topo-dark relative mx-auto max-w-2xl overflow-hidden rounded-4xl border border-dawn-400/25 p-7 sm:p-10">
        <div className="blob -right-14 -top-12 h-44 w-44 bg-dawn-400/20" />
        <div className="relative grid items-center gap-8 sm:grid-cols-[auto_1fr]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(COVER)}
            alt="RHEMA"
            className="mx-auto w-32 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] sm:w-40"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-dawn-300">
              Édition de lancement
            </p>
            <h3 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">
              Réserve ton exemplaire
            </h3>
            <p className="mt-2 text-sm text-cream/65">
              Sortie officielle le <strong className="text-dawn-300">{RELEASE_LABEL}</strong>
            </p>

            {/* Les 3 offres (prix de lancement) — le pack mis en avant */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-bold">Le livre RHEMA</p>
                  <p className="text-[11px] text-cream/50">
                    365 révélations · 740 pages ·{" "}
                    <span className="text-dawn-300">offre de lancement</span>
                  </p>
                </div>
                <p className="shrink-0 text-right font-display text-base font-extrabold">
                  <span className="mr-1.5 text-xs font-semibold text-cream/40 line-through">
                    29,90 €
                  </span>
                  26,90 €
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-bold">Le carnet RHEMA</p>
                  <p className="text-[11px] text-cream/50">
                    Pour noter ce que Dieu te dit ·{" "}
                    <span className="text-dawn-300">offre de lancement</span>
                  </p>
                </div>
                <p className="shrink-0 text-right font-display text-base font-extrabold">
                  <span className="mr-1.5 text-xs font-semibold text-cream/40 line-through">
                    11,90 €
                  </span>
                  10,90 €
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-bold">L&apos;e-book RHEMA</p>
                  <p className="text-[11px] text-cream/50">
                    Lisible partout dans le monde, dès la sortie
                  </p>
                </div>
                <p className="shrink-0 font-display text-base font-extrabold">5 €</p>
              </div>
              <div className="relative flex items-center justify-between gap-3 rounded-xl border border-dawn-400/60 bg-dawn-400/10 px-3.5 py-3">
                <span className="absolute -top-2 left-3 rounded-full bg-dawn-400 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-night-950">
                  Le pack complet
                </span>
                <div>
                  <p className="text-sm font-bold">Livre + carnet</p>
                  <p className="text-[11px] text-cream/55">
                    <span className="line-through">41,80 €</span> · tu économises 5,90 €
                  </p>
                </div>
                <p className="shrink-0 font-display text-lg font-extrabold text-dawn-300">
                  35,90 €
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Précommander directement, ou laisser son email — pleine largeur */}
        <div className="relative mt-8">
          {RHEMA_PREORDER_URL? (
            <a
              href={RHEMA_PREORDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex w-full justify-center py-4 text-base"
            >
              Précommander maintenant
            </a>
          ): (
            <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm text-cream/60">
              Le paiement en ligne ouvre dans quelques jours.
            </p>
          )}

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-cream/35">
            <span aria-hidden className="h-px flex-1 bg-white/10" />
            ou
            <span aria-hidden className="h-px flex-1 bg-white/10" />
          </div>

          <p className="text-sm font-semibold text-cream/85">
            Laisse ton email : tu seras averti(e) en premier à l&apos;ouverture des
            précommandes, et tu reçois dès maintenant{" "}
            <span className="text-dawn-300">les 7 premières méditations offertes</span>{" "}
            en ebook.
          </p>
          <div className="mt-3">
            <NewsletterForm
              source="rhema-precommande"
              layout="stacked"
              size="lg"
              cta="Être averti(e) par email"
              note="Zéro spam : uniquement la sortie du livre."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
