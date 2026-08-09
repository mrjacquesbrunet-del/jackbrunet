"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { asset } from "@/lib/asset";

const ROTATING = [
  "la grâce",
  "la paix",
  "la force",
  "la joie",
  "l'espérance",
  "l'amour",
  "Sa présence",
];

/** En-tête « RHEMA » : photo d'ambiance en fond + bloc de titre à droite,
 *  avec le mot qui tourne (grâce, joie, amour…). App et page dévotionnel. */
export function DevotionalHero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % ROTATING.length), 2400);
    return () => clearInterval(t);
  }, []);

  function toMeditation() {
    const el = document.getElementById("meditation");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: Math.round(window.innerHeight * 0.9), behavior: "smooth" });
  }

  return (
    <section className="relative min-h-[92svh] overflow-hidden">
      {/* Photo d'ambiance en fond */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("/img/hero-rhema.webp")}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-[28%_center]"
      />
      {/* Voiles pour la lisibilité du texte (plus sombre à droite / en bas) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-black/85" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-black/0 via-black/25 to-black/70 lg:block" />

      <div className="container-x relative flex min-h-[92svh] items-center justify-center lg:justify-end">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md pt-16 text-center lg:pt-0 lg:text-right"
        >
          <h1
            className="font-sans text-5xl font-extrabold text-white sm:text-6xl"
            style={{ letterSpacing: "0.3em", paddingLeft: "0.3em" }}
          >
            RHEMA
          </h1>
          <div className="mx-auto mt-4 h-[3px] w-12 rounded-full bg-dawn-400 lg:ml-auto lg:mr-0" />
          <p className="mt-5 text-lg font-medium tracking-wide text-cream/85 sm:text-xl">
            Ton temps avec Jésus
          </p>

          {/* Séparateur : ligne lime + point */}
          <div className="mt-8 flex items-center gap-3">
            <span className="h-px flex-1 bg-dawn-400/50" />
            <span className="h-2 w-2 shrink-0 rounded-full bg-dawn-400" />
            <span className="h-px flex-1 bg-dawn-400/50" />
          </div>

          {/* Phrase à mot tournant */}
          <p className="mt-8 text-xl text-cream sm:text-2xl">
            Aujourd&apos;hui, reçois{" "}
            <span className="relative inline-block align-baseline">
              <AnimatePresence mode="wait">
                <motion.span
                  key={i}
                  className="inline-block font-extrabold text-dawn-400"
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
          </p>

          {/* Bouton pilule vers la méditation */}
          <div className="mt-9 flex justify-center lg:justify-end">
            <button
              type="button"
              onClick={toMeditation}
              className="group inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/[0.05] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-cream backdrop-blur-sm transition-colors hover:border-dawn-400 hover:text-white"
            >
              <motion.span
                className="h-2 w-2 rounded-full bg-dawn-400"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              La méditation du jour
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
