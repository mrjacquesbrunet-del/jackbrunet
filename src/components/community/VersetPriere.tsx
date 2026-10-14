"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import versets from "@/data/versets-priere.json";
import { useLangue } from "@/lib/i18n";

type Verset = { texte: string; ref: string };
const LISTE = versets as Record<"fr" | "en" | "pt", Verset>[];
const DUREE = 9000;

/** Plume (trait), comme sur la maquette. */
function Plume({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
      <path d="M20 4C12 4 6 9 5 18l-1 2M20 4c0 7-5 12-12 13M20 4L9 15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Verset sur la prière, en haut du mur : il change toutes les 9 secondes
 * (toucher = suivant). Textes exacts des Bibles de l'app (Louis Segond,
 * World English Bible, Bíblia Livre), selon la langue.
 */
export function VersetPriere({ className = "" }: { className?: string }) {
  const langue = useLangue();
  // Départ différent chaque jour, puis rotation.
  const [i, setI] = useState(() => Math.floor(Date.now() / 86_400_000) % LISTE.length);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % LISTE.length), DUREE);
    return () => clearInterval(t);
  }, [i]);

  const v = LISTE[i][langue] ?? LISTE[i].fr;

  return (
    <button
      type="button"
      onClick={() => setI((x) => (x + 1) % LISTE.length)}
      aria-label="Verset suivant"
      translate="no"
      className={`notranslate flex w-full flex-col rounded-2xl border border-dawn-400/25 bg-night-900/70 px-3 pb-2 pt-2.5 text-left ${className}`}
    >
      <span className="flex items-start gap-2">
        <Plume className="mt-0.5 h-4 w-4 shrink-0 text-dawn-400" />
        <AnimatePresence mode="wait">
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-w-0"
          >
            <span className="line-clamp-3 block text-[11px] leading-[1.35] text-cream/85">« {v.texte} »</span>
            <span className="mt-0.5 block text-[10px] text-cream/45">{v.ref}</span>
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="mt-1.5 flex justify-center gap-1" aria-hidden>
        {[0, 1, 2].map((k) => (
          <span key={k} className={`h-[3px] rounded-full transition-all ${i % 3 === k ? "w-2.5 bg-dawn-400" : "w-[3px] bg-white/25"}`} />
        ))}
      </span>
    </button>
  );
}
