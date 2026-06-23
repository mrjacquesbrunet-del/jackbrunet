"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { supportCta } from "@/config/site";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallaxe au scroll
  const yTitle = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const yBlob = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-24"
    >
      {/* Décor animé */}
      <div className="absolute inset-0 bg-grid opacity-60" />
      <motion.div
        style={{ y: yBlob }}
        className="blob left-[8%] top-24 h-[34rem] w-[34rem] rotate-[-12deg] rounded-[42%] bg-dawn-400/60 animate-pulse-glow"
      />
      <motion.div
        style={{ y: yBlob }}
        className="blob right-1/4 top-1/3 h-96 w-96 bg-spirit-400/25 animate-pulse-glow"
      />
      <div className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-night-900/10 animate-spin-slow" />

      <motion.div
        style={{ opacity }}
        className="container-x relative z-10 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <motion.div style={{ y: yTitle }} className="flex flex-col items-start">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="eyebrow"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-dawn-400" />
            Nouveau chaque matin
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 leading-[0.92] text-balance"
          >
            <span className="block font-display text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
              Rencontre Jésus
            </span>
            <span className="mt-2 block font-sans text-5xl font-extrabold uppercase tracking-tight text-night-900 sm:text-6xl md:text-7xl">
              chaque <span className="mark">jour</span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-night-900/70 sm:text-xl"
          >
            Une pensée qui réveille. Une parole qui éclaire. Un plan qui fait
            grandir. Rejoins une communauté vivante et laisse la lumière
            transformer ton quotidien.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="#aujourdhui" className="btn-primary text-base">
              Commencer aujourd'hui
            </Link>
            <Link href={supportCta.href} className="btn-ghost text-base">
              {supportCta.label}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex items-center gap-4 text-sm text-night-900/60"
          >
            <div className="flex -space-x-2.5">
              {[
                "from-dawn-400 to-dawn-600",
                "from-spirit-400 to-spirit-600",
                "from-glow-400 to-glow-500",
                "from-dawn-300 to-spirit-500",
              ].map((g, i) => (
                <span
                  key={i}
                  className={`h-9 w-9 rounded-full border-2 border-cream bg-gradient-to-br ${g}`}
                />
              ))}
            </div>
            <p>
              <span className="font-semibold text-night-900">+120 000</span> personnes
              édifiées chaque mois
            </p>
          </motion.div>
        </motion.div>

        {/* Carte « pensée du jour » flottante */}
        <motion.div
          initial={{ opacity: 0, x: 40, rotate: 2 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md lg:mx-0"
        >
          <div className="dark-ctx bg-topo-dark relative overflow-hidden rounded-4xl border border-night-900/10 p-7 shadow-card animate-float">
            <div className="blob -right-10 -top-10 h-40 w-40 bg-dawn-500/30" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="eyebrow">Aperçu du jour</span>
                <span className="text-xs text-cream/50">Aujourd'hui</span>
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold">Tu es vu, tu es aimé</h3>
              <p className="mt-3 text-sm leading-relaxed text-cream/70">
                « Les compassions de l'Éternel se renouvellent chaque matin.
                Grande est ta fidélité ! »
              </p>
              <p className="mt-2 text-xs font-semibold text-dawn-300">
                Lamentations 3.22-23
              </p>

              <div className="mt-6 rounded-2xl border border-white/10 bg-night-900/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-cream/50">
                  Reçois-la chaque matin
                </p>
                <div className="mt-3">
                  <NewsletterForm
                    source="hero-card"
                    layout="stacked"
                    cta="Je veux la lumière"
                    note=""
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Indicateur de scroll */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-night-900/40 sm:flex"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Défiler</span>
        <span className="h-10 w-6 rounded-full border border-night-900/20 p-1">
          <motion.span
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="block h-1.5 w-1.5 rounded-full bg-dawn-400"
          />
        </span>
      </motion.div>
    </section>
  );
}
