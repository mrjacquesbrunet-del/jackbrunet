"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "framer-motion";

const VARIANTS: Variants = {
  enter: (d: number) => ({ x: `${d * 100}%`, opacity: 0.4 }),
  center: { x: "0%", opacity: 1 },
  exit: (d: number) => ({ x: `${-d * 100}%`, opacity: 0.4 }),
};

/** Raccourcis de l'accueil qui glissent vers la gauche (auto + au doigt). */
const SLIDES = [
  {
    href: "/don",
    eyebrow: "Soutien",
    title: "Faire un don",
    text: "Évangélisation, aide humanitaire, ministère.",
    gradient: "linear-gradient(135deg, rgb(var(--n-900)), rgb(var(--n-700)) 65%, rgb(var(--s-500)))",
    accent: "#CAF000",
    iconBg: "#CAF000",
    iconColor: "rgb(var(--n-950))",
    icon: "M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z",
  },
  {
    href: "/a-propos",
    eyebrow: "Découvrir",
    title: "À propos",
    text: "La vision, la mission, le pasteur.",
    gradient: "linear-gradient(135deg, rgb(var(--n-900)), rgb(var(--n-700)) 90%)",
    accent: "#D8F53A",
    iconBg: "rgba(243,243,237,0.15)",
    iconColor: "#F3F3ED",
    icon: "M12 8h.01M11 12h1v4h1M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
  },
];

export function HomeQuickSlider() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (next: number) => {
    setDir(next > i || (i === SLIDES.length - 1 && next === 0) ? 1 : -1);
    setI((next + SLIDES.length) % SLIDES.length);
  };

  // Défilement automatique vers la gauche.
  useEffect(() => {
    const t = setInterval(() => {
      setDir(1);
      setI((p) => (p + 1) % SLIDES.length);
    }, 4200);
    return () => clearInterval(t);
  }, []);

  const s = SLIDES[i];

  return (
    <div className="max-w-2xl">
      <div className="relative overflow-hidden rounded-3xl">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={i}
            custom={dir}
            variants={VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(i + 1);
              else if (info.offset.x > 60) go(i - 1);
            }}
          >
            <Link
              href={s.href}
              className="group relative flex min-h-[132px] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 p-5 text-cream"
              style={{ backgroundImage: s.gradient }}
              draggable={false}
            >
              <div className="flex items-center gap-2">
                <span
                  className="grid h-9 w-9 place-items-center rounded-full"
                  style={{ background: s.iconBg, color: s.iconColor }}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d={s.icon} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: s.accent }}>
                  {s.eyebrow}
                </span>
              </div>
              <div className="mt-5">
                <p className="font-display text-xl font-extrabold leading-tight">{s.title}</p>
                <p className="mt-0.5 text-sm text-cream/75">{s.text}</p>
              </div>
              <span className="absolute bottom-4 right-4 text-2xl transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicateurs */}
      <div className="mt-2.5 flex justify-center gap-1.5">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => go(idx)}
            aria-label={`Raccourci ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              idx === i ? "w-5 bg-dawn-400" : "w-1.5 bg-night-900/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
