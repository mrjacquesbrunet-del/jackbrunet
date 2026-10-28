"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/components/community/useAuth";
import { Avatar } from "@/components/community/Avatar";
import { membresEnLigne, type MembreEnLigne } from "@/lib/presence";

const RAFRAICHIR_MS = 60_000;

/**
 * Rangée discrète « En ligne maintenant » (profil, messages, prière) : les
 * membres connectés que j'ai le droit de voir (réglage « Qui peut te voir en
 * ligne », amis = abonnés l'un à l'autre, blocages). Un toucher ouvre une
 * petite fiche : envoyer un message ou voir le profil. Rien si personne.
 */
export function EnLigneMaintenant({ tone = "dark", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  const { userId } = useAuth();
  const [membres, setMembres] = useState<MembreEnLigne[]>([]);
  const [choisi, setChoisi] = useState<MembreEnLigne | null>(null);
  const sombre = tone === "dark";

  useEffect(() => {
    if (!userId) {
      setMembres([]);
      return;
    }
    let vivant = true;
    const charger = () => {
      if (document.visibilityState !== "visible") return;
      void membresEnLigne().then((m) => {
        if (vivant) setMembres(m);
      });
    };
    charger();
    const t = setInterval(charger, RAFRAICHIR_MS);
    document.addEventListener("visibilitychange", charger);
    return () => {
      vivant = false;
      clearInterval(t);
      document.removeEventListener("visibilitychange", charger);
    };
  }, [userId]);

  if (!userId || membres.length === 0) return null;

  return (
    <div className={className}>
      <p
        className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] ${
          sombre ? "text-cream/45" : "text-night-900/45"
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
        En ligne maintenant · {membres.length}
      </p>
      <div className="-mx-1 mt-2 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {membres.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setChoisi(m)}
            className="flex w-12 shrink-0 flex-col items-center gap-1"
            aria-label={`${m.pseudo}, en ligne`}
          >
            <span className="relative">
              <Avatar pseudo={m.pseudo} url={m.avatar_url} size={40} />
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 bg-emerald-400 ${
                  sombre ? "border-night-950" : "border-white"
                }`}
                aria-hidden
              />
            </span>
            <span className={`w-full truncate text-center text-[10px] ${sombre ? "text-cream/60" : "text-night-900/60"}`}>
              {m.pseudo}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {choisi ? (
          <motion.div
            className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-label={choisi.pseudo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button type="button" aria-label="Fermer" onClick={() => setChoisi(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="keep-dark relative z-10 w-full max-w-sm rounded-t-[2rem] border border-white/10 bg-night-900 px-6 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-6 text-center text-cream shadow-2xl sm:rounded-[2rem] sm:pb-6"
            >
              <span className="relative mx-auto inline-block">
                <Avatar pseudo={choisi.pseudo} url={choisi.avatar_url} size={72} />
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-[3px] border-night-900 bg-emerald-400" aria-hidden />
              </span>
              <p className="mt-3 font-display text-xl font-extrabold">{choisi.pseudo}</p>
              <p className="mt-0.5 text-xs font-semibold text-emerald-400">En ligne</p>
              <Link
                href={`/messages?u=${choisi.id}`}
                onClick={() => setChoisi(null)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-dawn-400 py-3 font-bold text-night-950"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9} aria-hidden>
                  <path d="M4 5h16v11H8l-4 4V5z" strokeLinejoin="round" />
                </svg>
                Envoyer un message
              </Link>
              <Link
                href={`/membre?u=${choisi.id}`}
                onClick={() => setChoisi(null)}
                className="mt-2.5 block w-full rounded-2xl border border-white/15 bg-white/[0.04] py-3 font-semibold text-cream/85"
              >
                Voir le profil
              </Link>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
