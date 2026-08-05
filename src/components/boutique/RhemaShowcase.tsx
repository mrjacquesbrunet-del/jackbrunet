"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
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
export function RhemaShowcase() {
  return (
    <div className="dark-ctx bg-[#0A0B07] text-cream">
      <Hero />
      <Exploded />
      <Stats />
      <Manifesto />
      <BackCover />
      <Preorder />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4b. La 4ᵉ de couverture                                             */
/* ------------------------------------------------------------------ */
function BackCover() {
  return (
    <section className="px-6 pb-24 sm:pb-28">
      <div className="mx-auto grid max-w-3xl items-center gap-10 sm:grid-cols-2">
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
            Depuis plusieurs années, je cherche à transmettre des révélations bibliques
            simples et pratiques, pour amener chacun à méditer autrement. Ce livre
            rassemble l&apos;esprit de ces rhémas partagés au fil du temps — pour les
            faire passer de l&apos;écran à la page.
          </p>
          <p className="mt-3 text-xs font-semibold text-cream/40">
            Jack Brunet · pasteur et créateur de contenu chrétien
            <br />
            Préface de Josy W.Brunet
          </p>
        </div>
      </div>
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
        365 révélations bibliques à méditer, une par jour, pendant un an.
        L&apos;aboutissement de tout ce que je partage.
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-cream/40">
        Préface de Josy W.Brunet
      </p>
      <p className="mt-3 text-sm font-semibold text-cream/45">
        <span className="rounded-full bg-dawn-400/15 px-2.5 py-1 text-dawn-300">
          Offre de lancement
        </span>{" "}
        <span className="line-through">29,90 €</span>{" "}
        <span className="text-cream">26,90 €</span> · 740 pages · Sortie le {RELEASE_LABEL}
      </p>
      <div className="mt-5">
        <Countdown />
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
  { n: "01", title: "La révélation", text: "Le RHEMA du jour : une parole qui ouvre le verset autrement." },
  { n: "02", title: "Le verset", text: "Ancré dans la Bible, noir sur blanc, à souligner." },
  { n: "03", title: "La méditation", text: "Deux minutes pour descendre en profondeur." },
  { n: "04", title: "La mise en pratique", text: "Une prière pour le vivre — pas seulement le lire." },
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
  const start = 0.12 + index * 0.17;
  const opacity = useTransform(progress, [start, start + 0.1], [0, 1]);
  const x = useTransform(progress, [start, start + 0.14], [side === "left"? 60: -60, 0]);
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
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 0.25], [1, 0.86]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, -4]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.08, 0.9, 1], [0, 1, 1, 0.4]);

  return (
    <section ref={ref} className="relative h-[320vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden px-6">
        <motion.p
          style={{ opacity: titleOpacity }}
          className="mb-8 max-w-md text-center font-display text-2xl font-extrabold leading-tight sm:text-4xl"
        >
          Chaque jour, <span className="text-gradient">quatre temps</span>.
        </motion.p>

        <div className="relative flex w-full max-w-2xl items-center justify-center">
          <Layer progress={scrollYProgress} index={0} side="left" />
          <Layer progress={scrollYProgress} index={1} side="left" />
          <Layer progress={scrollYProgress} index={2} side="right" />
          <Layer progress={scrollYProgress} index={3} side="right" />

          <motion.img
            src={asset(COVER)}
            alt=""
            aria-hidden
            style={{ scale, rotate }}
            className="w-[180px] drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)] sm:w-[240px]"
          />
        </div>

        <motion.p
          style={{ opacity: titleOpacity }}
          className="mt-8 max-w-sm text-center text-sm text-cream/50 sm:hidden"
        >
          La révélation, le verset, la méditation, la mise en pratique.
        </motion.p>
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
  { big: "2 min", small: "pour nourrir ta foi" },
];

function Stats() {
  return (
    <section className="border-y border-white/[0.06] bg-[#0D0F09] px-6 py-14">
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.small} className="text-center">
            <p className="font-display text-4xl font-extrabold text-dawn-400 sm:text-5xl">{s.big}</p>
            <p className="mt-1.5 text-xs text-cream/50">{s.small}</p>
          </div>
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
        <div>
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
        </div>
        <div className="sm:text-right">
          <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-5xl">
            Ta première pensée
            <br />
            <span className="text-gradient">du matin.</span>
          </h2>
          <p className="mt-5 max-w-xl text-cream/65 sm:ml-auto">
            Avant les réseaux, avant les messages, avant le bruit. Un an de rendez-vous
            quotidiens avec Dieu, à poser sur ta table de nuit.
          </p>
        </div>
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
            {RHEMA_PREORDER_URL? (
              <a
                href={RHEMA_PREORDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-5 inline-flex"
              >
                Précommander maintenant
              </a>
            ): (
              <div className="mt-5">
                <p className="text-sm font-semibold text-cream/85">
                  Sois averti(e) en premier à l&apos;ouverture des précommandes — et reçois
                  dès maintenant <span className="text-dawn-300">les 7 premières méditations
                  offertes</span> en ebook.
                </p>
                <div className="mt-3">
                  <NewsletterForm
                    source="rhema-precommande"
                    cta="Je réserve ma place"
                    note="Zéro spam : uniquement la sortie du livre."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
