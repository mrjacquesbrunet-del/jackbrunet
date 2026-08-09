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

/** En-tête « RHEMA » : la photo occupe tout le cadre (proportions d'origine),
 *  le bloc de titre est posé à droite, dimensionné proportionnellement à la
 *  largeur pour reproduire exactement la maquette à toutes les tailles. */
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
    <section className="relative w-full overflow-hidden aspect-[1448/1086] lg:aspect-auto lg:h-[64vh] lg:max-h-[620px]">
      {/* Photo d'ambiance : cadre entier, proportions d'origine */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("/img/hero-rhema.webp")}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Voile léger côté droit pour la lisibilité du texte */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/10 to-black/60" />

      {/* Bloc de titre, poussé à droite DANS le conteneur borné au viewport
          (évite tout débordement). Tailles en vw sur mobile, fixes dès lg. */}
      <div className="absolute inset-0 flex items-center">
        <div className="container-x w-full">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="ml-auto max-w-[56%] text-right lg:max-w-sm"
          >
          <h1
            className="font-sans font-extrabold text-white text-[clamp(20px,4.8vw,3.75rem)]"
            style={{ letterSpacing: "0.14em" }}
          >
            RHEMA
          </h1>
          <div className="ml-auto mt-[1.2vw] h-[0.35vw] w-[6vw] rounded-full bg-dawn-400 lg:mt-4 lg:h-[3px] lg:w-12" />
          <p className="mt-[1.4vw] font-medium tracking-wide text-cream/85 text-[clamp(13px,2.05vw,1.25rem)] lg:mt-5">
            Ton temps avec Jésus
          </p>

          {/* Séparateur : ligne lime + point */}
          <div className="mt-[2.2vw] flex items-center gap-[1.2vw] lg:mt-8 lg:gap-3">
            <span className="h-px flex-1 bg-dawn-400/50" />
            <span className="h-[0.9vw] w-[0.9vw] shrink-0 rounded-full bg-dawn-400 lg:h-2 lg:w-2" />
            <span className="h-px flex-1 bg-dawn-400/50" />
          </div>

          {/* Phrase à mot tournant */}
          <p className="mt-[2.2vw] text-cream text-[clamp(15px,2.3vw,1.5rem)] lg:mt-8">
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
          <div className="mt-[2.4vw] flex justify-end lg:mt-9">
            <button
              type="button"
              onClick={toMeditation}
              className="group inline-flex items-center gap-[1.2vw] rounded-full border border-white/25 bg-white/[0.05] px-[2.4vw] py-[1.2vw] font-bold uppercase tracking-[0.12em] text-cream backdrop-blur-sm transition-colors text-[clamp(10px,1.4vw,0.75rem)] hover:border-dawn-400 hover:text-white lg:gap-2.5 lg:px-5 lg:py-3"
            >
              <motion.span
                className="h-[1vw] w-[1vw] rounded-full bg-dawn-400 lg:h-2 lg:w-2"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              La méditation du jour
            </button>
          </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
