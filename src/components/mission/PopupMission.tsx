"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { asset } from "@/lib/asset";
import { getOpens } from "@/lib/usage";
import { BarreObjectif, PHOTO_MISSION, useAllerAuDon, useObjectifDon } from "@/components/mission/CarteMission";

const CLE_PROCHAIN = "jb.popup.mission.prochain";
const JOUR = 24 * 3600_000;
/** Délai avant de reproposer : après « Plus tard », puis après un don. */
const PAUSE_PLUS_TARD = 10 * JOUR;
const PAUSE_APRES_DON = 30 * JOUR;
/** Onglets où il peut apparaître (jamais pendant la lecture ou un jeu). */
const PAGES = ["/devotionnel", "/communaute", "/plans"];

let dejaVuCetteSession = false;

function prochainePossible(): number {
  try {
    return Number(localStorage.getItem(CLE_PROCHAIN) || 0);
  } catch {
    return Infinity;
  }
}
function reporter(ms: number) {
  try {
    localStorage.setItem(CLE_PROCHAIN, String(Date.now() + ms));
  } catch {
    /* stockage indisponible */
  }
}

/**
 * Pop-up « Grande campagne de dons » (seul pop-up d'appel au don de l'app) :
 * à partir de la 4e ouverture, au plus une fois tous les 10 jours, 30 jours
 * de calme après un don, jamais par-dessus une autre fenêtre.
 */
export function PopupMission() {
  const pathname = (usePathname() ?? "").replace(/\/+$/, "") || "/";
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    if (dejaVuCetteSession || !PAGES.includes(pathname)) return;
    try {
      if (localStorage.getItem("jb.onboarded") !== "1") return;
    } catch {
      return;
    }
    // Toute personne qui a ouvert l'app plus de 3 fois.
    if (getOpens() <= 3 || Date.now() < prochainePossible()) return;
    const t = setTimeout(() => {
      // Une autre fenêtre est ouverte (rappel, note, menu…) : pas cette fois.
      if (document.querySelector('[aria-modal="true"], [role="dialog"]')) return;
      dejaVuCetteSession = true;
      reporter(PAUSE_PLUS_TARD);
      setOuvert(true);
    }, 6000);
    return () => clearTimeout(t);
  }, [pathname]);

  return <AnimatePresence>{ouvert ? <Fenetre onFermer={() => setOuvert(false)} /> : null}</AnimatePresence>;
}

function Fenetre({ onFermer }: { onFermer: () => void }) {
  const objectif = useObjectifDon();
  const allerAuDon = useAllerAuDon();

  return (
    <motion.div
      className="keep-dark fixed inset-0 z-[140] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Grande campagne de dons"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button type="button" aria-label="Fermer" onClick={onFermer} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-t-[2rem] border border-dawn-400/25 bg-night-900 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] text-cream shadow-2xl sm:rounded-[2rem] sm:pb-5"
      >
        <div className="relative h-48 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(PHOTO_MISSION)}
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: "center 40%", filter: "saturate(0.8) contrast(1.06) brightness(0.88)" }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgb(var(--n-900)) 0%, rgb(var(--n-900) / .6) 22%, transparent 50%)" }}
          />
          <button
            type="button"
            onClick={onFermer}
            aria-label="Fermer"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-night-950/60 text-cream/85 backdrop-blur"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
          <span className="absolute left-4 top-3.5 rounded-full bg-night-950/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-dawn-400 backdrop-blur">
            RHEMA
          </span>
          <p className="absolute inset-x-5 bottom-2 font-display text-[22px] font-extrabold leading-tight [text-shadow:0_1px_10px_rgba(0,0,0,.7)]">
            Grande campagne de <span className="text-dawn-400">dons</span>
          </p>
        </div>

        <div className="px-5 pt-2">
          <p className="text-[14px] leading-relaxed text-cream/80">
            Une application comme RHEMA, sa création et sa maintenance, c&apos;est plus de{" "}
            <span className="font-bold text-dawn-400">30 000 €</span>.
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-cream/80">
            Nous recherchons des donateurs pour la garder gratuite et bénir le plus grand nombre. Une partie des fonds
            servira aussi pour la mission auprès des plus pauvres.
          </p>
          {objectif ? (
            <div className="mt-4">
              <BarreObjectif objectif={objectif} />
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => {
              reporter(PAUSE_APRES_DON);
              onFermer();
              void allerAuDon();
            }}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-dawn-400 py-3.5 font-display text-[17px] font-extrabold text-night-950 shadow-[0_0_26px_-6px_rgba(202,240,0,.6)] transition-transform active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2} aria-hidden>
              <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" strokeLinejoin="round" />
            </svg>
            Je soutiens la mission
          </button>
          <button type="button" onClick={onFermer} className="mt-2 w-full py-2.5 text-[14px] font-semibold text-cream/55">
            Plus tard
          </button>
          <p className="mt-1 text-center text-[11.5px] text-cream/40">Apple Pay, Google Pay ou carte bancaire · Paiement sécurisé</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
