"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Item = { question: string; answer: string };

// Accordéon accessible (boutons natifs, aria-expanded, clavier).
export function Faq({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <div className="divide-y divide-night/10">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="group flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span className="text-lg font-bold leading-snug sm:text-xl">
                {item.question}
              </span>
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-night/20 text-xl font-medium transition-all duration-300 ease-smooth group-hover:border-leaf-deep group-hover:bg-leaf-faint ${isOpen ? "rotate-45 bg-night text-cream group-hover:bg-night" : ""}`}
                aria-hidden
              >
                +
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-7 leading-relaxed text-night/70">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
