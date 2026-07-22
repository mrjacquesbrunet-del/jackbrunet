"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { home, settings } from "@/lib/content";

const WORD_INTERVAL_MS = 3000;

export function Hero() {
  const { hero } = home;
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // -1 = phrase finale ; sinon index du mot courant.
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (reduce) {
      setFinished(true);
      return;
    }
    const timer = setInterval(() => {
      setStep((current) => {
        if (current >= hero.rotatingWords.length - 1) {
          clearInterval(timer);
          setFinished(true);
          return current;
        }
        return current + 1;
      });
    }, WORD_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [hero.rotatingWords.length, reduce]);

  // Parallaxe douce : le contenu remonte moins vite que le scroll.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.9], [0, 0.7]);

  const currentWord = finished ? hero.finalPhrase : hero.rotatingWords[step];

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden bg-night">
      {/* Fond : vidéo plein écran si fournie via le CMS, sinon ambiance cinématographique */}
      <div className="absolute inset-0" aria-hidden>
        {settings.hero.videoUrl ? (
          <video
            className="h-full w-full object-cover"
            src={settings.hero.videoUrl}
            poster={settings.hero.posterImage || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <motion.div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(90% 90% at 75% 15%, rgba(163,205,134,0.28) 0%, transparent 55%), radial-gradient(70% 80% at 15% 85%, rgba(48,255,18,0.07) 0%, transparent 60%), #121212",
            }}
            animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {/* Overlay noir transparent, texte blanc lisible */}
        <div className="absolute inset-0 bg-night/55" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-night to-transparent" />
        <div className="grain absolute inset-0" />
        <motion.div className="absolute inset-0 bg-night" style={{ opacity: overlayOpacity }} />
      </div>

      <motion.div className="wrap relative pb-28 pt-36" style={reduce ? undefined : { y: contentY }}>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="kicker"
        >
          {settings.name} · {settings.city}
        </motion.p>

        <h1 className="display-1 mt-6 text-cream">
          <motion.span
            className="block"
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {hero.fixedText}
          </motion.span>
          <span className="relative block min-h-[1.1em]">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentWord}
                initial={reduce ? false : { opacity: 0, y: "0.5em", filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduce ? undefined : { opacity: 0, y: "-0.4em", filter: "blur(8px)" }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className={`block ${finished ? "text-leaf" : "text-cream/90"}`}
              >
                {currentWord}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="lead mt-8 max-w-xl text-cream/80"
        >
          {hero.subtitle}
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link href="/premiere-visite" className="btn-primary">
            {hero.ctaPrimary}
          </Link>
          <Link href="/messages" className="btn-ghost-dark">
            {hero.ctaSecondary}
          </Link>
        </motion.div>
      </motion.div>

      {/* Indicateur de scroll */}
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden
      >
        <span className="block h-2 w-2 animate-pulse-dot rounded-full bg-pulse" />
      </motion.div>
    </section>
  );
}
