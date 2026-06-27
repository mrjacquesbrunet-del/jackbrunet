"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { useAppMode } from "@/lib/app-mode";

const STORAGE_KEY = "lumiere:popup-dismissed";
const DELAY_MS = 8_000;

/**
 * Pop-up de captation email — offre l'ebook gratuit « 7 jours pour
 * retrouver la paix ». Élégant, non agressif, mémorisé (une seule fois).
 */
export function EmailPopup() {
  const [open, setOpen] = useState(false);
  const isApp = useAppMode();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isApp) return; // dans l'app : pas de pop-up (on a la rubrique Exclusivités)
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, [isApp]);

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
            aria-label="Recevoir l'ebook gratuit"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="dark-ctx bg-topo-dark relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 shadow-card"
          >
            <div className="blob -right-16 -top-16 h-48 w-48 bg-dawn-500/25" />
            <button
              type="button"
              onClick={dismiss}
              aria-label="Fermer"
              className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-cream/70 transition-colors hover:text-cream"
            >
              ✕
            </button>

            <div className="relative grid gap-6 p-7 sm:grid-cols-[auto_1fr] sm:p-8">
              {/* Couverture de l'ebook (mockup, sans image) */}
              <div className="mx-auto sm:mx-0">
                <BookCover />
              </div>

              <div>
                <span className="eyebrow">📖 Ebook offert</span>
                <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight">
                  « 7 jours pour <span className="text-gradient">retrouver la paix</span> »
                </h3>
                <p className="mt-2 text-sm text-cream/70">
                  7 méditations courtes pour ancrer ta journée en Jésus. Reçois-le gratuitement,
                  tout de suite, dans ta boîte mail.
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-cream/75">
                  {["7 jours, 7 méditations guidées", "La paix de Dieu au quotidien", "100 % gratuit"].map(
                    (b) => (
                      <li key={b} className="flex items-center gap-2">
                        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-dawn-400 text-[10px] font-bold text-night-950">
                          ✓
                        </span>
                        {b}
                      </li>
                    ),
                  )}
                </ul>
                <div className="mt-5">
                  <NewsletterForm
                    source="popup"
                    layout="stacked"
                    size="lg"
                    cta="Recevoir mon ebook gratuit"
                    note="Cadeau immédiat. Désinscription en un clic."
                  />
                </div>
                <button
                  type="button"
                  onClick={dismiss}
                  className="mt-3 w-full text-center text-xs text-cream/40 transition-colors hover:text-cream/70"
                >
                  Non merci, peut-être plus tard
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Mini-couverture de livre en CSS (pas d'image à fournir). */
function BookCover() {
  return (
    <motion.div
      initial={{ rotate: -6 }}
      animate={{ rotate: [-6, -3, -6], y: [0, -4, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative h-44 w-32 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-spirit-600 to-night-900 shadow-card"
    >
      {/* tranche du livre */}
      <div className="absolute inset-y-0 left-0 w-2 bg-black/30" />
      <div className="flex h-full flex-col justify-between p-3">
        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-dawn-300">
          Ebook offert
        </span>
        <div>
          <p className="font-display text-sm font-extrabold leading-tight text-cream">
            7 jours pour retrouver la paix
          </p>
          <div className="mt-2 h-px w-8 bg-dawn-400" />
          <p className="mt-2 text-[9px] text-cream/60">Jack Brunet</p>
        </div>
      </div>
    </motion.div>
  );
}
