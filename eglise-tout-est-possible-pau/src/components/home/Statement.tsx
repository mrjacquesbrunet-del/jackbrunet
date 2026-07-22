"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { home } from "@/lib/content";

function Word({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  // Chaque mot s'allume à son tour pendant le scroll.
  const start = index / total;
  const end = (index + 1) / total;
  const opacity = useTransform(progress, [start, end], [0.14, 1]);

  return (
    <motion.span style={{ opacity }} className="inline">
      {word}{" "}
    </motion.span>
  );
}

// Déclaration géante révélée mot à mot au rythme du scroll —
// l'effet signature des grands sites d'églises.
export function Statement() {
  const { statement } = home;
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });

  const words = statement.text.split(" ");

  return (
    <section className="bg-cream py-28 text-night sm:py-40">
      <div className="wrap" ref={ref}>
        <p className="kicker text-leaf-deep">{statement.kicker}</p>
        <p className="display-2 mt-8 max-w-5xl">
          {reduce
            ? statement.text
            : words.map((word, i) => (
                <Word
                  key={`${word}-${i}`}
                  word={word}
                  index={i}
                  total={words.length}
                  progress={scrollYProgress}
                />
              ))}
        </p>
        <Link href="/a-propos" className="btn-dark mt-12">
          {statement.cta}
        </Link>
      </div>
    </section>
  );
}
