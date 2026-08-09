"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ROTATING = ["la paix", "la force", "la joie", "l'espérance", "la grâce", "Sa présence"];
const TITLE = ["Mon", "temps", "avec", "Jésus"];

/** En-tête animé de l'accueil de l'application (et de la page dévotionnel). */
export function DevotionalHero({ dateLabel }: { dateLabel?: string }) {
  const [i, setI] = useState(0);
  // La date passée en prop est calculée au build (export statique) et resterait
  // donc figée. On la recalcule dans le navigateur pour qu'elle soit toujours
  // celle du jour, et qu'elle bascule à minuit sans reconstruction.
  const [today, setToday] = useState(dateLabel);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % ROTATING.length), 2400);
    setToday(
      new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    );
    return () => clearInterval(t);
  }, []);

  return (
    <section className="dark-ctx bg-topo-dark relative overflow-hidden pt-28 pb-10 sm:pt-36 sm:pb-14">
      <div className="absolute inset-0 bg-grid opacity-[0.08]" />
      {/* Halos vivants */}
      <motion.div
        className="hero-glow blob left-1/4 top-6 h-72 w-72 rounded-[44%] bg-dawn-400/45"
        animate={{ y: [0, -22, 0], x: [0, 12, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="blob right-1/4 top-1/3 h-64 w-64 bg-spirit-400/30"
        animate={{ y: [0, 20, 0], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="hero-glow blob left-1/2 top-0 h-56 w-56 -translate-x-1/2 bg-glow-300/30"
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container-x relative text-center">
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="h-2 w-2 rounded-full bg-dawn-400"
            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
          {today? <span className="capitalize">{today}</span>: "Temps avec Jésus"}
        </motion.span>

        {/* Titre mot par mot */}
        <h1 className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-x-3 font-display text-5xl font-extrabold leading-[1.02] sm:text-6xl md:text-7xl">
          {TITLE.map((w, idx) => (
            <motion.span
              key={w}
              className={idx >= 2? "text-gradient": ""}
              initial={{ opacity: 0, y: 30, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.15 + idx * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {w}
            </motion.span>
          ))}
        </h1>

        {/* Phrase à mot tournant */}
        <motion.p
          className="mt-6 text-lg text-cream/75 sm:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          Aujourd&apos;hui, reçois{" "}
          <span className="relative inline-block align-baseline">
            <AnimatePresence mode="wait">
              <motion.span
                key={i}
                className="inline-block font-display font-extrabold text-gradient"
                initial={{ y: "0.4em", opacity: 0 }}
                animate={{ y: "0em", opacity: 1 }}
                exit={{ y: "-0.4em", opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {ROTATING[i]}
              </motion.span>
            </AnimatePresence>
          </span>
.
        </motion.p>

        {/* Invitation à défiler */}
        <motion.div
          className="mx-auto mt-9 flex w-fit flex-col items-center gap-1 text-cream/45"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">La méditation du jour</span>
          <motion.svg
            viewBox="0 0 24 24"
            className="h-5 w-5 fill-none stroke-current"
            strokeWidth={2}
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </motion.div>
      </div>
    </section>
  );
}
