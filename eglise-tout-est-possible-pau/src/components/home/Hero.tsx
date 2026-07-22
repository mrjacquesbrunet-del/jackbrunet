"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { Particles3D } from "@/components/ui/Particles3D";
import { home, settings } from "@/lib/content";

const WORD_INTERVAL_MS = 2000;

// Vidéo du hero : celle du CMS en priorité, sinon le fichier local
// public/videos/hero.mp4 (il suffit d'y déposer la vidéo fournie).
const HERO_VIDEO = settings.hero.videoUrl || "/videos/hero.mp4";

export function Hero() {
  const { hero } = home;
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [videoOk, setVideoOk] = useState(true);

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

  // Parallaxe cinématographique : le texte remonte, la vidéo s'assombrit.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.9], [0, 0.75]);

  // Profondeur 3D à la souris : le titre pivote très légèrement en
  // perspective, comme suspendu devant la vidéo.
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const tiltX = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 60, damping: 18 });
  const tiltY = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 60, damping: 18 });

  const onMouseMove = (e: React.MouseEvent) => {
    mx.set(e.clientX / window.innerWidth);
    my.set(e.clientY / window.innerHeight);
  };

  const currentWord = finished ? hero.finalPhrase : hero.rotatingWords[step];

  return (
    <section
      ref={ref}
      onMouseMove={reduce ? undefined : onMouseMove}
      className="relative flex min-h-[100svh] items-end overflow-hidden bg-night"
    >
      {/* Fond vidéo plein écran */}
      <div className="absolute inset-0" aria-hidden>
        {videoOk ? (
          <motion.video
            className="h-full w-full object-cover"
            style={reduce ? undefined : { scale: videoScale }}
            src={HERO_VIDEO}
            poster={settings.hero.posterImage || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoOk(false)}
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
        <div className="absolute inset-0 bg-night/50" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-night to-transparent" />
        <div className="grain absolute inset-0" />
        {/* Poussières lumineuses en profondeur, par-dessus la vidéo */}
        <Particles3D className="absolute inset-0 h-full w-full" />
        <motion.div className="absolute inset-0 bg-night" style={{ opacity: overlayOpacity }} />
      </div>

      <motion.div
        className="wrap relative pb-24 pt-40 sm:pb-28"
        style={reduce ? undefined : { y: contentY }}
      >
        <motion.h1
          className="display-1 text-3d text-cream"
          style={reduce ? undefined : { rotateX: tiltX, rotateY: tiltY, transformPerspective: 900 }}
        >
          <motion.span
            className="block"
            initial={reduce ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {hero.fixedText}
          </motion.span>
          <span className="relative block min-h-[1em]">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentWord}
                initial={reduce ? false : { opacity: 0, y: "0.45em", filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduce ? undefined : { opacity: 0, y: "-0.35em", filter: "blur(10px)" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`block text-pulse ${finished ? "drop-shadow-[0_0_30px_rgba(48,255,18,0.35)]" : ""}`}
              >
                {currentWord}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="lead mt-10 max-w-md text-cream/80"
        >
          {hero.subtitle}
        </motion.p>
      </motion.div>
    </section>
  );
}
