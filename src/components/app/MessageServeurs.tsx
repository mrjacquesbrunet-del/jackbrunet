"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { prendreFenetreAuto } from "@/lib/popups";
import { lienDonSite } from "@/lib/don-site";
import { openExternal } from "@/lib/external";
import { getLangue } from "@/lib/i18n";

/** Vu une fois par appareil ; plus montré après la date de fin. */
const CLE = "jb.message.serveurs-2026-10";
const FIN = Date.parse("2026-11-30T00:00:00Z");
/** Laisse aussi au repos le pop-up de don habituel (même appel, pas deux fois). */
const CLE_MISSION = "jb.popup.mission.prochain";
const PAGES = ["/devotionnel", "/communaute", "/plans", "/profil"];

/**
 * Message d'excuse après la panne d'octobre 2026 (serveurs saturés, tout le
 * monde déconnecté) : une seule fois, aux personnes déjà installées, avec un
 * appel à soutenir les frais de l'application.
 */
export function MessageServeurs() {
  const pathname = (usePathname() ?? "").replace(/\/+$/, "") || "/";
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    if (Date.now() > FIN || !PAGES.includes(pathname)) return;
    try {
      if (localStorage.getItem("jb.onboarded") !== "1" || localStorage.getItem(CLE)) return;
    } catch {
      return;
    }
    const t = setTimeout(() => {
      if (!prendreFenetreAuto("serveurs")) return;
      try {
        localStorage.setItem(CLE, "1");
        localStorage.setItem(CLE_MISSION, String(Date.now() + 6 * 24 * 3600_000));
      } catch {
        /* stockage indisponible */
      }
      setOuvert(true);
    }, 900); // avant le rappel du matin (1,2 s) : ce message ne dure qu'un temps
    return () => clearTimeout(t);
  }, [pathname]);

  const fermer = () => setOuvert(false);
  const soutenir = () => {
    fermer();
    void openExternal(lienDonSite(undefined, undefined, getLangue()));
  };

  return (
    <AnimatePresence>
      {ouvert ? (
        <motion.div
          className="keep-dark fixed inset-0 z-[140] flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Message de l'équipe RHEMA"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" aria-label="Fermer" onClick={fermer} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-h-[92svh] w-full max-w-md overflow-y-auto rounded-t-[2rem] border border-dawn-400/25 bg-night-900 px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-6 text-cream shadow-2xl sm:rounded-[2rem] sm:pb-5"
          >
            <button
              type="button"
              onClick={fermer}
              aria-label="Fermer"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-cream/70"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>

            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-dawn-400/15 text-dawn-400">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
                <rect x="3.5" y="4" width="17" height="6.5" rx="2" />
                <rect x="3.5" y="13.5" width="17" height="6.5" rx="2" />
                <path d="M7.5 7.25h.01M7.5 16.75h.01M11 7.25h5.5M11 16.75h5.5" strokeLinecap="round" />
              </svg>
            </span>
            <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em] text-dawn-400">L'équipe RHEMA</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight">Pardon, et merci pour ta patience</h2>

            <div className="mt-3 space-y-2.5 text-[14.5px] leading-relaxed text-cream/85">
              <p>
                Ces derniers jours, beaucoup d'entre vous n'arrivaient plus à se connecter, et tu as peut-être été
                déconnecté(e). Nous en sommes vraiment désolés.
              </p>
              <p>
                La raison est belle : vous êtes de plus en plus nombreux à rejoindre RHEMA, et nos serveurs n'ont pas tenu le
                choc. Nous avons dû passer à des serveurs et à un espace de stockage plus grands pour accueillir tout le
                monde.
              </p>
            </div>

            <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 text-[13.5px] leading-snug text-cream/80">
              Ton compte et tes données n'ont pas bougé. Si tu as été déconnecté(e), reconnecte-toi simplement avec ton
              e-mail habituel, ou avec Apple ou Google.
            </p>

            <div className="mt-4 space-y-2.5 text-[14.5px] leading-relaxed text-cream/85">
              <p className="font-semibold text-cream">
                RHEMA est gratuite et le restera. Mais elle engendre des coûts importants, aujourd'hui pris en charge en
                intégralité par le pasteur Jack.
              </p>
              <p>Si tu veux soutenir l'œuvre et aider RHEMA à continuer de grandir, chaque geste compte.</p>
            </div>

            <button
              type="button"
              onClick={soutenir}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-dawn-400 py-3.5 font-display text-[17px] font-extrabold text-night-950 shadow-[0_0_26px_-6px_rgba(202,240,0,.6)] transition-transform active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2} aria-hidden>
                <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" strokeLinejoin="round" />
              </svg>
              Je soutiens RHEMA
            </button>
            <button type="button" onClick={fermer} className="mt-2 w-full py-2.5 text-[14px] font-semibold text-cream/50">
              Plus tard
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
