"use client";

import { motion } from "framer-motion";

/**
 * En-tête moderne et animé de la page Bible: un grand titre en fond, une Bible
 * illustrée qui flotte par-dessus (effet « produit devant le texte »), le tout
 * dans la charte (olive profond + accents lime). Pensé pour bien rendre dans
 * l'application.
 */
export function BibleHero() {
  return (
    <section className="dark-ctx bg-topo-dark relative overflow-hidden rounded-b-[2.5rem] pt-28 pb-10 text-cream sm:pt-36">
      <div className="absolute inset-0 bg-grid opacity-[0.12]" />
      <div className="blob left-1/4 top-6 h-72 w-72 bg-dawn-400/25 animate-pulse-glow" />
      <div className="blob right-1/5 bottom-0 h-64 w-64 bg-spirit-400/20 animate-pulse-glow" />

      <div className="container-x relative text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block rounded-full border border-dawn-400/40 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-dawn-300"
        >
          Bible
        </motion.span>

        {/* Scène: grand mot en fond + Bible qui flotte devant */}
        <div className="relative mx-auto mt-4 flex h-[42vw] max-h-[280px] min-h-[190px] items-center justify-center">
          {/* Grand mot en arrière-plan */}
          <motion.span
            aria-hidden
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="pointer-events-none absolute select-none font-display text-[26vw] font-black leading-none tracking-tight text-white/[0.06] sm:text-[150px]"
          >
            BIBLE
          </motion.span>

          {/* Halo derrière la Bible */}
          <div className="absolute h-40 w-40 rounded-full bg-dawn-400/20 blur-3xl" />

          {/* Bible illustrée qui flotte */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -6, scale: 0.9 }}
            animate={{ opacity: 1, y: [0, -10, 0], rotate: -6, scale: 1 }}
            transition={{
              opacity: { duration: 0.6 },
              scale: { duration: 0.6 },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
            className="relative drop-shadow-[0_25px_35px_rgba(0,0,0,0.45)]"
          >
            <BibleArt />
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="font-display text-5xl font-extrabold leading-[1.05] sm:text-6xl"
        >
          La <span className="text-dawn-400">Bible</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mx-auto mt-3 max-w-md text-sm text-cream/70 sm:text-base"
        >
          Lis, écoute et médite la Parole. Choisis un livre, un chapitre, et laisse-la
          prendre racine.
        </motion.p>
      </div>
    </section>
  );
}

/** Bible fermée stylisée (vecteur, charte lime/olive). */
function BibleArt() {
  return (
    <svg
      viewBox="0 0 220 260"
      className="h-[38vw] max-h-[220px] min-h-[150px] w-auto"
      fill="none"
    >
      <defs>
        <linearGradient id="jb-cover" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3A3F28" />
          <stop offset="1" stopColor="#0A0B07" />
        </linearGradient>
      </defs>

      {/* Tranche des pages (crème), décalée */}
      <rect x="58" y="46" width="122" height="180" rx="12" fill="#EDE9DA" />
      <rect x="58" y="46" width="122" height="180" rx="12" fill="#000" opacity="0.04" />
      {/* Lignes de pages */}
      <g stroke="#C9C2AC" strokeWidth="1.4" opacity="0.7">
        <line x1="172" y1="60" x2="172" y2="212" />
        <line x1="167" y1="60" x2="167" y2="212" />
      </g>

      {/* Couverture */}
      <rect x="44" y="38" width="122" height="180" rx="12" fill="url(#jb-cover)" />
      {/* Dos / reflet */}
      <rect x="44" y="38" width="12" height="180" rx="6" fill="#ffffff" opacity="0.06" />
      <rect x="44" y="38" width="122" height="180" rx="12" fill="none" stroke="#CAF000" strokeOpacity="0.25" strokeWidth="1.5" />

      {/* Croix lime */}
      <rect x="100" y="92" width="10" height="74" rx="3" fill="#CAF000" />
      <rect x="80" y="112" width="50" height="10" rx="3" fill="#CAF000" />

      {/* Marque-page (ruban) */}
      <rect x="128" y="38" width="9" height="150" fill="#CAF000" opacity="0.92" />
      <path d="M128 188 L132.5 180 L137 188 Z" fill="#AEB98C" />
    </svg>
  );
}
