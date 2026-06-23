"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NewsletterForm } from "@/components/ui/NewsletterForm";

const STORAGE_KEY = "lumiere:popup-dismissed";
const DELAY_MS = 12_000;

/**
 * Pop-up de captation email — élégant, non agressif.
 * Apparaît une fois (mémorisé), après un délai, avec cadeau gratuit.
 */
export function EmailPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* stockage indisponible — ignore */
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={dismiss}
            className="absolute inset-0 bg-night-950/70 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Recevoir le cadeau gratuit"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="dark-ctx bg-topo-dark relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 p-7 shadow-card sm:p-8"
          >
            <div className="blob -right-16 -top-16 h-48 w-48 bg-dawn-500/25" />
            <button
              type="button"
              onClick={dismiss}
              aria-label="Fermer"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-cream/70 transition-colors hover:text-cream"
            >
              ✕
            </button>

            <div className="relative">
              <span className="eyebrow">Cadeau gratuit</span>
              <h3 className="mt-4 font-display text-2xl font-extrabold leading-tight">
                Reçois <span className="text-gradient">« 7 jours pour retrouver la paix »</span>
              </h3>
              <p className="mt-2 text-sm text-cream/70">
                Un mini-parcours offert : 7 méditations courtes pour ancrer ta journée
                en Jésus. Tu recevras aussi la pensée du jour chaque matin.
              </p>
              <div className="mt-6">
                <NewsletterForm
                  source="popup"
                  layout="stacked"
                  size="lg"
                  cta="Recevoir mon cadeau"
                  note="Cadeau immédiat. Désinscription en un clic."
                />
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="mt-4 w-full text-center text-xs text-cream/40 transition-colors hover:text-cream/70"
              >
                Non merci, peut-être plus tard
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
