"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { asset } from "@/lib/asset";
import { getOpens } from "@/lib/usage";
import { BarreObjectif, PHOTO_MISSION, useObjectifDon } from "@/components/mission/CarteMission";
import { lienDonSite } from "@/lib/don-site";
import { openExternal } from "@/lib/external";
import { getLangue } from "@/lib/i18n";
import { getSupabase } from "@/lib/supabase";

/** Repli si la photo du profil de Pasteur Jack n'est pas encore chargée. */
const PHOTO_JACK = "/img/jack-avatar.webp";
const CLE_PHOTO_JACK = "jb.photo.jack";

/** Photo du profil RHEMA de Pasteur Jack (celle qu'il a mise dans l'app). */
function usePhotoJack(): string {
  const [url, setUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(CLE_PHOTO_JACK) || asset(PHOTO_JACK);
    } catch {
      return asset(PHOTO_JACK);
    }
  });
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    void sb
      .from("profiles")
      .select("avatar_url,pseudo")
      .eq("verified", true)
      .or("pseudo.ilike.%jack%,pseudo.ilike.%brunet%")
      .not("avatar_url", "is", null)
      .limit(1)
      .then(({ data }) => {
        const u = (data as { avatar_url: string | null }[] | null)?.[0]?.avatar_url;
        if (!u) return;
        setUrl(u);
        try {
          localStorage.setItem(CLE_PHOTO_JACK, u);
        } catch {
          /* stockage indisponible */
        }
      });
  }, []);
  return url;
}

const CLE_PROCHAIN = "jb.popup.mission.prochain";
const JOUR = 24 * 3600_000;
/** Délai avant de reproposer : après « Plus tard », puis après un don. */
const PAUSE_PLUS_TARD = 6 * JOUR;
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
 * Pop-up « Un message de Jack » (seul pop-up d'appel au don de l'app) :
 * à partir de la 4e ouverture, au plus une fois tous les 6 jours, 30 jours
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
  const photoJack = usePhotoJack();
  const pct = objectif ? Math.min(100, Math.round((objectif.collecte / objectif.objectif) * 100)) : 0;

  // Paiement Stripe : « 10 € par mois » s'ouvre directement, « Une fois »
  // ouvre la page de don pour choisir le montant.
  const donner = (mensuel: boolean) => {
    reporter(PAUSE_APRES_DON);
    onFermer();
    void openExternal(lienDonSite(mensuel ? 10 : undefined, mensuel, getLangue(), mensuel));
  };

  return (
    <motion.div
      className="keep-dark fixed inset-0 z-[140] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Un message de Jack"
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
        className="relative z-10 max-h-[92svh] w-full max-w-md overflow-y-auto rounded-t-[2rem] border border-dawn-400/25 bg-night-900 pb-[calc(env(safe-area-inset-bottom)+1rem)] text-cream shadow-2xl sm:rounded-[2rem] sm:pb-5"
      >
        <div className="relative h-36 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset(PHOTO_MISSION)}
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: "center 38%", filter: "saturate(0.8) contrast(1.06) brightness(0.88)" }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgb(var(--n-900)) 0%, rgb(var(--n-900) / .5) 30%, transparent 60%)" }}
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
        </div>

        <div className="relative -mt-7 px-5">
          {/* Un message personnel de Jack */}
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoJack}
              alt=""
              className="h-14 w-14 shrink-0 rounded-full object-cover ring-[3px] ring-night-900 shadow-[0_0_0_5px_rgba(202,240,0,.35)]"
            />
            <p className="pt-5 text-[11px] font-black uppercase tracking-[0.2em] text-dawn-400">Un message de Jack</p>
          </div>

          <div className="mt-3 space-y-2.5 text-[14.5px] leading-relaxed text-cream/85">
            <p>
              Chaque semaine, des milliers de personnes ouvrent la Parole de Dieu dans RHEMA, sans payer un centime. Je
              veux que ça reste ainsi.
            </p>
            <p>
              Une application comme RHEMA représente plus de 30 000 € de développement, et elle a des frais chaque mois.
              Nous ne mettons pas de publicité et nous ne vendons pas tes données : RHEMA vit grâce à ceux qui contribuent.
            </p>
            <p className="font-semibold text-cream">
              Si RHEMA te fait du bien, aide-nous à la garder gratuite pour le prochain qui en a besoin.
            </p>
          </div>

          {/* Preuve sociale : la barre seulement quand elle est déjà bien
              remplie, sinon le nombre de dons (une barre vide freine). */}
          {objectif && pct >= 20 ? (
            <div className="mt-4">
              <BarreObjectif objectif={objectif} />
            </div>
          ) : objectif && objectif.dons >= 5 ? (
            <p className="mt-4 flex items-center gap-2 text-[13px] font-semibold text-dawn-400">
              <span className="h-2 w-2 rounded-full bg-dawn-400" />
              {objectif.mensuel
                ? `Déjà ${objectif.dons} contributions ce mois-ci`
                : `Déjà ${objectif.dons} contributions reçues`}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => donner(true)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-dawn-400 py-3.5 font-display text-[17px] font-extrabold text-night-950 shadow-[0_0_26px_-6px_rgba(202,240,0,.6)] transition-transform active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2} aria-hidden>
              <path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z" strokeLinejoin="round" />
            </svg>
            10 € par mois
          </button>
          <button
            type="button"
            onClick={() => donner(false)}
            className="mt-2.5 w-full rounded-2xl border border-white/15 bg-white/[0.04] py-3 text-[15px] font-bold text-cream transition-colors active:bg-white/10"
          >
            Une fois, le montant de mon choix
          </button>

          <p className="mt-3.5 text-center text-[12.5px] leading-snug text-cream/55">
            Une partie des contributions soutient aussi nos missions auprès des enfants les plus pauvres.
          </p>

          <div className="mt-3 flex items-end justify-between">
            <button type="button" onClick={onFermer} className="py-2 text-[13.5px] font-semibold text-cream/45">
              Plus tard
            </button>
            <p className="text-[24px] leading-none text-cream/85" style={{ fontFamily: "var(--font-script), cursive" }}>Merci. Jack</p>
          </div>
          <p className="mt-2 text-center text-[11px] text-cream/35">Apple Pay, Google Pay ou carte bancaire · Paiement sécurisé</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
