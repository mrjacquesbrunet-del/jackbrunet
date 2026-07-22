"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

function Word({
  word,
  index,
  total,
  progress,
  dimOpacity,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  dimOpacity: number;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const opacity = useTransform(progress, [start, end], [dimOpacity, 1]);

  return (
    <motion.span style={{ opacity }} className="inline">
      {word}{" "}
    </motion.span>
  );
}

// Texte révélé mot à mot au rythme du scroll — réutilisable sur
// toutes les grandes déclarations du site.
export function WordReveal({
  text,
  className = "",
  dimOpacity = 0.14,
}: {
  text: string;
  className?: string;
  dimOpacity?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });

  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {reduce
        ? text
        : words.map((word, i) => (
            <Word
              key={`${word}-${i}`}
              word={word}
              index={i}
              total={words.length}
              progress={scrollYProgress}
              dimOpacity={dimOpacity}
            />
          ))}
    </p>
  );
}
