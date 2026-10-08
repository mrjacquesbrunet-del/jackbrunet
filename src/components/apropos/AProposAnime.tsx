"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";

/** Nombre qui défile jusqu'à sa valeur quand il apparaît à l'écran. */
export function Compteur({ valeur, suffixe = "", duree = 1.6, annee = false }: { valeur: number; suffixe?: string; duree?: number; annee?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const vu = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!vu) return;
    let raf = 0;
    const debut = performance.now();
    const pas = (t: number) => {
      const p = Math.min(1, (t - debut) / (duree * 1000));
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(valeur * e));
      if (p < 1) raf = requestAnimationFrame(pas);
    };
    raf = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(raf);
  }, [vu, valeur, duree]);
  return (
    <span ref={ref} translate="no">
      {annee ? n : n.toLocaleString("fr-FR")}
      {suffixe}
    </span>
  );
}

export type Valeur = { titre: string; accroche: string; texte: string; icone: string };

/** Les quatre valeurs : cartes qui se déplient au toucher. */
export function Valeurs({ valeurs }: { valeurs: Valeur[] }) {
  const [ouverte, setOuverte] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {valeurs.map((v, i) => {
        const o = ouverte === i;
        return (
          <motion.div
            key={v.titre}
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className={`overflow-hidden rounded-3xl border transition-colors ${
              o ? "border-dawn-400/50 bg-dawn-400/[0.07] shadow-[0_0_24px_rgba(202,240,0,.12)]" : "border-white/10 bg-white/[0.04]"
            }`}
          >
            <button
              type="button"
              onClick={() => setOuverte(o ? null : i)}
              aria-expanded={o}
              className="flex w-full items-center gap-4 p-4 text-left"
            >
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-colors ${
                  o ? "bg-dawn-400 text-night-950" : "bg-dawn-400/12 text-dawn-400"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
                  <path d={v.icone} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[20px] font-extrabold leading-tight text-cream">{v.titre}</span>
                <span className="mt-0.5 block text-[13.5px] font-semibold text-dawn-400/90">{v.accroche}</span>
              </span>
              <motion.span animate={{ rotate: o ? 45 : 0 }} className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-cream/70">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {o ? (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="px-5 pb-5 text-[15px] leading-relaxed text-cream/75"
                >
                  {v.texte}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

/** En-tête : la photo glisse doucement, le titre apparaît mot à mot. */
export function EnTeteAPropos({ photo, titre, role }: { photo: string; titre: string; role: string }) {
  return (
    <section className="relative h-[78svh] min-h-[520px] overflow-hidden">
      <motion.img
        src={photo}
        alt=""
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "center 18%" }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 60% at 80% 10%, rgba(202,240,0,.14), transparent 60%), linear-gradient(to top, rgb(var(--n-950)) 6%, rgb(var(--n-950) / .7) 38%, rgb(var(--n-950) / .1) 70%, rgb(var(--n-950) / .35))",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-3xl px-5 pb-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="inline-flex rounded-full border border-dawn-400/40 bg-night-950/50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-dawn-400 backdrop-blur"
        >
          À propos
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 font-display text-[40px] font-extrabold leading-[1.05] text-cream sm:text-6xl"
        >
          Une foi vivante, <span className="text-dawn-400">simple et profonde</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-3 text-[15px] font-semibold text-cream/80"
        >
          <span translate="no">{titre}</span>{" · "}<span>{role}</span>
        </motion.p>
      </div>
    </section>
  );
}
