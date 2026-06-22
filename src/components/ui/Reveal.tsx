"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Direction d'entrée. */
  from?: "up" | "down" | "left" | "right" | "scale";
  once?: boolean;
};

const offset = 28;

function variants(from: NonNullable<RevealProps["from"]>): Variants {
  const hidden: Record<string, number> = { opacity: 0 };
  if (from === "up") hidden.y = offset;
  if (from === "down") hidden.y = -offset;
  if (from === "left") hidden.x = offset;
  if (from === "right") hidden.x = -offset;
  if (from === "scale") hidden.scale = 0.92;

  return {
    hidden,
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };
}

/** Anime un bloc à son apparition dans le viewport (effet au scroll). */
export function Reveal({
  children,
  className,
  delay = 0,
  from = "up",
  once = true,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      variants={variants(from)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
