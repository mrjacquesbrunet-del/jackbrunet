"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// Transition cinématographique à chaque changement de page :
// fondu + léger glissement, jamais brusque.
export default function Template({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
