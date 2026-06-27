"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

export type HeroTone = "lime" | "sky" | "amber" | "emerald" | "rose" | "violet" | "teal";

/** Couleurs des halos décoratifs par tonalité (le titre/étiquette sont gérés en CSS). */
const BLOBS: Record<HeroTone, [string, string]> = {
  lime: ["#CAF000", "#84CC16"],
  sky: ["#38BDF8", "#2563EB"],
  amber: ["#FBBF24", "#FB923C"],
  emerald: ["#34D399", "#059669"],
  rose: ["#FB7185", "#F472B6"],
  violet: ["#A78BFA", "#7C3AED"],
  teal: ["#2DD4BF", "#14B8A6"],
};

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Tonalité de couleur de la page (en-tête + halos). */
  tone?: HeroTone;
};

/** En-tête immersif et animé, coloré selon la page (site + app). */
export function PageHero({ eyebrow, title, description, children, tone = "lime" }: PageHeroProps) {
  const [c1, c2] = BLOBS[tone];
  return (
    <section className={`hero-${tone} relative overflow-hidden pt-32 sm:pt-40`}>
      <div className="absolute inset-0 bg-grid opacity-50" />
      <motion.div
        className="blob left-1/3 top-8 h-80 w-80 rounded-[42%]"
        style={{ backgroundColor: c1, opacity: 0.4 }}
        animate={{ y: [0, -18, 0], opacity: [0.32, 0.5, 0.32] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="blob right-1/4 top-1/2 h-72 w-72"
        style={{ backgroundColor: c2, opacity: 0.28 }}
        animate={{ y: [0, 20, 0], opacity: [0.22, 0.4, 0.22] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="container-x relative pb-12 text-center">
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {eyebrow}
        </motion.span>
        <motion.h1
          className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] text-balance sm:text-5xl md:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08 }}
        >
          {title}
        </motion.h1>
        {description ? (
          <motion.p
            className="mx-auto mt-5 max-w-2xl text-base text-night-900/70 sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
          >
            {description}
          </motion.p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
