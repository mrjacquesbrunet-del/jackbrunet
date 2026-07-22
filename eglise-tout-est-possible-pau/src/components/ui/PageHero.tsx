"use client";

import { motion, useReducedMotion } from "framer-motion";
import { withScript } from "@/lib/script";
import type { PageHero as PageHeroType } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

// En-tête des pages intérieures : typographie affiche géante,
// apparition orchestrée (sur-titre → titre → sous-titre).
export function PageHero({ hero, tone = "dark" }: { hero: PageHeroType; tone?: "dark" | "light" }) {
  const dark = tone === "dark";
  const reduce = useReducedMotion();

  const appear = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 34 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease },
  });

  return (
    <div className={`${dark ? "bg-night text-cream" : "bg-cream text-night"} relative overflow-hidden`}>
      {dark && <div className="glow-leaf absolute -top-40 right-0 h-[36rem] w-[36rem]" aria-hidden />}
      <div className="wrap relative pb-20 pt-40 sm:pb-28 sm:pt-48">
        <motion.p
          {...appear(0.05)}
          className={`flex items-center gap-3 text-[0.7rem] font-extrabold uppercase tracking-kicker sm:text-xs ${
            dark ? "text-pulse" : "text-leaf-deep"
          }`}
        >
          <span className="block h-2 w-2 animate-pulse-dot rounded-full bg-pulse" aria-hidden />
          {hero.kicker}
        </motion.p>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 44, rotateX: 55 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.1, delay: 0.18, ease }}
          style={{ transformPerspective: 900, transformOrigin: "center bottom" }}
          className={`display-2 mt-6 max-w-5xl text-balance ${dark ? "text-3d" : ""}`}
        >
          {withScript(hero.title)}
        </motion.h1>
        <motion.p
          {...appear(0.32)}
          className={`lead mt-7 max-w-2xl ${dark ? "text-cream/75" : "text-night/70"}`}
        >
          {hero.subtitle}
        </motion.p>
      </div>
    </div>
  );
}
