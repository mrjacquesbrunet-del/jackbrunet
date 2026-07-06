"use client";

import { motion } from "framer-motion";

/**
 * En-tête de la page Bible, épuré, dans la charte (olive profond + accent
 * lime), aligné sur le style du mur de prière. Légère animation d'apparition.
 */
export function BibleHero() {
  return (
    <section className="dark-ctx relative overflow-hidden bg-night-950 pt-28 pb-10 text-cream sm:pt-36">
      <div className="absolute inset-0 bg-grid opacity-[0.1]" />
      <div className="blob -right-10 top-6 h-56 w-56 bg-dawn-400/25 animate-pulse-glow" />

      <div className="container-x relative">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block rounded-full border border-dawn-400/40 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-dawn-300"
        >
          Bible
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl"
        >
          La <span className="text-dawn-400">Bible</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-2 max-w-xl text-cream/70"
        >
          Lis, écoute et médite la Parole. Choisis un livre, un chapitre, et laisse-la
          prendre racine.
        </motion.p>
      </div>
    </section>
  );
}
