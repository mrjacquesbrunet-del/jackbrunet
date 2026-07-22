"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

// Fil de progression de lecture — le vert lumineux utilisé comme
// micro-détail, conformément à la charte.
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const reduce = useReducedMotion();

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[90] h-0.5 origin-left bg-pulse/80"
      style={{ scaleX }}
    />
  );
}
