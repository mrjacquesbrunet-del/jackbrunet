"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// Titre 3D « style Apple » : le texte se redresse en perspective
// (rotation X depuis le plan) en entrant dans le viewport.
export function Title3D({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { rotateX: 55, opacity: 0, y: 44 }}
      whileInView={{ rotateX: 0, opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 900, transformOrigin: "center bottom" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
