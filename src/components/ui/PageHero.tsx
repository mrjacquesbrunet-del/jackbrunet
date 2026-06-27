"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

/** Tonalités — UNIQUEMENT dans la palette de la marque (crème / olive / lime / vert). */
export type HeroTone = "creme" | "olive" | "lime" | "vert";

const TONES: Record<HeroTone, { dark: boolean; blobs: [string, string] }> = {
  creme: { dark: false, blobs: ["#CAF000", "#84CC16"] },
  lime: { dark: false, blobs: ["#CAF000", "#A3E635"] },
  vert: { dark: false, blobs: ["#34D399", "#16A34A"] },
  olive: { dark: true, blobs: ["#CAF000", "#65A30D"] },
};

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  tone?: HeroTone;
};

/** En-tête immersif et animé, décliné dans les couleurs de la marque (site + app). */
export function PageHero({ eyebrow, title, description, children, tone = "creme" }: PageHeroProps) {
  const { dark, blobs } = TONES[tone];
  const [c1, c2] = blobs;
  return (
    <section
      className={`hero-${tone} relative overflow-hidden pt-32 sm:pt-40 ${
        dark ? "dark-ctx bg-topo-dark text-cream" : ""
      }`}
    >
      <div className="absolute inset-0 bg-grid opacity-50" />
      <motion.div
        className="blob left-1/3 top-8 h-80 w-80 rounded-[42%]"
        style={{ backgroundColor: c1, opacity: 0.4 }}
        animate={{ y: [0, -18, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="blob right-1/4 top-1/2 h-72 w-72"
        style={{ backgroundColor: c2, opacity: 0.28 }}
        animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
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
            className={`mx-auto mt-5 max-w-2xl text-base sm:text-lg ${
              dark ? "text-cream/75" : "text-night-900/70"
            }`}
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
