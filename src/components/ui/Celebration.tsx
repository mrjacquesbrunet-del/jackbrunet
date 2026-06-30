"use client";

import { motion, AnimatePresence } from "framer-motion";

/** Petite modale de célébration animée, réutilisable (badges, prière exaucée…). */
export function Celebration({
  open,
  emoji,
  title,
  message,
  cta = "Amen 🙏",
  onClose,
}: {
  open: boolean;
  emoji: string;
  title: string;
  message: string;
  cta?: string;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] grid place-items-center bg-night-950/70 p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-sm rounded-4xl border border-dawn-400/40 bg-white p-7 text-center shadow-card"
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="text-6xl"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260 }}
            >
              {emoji}
            </motion.div>
            <p className="mt-3 font-display text-2xl font-extrabold">{title}</p>
            <p className="mt-2 text-sm text-night-900/65">{message}</p>
            <button type="button" onClick={onClose} className="btn-primary mt-5 w-full">
              {cta}
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
