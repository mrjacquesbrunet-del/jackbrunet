"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

/** Annonces défilantes du profil (cliquables). Facile à enrichir: ajoute une
 * entrée ici (titre, texte, lien, dégradé). */
const BANNERS = [
  {
    href: "/boutique",
    eyebrow: "Nouveau",
    title: "Le livre RHEMA",
    text: "365 révélations bibliques à méditer — découvre-le.",
    from: "#2A2E1C",
    to: "#5E6A3A",
  },
  {
    href: "/exclusivites",
    eyebrow: "Offert",
    title: "Tes exclusivités",
    text: "Ebooks, soaking & bonus à débloquer",
    from: "#3B0764",
    to: "#6D28D9",
  },
];

export function ProfileBanners() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (BANNERS.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % BANNERS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const b = BANNERS[i];

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href={b.href}
            className="group flex items-center justify-between gap-4 overflow-hidden rounded-3xl border border-white/10 p-5 text-cream transition-transform hover:-translate-y-0.5"
            style={{ backgroundImage: `linear-gradient(120deg, ${b.from}, ${b.to})` }}
          >
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-dawn-300">
                {b.eyebrow}
              </span>
              <p className="mt-1 font-display text-lg font-extrabold leading-tight">{b.title}</p>
              <p className="mt-0.5 text-sm text-cream/75">{b.text}</p>
            </div>
            <span className="shrink-0 text-2xl transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>
      </AnimatePresence>

      <div className="mt-2 flex justify-center gap-1.5">
        {BANNERS.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setI(idx)}
            aria-label={`Annonce ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              idx === i? "w-5 bg-spirit-600": "w-1.5 bg-night-900/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
